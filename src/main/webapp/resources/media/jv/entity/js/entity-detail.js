define(function(require, exports, module){
	"use strict";
	
	function defaultStatus(){
		return require('utils').createStatus({
			dtmpl		: null,
			premises	: null,
			actions		: null,
			entity		: null
		});
	}
	
	exports.init = function(_param){
		var defParam = {
			$page			: null,
			validateSign			: null,
			code			: null,
			mode			: 'detail',
			fieldGroupId	: null
		}
		var param = $.extend({}, defParam, _param);
		var $page = param.$page;
		var $groupContainer = $('.group-container', $page);
		var status = defaultStatus();
		status.setStatus('mode', param.mode);
		
		var Ajax = require('ajax');
		var $CPF = require('$CPF');
		var DetailInput = require('entity/js/entity-detail-input.js');
		var Fetcher = require('field/js/field-option-fetcher.js');
		var Content = require('entity/js/entity-detail-content.js');
		//覆盖渲染实体的普通字段
		var fieldOptionsFetcher = new Fetcher();
		var doWhen = require('utils').DoWhen(function(){return param.mode});
		doWhen(	/rabc.+/, function(){status.setStatus({contextType:'rabc',contextTypeArg:param.fieldGroupId})},
				/node.+/, function(){status.setStatus({contextType:'node',contextTypeArg:param.nodeId})},
				/user.+/, function(){param.validateSign = 'user';status.setStatus({contextType:'normal',contextTypeArg:''})},
				function(){status.setStatus({contextType:'normal',contextTypeArg:''})});
		$CPF.showLoading();
		require('tmpl').load('media/jv/entity/tmpl/entity-detail.tmpl').done(function(tmplMap){
			
			status
				.bind('dtmpl', renderFrame)
				.bind('premises', renderPremises)
				;
			status.setStatus('content', new Content());
			doWhen(/.*create/, function(){
				status
					.bind('dtmpl', renderTitle)
					.bind('dtmpl', renderDetailInputs)
					.bind('actions', renderActions)
					.bind('buttonStatus', renderSaveButton)
					.bind('normalFieldInputInited', setDetailInputsValue)
			},/.*update/, function(){
				status
					.bind('entity', renderTitle)
					.bind('dtmpl', renderDetailInputs)
					.bind('dtmpl', renderFusionToggler)
					.bind('actions', renderActions)
					.bind('buttonStatus', renderSaveButton)
					.bind('entity', renderArrayItems)
					.bind('entity', setDetailInputsValue)
					.bind('normalFieldInputInited', setDetailInputsValue)
					;
			},/.*detail/, function(){
				status
					.bind('entity', renderTitle)
					.bind('entity', renderEntityDetail)
					.bind('entity', bindExport)
					.bind('history', renderHistory)
					.bind('versionCode', setCurrentHistoryItem)
					;
			});
			//加载详情模板
			//渲染premises
			//渲染actions
			//如果传入了code，则加载实体数据，并且填充到页面中
			
			//初始化页面，加载模板后加载实体
			loadDetailTemplate().done(function(){
				//detail模式下，要加载entity和history
				doWhen(/.*detail/, function(){loadEntity();loadHistory(1)});
				//update模式下，只要加载entity
				doWhen(/.*update/, function(){loadEntity()});
			})
			
			/**
			 * 从服务器加载详情模板
			 */
			function loadDetailTemplate(){
				$CPF.showLoading();
				var uri = 'api2/meta/tmpl/dtmpl_config/' + status.getStatus('contextType') + '/' + param.validateSign + '/' + status.getStatus('contextTypeArg');
				return Ajax.ajax(uri).done(function(data){
					var config = data.config;
					doWhen(/rabc.+|node.+/, function(){
						status.setStatus('moduleTitle', config.module.title);
					}, /user.+/, function(){
						status.setStatus('moduleTitle', '用户');
					}, function(){
						status.setStatus('moduleTitle', data.menu.title);
					});
					status.setStatus(config, ['dtmpl', 'premises', 'actions', 'buttonStatus']);
				});
			}
			
			/**
			 * 从服务器加载实体数据
			 */
			function loadEntity(versionCode){
				var reqParam = {};
				doWhen(/node.+/, function(){reqParam.nodeId = param.nodeId},
						/rabc.+/, function(){reqParam.fieldGroupId = param.fieldGroupId},
						/user.+/, function(){if(param.dtmplId) reqParam.dtmplId = param.dtmplId});
				if(typeof versionCode === 'string' && versionCode) reqParam.versionCode = versionCode;
				$CPF.showLoading();
				var uri = 'api2/entity/curd/detail/' + param.validateSign + '/' + param.code;
				Ajax.ajax(uri, reqParam).done(function(data){
					status.setStatus(data, ['entity', 'versionCode']);
				});
				
			}
			
			/**
			 * 加载历史信息，只有详情页会执行
			 */
			function loadHistory(hisPageNo){
				var reqParam = {};
				doWhen(['node_detail', 'node_update'], function(){reqParam.nodeId = param.nodeId});
				var uri = 'api2/entity/curd/history/' + param.validateSign + '/' + param.code + '/1';
				Ajax.ajax(uri, reqParam).done(function(data){
					status.setStatus(data, ['history']);
				});
			}
			
			/**
			 * 渲染页面标题
			 */
			function renderTitle(data){
				tmplMap['page-title']
					.replaceIn($page, this.properties);
			}
			
			/**
			 * 根据详情模板渲染页面框架
			 */
			function renderFrame(){
				var groups = status.getStatus('dtmpl').groups;
				tmplMap['groups'].replaceIn($page, {
					groups	,
					mode	: param.mode
				}, {
					//添加一行
					addArrayItemRow	: function(group){
						var $fieldGroup = $(this).closest('.field-group');
						var $tbody = $('tbody', $fieldGroup);
						var rownum = $('>tr', $tbody).length;
						addRow(group, $tbody);
					},
					//弹出框页面，然后选择一个实体后返回
					dialogSelectRow	: function(group){
						var $table = $(this).closest('table');
						//获得当前
						var exceptCodes = getExistCodes(group);
						require('dialog').openDialog('jv/entity/curd/select/' + param.validateSign + '/' + group.id, '选择实体', undefined, {
							reqParam:	{
								except	: exceptCodes.join()
							},
							width	: 1000,
							height	: 450,
							onSubmit: function(entitiesLoader){
								appendEntityToArrayTable(entitiesLoader, group, $table);
							}
						});
					},
					//弹出框编辑实体页面，创建并保存实体后返回
					dialogCreateEntity	: function(group){
						var $table = $(this).closest('table');
						require('dialog').openDialog('jv/entity/curd/rabc_create/' + param.validateSign + '/' + group.id, '创建实体', undefined, {
							width	: 1000,
							height	: 450,
							events:	{
								afterSave	: function(entitiesLoader){
									appendEntityToArrayTable(entitiesLoader, group, $table);
								}
							}
						})
						
					}
				});
				//初始化content的arrayComposite数据
				var content = this.getStatus('content');
				$.each(groups, function(){
					if(this.isArray == 1){
						content.addArrayComposite(this.composite.name);
					}
				});
				//初始化索引器
				bindIndexer($page);
			}
			
			/**
			 * 根据fieldGroup获得在content中对应的的contentComposite
			 */
			function getContentComposite(group){
				var content = status.getStatus('content');
				return content.getArrayComposite(group.composite.name);
			}
			/**
			 * 获得字段组合中已经插入的行的实体code
			 */
			function getExistCodes(group){
				var codes = [];
				var contentComposite = getContentComposite(group);
				$.each(contentComposite.rows, function(){
					if(this.entityCode){
						codes.push(this.entityCode);
					}
				});
				return codes;
			}
			
			function collectGroupDfieldIds(group){
				var fields = [];
				for(var i in group.fields){
					var field = group.fields[i];
					fields.push(field.id);
				}
				return fields;
			}
			
			/**
			 * 将选择的实体插入到对应的arrayItems中
			 */
			function appendEntityToArrayTable(entitiesLoader, group, $table){
				var dfieldIds = collectGroupDfieldIds(group);
				$CPF.showLoading();
				entitiesLoader(dfieldIds).done(function(entities){
					var $tbody = $table.children('tbody');
					$.each(entities, function(i, entity){
						var contentRow = addRow(group, $tbody, function(dfieldId){return entity.byDfieldIds[dfieldId]});
						contentRow.setEntityCode(entity['唯一编码']);
					}); 
					$CPF.closeLoading();
				});
			}
			
			/**
			 * 将编辑后的实体从后台重新加载后，更新对应的行
			 */
			function updateArrayItem(entitiesLoader, group, $row){
				//获得请求需要的
				var dfieldIds = collectGroupDfieldIds(group);
				$CPF.showLoading();
				entitiesLoader(dfieldIds).done(function(entities){
					var entity = entities[0];
					if(entity){
						var contentRow = $row.data('content-row');
						$.each(contentRow.inputs, function(){
							var value = entity.byDfieldIds[this.getDetailFieldId()];
							if(value) this.setValue(value, true);
						});
					}
					$CPF.closeLoading();
				});
				
			}
			
			/**
			 * 根据ArrayItem的group，在已经存在的tbody里插入一行
			 * valueGetter是插入行的每个单元格里的表单里要设置的值
			 * 如果只是要插入空行，那么valueGetter可以不传
			 */
			function addRow(group, $tbody, valueGetter){
				var contentComposite = getContentComposite(group);
				var contentRow = contentComposite.addRow();
				//根据模板创建一行
				var $row = createUpdateArrayItemRow(group, 1, function(){
					if(valueGetter){
						var value = valueGetter(this.getDetailFieldId());
						if(value) this.setValue(value, true);
					}
					contentRow.addInput(this);
				});
				//将contentRow对象和dom绑定
				$row.data('content-row', contentRow);
				contentRow.setRelationLabelSelect($row.find('select.array-item-relation-label-select'));
				$tbody.append($row);
				refreshPagination($tbody, 'last');
				return contentRow;
			}
			
			/**
			 * 
			 */
			function createUpdateArrayItemRow(group, rownum, inputCallback){
				var $row = tmplMap['create-array-item-row'].tmpl({
					group, rownum
				}, {
					removeRow	: removeArrayItemRow						
				});
				tmplMap['group-field-input'].replaceFor(
					$('style[target="array-item-field-input"]', $row), {}, {}, 
					function($span, data, isLast){
						var field = data.data.field;
						var fieldName = toCompositeFieldName(field, group.composite.name);
						createFieldInput(field, fieldName)
							.done(function(dom){
								$span.append(dom);
								this.enableDefaultValue();
								(inputCallback || $.noop).apply(this, [dom]);
							});
					});
				return $row;
			}
			
			/**
			 * 渲染前提字段
			 */
			function renderPremises(){
				tmplMap['premises'].replaceIn($page, {
					groupPremises	: status.getStatus('premises')
				})
			}
			
			/**
			 * 渲染操作按钮
			 */
			function renderActions(){
				var actions = this.getStatus('actions');
				var innerActions = [], outgoingActions = [];
				
				if(actions){
					$.each(actions, function(){
						if(this.outgoing === 1){
							outgoingActions.push(this)
						}else{
							innerActions.push(this);
						}
					});
				}
				tmplMap['inner-actions'].replaceIn($page, {innerActions}, {doAction, toggleInnerActions});
				tmplMap['outgoing-actions'].replaceIn($page, {outgoingActions}, {doAction});
				tmplMap['save-button'].replaceIn($page, {}, {doSave});
			}
			
			/**
			 * 切换隐藏的操作按钮
			 */
			function toggleInnerActions(){
				var $actionsContainer = $('#actions-container', $page);
				require('utils').switchClass($(this).children('i'), 'fa-toggle-left', 'fa-toggle-right', function(isHidden){
					$actionsContainer.removeClass('init');
					$actionsContainer.toggleClass('close', isHidden);
				});
			}
			
			function renderSaveButton(){
				var buttonStatus = this.getStatus('buttonStatus');
			}
			
			function doAction(action){
				doSave('action', action);
			}
			
			/**
			 * 执行保存
			 */
			function doSave(flag, action){
				var Dialog = require('dialog');
				var formData = getSubmitData(2);
				if(formData instanceof FormData){
					var fuseMode = status.getStatus('fuseMode');
					var msg = '是否保存？';
					if(flag === 'action' && action){
						msg = '是否执行操作【' + action.title + '】';
						formData.set('%actionId%', action.id);
					};
					if(fuseMode){
						msg += '（当前为融合模式）';
					}
					Dialog.confirm(msg).done(function(){
						require('utils').writeFormData(formData);
						var page = $page.getLocatePage();
						var uri = 'api2/entity/curd/save/' + status.getStatus('contextType')  + '/'  + param.validateSign + '/' + status.getStatus('contextTypeArg');
						require('ajax').ajax(uri, formData, function(data){
							if(data.status === 'suc'){
								Dialog.notice('保存成功', 'success');
								doWhen(
									'create', function(){page.loadContent('jv/entity/curd/update/' + param.validateSign + '/' + data.code)}, 
									['update', 'node_update', 'user_update'], function(){page.refresh()},
									/rabc.+/, function(){
										var afterSave = page.getPageObj().getEventCallbacks('afterSave');
										if(afterSave){afterSave.apply(page, [require('entity/js/entity-select').createEntityLoader([data.code], param.validateSign, param.fieldGroupId)])}
										page.close();
								});
							}else{
								Dialog.notice('保存失败', 'error');
							}
						});
					});
				}
			}
			
			/**
			 * 获得表单数据（返回FormData）
			 * @param validateLevel 校验等级
			 * 		0或者不传入时不校验；
			 * 		1时校验所有表单，将错误的表单组装成数组并返回
			 * 		2时校验所有表单，将错误的表单加注信息，并组装成数组后返回
			 */
			function getSubmitData(validateLevel){
				var formData = new FormData();
				var errors = [];
				var fuseMode = status.getStatus('fuseMode');
				if(fuseMode){
					formData.set('%fuseMode%', true);
				}
				
				//设置实体的code
				var entity = status.getStatus('entity');
				if(entity){
					formData.append('唯一编码', entity.code);
				}
				//获得当前实体的内容
				var content = status.getStatus('content');
				//普通的字段
				$.each(content.normalInputs, function(){
					$.merge(errors, this.validate(validateLevel));
					if(this.isValueChanged()){
						this.appendToFormData(formData, this.getName());
					}
				});
				//遍历所有数组字段组
				content.forEachArrayComposites(function(){
					var compositeName = this.compositeName;
					//判断是否有相同的compositeName
					formData.set(compositeName + '.$$flag$$', true);
					
					//遍历当前composite内的所有行
					$.each(this.rows, function(rowIndex){
						var namePrefix = compositeName + '[' + rowIndex + '].';
						//设置code
						if(this.entityCode) formData.set(namePrefix + '唯一编码', this.entityCode);
						//设置关系名
						var relationLabel = this.getRelationLabel();
						if(relationLabel) formData.set(namePrefix + '$$label$$', relationLabel);
						//遍历当前行的所有表单
						$.each(this.inputs, function(){
							$.merge(errors, this.validate(validateLevel));
							if(this.isValueChanged()){
								var name = namePrefix + this.getName();
								this.appendToFormData(formData, name);
							}
						});
					});
				});
				if(errors.length > 0){
					return errors;
				}else{
					return formData;
				}
			}
			
			/**
			 * 根据实体数据填充详情值
			 */
			function renderEntityDetail(){
				var entity = this.getStatus('entity');
				//覆盖渲染实体的普通字段
				tmplMap['group-field'].replaceIn($page, function(field){
					return {entity,field}
				});
				//覆盖渲染实体的数组字段
				tmplMap['array-item-rows'].replaceIn($page, function(group){
					return {entity, group}
				}, {}, function($rows){
					var $fieldGroup = $rows.closest('.field-group');
					//渲染覆盖数组字段表格的筛选器
					tmplMap['keyword-search-container'].replaceIn($fieldGroup, function(group){
						return {entity, group}
					})
					bindTableEvent($fieldGroup);
				});
				//绑定特殊类型字段的显示
				bindFieldInput($page);
				$CPF.closeLoading();
			}
			
			//根据详情模板来渲染表单
			function renderDetailInputs(){
				var dtmpl = this.getStatus('dtmpl');
				var content = this.getStatus('content');
				if(dtmpl){
					tmplMap['group-field-input'].replaceFor(
							$('style[target="group-field"]', $page), function(field){
								return {field};
							}, {}, function($span, data, isLast, index){
								var field = data.field;
								console.log('create-field-input', field.type, index);
								createFieldInput(field, data.field.name, function(){
									console.log('prepared-create-field-input', field.type, index);
									if(isLast){
										fieldOptionsFetcher.commit().done(function(){
											status.setStatus('normalFieldInputInited', true);
										});
									}
								}).done(function(dom){
									$span.append(dom);
									addInputValueSetSequence(this, field);
									//将普通表单添加到content
									content.addNormalInput(this);
								});
							})
							;
				}
			}

			

			/**
			 * 
			 */
			function createFieldInput(field, fieldName, preparedCallback){
				//构造表单控件对象
				var detailInput = new DetailInput({
					type				: field.type,
					dfieldId			: field.id,
					fieldId				: field.fieldId,
					optionsKey			: field.optionGroupKey,
					fieldOptionsFetcher,
					$container			: $page.find('.field-input-container'),
					defaultValue		: field.dv,
					validators			: (field.validators || '').split(','),
				});
				detailInput.setName(fieldName);
				return detailInput.renderDOM(preparedCallback);
			}
			/**
			 * 移除行的回调
			 */
			function removeArrayItemRow(){
				var $row = $(this).closest('tr');
				var contentRow = $row.data('content-row');
				if(contentRow){
					require('dialog').confirm('确定移除该行？').done(function(){
						var $tbody = $row.closest('tbody');
						$row.remove();
						contentRow.remove();
						refreshPagination($tbody);
					});
				}
			}
			
			/**
			 * 弹出框编辑行的回调
			 */
			function dialogUpdateArrayItemRow(arrayItemCode, group){
				var $row = $(this).closest('tr');
				require('dialog').openDialog('jv/entity/curd/rabc_update/' + param.validateSign + '/' + group.id + '/' + arrayItemCode, '编辑实体', undefined, {
					width	: 1000,
					height	: 450,
					events:	{
						afterSave	: function(entitiesLoader){
							updateArrayItem(entitiesLoader, group, $row);
						}
					}
				})
			}
			
			function renderArrayItems(){
				var entity = this.getStatus('entity');
				var content = this.getStatus('content');
				//覆盖渲染实体的数组字段
				tmplMap['update-array-item-rows']
					.replaceFor($('style[target="array-item-rows"]', $page), function(group){
					return {entity, group}
				}, {
					removeRow	: removeArrayItemRow,
					updateRow	: dialogUpdateArrayItemRow
				}, function($rows, fieldGroupData){
					//添加一个arrayComposite
					var compositeName = fieldGroupData.group.composite.name;
					var contentComposite = content.getArrayComposite(compositeName);
					
					//var contentComposite = content.addArrayComposite(compositeName);
					var $fieldGroup = $rows.closest('.field-group');
					$rows.filter('tr').each(function(){
						var $row = $(this);
						var contentRow = contentComposite.addRow();
						$row.data('content-row', contentRow);
						contentRow.setEntityCode($row.attr('data-code'));
						contentRow.setRelationLabelSelect($row.find('select.array-item-relation-label-select'));
						tmplMap['group-field-input'].replaceFor(
								$('style[target="array-item-field-input"]', $row), {}, {}, 
								function($span, data, isLast){
									var field = data.data.field;
									var arrayItem = data.data.arrayItem;
									var fieldName = toCompositeFieldName(field, compositeName);
									createFieldInput(field, fieldName)
										.done(function(dom){
											$span.append(dom);
											this.setValue(arrayItem.fieldMap[field.id], true);
											contentRow.addInput(this);
										});
								});
					});
					bindTableEvent($fieldGroup);
				});
			}
			
			function toCompositeFieldName(field, compositeName){
				return field.name.substring(compositeName.length + 1);
			}
			
			//用于延迟设置普通字段值的序列
			var normalInputValueSetSequence = [];
			function addInputValueSetSequence(detailInput, field){
				normalInputValueSetSequence.push({detailInput, field});
			}

			function setDetailInputsValue(){
				var entity = this.getStatus('entity');
				var normalFieldInputInited = this.getStatus('normalFieldInputInited');
				doWhen(/.*create/, function(){
					if(normalFieldInputInited){
						//创建模式下，有默认值的表单设置默认值
						while(1){
							var f = normalInputValueSetSequence.shift();
							if(!f) break;
							f.detailInput.enableDefaultValue(true);
						}
						$CPF.closeLoading();
					}
				});
				doWhen(/.*update/, function(){
					//修改模式下，为表单设置实体字段值
					if(entity && normalFieldInputInited){
						while(1){
							var f = normalInputValueSetSequence.shift();
							if(!f) break;
							var value = entity.fieldMap[f.field.id];
							f.detailInput.setValue(value, true);
							f.detailInput.setReadonly(getReadonly(f.field, value))
						}
						$CPF.closeLoading();
					}
				});
			}
			
			function getReadonly(field, value){
				switch(field.fieldAccess){
					case '读':
						return true;
					case '补':
						return !value;
				}
				
			}
			
			function renderFusionToggler(){
				tmplMap['fusion-toggler'].replaceIn($page, {}, {
					toggleFusionMode	: function(){
						var $toggler = $(this);
						$toggler.toggleClass('on');
						var isOn = $toggler.is('.on');
						$toggler.attr('title', '融合模式：（' + (isOn? '开': '关') + '）');
						$('#save', $page).toggleClass('fuse-mode', isOn);
						status.setStatus('fuseMode', isOn);
					}
				});
			}
			
			function renderErrors(){
				
			}
			
			function renderHistory(){
				var history = this.getStatus('history');
				if(history){
					var historyItems = toHistoryItems(history);
					//渲染按钮
					tmplMap['timeline-toggler']
						.replaceIn($page, this.properties);
					//渲染历史框
					tmplMap['timeline-area']
						.replaceIn($page, {
								historyItems,
								hasMore	: false
							}, {
								goHistory:	function(versionCode){
									var $dd = $(this).closest('dd');
									if(!$dd.is('.current')){
										$CPF.showLoading();
										loadEntity(versionCode);
									}
								}
							});
					status.setStatus('versionCode');
				}
			}
			
			/**
			 * 根据当前的versionCode设置历史时间轴中当前的节点
			 */
			function setCurrentHistoryItem(){
				var versionCode = status.getStatus('versionCode');
				if(versionCode){
					$('#timeline-area .VivaTimeline>dl>dd', $page)
						.filter('.current')
						.removeClass('current')
						.end()
						.filter('dd[data-id="' + versionCode + '"]')
						.addClass('current');
						
				}
			}
			
			/**
			 * 渲染并绑定导出详情按钮
			 */
			function bindExport(){
				var _this = this;
				tmplMap['btn-export'].replaceIn($page, this.properties, {
					doExport	: function(){
						var entity = _this.getStatus('entity');
						var versionCode = _this.getStatus('versionCode');
						var reqParam = {};
						if(versionCode){
							reqParam.versionCode = versionCode;
						}
						doWhen(/node.+/, function(){reqParam.nodeId = param.nodeId},
								/user.+/, function(){if(param.dtmplId) reqParam.dtmplId = param.dtmplId});
						if(entity.code){
							require('dialog').confirm('确认导出当前详情页？').done(function(){
								$CPF.showLoading();
								Ajax.ajax('api2/entity/export/detail/' + param.validateSign + '/' + entity.code, reqParam, function(data){
									if(data.status === 'suc'){
										if(data.uuid){
											Ajax.download('api2/entity/export/download/' + data.uuid);
										}
									}
								}, {
									afterLoad	: function(){
										$CPF.closeLoading();
									}
								});
							});
						}
					}
				});
			}
			
		});
		
		
		
		function bindTableEvent($page){
			/**
			 * 排序
			 */
			$('.field-array-table table', $page).each(function(){
				var $table = $(this);
				var $orderHeads = $('>thead>tr>th.sorting', $table);
				var $tbody = $('>tbody', $table);
				$orderHeads.click(function(){
					var $thisHead = $(this);
					var colIndex = $('>thead>tr>th', $table).index($thisHead);
					var fieldType = $thisHead.attr('field-type');
					$orderHeads.not(this).filter('.sorting_desc,.sorting_asc').removeClass('sorting_desc sorting_asc');
					if($thisHead.is('.sorting_asc')){
						$thisHead.removeClass('sorting_asc').addClass('sorting_desc');
						sortTable($tbody, colIndex, 'desc', fieldType);
					}else if($thisHead.is('.sorting_desc')){
						$thisHead.removeClass('sorting_desc sorting_asc');
						sortTable($tbody);
					}else{
						$thisHead.removeClass('sorting_desc').addClass('sorting_asc');
						sortTable($tbody, colIndex, 'asc', fieldType);
					}
				});
			});
			
			//筛选
			$('.keyword-search-container :text', $page).on('input propertychang', function(){
				var $text = $(this);
				var keyword = $text.val();
				var $tbody = $text.closest('.field-group').find('.field-container .field-array-table tbody');
				$tbody.children('tr').each(function(i){
					var $row = $(this);
					var flag = keyword == '';
					$row.children('td').slice(1).each(function(){
						var $cell = $(this);
						if(!isExceptFilterCell($cell)){
							var cellText = $cell.data('origin-text');
							if(cellText == undefined){
								cellText = $cell.text();
							}
							if(keyword){
								if(cellText.indexOf(keyword) >= 0){
									var html = cellText.replace(keyword, '<k>' + keyword + '</k>');
									$cell.html(html);
									flag = true;
									$cell.data('origin-text', cellText);
								}
							}else{
								if($cell.data('origin-text')){
									$cell.html(cellText);
								}
							}
						}
					});
					$row.toggleClass('hidden-row', !flag);
				});
				refreshPagination($tbody);
				return false;
			});
			
			function isExceptFilterCell($cell){
				return $cell.is('[field-type="file"]');
			}
			
			
			
			function sortTable($tbody, colIndex, orderDir, fieldType){
				var datas = [];
				var $rows = $tbody.children('tr').not('.hidden-row').each(function(i){
					var $row = $(this);
					var $orderCol = $row.children('td').eq(colIndex);
					datas.push({
						data	: $orderCol.text(),
						index	: i,
						order	: $row.attr('origin-order')
					});
				});
				
				for(var i = 0; i < datas.length; i++){
					for(var j = i + 1; j < datas.length; j++){
						if(orderDir && shouldSwap(datas[i].data, datas[j].data, orderDir, fieldType)
							|| !orderDir && shouldSwap(datas[i].order, datas[j].order, 'asc')){
							var t = datas[i];
							datas[i] = datas[j];
							datas[j] = t;
						}
					}
				}
				
				for(var i = 0; i < datas.length; i++){
					var $row = $rows.eq(datas[i].index);
					$row.children('td').eq(0).text(i + 1);
					$tbody.append($row);
				}
				
				refreshPagination($tbody);
			}
			
			function shouldSwap(x, y, orderDir, fieldType){
				var FieldInput = require('field/js/field-input.js');
				if(orderDir === 'asc'){
					return FieldInput.compare(x, y, fieldType) > 0;
				}else if(orderDir === 'desc'){
					return FieldInput.compare(x, y, fieldType) < 0;
				}
			}
			
			/**
			 * 分页
			 */
			$('.field-array-table>table', $page).each(function(){
				refreshPagination($('>tbody', this))
			});
		}
		

		var pageSize = 5;
		function refreshPagination($tbody, goPageNo){
			var $rows = $tbody.children('tr');
			var count = $rows.not('.hidden-row').each(function(i){
				var $indexCell = $(this).children('td').eq(0);
				$indexCell.text(i + 1);
			}).length;
			
			var $widgetHeader = $tbody.closest('.field-group').find('>div.widget-header');
			var $paginationContainer = $widgetHeader.find('>div.pagination-container');
			
			if(count <= pageSize){
				//不需要分页
				$paginationContainer.remove();
				$tbody.children('tr').addClass('show-page-row');
			}else{
				var initPageNo = 1; 
				if($paginationContainer.length == 0){
					$paginationContainer = buildPaginationContainer();
					$widgetHeader.append($paginationContainer);
				}else{
					initPageNo = parseInt($paginationContainer.find('ul.pagination>li.active').text());
				}
				var $paginationList = $paginationContainer.children('ul');
				var $firstLi = $paginationList.children('li.page-first');
				$firstLi.nextUntil('li.page-last').remove();
				//刷新后的页号
				
				var pageCount = Math.ceil(count / pageSize);
				
				for(var i = pageCount; i >= 1; i--){
					var $pageLi = $('<li><a href="#">' + i + '</a></li>');
					$pageLi.children('a').click(function(){
						goPage(parseInt($(this).text()), $paginationList, $tbody);
						return false;
					});
					$firstLi.after($pageLi);
				}
				if(goPageNo === 'last'){
					goPageNo = pageCount;
				}else{
					goPageNo = goPageNo || initPageNo;
				}
				goPage(goPageNo, $paginationList, $tbody);
			}
			
			
		}
		
		function goPage(pageNo, $paginationList, $tbody){
			//显示的最多页码个数
			var maxPaginator = 3;
			var $pageNos = $paginationList.children('li').removeClass('hidden-paginator').not('.page-first,.page-last');
			$pageNos.removeClass('active');
			if($pageNos.length > maxPaginator){
				var half = Math.ceil(maxPaginator / 2);
				if(pageNo >= half){
					$pageNos.slice(0, pageNo - half).addClass('hidden-paginator');
				}
				$pageNos.slice(pageNo + half - 1).addClass('hiden-paginator');
			}
			$pageNos.eq(pageNo - 1).addClass('active');
			$tbody.children('tr').removeClass('show-page-row');
			var start = (pageNo - 1) * pageSize;
			$tbody.children('tr').not('.hidden-row').slice(start, start + pageSize).addClass('show-page-row');
			var $goFirst = $paginationList.children('.page-first').removeClass('disabled').off('click'),
				$goLast = $paginationList.children('.page-last').removeClass('disabled').off('click');
			if(pageNo == 1){
				$goFirst.addClass('disabled');
			}else{
				$goFirst.click(function(){goPage(1, $paginationList, $tbody)})
			}
			if(pageNo == $pageNos.length){
				$goLast.addClass('disabled');
			}else{
				$goLast.click(function(){goPage($pageNos.length, $paginationList, $tbody)})
			}
		}
		
		function buildPaginationContainer(){
			var $container = $('<div class="widget-buttons pagination-container">'
					+ '<ul class="pagination pagination-sm">'
					+ '<li class="page-first disabled"><a href="#">«</a></li>'
					+ '<li class="page-last"><a href="#">»</a></li>'
					+ '</ul></div>');
			return $container;
			
		}
		
		
		function bindIndexer($page){
			var Indexer = require('indexer');
			var $scrollTarget = $page.closest('.main-tab-content')[0];
			if($page.getLocatePage().getType() === 'dialog'){
				$scrollTarget = $page.closest('.modal-body-wrapper')[0];
			}
			var indexer = new Indexer({
				scrollTarget: $scrollTarget,
				elements	: $('.group-container>.field-group', $page),
				titleGetter	: function(ele){
					return $(this).find('.group-title').text();
				},
				offsetGetter: function(){
					var $this = $(this);
					var thisOffsetTop = $this[0].offsetTop;
					var top = 0;
					if($this[0].offsetParent){
						top = $this[0].offsetParent.offsetTop;
					}
					return thisOffsetTop + top;
				}
			});
			$page.append(indexer.getContainer());
			indexer.triggerScroll();
		}
		
		function bindFieldInput($page){
			var FieldInput = require('field/js/field-input.js');
			$('.field-view[field-type],.value-row>td[field-type]', $page).each(function(){
				var $this = $(this);
				var type = $this.attr('field-type');
				switch(type){
					case 'file':
						var src = $this.text().trim();
						var fieldInput = new FieldInput({
							type	: 'file',
							value	: src,
							readonly: true
						});
						$this.empty().append(fieldInput.getDom());
						break;
					default:
				}
			});
		}
	}
	
	
	function toHistoryItems(history){
		var Utils = require('utils');
		var historyItems = [];
		var monthKeyMap = {};
		var monthes = [];
		$.each(history, function(){
			var thisMonthArray = monthKeyMap[this.monthKey]; 
			if(!thisMonthArray){
				monthes.push(this.monthKey);
				thisMonthArray = monthKeyMap[this.monthKey] = [];
			}
			var index = 0;
			for(var j = thisMonthArray.length - 1; j >= 0; j--){
				if(thisMonthArray[j].time > this.time){
					index = j + 1;
					break;
				}
			}
			thisMonthArray.splice(index, 0,{
				code	: this.code,
				time	: this.time,
				timeStr	: Utils.formatDate(new Date(this.time), 'yyyy-MM-dd hh:mm:ss'),
				userName: this.userName,
				current	: this.current
			});
		});
		$.each(monthes.sort(sequence), function(){
			var monthKey = this;
			historyItems.push({
				monthTime	: monthKey,
				monthStr	: Utils.formatDate(new Date(monthKey), 'yyyy年MM月')
			});
			$.merge(historyItems, monthKeyMap[monthKey]);
		});
		return historyItems;
	}
	function sequence(a, b){
		return parseInt(b) - parseInt(a);
	}
});