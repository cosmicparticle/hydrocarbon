define(function(require, exports, module){
	"use strict";
	 function adjustFieldTitle($titleLabel){
		var $titleSpan = $('<span class="field-title-d">').text($titleLabel.text());
		$titleLabel.empty().append($titleSpan);
		require('utils').removeStyle($titleLabel, 'font-size');
		require('utils').removeStyle($titleLabel, 'line-height');
		var thisWidth = $titleSpan.width(),
		thisHeight = $titleSpan.height(),
		parentWidth = $titleLabel.width(),
		parentHeight = $titleLabel.height(),
		parentFontsize = parseFloat($titleLabel.css('font-size'));
		;
		var row = Math.ceil(thisWidth / parentWidth);
		var parentLineheight = parentHeight / row;
		if(parentFontsize >= parentLineheight){
			$titleLabel.css('font-size', (parentLineheight - 2) + 'px');
		}
		$titleLabel.css('line-height', (parentLineheight - 1) + 'px');
		
		$titleLabel.text($titleSpan.text());
	};
	exports.adjustFieldTitle = adjustFieldTitle;
	
	exports.init = function($page, _param){
		var FieldSearch = require('field/js/field-search.js');
		var FieldInput = require('field/js/field-input.js');
		
		FieldInput.loadGlobalOptions('admin/field/enum_json').done(function(){
			//初始化参数
			var param = $.extend({
				tmplData	: {}
			}, _param);
			
			//字段组容器
			var $groupContainer = $('.group-container', $page);
			//字段模板
			var $tmplFieldGroup = $('#tmpl-field-group', $page);
			var $tmplField = $('#tmpl-field', $page);
			
			var tmplData = param.tmplData;
			
			//
			var indexer = null;
			
			/**
			 * 初始化某个字段组内的字段容器的拖拽事件
			 */
			function bindGroupFieldsDraggable($fieldContainer){
				$fieldContainer.sortable({
					helper 		: "clone",
					cursor 		: "move",// 移动时候鼠标样式
					opacity		: 0.5, // 拖拽过程中透明度
					placeholder	: function(curr){
						return curr.is('.dbcol')? 
								'field-item-placeholder dbcol'
								: 'field-item-placeholder'  
					},
					tolerance 	: 'pointer'
				});
			}
			
			/**
			 * 获得某个元素所在的字段最顶层dom
			 */
			function getLocateField($dom){
				return $($dom).closest('.field-item');
			}
			
			/**
			 * 获得某个元素所在的字段组最顶层dom
			 */
			function getLocateGroup($dom){
				return $($dom).closest('.field-group');
			}
			
			/**
			 * 获得字段组的字段容器dom
			 */
			function getFieldContainer($group){
				return $('.field-container', $group);
			}
			
			var choosedArrayCompositeIdSet = new Set();
			
			/**
			 * 初始化某个字段组的自动完成功能
			 */
			function initGroupFieldSearchAutocomplete($group){
				var $fieldSearch = $('.field-search', $group);
				var fieldSearch = FieldSearch.bind($fieldSearch, {
					single			: true,
					textPicked		: true,
					module			: param.module,
					exceptComposites: choosedArrayCompositeIdSet,
					fieldFilters	: ['file'],
					afterChoose		: function(field){
						if(field.composite.isArray){
							//选择的字段是一个数组字段，锁定当前选择器的标签页
							fieldSearch.lockTab();
							choosedArrayCompositeIdSet.add(field.composite.c_id.toString());
							//TODO: 将字段添加到数组当中
						}else{
							fieldSearch.hideArrayComposites();
						}
						appendFieldToGroup({
							title			: field.title,
							fieldId			: field.id,
							colNum			: 1,
							optionGroupKey	: field.optGroupKey,
							name			: field.name,
							type			: field.type,
						}, $group, {
							isArrayField	: field.composite.isArray == 1,
							relations		: field.composite.relationSubdomain
						});
					}
				});
				$group.data('fieldSearch', fieldSearch);
			}
			/**
			 * 添加一个字段到指定的字段组中
			 * @param groupFieldData 字段数据，必须包含fieldId属性
			 */
			function appendFieldToGroup(groupFieldData, $group, option){
				//构造新字段的内容
				var fieldData = {
						id				: groupFieldData.id,
						title			: groupFieldData.title,
						fieldId			: groupFieldData.fieldId,
						dv				: groupFieldData.dv,
						colNum			: groupFieldData.colNum,
						fieldOriginTitle: groupFieldData.fieldOriginTitle,
						fieldAvailable	: groupFieldData.fieldAvailable == undefined? true: groupFieldData.fieldAvailable,
						fieldType		: groupFieldData.type,
						fieldName		: groupFieldData.name,
						optGroupKey		: groupFieldData.optionGroupKey,
						validators		: []
				};
				var VALIDATORS = ['required'];
				if(!$.isArray(groupFieldData.validators)){
					groupFieldData.validators = [];
				}
				for(var i in VALIDATORS){
					fieldData.validators[VALIDATORS[i]] = groupFieldData.validators.indexOf(VALIDATORS[i]) >= 0;
				}
				//将字段插入到字段组中
				var $fieldContainer = getFieldContainer($group);
				var fieldSearch = $group.data('fieldSearch');
				fieldSearch.getFieldData(fieldData.fieldId).done(function(field){
					fieldData.fieldOriginTitle = field? (field.c_cname + '-' + field.title) : '';
					if(option.isArrayField){
						//添加数组字段
						var $arrayTable = $('.field-array-table', $fieldContainer);
						if($arrayTable.length == 0){
							//还没有添加字段过
							$arrayTable = $('#tmpl-field-array-table', $page).tmpl();
							$arrayTable.appendTo($fieldContainer);
							var $relationSelect = null;
							if($.isArray(option.relations)){
								var $titleCell = $('<th>关系</th>')
								$relationSelect = $('<select class="tmpl-relation-labels">');
								for(var i in option.relations){
									$relationSelect.append('<option value="' + option.relations[i] + '">' + option.relations[i] + '</option>');
								}
								$arrayTable.find('.title-row').children('.delete-col').before($titleCell);
								//$arrayTable.find('.value-row').append($('<td>').append($relationSelect));
							}
							$arrayTable.find('.title-row').sortable({
								helper		: 'original',
								cursor		: 'move',
								axis		: 'x',
								opacity		: 0.5,
								tolerance 	: 'pointer',
								items		: '>th[field-id]',
								stop		: function(e, ui){
									var Utils = require('utils');
									$(this).children().each(function(index){
										var $title = $(this);
										var fieldId = $title.attr('field-id');
										if(fieldId){
											$arrayTable.find('tbody').children('tr').each(function(){
												var $row = $(this);
												var $cell = null;
												if(fieldId){
													$cell = $row.find('td[field-id="' + fieldId + '"]');
												}
												if($cell != null){
													Utils.prependTo($cell, $row, index);
												}
											});
										}
									});
								}
							});
							var $createArrayControl = $group.find('.create-arrayitem-control');
							
							function createRow(e, initData){
								var fields = [];
								initData = initData || {};
								var $arrayTable = $('.field-array-table', $fieldContainer);
								$arrayTable.find('.title-row').children('th[field-id]').each(function(){
									fields.push($(this).data('originField'));
								});
								var $tbody = $arrayTable.find('tbody');
								var $row = $('#tmpl-field-array-value-row', $page).tmpl({
									entityCode	: initData.entityCode,
									arrayEntityId	: initData.arrayEntityId,
									index		: $tbody.children('tr').length, 
									composite	: field.composite,
									fields		: fields
								});
								$row.find('.field-input.relation').append($relationSelect && $relationSelect.clone());
								$row.find('.array-item-remove').click(function(){
									require('dialog').confirm('确定删除该行？', function(yes){
										if(yes){
											$row.nextAll('tr').each(function(){
												var $thisRow = $(this);
												var index = $thisRow.index();
												$thisRow.find('td.number-col').text(index);
											});
											$row.remove();
										}
									});
								})
								$row.find('.field-input[field-id]').each(function(i){
									var $cell = $(this).closest('td');
									var field = fields[i];
									var entityFieldValue = '';
									if(initData.fieldMap){
										var entityField = initData.fieldMap['f_' + field.id];
										if(entityField){
											entityFieldValue = entityField.value;
											$cell.attr('data-id', entityField.id)
										}
									}
									var fieldInput = new FieldInput({
										type		: field.type,
										value		: entityFieldValue,
										optionsKey	: field.optGroupKey,
										$page		: $page
									});
									$(this).append(fieldInput.getDom()).data('field-input', fieldInput);
								});
								$tbody.append($row);
							}
							$createArrayControl.show();
							if($createArrayControl.data('bindedCreateRowFunc')){
								$createArrayControl.off('click', $createArrayControl.data('bindedCreateRowFunc'));
							}
							$createArrayControl.on('click', createRow).data('bindedCreateRowFunc', createRow);
							
							
							var $arrayitemControl = $group.find('.select-arrayitem-control');
							if(field.composite.addType == 5){
								function tmplClick(){
									var reqParam = {};
									var stmplId = $group.attr('stmpl-id'); 
									if(!stmplId){
										reqParam.moduleName = param.module;
										reqParam.compositeId = field.c_id;
									}
									require('dialog').openDialog(
											'admin/tmpl/stmpl/' + (stmplId? ('update/' + stmplId) : 'create')
											, '编辑选择模板' + field.c_title, undefined, {
												reqParam	: reqParam,
												width		: 1000,
												height		: 500,
												events		: {
													afterSave	: function(stmplId){
														if(stmplId){
															console.log(stmplId);
															$group.attr('stmpl-id', stmplId);
														}
													}
												}
											});
								}
								function toselectClick(){
									var reqParam = {};
									var stmplId = $group.attr('stmpl-id'); 
									var existCodes = []; 
									var $this = $(this);
									var $table = $this.closest('.field-group').find('table');
									$table.find('>tbody>tr').each(function(){
										var entityCode = $(this).attr('data-code');
										if(entityCode){
											existCodes.push(entityCode);
										}
									});
									
									require('dialog').openDialog('admin/tmpl/atmpl/rel_selection/' + stmplId, 
											undefined, undefined, {
										reqParam	: {
											exists	: existCodes.join()
										},
										width		: 1000,
										height		: 400,
										onSubmit	: function(entitiesLoader){
											var fieldNames = [];
											var fields = [];
											$('>thead>tr>th', $table).each(function(){
												var originField = $(this).data('originField');
												if(originField){
													fieldNames.push(originField.name);
													fields.push(originField);
												}
											});
											entitiesLoader(fieldNames).done(function(entities){
												console.log(entities);
												function _(i){
													if(entitiesLoader.codes.length > i){
														var entity = entities[entitiesLoader.codes[i]];
														var fieldMap = {};
														$.each(fields, function(){
															fieldMap['f_' + this.id] = {
																value	: entity[this.name]
															}
														});
														$createArrayControl.trigger('click', {
															entityCode	: entitiesLoader.codes[i],
															fieldMap	: fieldMap
														});
														if(entitiesLoader.codes.length > i + 1){
															_(i + 1);
														}else{
															//refreshRowTable();
														}
													}
												}
												_(0);
											});
										}
									});
								}
								
								if($arrayitemControl.data('bindedClickEvent')){
									$arrayitemControl.find('a.btn-tmpl').off('click', $arrayitemControl.data('bindedClickEvent').tmplClick)
									$arrayitemControl.find('a.btn-toselect').off('click', $arrayitemControl.data('bindedClickEvent').toselectClick)
								}
								$arrayitemControl.find('a.btn-tmpl').on('click', tmplClick);
								$arrayitemControl.find('a.btn-toselect').on('click', toselectClick);
								$arrayitemControl.data('bindedClickEvent', {tmplClick:tmplClick, toselectClick:toselectClick}).show();
							}else{
								$arrayitemControl.remove();
							}
						}
						var $titleCell = $('#tmpl-field-array-title', $page).tmpl(fieldData);
						$titleCell.data('field-data', fieldData);
						$titleCell.data('originField', field);
						$arrayTable.find('.title-row').children('.delete-col').before($titleCell);
						$arrayTable.find('tbody').children('tr').each(function(){
							var $row = $(this);
							var $valueCell = $('#tmpl-field-array-value-cell', $page).tmpl({field:field});
							var fieldInput = new FieldInput({
								type		: field.type,
								value		: '',
								optionsKey	: field.optGroupKey,
								$page		: $page
							});
							$valueCell.append(fieldInput.getDom());
							$row.children('.delete-col').before($valueCell);
						});
						$arrayTable.find('tfoot td').attr('colspan', $arrayTable.find('.title-row').children().length);
						//$arrayTable.find('.value-row').append($('#tmpl-field-array-value', $page).tmpl(fieldData));
					}else{
						var $field = $tmplField.tmpl(fieldData);
						$field.data('field-data', fieldData).appendTo($fieldContainer);
						initFieldDefaultValue($field, true);
						adjustFieldTitle($field.find('.field-title'));
					}
					fieldSearch.enableField(fieldData.fieldId, false).done(function(field){
						if(field){
							if(field.composite.isArray){
								$group.attr('composite-id', field.composite.c_id);
								choosedArrayCompositeIdSet.add(field.composite.c_id.toString());
								fieldSearch.lockTabByCompositeId(field.composite.c_id);
							}else{
								fieldSearch.hideArrayComposites();
							}
						}
						if(option.deferred){
							option.deferred.complete();
						}
					});
				});
				return true;
			}
			
			/**
			 * 绑定双击时，编辑该文本的事件
			 */
			function bindDblClickEdit(selector, inputClass){
				$page.on('dblclick', selector, function(e){
					require('utils').toEditContent(e.target, inputClass).bind('confirmed', function(text, $this){
						if($this.is('.field-title')){
							adjustFieldTitle($this);
						}else if($this.is('.group-title')){
							if(indexer){
								indexer.syncTitle();
							}
							//焦点放到字段搜索框中
							getLocateGroup($this).find('.search-text-input').select();
						}
					});
				});
			}
			
			/**
			 * 切换字段的显示长度
			 */
			function toggleFieldExpand($field, toExpand){
				var $i = $('.toggle-expand-field i', $field);
				require('utils').switchClass($i, 'fa-expand', 'fa-compress', toExpand, function(compressed){
					$field.toggleClass('dbcol', !compressed);
				});
			}
			
			/**
			 * 绑定全局事件
			 */
			function bindPageEvent(event, selector, callback){
				$page.bind(event, selector, function(e){
					var $target = $(e.target);
					if($target.is(selector)){
						try{
							callback.apply($target, [e]);
						}catch(e){}
						return false;
					}
				});
			}
			/**
			 * 检查并整合页面中的模板数据
			 */
			function checkSaveData(callback){
				var Dialog = require('dialog');
				var saveData = {
						tmplId	: param.tmplId,
						//模板名
						title	: $('#tmplName', $page).val(),
						//字段组
						groups	: [],
						//模板模块
						module	: param.module
				};
				//遍历所有字段组
				getAllGroups().each(function(){
					var $group = $(this);
					var $arrayTable = $group.find('.field-array-table');
					var isArray = $arrayTable.length > 0;
					
					var group = {
							id		: $group.attr('data-id'),
							title	: $group.find('span.group-title').text(),
							isArray	: isArray,
							fields	: []
					};
					saveData.groups.push(group);
					if(isArray){
						group.entities = [];
						group.selectionTemplateId = $group.attr('stmpl-id');
						group.compositeId = $group.attr('composite-id');
						group.unallowedCreate = $group.find('.create-arrayitem-control :checkbox').prop('checked')? 1 : 0;
						$arrayTable.find('.title-row>th[field-id]').each(function(){
							var $th = $(this);
							var field = $th.data('field-data');
							group.fields.push({
								id		: $th.attr('data-id'),
								fieldId	: $th.attr('field-id'),
								title	: $th.children('span').text()
							});
						});
						
						$arrayTable.find('tbody>tr').each(function(){
							var $row = $(this);
							var fieldMap = {};
							$row.find('td[field-id]').each(function(){
								var $cell = $(this);
								var fieldId = $cell.attr('field-id');
								var fieldInput = $cell.find('span.field-input[field-id]').data('field-input');
								if(fieldInput){
									fieldMap['f_' + fieldId] = {
										id		: $cell.attr('data-id'),
										value	: fieldInput.getValue() + ''
									}
								}
							});
							group.entities.push({
								id					: $row.attr('data-id'),
								relationLabel		: $row.find('select.tmpl-relation-labels').val(),
								relationEntityCode	: $row.attr('data-code'),
								fieldMap			: fieldMap
							});
						});
						
					}else{
						//遍历所有字段
						$group.find('.field-item').each(function(){
							var $field = $(this);
							var field = {
									id			: $field.attr('data-id'),
									fieldId		: $field.attr('field-id'),
									title		: $field.find('label.field-title').text(),
									viewVal		: '',
									dbcol		: $field.is('.dbcol'),
									validators	: ''
							};
							var $fieldValue = $field.find('.field-value').eq(0);
							var fieldInput = $fieldValue.data('field-input');
							if(fieldInput){
								field.viewVal = fieldInput.getValue();
							}
							$field.find('.field-validate-menu>li.checked-validate').each(function(){
								field.validators += $(this).attr('validate-name') + ';';
							});
							if(field.validators){
								field.validators = field.validators.substring(0, field.validators.length - 1);
							}
							group.fields.push(field);
						});
					}
				});
				if(!saveData.title){
					Dialog.notice('请填写模板名', 'error');
				}else if(saveData.groups.length == 0){
					Dialog.notice('请至少添加一个字段组', 'error');
				}else{
					Dialog.confirm('确认保存模板？', function(yes){
						if(yes){
							(callback || $.noop)(saveData);
						}
					});
				}
			}
			
			function getAllGroups(){
				return $groupContainer.find('.field-group');
			}
			
			var disabledFieldIdSet = new Set();
			
			//初始化字段组容器的拖拽事件
			$groupContainer.sortable({
				helper		: 'clone',
				cursor		: 'move',
				opacity		: 0.5,
				placeholder	: 'group-item-placeholder',
				handle		: '.group-title',
				tolerance 	: 'pointer',
				update		: function(){
					if(indexer){
						indexer.refresh(getAllGroups());
					}
				}
			
			});
			
			//绑定点击添加字段组按钮的事件
			$('#add-group', $page).click(function(){
				var $group = $tmplFieldGroup.tmpl({
					title			: '新字段组',
					unallowedCreate	: null
				}).appendTo($groupContainer);
				//绑定字段组内字段的拖动动作
				bindGroupFieldsDraggable(getFieldContainer($group));
				//初始化字段组的字段搜索自动完成功能
				initGroupFieldSearchAutocomplete($group);
				//页面滚动到底部
				require('utils').scrollTo($page.closest('.cpf-page-content'));
				//触发字段组的标题修改功能
				$group.find('.group-title').trigger('dblclick');
				if(indexer){
					indexer.refresh(getAllGroups());
				}
			});
			
			//绑定点击保存按钮时的回调
			$('#save', $page).click(function(){
				checkSaveData(function(saveData){
					require('ajax').postJson('admin/tmpl/atmpl/save', saveData, function(data){
						if(data.status === 'suc'){
							require('dialog').notice('保存成功', 'success');
							$page.getLocatePage().close();
							var tpage = require('page').getPage(param.module + '_atmpl_list');
							if(tpage){
								tpage.refresh();
							}
						}else{
							require('dialog').notice('保存失败', 'error');
						}
					});
				});
			});
			
			//绑定模板名称回车时，添加一个字段组
			$('#tmplName', $page).keypress(function(e){
				if(e.keyCode === 13){
					if($groupContainer.children('.field-group').length === 0){
						$('#add-group', $page).trigger('click');
					}
				}
			});
			
			//切换字段的显示长度
			bindPageEvent('click', '.toggle-expand-field i', function(e){
				var $field = getLocateField(this);
				toggleFieldExpand($field);
			});
			
			//删除字段
			bindPageEvent('click', '.remove-field i', function(e){
				var $field = getLocateField(e.target),
				$group = getLocateGroup(e.target),
				fieldTitle = $field.find('.field-title').text(),
				groupName = $group.find('.group-title').text();
				require('dialog').confirm('确认在字段组[' + groupName + ']中删除字段[' + fieldTitle + ']？', function(yes){
					if(yes){
						if($field.siblings('div[field-id]').length == 0){
							//如果是最后一个字段，那么就重置该字段组
							$field.closest('.field-group').removeAttr('data-id');
						}
						var fieldSearch = $group.data('fieldSearch');
						if(fieldSearch){
							fieldSearch.enableField($field.attr('field-id'));
						}
						$field.remove();
					}
				});
			});
			
			var ignoredFieldType = ['file', 'image'];
			function initFieldDefaultValue($field, toSetDefVal){
				var $fieldValue = $field.find('.field-value').eq(0);
				var fieldData = $field.data('field-data');
				console.log(fieldData);
				if(ignoredFieldType.indexOf(fieldData.fieldType) < 0){
					var fieldInputParam = {
							$page: $page,
							fieldKey: param.module + '@' + fieldData.fieldName,
							name: fieldData.fieldName,
							optionsKey: fieldData.optGroupKey,
							//optionsSet: undefined,
							readonly: false,
							//styleClass: undefined
							type: fieldData.fieldType,
							value: fieldData.dv
					};
					var fieldInput = new FieldInput(fieldInputParam);
					$fieldValue.empty().append($('<div class="field-input">').append(fieldInput.getDom()));
					$fieldValue.data('field-input', fieldInput);
					return;
				}
			}
			
			//删除数组字段
			bindPageEvent('click', '.remove-array-field i', function(e){
				var $title = $(this).closest('th'),
				title = $title.children('span').text(),
				fieldId = $title.attr('field-id'),
				$group = getLocateGroup(e.target),
				groupName = $group.find('.group-title').text();
				if(fieldId){
					require('dialog').confirm('确认在字段组[' + groupName + ']中删除字段[' + title + ']？', function(yes){
						if(yes){
							var isOnly = false;
							if($title.siblings('th[field-id]').length == 0){
								//如果是最后一个字段，那么就把整个列表移除
								$title.closest('.field-group').removeAttr('data-id');
								$title.closest('.field-array-table').remove();
							}else{
								$title.closest('table').find('td[field-id="' + fieldId + '"]').remove();
								$title.remove();
							}
							var fieldSearch = $group.data('fieldSearch');
							if(fieldSearch){
								fieldSearch.enableField(fieldId);
							}
						}
					});
				}
			});
			
			bindPageEvent('click', '.recover-array-field i', function(e){
				var $title = $(this).closest('th'),
				title = $title.children('span').text(),
				fieldData = $title.data('field-data'),
				fieldTitle = title;
				
				if(fieldData && fieldData.title){
					fieldTitle = fieldData.title;
				}
				require('dialog').confirm('确认恢复字段[' + title + ']为原始名称[' + fieldTitle + ']？', function(yes){
					if(yes){
						$title.text(fieldTitle);
					}
				});
			});
			
			//删除字段组
			bindPageEvent('click', '.remove-group i', function(e){
				var $group = getLocateGroup(e.target);
				var groupTitle = $group.find('.group-title').text();
				var compositeId = $group.attr('composite-id');
				require('dialog').confirm('是否删除字段组[' + groupTitle + ']', function(yes){
					if(yes){
						//移除
						$group.remove();
						//释放字段组的字段选择器
						var fieldSearch = $group.data('fieldSearch');
						if(fieldSearch){
							fieldSearch.release();
						}
						choosedArrayCompositeIdSet['delete'](compositeId);
						if(indexer){
							indexer.refresh(getAllGroups());
						}
					}
				});
			});
			//双击编辑字段组标题
			bindDblClickEdit('span.group-title', 'group-title');
			//双击编辑字段标题
			bindDblClickEdit('label.field-title', 'field-title');
			bindDblClickEdit('.field-array-table tr.title-row th>span', 'field-title');
			
			//初始化默认数据
			if(tmplData && tmplData.groups){
				$.each(tmplData.groups, function(i){
					var group = tmplData.groups[i];
					var $group = 
						$tmplFieldGroup
						.tmpl($.extend({}, {unallowedCreate	: null}, group))
						.appendTo($groupContainer);
					if(!group.isArray){
						//绑定字段组内字段的拖动动作
						bindGroupFieldsDraggable(getFieldContainer($group));
					}
					//初始化字段组的字段搜索自动完成功能
					initGroupFieldSearchAutocomplete($group);
					var deferred = new MultiDeferred();
					for(var j in group.fields){
						var field = group.fields[j];
						if(field.validators){
							field.validators = field.validators.split(';');
						}
						appendFieldToGroup(field, $group, {
							isArrayField	: group.isArray == 1,
							relations		: group.relationSubdomain,
							deferred		: deferred.delay()
						});
					}
					if(group.isArray){
						deferred.allDone(function(){
							for(var k in group.entities){
								var entity = group.entities[k];
								var entityFieldMap = {}
								$.each(entity.fields, function(){
									entityFieldMap['f_' + this.fieldId] = this;
								});
								//创建行
								$group.find('.create-arrayitem-control').trigger('click', [{
									entityCode		: entity.relationEntityCode,
									arrayEntityId	: entity.id,
									fieldMap		: entityFieldMap
								}]);
								//对行内的dom进行操作
								
							}
						});
						console.log('deferreds start');
						deferred.start();
					}
				});
			}
			//字段的标题初始化，需要延迟，等到页面加载完之后执行
			setTimeout(function(){
				var Indexer = require('indexer')
				indexer = new Indexer({
					scrollTarget: $page.closest('.main-tab-content')[0],
					elements	: getAllGroups(),
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
					},
					dragable	: true
				});
				
				$('.page-body', $page).append(indexer.getContainer());
				indexer.bindSortUpdate(function(eles){
					for(var i = 0; i < eles.length; i++){
						var ele = eles[i];
						$groupContainer.append(ele.element);
					}
				});
				indexer.triggerScroll();
				$('.field-title', $page).each(function(){adjustFieldTitle($(this))});
				$('#tmplName', $page).focus().select();
			}, 50);
			
		});
		
	}
	
	function MultiDeferred(){
		var items = [];
		var allDoneCallback = $.noop;
		var started = false;
		var done = false;
		var _this = this;
		this.delay = function(){
			var completed = false;
			var delayItem = {
				isCompleted	: function(){
					return completed;
				},
				complete	: function(){
					if(!completed){
						completed = true;
						if(started){
							_this.checkAllCompleted();
						}
					}
				}
			}
			items.push(delayItem);
			return delayItem;
		}
		this.start = function(){
			started = true;
			console.log('start');
			this.checkAllCompleted();
		}
		var checkReq = 0;
		this.checkAllCompleted = function(){
			if(!done){
				if(checkReq > 0){
					checkReq++;
					return;
				}
				checkReq++;
				while(checkReq > 0){
					for(var i in items){
						if(!items[i].isCompleted()){
							checkReq--;
							return;
						}
					}
					done = true;
					allDoneCallback.apply(this, []);
					checkReq = 0;
				}
			}
		}
		this.allDone = function(callback){
			allDoneCallback = callback;
		}
	}
});