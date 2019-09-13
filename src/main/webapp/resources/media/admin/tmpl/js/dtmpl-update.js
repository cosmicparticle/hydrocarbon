define(function(require1, exports, module){
	"use strict";
	var Dialog = require1('dialog');
	 function adjustFieldTitle($titleLabel){
		var $titleSpan = $('<span class="field-title-d">').text($titleLabel.text());
		$titleLabel.empty().append($titleSpan);
		require1('utils').removeStyle($titleLabel, 'font-size');
		require1('utils').removeStyle($titleLabel, 'line-height');
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
		var FieldSearch = require1('field/js/field-search.js');
		var FieldInput = require1('field/js/field-input.js');
		
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
					afterChoose		: function(field){
						if(field.composite.isArray){
							//选择的字段是一个数组字段，锁定当前选择器的标签页
							fieldSearch.lockTab();
							choosedArrayCompositeIdSet.add(field.composite.c_id.toString());
							bindFieldGroupConfig($group, field.composite);
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
						pointModuleName : groupFieldData.pointModuleName,
						refGroupId		: groupFieldData.refGroupId,
						refGroupTitle   : groupFieldData.refGroupTitle,
						validators		: []
				};
				var VALIDATORS = ['require1d'];
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
							if($.isArray(option.relations)){
								var $titleCell = $('<th>关系</th>')
								var $relationSelect = $('<select class="tmpl-relation-labels">');
								for(var i in option.relations){
									$relationSelect.append('<option value="' + option.relations[i] + '">' + option.relations[i] + '</option>');
								}
								$arrayTable.find('.title-row').append($titleCell);
								$arrayTable.find('.value-row').append($('<td>').append($relationSelect));
							}
							$arrayTable.find('.title-row').sortable({
								helper		: 'original',
								cursor		: 'move',
								axis		: 'x',
								opacity		: 0.5,
								tolerance 	: 'pointer',
								stop		: function(e, ui){
									var Utils = require1('utils');
									$(this).children().each(function(index){
										var $title = $(this);
										var fieldId = $title.attr('field-id');
										$arrayTable.find('tbody').children('tr').each(function(){
											var $row = $(this);
											var $cell = null;
											if(fieldId){
												$cell = $row.find('td[field-id="' + fieldId + '"]');
											}else if($title.is('.number-col')){
												$cell = $row.find('td.number-col');
											}
											if($cell != null){
												Utils.prependTo($cell, $row, index);
											}
										});
									});
								}
							});
							var $createArrayControl = $group.find('.create-arrayitem-control');
							
							var $dialogItemControl = $group.find('.dialog-item-control');
							
							var $filterItemControl = $group.find('.filter-arrayitem-control');
							$filterItemControl.show().find('.btn-filter').click(function(){
								var filterId = $group.attr('array-item-filter-id');
								var reqParam = {filterId};
								require1('dialog').openDialog(
										'admin/tmpl/dtmpl/arrayitem_filter/' + param.module + '/'  + field.c_id,
										'编辑过滤器', undefined, {
											reqParam 	: reqParam,
											width		: 1000,
											height		: 500,
											events		: {
												afterSave	: function(filterId){
													$group.attr('array-item-filter-id', filterId);
												}
											}
										}
									);
							}).end().find(':checkbox.filterable').change(function(){
								var filterable = $(this).prop('checked');
								$filterItemControl.find('.btn-filter').toggle(filterable);
							});
							
							var $arrayitemControl = $group.find('.select-arrayitem-control');
							if(field.composite.addType == 5){
								$createArrayControl.show();
								$arrayitemControl
									.find(':checkbox').change(function(){
										//勾选是否显示选择按钮
										var $checkbox = $(this);
										var $a = $checkbox.closest('label').prev('a');
										$a.toggle($checkbox.prop('checked'));
									})
									.end().find('a.btn-select').click(function(){
										var reqParam = {};
										var stmplId = $group.attr('stmpl-id'); 
										if(!stmplId){
											reqParam.moduleName = param.module;
											reqParam.compositeId = field.c_id;
										}
										require1('dialog').openDialog(
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
									})
									.end().show();
								$arrayitemControl.find(':checkbox.selectable').prop('checked', !!$group.attr('stmpl-id')).trigger('change');
								if(field.composite.expand && field.composite.expand.rabcModule){
									$dialogItemControl.show().find('a.btn-dialog-rabc-tmplgroup').click(function(){
										var reqParam = {};
										var rabcTemplateGroupId = $group.attr('rabc-tmpl-group-id'); 
										if(rabcTemplateGroupId){
											reqParam.rabcTemplateGroupId = rabcTemplateGroupId;
										}
											
										
										require1('dialog').openDialog('admin/tmpl/group/rabc_relate/' + param.module + '/' + field.c_id
												, '选择关联模板组合', undefined, {
											reqParam	: reqParam,
											onSubmit	: function(data){
												if(data && data[0]){
													$group.attr('rabc-tmpl-group-id', data[0].id);
												}
											}
										});
									});
									/*$dialogItemControl.show().find('a.btn-dialog-dtmpl').click(function(){
										var reqParam = {};
										var rdtmplId = $group.attr('rdtmpl-id'); 
										if(rdtmplId){
											reqParam.dtmplId = rdtmplId;
										}
										require1('dialog').openDialog('admin/tmpl/dtmpl/relation_dtmpl/' + param.module + '/' + field.c_id
												, '编辑关系详情模板（' + field.c_title + '）', undefined, {
											reqParam	: reqParam,
											width		: 1000,
											height		: 500,
											events		: {
												afterSave	: function(rdtmplId){
													if(rdtmplId){
														console.log(rdtmplId);
														$group.attr('rdtmpl-id', rdtmplId);
													}
												}
											}
										});
									});*/
								}
								
							}else{
								$createArrayControl.remove();
								$arrayitemControl.remove();
							}
						}
						var $titleCell = $('#tmpl-field-array-title', $page).tmpl(fieldData);
						$titleCell.data('field-data', fieldData);
						$arrayTable.find('.title-row').append($titleCell);
						$arrayTable.find('.value-row').append($('#tmpl-field-array-value', $page).tmpl(fieldData));
					}else{
						var $field = $tmplField.tmpl(fieldData);
						$field.data('field-data', fieldData).appendTo($fieldContainer);
						initFieldDefaultValue($field, fieldData.dv !== '' && fieldData.dv !== undefined);
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
					});
				});
				return true;
			}
			
			function bindFieldGroupConfig($fieldGroup, composite, group){
				var $fieldGroupConfigButtons = $('.field-group-config-buttons', $fieldGroup);
				if(composite && $fieldGroupConfigButtons.is(':hidden')){
					$fieldGroupConfigButtons.show();
					//获得初始数据（该对象在字段组生命周期内是单例）
					var fieldGroupData = getFieldGroupConfigData($fieldGroup, composite, group);
					//绑定点击配置按钮打开弹出框的事件
					$('.field-group-config', $fieldGroup).click(function(){
						var groupTitle = $('.group-title', $fieldGroup).text();
						require1('tmpl').load('media/admin/tmpl/tmpl/dtmpl-fieldgroup-config-dialog.tmpl').done(function(tmpl){
							//创建一个副本对象，用于参数弹出框中的基准
							var thisFieldGroupConfigData = Object.assign({}, fieldGroupData);
							//根据参数对象，打开弹出框
							var $dialog = tmpl.tmpl(thisFieldGroupConfigData);
							var fieldGroupConfigPage = require1('dialog').openDialog($dialog, '字段组参数（' + groupTitle + '）', undefined, {
								width		: 450,
								height		: 420,
								contentType	: 'dom',
								onSubmit	: function(dataFromPage){
									//根据bindSelectionDialog方法绑定的事件，返回的对象覆盖到主参数对象中
									saveFieldGroupConfigData.apply(fieldGroupData, [thisFieldGroupConfigData, dataFromPage]);
									//根据保存的字段组参数，修改详情模板中的字段组展示
									renderFieldGroupConfig($fieldGroup, fieldGroupData);
								}
							});
							//绑定编辑模板编辑事件
							bindSelectionDialog($dialog, thisFieldGroupConfigData, composite);
							//
							bindRelTreeTemplate($dialog, thisFieldGroupConfigData);
							//绑定模板组合事件
							bindRelTemplateGroup($dialog, thisFieldGroupConfigData);
							//绑定关系/多值的筛选器事件
							bindArrayItemFiter($dialog, thisFieldGroupConfigData, composite);
							//绑定字段组参数保存事件
							bindReturnDataFromPage(fieldGroupConfigPage, thisFieldGroupConfigData);
						});
					});
				}
			}
			
			function bindRelTreeTemplate($dialog, thisFieldGroupConfigData){
				var $selectableNodes = $('.selectable-nodes', $dialog);
				//切换关联模板组合的控件显示状态
				function toggleTreeNodesControls(toShow){
					if(toShow){
						if(thisFieldGroupConfigData.rabcTreeTemplateId){
							if(thisFieldGroupConfigData.rabcTreeNodeOptions == null){
								//从后台加载属性模板的node选项
								loadNodesOptionFromServer();
							}else{
								//直接根据已有选项数据初始化控件
								initTreeNodesSelect2();
							}
						}
					}
					$selectableNodes.closest('.form-group').toggle(toShow);
				}
				/**
				 * 从后台加载属性模板的node选项
				 */
				function loadNodesOptionFromServer(){
					require1('$CPF').showLoading();
					thisFieldGroupConfigData.rabcTreeNodeOptions = [];
					require1('ajax').ajax('api2/meta/tmpl/ttmpl/' 
							+ thisFieldGroupConfigData.rabcTreeTemplateId).done(function(data){
						if(data.ttmpl && data.ttmpl){
							thisFieldGroupConfigData.rabcTreeNodeOptions = convertFromTreeNodes(data.ttmpl.nodes);
							initTreeNodesSelect2();
						}
					}).always(function(){
						require1('$CPF').closeLoading();
					});
				}
				function convertFromTreeNodes(ttmplNodes){
					var nodeOptions = [];
					$.each(ttmplNodes, function(){
						if(this.moduleName === thisFieldGroupConfigData.rabcModule){
							nodeOptions.push({
								id		: this.id,
								text	: this.title
							});
						}
					});
					return nodeOptions;
				}
				function initTreeNodesSelect2(){
					try{$selectableNodes.select2('destroy').empty()}catch(e){}
					$selectableNodes.select2({
						theme			: "bootstrap",
						width			: null,
						allowClear		: true,
						placeholder		: '',
						data			: thisFieldGroupConfigData.rabcTreeNodeOptions,
						multiple		: true
					}).val(thisFieldGroupConfigData.rabcTreeNodeIds).trigger('change');
				}
				//绑定选择模板组合后的回调
				var $chooseTreeTemplateButton = $('a.choose-ttmpl', $dialog).on('CpfAfterChoose', function(e, ttmplTitle, ttmpl){
					if(ttmpl){
						thisFieldGroupConfigData.rabcTreeTemplateId = ttmpl.id;
						thisFieldGroupConfigData.rabcTreeTemplateTitle = ttmplTitle;
						thisFieldGroupConfigData.rabcTreeNodeIds = [];
						thisFieldGroupConfigData.rabcTreeNodeOptions = convertFromTreeNodes(ttmpl.nodes);
						toggleTreeNodesControls(true);
					}
				});
				
				//绑定取消关联模板组合的事件
				$('.unselect-ttmpl', $dialog).click(function(){
					require1('dialog').confirm('确认取消关联树形模板？').done(function(){
						thisFieldGroupConfigData.rabcTreeTemplateId = null;
						thisFieldGroupConfigData.rabcTreeTemplateTitle = null;
						$chooseTreeTemplateButton.text('选择树形模板');
						toggleTreeNodesControls(false);
					});
				});
				
				//初始化，当没有关联模板组合的时候，隐藏
				toggleTreeNodesControls(!!thisFieldGroupConfigData.rabcTreeTemplateId);
			}
			
			function getFieldGroupConfigData($fieldGroup, composite, group){
				group = group || {};
				var fieldGroupData = $fieldGroup.data('fieldgroup-config-data');
				if(!fieldGroupData){
					fieldGroupData = {
							uuid					: require1('utils').uuid(5,62),
							isRelation				: composite.addType == 5,
							isRabc					: !!composite.relModuleName,
							rabcModule				: composite.relModuleName,
							unallowedCreate			: group.unallowedCreate,
							dialogSelectType		: group.dialogSelectType,
							selectionTemplateId		: group.selectionTemplateId,
							rabcTreeTemplateId		: group.rabcTreeTemplateId,
							rabcTreeTemplateTitle	: group.rabcTreeTemplateTitle,
							rabcTreeNodeIds			: [],
							rabcTreeNodeOptions		: null,
							rabcTemplateGroupId		: group.rabcTemplateGroupId,
							rabcTemplateGroupTitle	: group.rabcTemplateGroupTitle,
							rabcUncreatable			: group.rabcUncreatable,
							rabcUnupdatable			: group.rabcUnupdatable,
							arrayItemFilterId		: group.arrayItemFilterId
					}
					if(group.rabcTreeNodes){
						fieldGroupData.rabcTreeNodeIds = group.rabcTreeNodes.map(function(node){return node.nodeTemplateId})
					}
					$fieldGroup.data('fieldgroup-config-data', fieldGroupData);
				}
				return fieldGroupData;
			}
			
			
			/**
			 * 绑定关联模板组合的相关事件
			 */
			function bindRelTemplateGroup($dialog, thisFieldGroupConfigData){
				var $rabcCreatableCheckbox = $('.rabccreatable-checkbox', $dialog),
					$rabcUpdatableCheckbox = $('.rabcupdatable-checkbox', $dialog);
				
				//切换关联模板组合的控件显示状态
				function toggleRabcControls(toShow){
					$rabcCreatableCheckbox.prop('checked', true).closest('.form-group').toggle(toShow);
					$rabcUpdatableCheckbox.prop('checked', true).closest('.form-group').toggle(toShow);
				}
				//绑定选择模板组合后的回调
				var $chooseTemplateGroupButton = $('a.choose-tmplgroup', $dialog).on('CpfAfterChoose', function(e, tmplGroupTitle, tmplGroup){
					if(tmplGroup){
						thisFieldGroupConfigData.rabcTemplateGroupId = tmplGroup.id;
						thisFieldGroupConfigData.rabcTemplateGroupTitle = tmplGroupTitle;
						toggleRabcControls(true);
					}
				});
				
				//绑定取消关联模板组合的事件
				$('.unselect-tmplgroup', $dialog).click(function(){
					require1('dialog').confirm('确认取消关联模板组合？').done(function(){
						thisFieldGroupConfigData.rabcTemplateGroupId = null;
						thisFieldGroupConfigData.rabcTemplateGroupTitle = null;
						$chooseTemplateGroupButton.text('选择模板组合');
						toggleRabcControls(false);
					});
				});
				
				//初始化，当没有关联模板组合的时候，隐藏
				if(!thisFieldGroupConfigData.rabcTemplateGroupId){
					toggleRabcControls(false);
				}
			}
			
			function bindCheckboxLinkGroup(lcgroup){
				lcgroup.$link.click(function(){
					var defer = lcgroup.openDialog();
					if(defer){
						defer.fail(function(){
							lcgroup.$checkbox.prop('checked', false).trigger('change');
						});
					}
				});
				lcgroup.$checkbox.change(function(e, notOpenLink){
					var checked = $(this).prop('checked');
					lcgroup.$link.toggle(checked);
					if(!notOpenLink && checked){
						lcgroup.$link.trigger('click');
					}
				}).trigger('change', [true]);
			}
			
			/**
			 * 绑定弹出框选择模板的相关事件
			 */
			function bindSelectionDialog($dialog, thisFieldGroupConfigData, composite){
				var $stmplCheckbox = $('.stmpl-checkbox', $dialog),
					$ttmplCheckbox = $('.ttmpl-checkbox', $dialog),
					$ltmplCheckbox = $('.ltmpl-checkbox', $dialog);
				require1('utils').mutexCheckbox($('.dialog-select-type :checkbox', $dialog));
				
				bindCheckboxLinkGroup({
					$link		: $('.stmpl-link', $dialog),
					$checkbox	: $stmplCheckbox,
					openDialog	: function(){
						var defer = $.Deferred();
						var reqParam = {};
						var stmplId = thisFieldGroupConfigData.selectionTemplateId;
						if(!stmplId){
							reqParam.moduleName = param.module;
							reqParam.compositeId = composite.c_id;
						}
						require1('dialog').openDialog(
								'admin/tmpl/stmpl/' + (stmplId? ('update/' + stmplId) : 'create')
								, '编辑选择模板', undefined, {
								reqParam	: reqParam,
								width		: 1000,
								height		: 500,
								events		: {
									afterSave	: function(stmplId){
										if(stmplId){
											thisFieldGroupConfigData.selectionTemplateId = stmplId;
											defer.resolve(stmplId);
										}
									}
								},
								onClose	: function(){
									if(!thisFieldGroupConfigData.selectionTemplateId){
										defer.reject();
									}
								}
						});
						return defer.promise();
					}
				});
			}
			
			/**
			 * 
			 */
			function bindArrayItemFiter($dialog, thisFieldGroupConfigData, composite){
				bindCheckboxLinkGroup({
					$link		: $('.arrayitem-fiter-link', $dialog),
					$checkbox	: $('.arrayitem-fiter-checkbox', $dialog),
					openDialog	: function(){
						var defer = $.Deferred();
						var reqParam = {filterId: thisFieldGroupConfigData.arrayItemFilterId || ''};
						require1('dialog').openDialog(
							'admin/tmpl/dtmpl/arrayitem_filter/' + param.module + '/'  + composite.c_id,
							'编辑过滤器', undefined, {
								reqParam 	: reqParam,
								width		: 1000,
								height		: 500,
								events		: {
									afterSave	: function(filterId){
										if(filterId){
											thisFieldGroupConfigData.arrayItemFilterId = filterId;
											defer.resolve(filterId);
										}
									}
								},
								onClose	: function(){
									if(!thisFieldGroupConfigData.arrayItemFilterId){
										defer.reject();
									}
								}
							}
						);
						return defer.promise();
					}
				});
			}
			
			function bindReturnDataFromPage(fieldGroupConfigPage, thisFieldGroupConfigData){
				fieldGroupConfigPage.getPage().bind('footer-submit', function(){
					var $dialogPage = this.getContent();
					return {
						unallowedCreate	: $('#allow-create', $dialogPage).prop('checked')? null: 1,
						dialogSelectType: $('.dialog-select-type :checkbox:checked', $dialogPage).val(),
						rabcTreeNodeIds	: $('.selectable-nodes', $dialogPage).val(),
						rabcUncreatable	: $('.rabccreatable-checkbox', $dialogPage).prop('checked')? null: 1,
						rabcUnupdatable	: $('.rabcupdatable-checkbox', $dialogPage).prop('checked')? null: 1,
					}
				});
			}
			
			/**
			 * 将bindFieldGroupSaveEvent绑定的事件中返回的数据，放到this中，this为要修改的fieldGroupData
			 */
			function saveFieldGroupConfigData(thisFieldGroupConfigData, dataFromPage){
				var configData = {
					selectionTemplateId		: thisFieldGroupConfigData.selectionTemplateId,
					rabcTreeTemplateId		: thisFieldGroupConfigData.rabcTreeTemplateId,
					rabcTreeTemplateTitle	: thisFieldGroupConfigData.rabcTreeTemplateTitle,
					rabcTreeNodeOptions		: thisFieldGroupConfigData.rabcTreeNodeOptions,
					rabcTemplateGroupId		: thisFieldGroupConfigData.rabcTemplateGroupId,
					rabcTemplateGroupTitle	: thisFieldGroupConfigData.rabcTemplateGroupTitle,
					arrayItemFilterId		: thisFieldGroupConfigData.arrayItemFilterId
				};
				$.extend(configData, dataFromPage);
				
				if(!configData.rabcTemplateGroupId){
					configData.rabcTemplateGroupTitle = null;
					configData.rabcUncreatable = null;
					configData.rabcUnupdatable = null;
				}
				validateFieldGroupConfigData(configData);
				Object.assign(this, configData);
			}
			function validateFieldGroupConfigData(configData){
				if(configData.rabcTreeTemplateId){
					if(!configData.rabcTreeNodeIds || configData.rabcTreeNodeIds.length == 0){
						var msg = '当关联了树形模板，必须至少选择一个可选节点';
						require1('dialog').notice(msg, 'error');
						$.error(msg);
					}
				}
			}
			
			/**
			 * 根据fieldGroupData中的数据修改$fieldGroup的展示
			 */
			function renderFieldGroupConfig($fieldGroup, fieldGroupData){
				console.log(fieldGroupData);
			}
			
			/**
			 * 绑定双击时，编辑该文本的事件
			 */
			function bindDblClickEdit(selector, inputClass){
				$page.on('dblclick', selector, function(e){
					require1('utils').toEditContent(e.target, inputClass).bind('confirmed', function(text, $this){
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
				require1('utils').switchClass($i, 'fa-expand', 'fa-compress', toExpand, function(compressed){
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
				var Dialog = require1('dialog');
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
						var groupConfigData = getFieldGroupConfigData($group);
						if(groupConfigData){
							$.extend(group, {
								compositeId	: $group.attr('composite-id')
							}, groupConfigData);
						}else{
							$.error('应该调用getFieldGroupConfigData初始化$group');
						}
						
						/*
						var $selectable = $group.find('.selectable:checkbox');
						if($selectable.prop('checked')){
							group.selectionTemplateId = $group.attr('stmpl-id');
						}
						group.compositeId = $group.attr('composite-id');
						group.rabcTemplateGroupId = $group.attr('rabc-tmpl-group-id');
						group.rabcUncreatable = $group.find('.rabc-uncreatable').prop('checked')? 1: null;
						group.rabcUnupdatable = $group.find('.rabc-unupdatable').prop('checked')? 1: null;
						if($group.find('.filterable').prop('checked')){
							group.arrayItemFilterId = $group.attr('array-item-filter-id');
						}
						group.unallowedCreate = $group.find('.create-arrayitem-control :checkbox').prop('checked')? 1 : 0;*/
						$arrayTable.find('.title-row>th[field-id]').each(function(){
							var $th = $(this);
							var field = $th.data('field-data');
							group.fields.push({
								id		: $th.attr('data-id'),
								fieldId	: $th.attr('field-id'),
								title	: $th.children('span').text(),
								viewVal	: 'XXX'
							});
						});
					}else{
						//遍历所有字段
						$group.find('.field-item').each(function(){
							var $field = $(this);
							var field = {
									id			: $field.attr('data-id'),
									fieldId		: $field.attr('field-id'),
									refGroupId	: $field.attr('refGroupId'),
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
					unallowedCreate	: null,
					rabcUncreatable	: null,
					rabcUnupdatable	: null,
					arrayItemFilterId	: null
				}).appendTo($groupContainer);
				//绑定字段组内字段的拖动动作
				bindGroupFieldsDraggable(getFieldContainer($group));
				//初始化字段组的字段搜索自动完成功能
				initGroupFieldSearchAutocomplete($group);
				//页面滚动到底部
				require1('utils').scrollTo($page.closest('.cpf-page-content'));
				//触发字段组的标题修改功能
				$group.find('.group-title').trigger('dblclick');
				if(indexer){
					indexer.refresh(getAllGroups());
				}
			});
			
			function doSave(saveData, saveOptions){
				var defer = $.Deferred();
				var submitData = $.extend({}, saveData, saveOptions);
				require1('ajax').postJson('admin/tmpl/dtmpl/save', submitData, function(data){
					if(data.status === 'suc'){
						require1('dialog').notice('保存成功', 'success');
						$page.getLocatePage().close();
						defer.resolve(data.dtmplId);
					}else{
						require1('dialog').notice('保存失败', 'error');
					}
				});
				return defer.promise();
			}
			
			//绑定点击保存按钮时的回调
			$('#save', $page).click(function(){
				var Dialog = require1('dialog');
				checkSaveData(function(saveData){
					if(param.mainModule){
						var page = $page.getLocatePage();
						if(page.getPageObj() instanceof Dialog){
							var $content = $('#dialog-dtmpl-save-options', $page).tmpl({});
							Dialog.openDialog($content, '保存参数', undefined, {
								domData	: {},
								width	: 350,
								height	: 150,
								top		: 100,
								afterLoad	: function(){
									var optionsPage = this;
									var $optionsContent = optionsPage.getPage().getContent();
									this.getFooter().find('button').click(function(){
										var saveOptions = {
											range		: $('[name="range"]:checked', $optionsContent).attr('value'),
											saveMethod	: $('[name="save-method"]:checked', $optionsContent).attr('value')
										}
										doSave(saveData, saveOptions).done(function(dtmplId){
											optionsPage.close();
											var afterSave = page.getPageObj().getEventCallbacks('afterSave');
											if(typeof afterSave == 'function'){
												afterSave.apply(page, [dtmplId]);
											}
										});
									});
								}
							});
						}
					}else{
						doSave(saveData).done(function(){
							var tpage = require1('page').getPage(param.module + '_dtmpl_list');
							if(tpage){
								tpage.refresh();
							}
						});
					}
				});
			});
			
			var dtmplListLoadProgress = 0;
			$('#load-dtmpl', $page).click(function(){
				var $dtmplListContainer = $('#dtmpl-list-container', $page);
				if(dtmplListLoadProgress === 0){
					//ajax加载
					require1('ajax').ajax('admin/tmpl/dtmpl/load_dtmpls/' + param.module, {
						excludeDtmplId	: param.tmplId
					}, function(data){
						if(data.status === 'suc'){
							if(data.dtmpls){
								var $dtmplListWrapper = $('#dtmpl-list-wrapper', $page);
								var $dtmplListItemTmpl = $('#dtmpl-listitem-tmpl', $page);
								for(var i in data.dtmpls){
									var dtmplData = data.dtmpls[i];
									var $dtmplListItem = $dtmplListItemTmpl.tmpl(dtmplData).click(function(){
										var dtmplId = $(this).attr('data-id');
										var page = $page.getLocatePage();
										page.loadContent('admin/tmpl/dtmpl/relation_dtmpl/' + param.mainModule + '/' + param.relationCompositeId, undefined, {
											dtmplId	: dtmplId
										});
									});
									$dtmplListWrapper.append($dtmplListItem);
								}
								$dtmplListContainer.show();
								dtmplListLoadProgress = 2;
							}
						}
					});
					dtmplListLoadProgress = 1;
				}else if(dtmplListLoadProgress == 2){
					$dtmplListContainer.toggle();
				}
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
			
			//选择模板组合
			bindPageEvent('click', '.field-refmodule-a i', function(e){
				var $field = getLocateField(this);
				//请求打开选择模板组合对话框
				var pointMName=$field.data('field-data').pointModuleName;
				var $current = $(this);
				Dialog.openDialog("admin/tmpl/group/choose/"+pointMName, 
						"选择关联模板", undefined, {
					undefined,
					width		: 1000,
					height		: 400,
					onSubmit	: function(data){
						if(data && data[0]){
							$field.attr('refGroupId',data[0].id);
							$current.attr('title',data[0].title);
						}
					}
				});
				
			});

			//删除字段
			bindPageEvent('click', '.remove-field i', function(e){
				var $field = getLocateField(e.target),
				$group = getLocateGroup(e.target),
				fieldTitle = $field.find('.field-title').text(),
				groupName = $group.find('.group-title').text();
				require1('dialog').confirm('确认在字段组[' + groupName + ']中删除字段[' + fieldTitle + ']？', function(yes){
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
			//恢复字段名称
			bindPageEvent('click', '.recover-field i', function(e){
				var $field = getLocateField(e.target),
				$fieldTitle = $field.find('.field-title'),
				fieldTitle = $fieldTitle.text(),
				fieldData = $field.data('field-data'),
				fieldName = fieldTitle;
				if(fieldData && fieldData.title){
					fieldName = fieldData.title;
				}
				require1('dialog').confirm('确认恢复字段[' + fieldTitle + ']为原始名称[' + fieldName + ']？', function(yes){
					if(yes){
						$fieldTitle.text(fieldName);
						adjustFieldTitle($fieldTitle);
					}
				});
			});
			
			bindPageEvent('click', '.field-setdefval i', function(e){
				var $a = $(e.target).closest('.field-setdefval');
				var tounsetdefval = $a.is('.tounsetdefval');
				var $field = getLocateField(e.target);
				var $fieldValue = $field.find('.field-value').eq(0);
				if(tounsetdefval){
					require1('dialog').confirm('是否取消当前字段的默认值？', function(yes){
						if(yes){
							initFieldDefaultValue($field, false);
							$a.removeClass('tounsetdefval');
						}
					})
				}else{
					initFieldDefaultValue($field, true);
					$a.attr('title', '取消默认值');
					$a.addClass('tounsetdefval');
				}
			});
			
			var ignoredFieldType = ['file', 'image'];
			function initFieldDefaultValue($field, toSetDefVal){
				var $fieldValue = $field.find('.field-value').eq(0);
				if(toSetDefVal){
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
				$fieldValue.empty().append('<span class="field-view">XXXXX</span>').removeData('field-input');
			}
			
			bindPageEvent('click', 'ul.field-validate-menu>li', function(e){
				var $field = getLocateField(e.target);
				var $li = $(this);
				var toChecked = !$li.is('.checked-validate');
				var validateName = $li.attr('validate-name');
				$field.find('.dtmpl-field-validates>.dtmpl-field-validate-' + validateName).toggleClass('active-validator', toChecked);
				$li.toggleClass('checked-validate', toChecked);
			});
			
			//删除数组字段
			bindPageEvent('click', '.remove-array-field i', function(e){
				var $title = $(this).closest('th'),
				title = $title.children('span').text(),
				fieldId = $title.attr('field-id'),
				$group = getLocateGroup(e.target),
				groupName = $group.find('.group-title').text();
				if(fieldId){
					require1('dialog').confirm('确认在字段组[' + groupName + ']中删除字段[' + title + ']？', function(yes){
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
				require1('dialog').confirm('确认恢复字段[' + title + ']为原始名称[' + fieldTitle + ']？', function(yes){
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
				require1('dialog').confirm('是否删除字段组[' + groupTitle + ']', function(yes){
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
				for(var i in tmplData.groups){
					var group = tmplData.groups[i];
					var $group = 
						$tmplFieldGroup
						.tmpl($.extend({}, {
							isArray			: null,
							unallowedCreate	: null,
							rabcUncreatable	: null,
							rabcUnupdatable	: null,
							arrayItemFilterId	: null
							}, group))
						.appendTo($groupContainer);
					if(!group.isArray){
						//绑定字段组内字段的拖动动作
						bindGroupFieldsDraggable(getFieldContainer($group));
					}
					bindFieldGroupConfig($group, group.composite, group);
					//初始化字段组的字段搜索自动完成功能
					initGroupFieldSearchAutocomplete($group);
					for(var j in group.fields){
						var field = group.fields[j];
						if(field.validators){
							field.validators = field.validators.split(';');
						}
						appendFieldToGroup(field, $group, {
							isArrayField	: group.isArray == 1,
							relations		: group.relationSubdomain
						});
					}
				}
			}
			//字段的标题初始化，需要延迟，等到页面加载完之后执行
			setTimeout(function(){
				var Indexer = require1('indexer')
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
});