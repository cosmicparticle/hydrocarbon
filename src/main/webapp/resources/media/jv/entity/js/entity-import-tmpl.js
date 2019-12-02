define(function(require, exports, module){
	"use strict";
	exports.initPage = function(_param){
		var defParam = {
			$page	: null,
			menuId	: null,
			tmplId	: null
		};
		
		var param = $.extend({}, defParam, _param);
		
		var Utils = require('utils');
		var Ajax = require('ajax');
		var Dialog = require('dialog');
		var $CPF = require('$CPF');
		
		var $page = param.$page;
		
		var context = Utils.createContext({
			fieldDictionary			: [],
			tmplFields				: [],
			originTmpl				: null,
			fieldPicker				: null,
			hasChanged				: false,
			tmpls					: [],
			tmplId					: null
		});
		require('event').bindScopeEvent($page, {saveTmpl, toggleTemplates, downloadTmpl});
		var $tbody = $('.fields-l tbody', $page);
		bindRowSortable();
		
		require('tmpl').load('media/jv/entity/tmpl/entity-import-tmpl.tmpl').done(function(tmplMap){
			context
				.bind('fieldDictionary', renderFieldSelector)
				.bind('tmplFields', renderShownTemplateFields)
				.bind('originTmpl', appendOriginTmplFields)
				.bind('fieldPicker', appendOriginTmplFields)
				.bind('tmpls', renderTemplates)
				.bind('tmplId', loadOriginTemplate)
				.bind('originTmpl', setCurrentTemplate)
				;
			loadFields();
			loadTemplates();
			
			
			function appendOriginTmplFields(){
				var fieldPicker = context.getStatus('fieldPicker');
				var originTmpl = context.getStatus('originTmpl');
				if(fieldPicker && originTmpl){
					fieldPicker.reset();
					var sortedFields = sortTmplFields(originTmpl.fields);
					$.each(sortedFields, function(){
						if(this.fieldId){
							fieldPicker.select(this.fieldId, {dataId: this.id});
						}
					});
					//调整$label$表头位置
					$.each(sortedFields, function(i){
						if(this.compositeId){
							var $labelRow = $tbody.children('tr[composite-id="' + this.compositeId + '"]');
							var position = $labelRow.index();
							if(i < position){
								$labelRow.insertBefore($tbody.children('tr').eq(i));
							} else if(i > position){
								$labelRow.insertAfter($tbody.children('tr').eq(i));
							}
						}
					});
				}
			}
			
			function renderFieldSelector(){
				var fieldDictionary = context.getStatus('fieldDictionary');
				var FieldPicker = require('entity/js/entity-field-picker');
				var fieldPicker = new FieldPicker({
					$page, plhTarget: 'fields-container'
				});
				fieldPicker.setComposites(fieldDictionary.composites);
				fieldPicker.bindSelected(whenFieldSelected);
				fieldPicker.bindReseted(whenFieldReseted);
				fieldPicker.render().done(function(){
					context.setStatus('fieldPicker', fieldPicker);
				})
			}
			
			function whenFieldSelected(field, $field, toggleDisabled, data){
				console.log(data);
				var tmplFields = context.getStatus('tmplFields');
				if(field.composite.type === 'normal'){
					toggleDisabled(true);
					tmplFields.push({
						id			: data && data.dataId,
						title		: field.name,
						fieldId		: field.id,
						order		: tmplFields.length,
						enableSelect: function(){toggleDisabled(false)}
					});
				}else{
					var maxFieldIndex = -1;
					var maxRelationLabelIndex = -1;
					var fieldIsRelation = field.composite.type === 'relation';
					$.each(tmplFields, function(){
						if(fieldIsRelation && !this.fieldId && this.compositeId){
							if(this.compositeId === field.composite.id && this.fieldIndex > maxRelationLabelIndex){
								maxRelationLabelIndex = this.fieldIndex;
							}
						}else if(this.fieldId === field.id && this.fieldIndex > maxFieldIndex){
							maxFieldIndex = this.fieldIndex;
						}
					});
					if(fieldIsRelation && maxRelationLabelIndex === maxFieldIndex){
						tmplFields.push({
							title			: field.composite.name + '[' + (maxRelationLabelIndex + 1) + '].$label$',
							compositeId		: field.composite.id,
							fieldIndex		: maxRelationLabelIndex + 1,
							order			: tmplFields.length,
							labelComposite	: field.composite
						})
					}
					tmplFields.push({
						id			: data && data.dataId,
						title		: field.composite.name + '[' + (maxFieldIndex + 1) + '].' + field.name,
						fieldId		: field.id,
						fieldIndex	: maxFieldIndex + 1,
						order		: tmplFields.length,
						composite	: field.composite,
						field		: field
					});
				}
				context.setStatus('tmplFields');
				if(!data){context.setStatus('hasChanged', true)}
			}
			
			function whenFieldReseted(){
				context.setStatus('tmplFields', []);
			}
			
			function renderShownTemplateFields(){
				var tmplFields = context.getStatus('tmplFields');
				if(tmplFields){
					try{
						tmplFields.sort(function(a, b){return a.order - b.order});
						var $rows = $();
						$.each(tmplFields, function(order){
							var $row = tmplMap['tmpl-field-rows'].tmpl({field: this}, {
								removeRow	: removeRow
							});
							this.$row = $row;
							$rows = $rows.add($row);
						});
						$tbody.empty().append($rows);
					}catch(e){
						console.error(e);
					}
				}
			}
			
			function removeRow(field){
				var tmplFields = context.getStatus('tmplFields');
				tmplFields.splice(tmplFields.indexOf(field), 1);
				if(field.composite){
					var hasRemainSublings = null;
					if(field.composite.type === 'relation'){
						//检测关系字段是否全被移除，如果关系字段全被移除，那么自动移除label字段
						hasRemainSublings = false;
						var relationLabelIndex = -1;
						$.each(tmplFields, function(i){
							if(this.composite && this.composite.id === field.composite.id && this.fieldIndex == field.fieldIndex){
								hasRemainSublings = true;
							}else if(this.compositeId === field.composite.id && this.fieldIndex === field.fieldIndex){
								relationLabelIndex = i;
							}
						});
						if(!hasRemainSublings){
							tmplFields.splice(relationLabelIndex, 1);
						}
					}
					//检测某个索引的数组字段是否全被移除，如果被移除，那么后面索引的字段索引自动减1
					if(hasRemainSublings == null){
						hasRemainSublings = false;
						$.each(tmplFields, function(){
							if(this.composite && this.composite.id === field.composite.id && this.fieldIndex == field.fieldIndex){
								hasRemainSublings = true;
								return false;
							}
						});
					}
					if(!hasRemainSublings){
						$.each(tmplFields, function(){
							if(this.labelComposite && this.compositeId === field.composite.id && this.fieldIndex > field.fieldIndex){
								this.fieldIndex--;
								this.title = this.labelComposite.name + '[' + this.fieldIndex + '].$label$';
							}else if(this.composite && this.composite.id === field.composite.id && this.fieldIndex > field.fieldIndex){
								this.fieldIndex--;
								this.title = this.composite.name + '[' + this.fieldIndex + '].' + this.field.name;
							}
						});
					}
					
				}
				
				$.each(tmplFields, function(){
					if(this.order > field.order){
						this.order--;
					}
				});
				if(field.enableSelect){field.enableSelect()}
				context.setStatus('tmplFields')
				context.setStatus('hasChanged', true);
			}
			
			/**
			 * 渲染模板列表
			 */
			function renderTemplates(){
				var tmpls = context.getStatus('tmpls');
				tmplMap['tmpl-list'].replaceIn($page, {
					tmpls			: tmpls,
					menuId			: param.menuId,
					currentTmplId	: context.getStatus('tmplId')
				}, {
					showTmpl		: function(tmpl){
						context.setStatus('tmplId', tmpl.id);
					}
				})
			}
		});
		
		function loadFields(){
			Ajax.ajax('api2/entity/import/dict/' + param.menuId).done(function(data){
				if(data.fieldDictionary){
					context.setStatus('fieldDictionary', data.fieldDictionary);
					context.setStatus('tmplFields', []);
				}
			});
		}
		
		function loadOriginTemplate(){
			var tmplId = context.getStatus('tmplId');
			if(tmplId){
				$CPF.showLoading();
				Ajax.ajax('api2/entity/import/tmpl/' + param.menuId + '/' + tmplId).done(function(res){
					noticeAssert(res.tmpl, '获得导入模板失败');
					context.setStatus('originTmpl', res.tmpl);
					context.setStatus('hasChanged', false);
					$CPF.closeLoading();
				});
			}
		}
		
		function loadTemplates(){
			$CPF.showLoading();
			Ajax.ajax('api2/entity/import/tmpls/' + param.menuId).done(function(res){
				if(res.tmpls){
					$.each(res.tmpls, function(){
						this.updateTimeStr = this.updateTime? 
								Utils.formatDate(new Date(this.updateTime), 'yyyy-MM-dd hh:mm:ss'): '';
					});
					context.setStatus('tmpls', res.tmpls);
					$CPF.closeLoading();
				}
			});
		}
		
		function bindRowSortable(){
			$tbody.sortable({
				helper 		: "clone",
				cursor 		: "move",// 移动时候鼠标样式
				opacity		: 0.5, // 拖拽过程中透明度
				tolerance 	: 'pointer',
				update		: function(e, ui){
					$.each(context.getStatus('tmplFields'), function(){
						this.order = this.$row.index();
					});
					context.setStatus('hasChanged', true)
					console.log(context.getStatus('tmplFields'));
				}
			});
		}
		
		
		
		function toggleTemplates(){
			var $tmplList = $('#tmpl-list', $page);
			if($tmplList.length === 0){
				loadTemplates();
			}else{
				$tmplList.toggle();
			}
		}
		
		
		function saveTmpl(){
			var defer = $.Deferred();
			var tmplFields = context.getStatus('tmplFields');
			var tmplTitle = $('#tmpl-title', $page).val();
			try{
				noticeAssert(tmplFields && tmplFields.length > 0, '添加字段后保存');
				noticeAssert(tmplTitle, '请设置导入模板名称');
				var saveData = {
						tmplId	: context.getStatus('tmplId'),
						title	: tmplTitle,
						fields	: [], 
				};
				$.each(sortTmplFields(tmplFields), function(){
					saveData.fields.push(Utils.setProperties(this, ['id', 'fieldId', 'compositeId', 'fieldIndex']));
				});
				console.log(saveData);
				Dialog.confirm('确认保存导入模板？').done(function(){
					Ajax.postJson('api2/entity/import/save_tmpl/' + param.menuId, saveData, function(res){
						if(res.tmplId){
							Dialog.notice('保存成功', 'success');
							console.log(res.tmplId);
							defer.resolve(res);
						}else{
							Dialog.notice('保存失败', 'error');
						}
					});
				});
			}catch(e){}
			return defer.promise();
		}
		
		function downloadTmpl(){
			var originTmpl = context.getStatus('originTmpl');
			var hasChanged = context.getStatus('hasChanged');
			if(!originTmpl || originTmpl && hasChanged){
				saveTmpl().done(function(res){
					Ajax.download('api2/entity/import/download_tmpl/' + res.tmplId + '?@token=' + Ajax.getAuthToken());
				});
			}else if(originTmpl && !hasChanged){
				Ajax.download('api2/entity/import/download_tmpl/' + originTmpl.id + '?@token=' + Ajax.getAuthToken());
			}
		}
		
		function setCurrentTemplate(){
			var originTmpl = context.getStatus('originTmpl');
			if(originTmpl){
				var $tmplList = $('#tmpl-list', $page);
				$tmplList.find('a.tmpl-item').removeClass('active')
				$tmplList.find('a[data-id="' + originTmpl.id + '"]').addClass('active');
				$('#tmpl-title', $page).val(originTmpl.title);
			}
		}
		
		
		function noticeAssert(bool, errorWhenFalse){
			if(!bool){
				Dialog.notice(errorWhenFalse, 'error');
				$.error();
			}
		}
		function sortTmplFields(tmplFields){return tmplFields.sort(function(a, b){return a.order - b.order})}
	}
});