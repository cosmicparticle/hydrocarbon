define(function(require, exports, module){
	"use strict";
	var Dialog = require('dialog'),
		Ajax = require('ajax'),
		$CPF = require('$CPF'),
		FieldInput = require('field/js/field-input.js'),
		DtmplUpdate = require('tmpl/js/dtmpl-update.js'),
		Utils = require('utils'),
		uriGeneratorFactory = function(entityCode, uriData){
			switch(uriData.type){
				case 'entity': 
					var menuId = uriData.menuId;
					if(uriData.rabcTmplGroupId){
						menuId = uriData.mainMenuId;
					}
					return {
						stmpl	: function(stmplId){
							return 'admin/modules/curd/rel_selection/' + menuId + '/' + stmplId;
						},
						rel_tree: function(fieldGroupId){
							return 'admin/modules/curd/rel_tree/' + menuId + '/' + fieldGroupId;
						},
						rdtmpl	: function(fieldGroupId){
							return 'admin/modules/curd/rabc_create/' + menuId + '/' + fieldGroupId;
						},
						load_rabc_entities	: function(relationCompositeId){
							return 'admin/modules/curd/load_rabc_entities/' + menuId + '/' + uriData.relationCompositeId;
						},
						entityDetail		: function(fieldGroupId, entityCode){
							return 'admin/modules/curd/rabc_detail/' +menuId + '/' + fieldGroupId + '/' + entityCode;
						}
					}
				case 'node':
					var menuId = uriData.menuId;
					var nodeId = uriData.nodeId;
					return {
						stmpl	: function(stmplId){
							return 'admin/modules/curd/node_rel_selection/' + menuId + '/' + nodeId + '/' + stmplId;
						},
						rdtmpl	: function(fieldGroupId){
							return 'admin/modules/curd/node_rabc_create/' + menuId + '/' + nodeId + '/' + fieldGroupId;
						},
						load_rabc_entities	: function(relationCompositeId){
							return 'admin/modules/curd/node_load_rabc_entities/' + menuId + '/' + nodeId + '/' + uriData.relationCompositeId;
						},
						entityDetail		: function(fieldGroupId, entityCode){
							return 'admin/modules/curd/node_rabc_detail/' + menuId + '/' + nodeId + '/' + fieldGroupId + '/' + entityCode;
						}
					}
				case 'user':
					return {
						stmpl	: function(stmplId){
							return 'admin/config/user/open_selection/' + stmplId;
						}
					}
			}
		}
		
	exports.init = function($page, entityCode, uriData){
		var isUpdateMode = entityCode !== '';
		var uriGenerator = uriGeneratorFactory(entityCode, uriData);
		$CPF.showLoading();
		FieldInput.loadGlobalOptions('admin/field/enum_json').done(function(){
			appendTo($page, $('.field-input', $page)).done(function(initInput, refreshRowTable){
				initInput();
				refreshRowTable();
			});
			$CPF.closeLoading();
		});
		
		var fuseMode = false;
		$('#save i', $page).click(function(){
			var validateResult = FieldInput.validateForm($('form', $page));
			$('.dtmpl-field-validates>i', $page).each(function(){
				var $this = $(this);
				var param = {};
				if($this.closest('table').length > 0){
					var $item = $this.closest('.field-input');
					var $title = $this.closest('table').find('thead>tr>th').eq($this.closest('td').index());
					param = {
						$item 			: $item,
						title 			: $title.text(),
						value 			: $item.find(':input').val()
					};
					$item.removeClass('field-validate-error');
				}else{
					var $item = $this.closest('.field-item');
					param = {
						$item 			: $item,
						title 			: $item.find('label.field-title').text(),
						value 			: $item.find(':input').val()
					};
					$item.removeClass('field-validate-error');
				}
				param.validateName = $this.attr('validate-name');
				validateResult = validate(param) && validateResult;
			});
			if(validateResult){
				var msg = '是否保存？';
				if(fuseMode){
					msg = '是否保存（当前为融合模式）？'
				}
				Dialog.confirm(msg, function(yes){
					if(yes){
						$('form', $page).submit();
					}
				});
			}
		});
		$('form', $page).on('cpf-submit', function(e, formData){
			//绑定部分自定义字段控件的表单值
			bindEmptyMultipleSelectValue(e.target, formData);
			FieldInput.bindSubmitData(e.target, formData);
			if(typeof fuseMode === 'boolean'){
				formData.append('%fuseMode%', fuseMode);
			}
		}).on('cpf-submited', function(e, data){
			if(data.entityCode){
				var page = $page.getLocatePage();
				var afterSave = page.getPageObj().getEventCallbacks('afterSave');
				if(typeof afterSave == 'function'){
					var entitiesLoader = function(fields){
						var deferred = $.Deferred();
						if($.isArray(fields) && fields.length > 0){
							Ajax.ajax(uriGenerator.load_rabc_entities(), {
								codes	: data.entityCode,
								fields	: fields.join()
							}, function(data){
								if(data.status === 'suc'){
									deferred.resolve(data.entities);
								}else{
									$.error('获取数据错误');
								}
							});
						}
						return deferred.promise();
					};
					entitiesLoader.codes = [data.entityCode];
					afterSave.apply(page, [entitiesLoader]);
				}
			}
		});
		function bindEmptyMultipleSelectValue(form, formData){
			$('select[multiple],select[multiple="multiple"]', form).each(function(){
				var $select = $(this);
				var value = $select.val();
				var name = $select.attr('name');
				if(!value && name && !formData.has(name)){
					formData.append(name, '');
				}else if($.isArray(value)){
					formData.set(name, value.join());
				}
			});
		}
		if($('#fusion-toggler', $page).length == 0){
			fuseMode = null;
		}else{
			$('#fusion-toggler', $page).click(function(){
				var $this = $(this);
				$this.toggleClass('on');
				fuseMode = $this.is('.on');
				$this.attr('title', '融合模式：（' + (fuseMode? '开': '关') + '）');
				$('#save', $page).toggleClass('fuse-mode', fuseMode);
			});
		}
		
		$page.on('click', '.array-item-detail', function(){
			var entityCode = $(this).closest('tr').find('.entity-code').val();
			require('tab').openInTab(uriGenerator.entityDetail(entityCode), 
					'module_detail_' + entityCode);
		});
		
		$page.on('click', '.array-item-remove', function(){
			var $row = $(this).closest('tr');
			Dialog.confirm('确认删除该行？', function(yes){
				if(yes){
					var $table = $row.closest('table');
					$row.remove();
					refreshTable($table);
				}
			});
		});
		$page.on('click', '.array-item-update', function(){
			var $row = $(this).closest('tr');
			var entityCode = $row.find('.entity-code').val();
			var fieldGroupId = $row.closest('.field-group').attr('field-group-id');
			require('dialog').openDialog(uriGenerator.rdtmpl(fieldGroupId), 
					undefined, undefined, {
				reqParam	: {entityCode: entityCode},
				width		: 1100,
				height		: 500,
				events:	{
					afterSave	: function(entitiesLoader){
						updateEntityToArray(entitiesLoader, $row);
						this.close();
					}
				}
			});
		});
		function appendEntityToArrayTable(entitiesLoader, $table){
			var fields = [];
			$table.find('thead .th-field-title[fname-full]').each(function(){
				var fieldName = $(this).attr('fname-full');
				fields.push(fieldName);
			});
			entitiesLoader(fields).done(function(entities){
				console.log(entities);
				function _(i){
					if(entitiesLoader.codes.length > i){
						addRow($table, true).done(function(initInput, refreshRowTable, $row, $doms){
							setFieldValue(entities[entitiesLoader.codes[i]], $row, $doms);
							initInput();
							if(entitiesLoader.codes.length > i + 1){
								_(i + 1);
							}else{
								refreshRowTable();
							}
						});
					}
				}
				_(0);
			});
		}
		function updateEntityToArray(entitiesLoader, $row){
			var fields = [];
			var $fieldInputs = $row.find('.field-input[fname-full]');
			$fieldInputs.each(function(){
				var fieldName = $(this).attr('fname-full');
				fields.push(fieldName);
			});
			entitiesLoader(fields).done(function(entities){
				if(entitiesLoader.codes.length > 0){
					$fieldInputs.each(function(){
						var $fieldInput = $(this);
						var fieldInput = $fieldInput.data('field-input');
						var fieldName = $fieldInput.attr('fname-full');
						if(fieldInput){
							var fieldValue = entities[entitiesLoader.codes[0]][fieldName];
							fieldInput.setValue(fieldValue || '');
						}
					});
				}
			});
		}
		
		$('.open-select-dialog[stmpl-id]', $page).click(function(){
			var $this = $(this);
			var stmplId = $this.attr('stmpl-id');
			var existCodes = []; 
			$this.closest('table').find('.value-row').each(function(){
				var entityCode = $(this).find(':hidden.entity-code').val();
				if(entityCode){
					existCodes.push(entityCode);
				}
			});
			
			Dialog.openDialog(uriGenerator.stmpl(stmplId), 
					undefined, undefined, {
				reqParam	: {
					exists	: existCodes.join()
				},
				width		: 1000,
				height		: 400,
				onSubmit	: function(entitiesLoader){
					appendEntityToArrayTable(entitiesLoader, $this.closest('table'));
				}
			});
			
		});

		$('.open-select-dialog[ttmpl-id]', $page).click(function(){
			var $this = $(this);
			var fieldGroupId = $this.closest('[field-group-id]').attr('field-group-id');
			if(fieldGroupId){
				Dialog.openDialog(uriGenerator.rel_tree(fieldGroupId), undefined, undefined, {
					width	: 1000,
					height	: 400,
					onSubmit: function(entitiesLoader){
						appendEntityToArrayTable(entitiesLoader, $this.closest('table'));
					}
				});
				
			}

		});
		
		function setFieldValue(entity, $row){
			var $codeInput = $('<input type="hidden" class="entity-code" />');
			$codeInput.val(entity['唯一编码']);
			$row.children('td').first().append($codeInput);
			$row.find('.field-input[fname-full]').each(function(){
				var $this = $(this);
				var value = entity[$this.attr('fname-full')];
				if(value){
					$this.attr('fInp-value', value);
				}
			});
			console.log(arguments);
		}
		
		
		$('.array-item-add', $page).click(function(){
			var $table = $(this).closest('table');
			addRow($table).done(function(initInput, refreshRowTable){
				initInput();
				refreshRowTable();
			});
		});
		
		$('.rabd-add', $page).click(function(){
			var $this = $(this);
			var fieldGroupId = $this.closest('.field-group').attr('field-group-id');
			if(fieldGroupId){
				require('dialog').openDialog(uriGenerator.rdtmpl(fieldGroupId), 
						undefined, undefined, {
					reqParam	: {},
					width		: 1000,
					height		: 500,
					events:	{
						afterSave	: function(entitiesLoader){
							appendEntityToArrayTable(entitiesLoader, $this.closest('table'));
							this.close();
						}
					}
				});
			}
		});
		
		
		function addRow($table, withData){
			var $tbody = $table.children('tbody');
			var $titleRow = $table.find('.title-row');
			var $dataRow = $('<tr class="value-row">').append('<td><span></span></td>')
			$titleRow.children('th.th-field-title').each(function(){
				var $title = $(this);
				var $td = $('<td>');
				if($title.is('.field-unavailable')){
					$td.addClass('field-unavailable');
				}else{
					var $fieldInput = $('<span class="field-input"></span></span>');
					var $validates = $('<div class="dtmpl-field-validates">').appendTo($fieldInput);
					var access = $title.attr('fInp-access');
					var readonly = false;
					if(access == '读' || access == '补' && withData){
						readonly = true;
					}
					$fieldInput
						.attr('fInp-type', $title.attr('fInp-type'))
						.attr('fInp-optkey', $title.attr('fInp-optkey'))
						.attr('fInp-fieldkey', $title.attr('fInp-fieldkey'))
						.attr('fname-full', $title.attr('fname-full'))
						.attr('fInp-value', $title.attr('fInp-value'))
						.attr('fInp-readonly', readonly).attr('fInp-refgroupid',$title.attr('fInp-refgroupid'))
						.appendTo($('<span class="field-value"></span>').appendTo($td));
					if($title.attr('fInp-optset')){
						$fieldInput.attr('fInp-optset', $title.attr('fInp-optset'));
					}
					if($title.is('.relation-label')){
						$validates.append('<i validate-name="required"></i>');
					}
				}
				$dataRow.append($td);
			});
			var $rowOperator = $('<td>');
			if(withData && $table.closest('.field-group').attr('rabc-unupdatable') !== 'true'){
				$rowOperator.append('<span class="array-item-update fa fa-edit" title="编辑当前行"></span>');
			}
			$rowOperator.append('<span class="array-item-remove" title="移除当前行">×</span>');
			$dataRow.append($rowOperator);
			$dataRow.appendTo($tbody);
			var deferred = $.Deferred();
			appendTo($page, $dataRow.find('.field-input')).done(function(initInput, refreshRowTable, $doms){
				deferred.resolve(initInput, refreshRowTable, $dataRow, $doms);
			});
			return deferred;
		}
		
		var $actionsBtn = $('#actions', $page);
		var $actionList = $('#action-list', $page);
		var $actionsContainer = $actionList.parent();
		(function(){
			var height = $actionsContainer.outerHeight();
			$actionsContainer.css('height', height + 'px');
			$actionsContainer.addClass('close');
		})();
		function toggleActionBtn(){
			require('utils').switchClass($actionsBtn.children('i'), 'fa-toggle-left', 'fa-toggle-right', function(isHidden){
				$actionsContainer.removeClass('init');
				$actionsContainer.toggleClass('close', isHidden);
			});
		}
		
		$actionsBtn.click(function(){
			toggleActionBtn();
		});
		$('.btn-action-outgoing[data-id]', $page).add($actionList.children('a')).click(function(){
			var $action = $(this);
			var actionId = $action.attr('data-id');
			if(actionId){
				Dialog.confirm('是否执行操作【' + $action.attr('title') + '】', function(yes){
					if(yes){
						$('form', $page).trigger('submit', function(formData){
							formData.append('%actionId%', actionId);
						});
					}
				});
			}
		});
		setTimeout(function(){
			var Indexer = require('indexer');
			var pageType = $page.getLocatePage().getType();
			var $scrollTarget = null;
			if(pageType === 'tab'){
				var $scrollTarget = $page.closest('.main-tab-content')[0];
			}else if(pageType === 'dialog'){
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
			$('.field-title', $page).each(function(){DtmplUpdate.adjustFieldTitle($(this))});
		}, 100);
		
	}
	
	
	function appendTo($page, $doms, paramGetter){
		var def = $.Deferred();
		paramGetter = paramGetter || function($dom){
			function attr(attrName){
				return $dom.attr(attrName);
			}
			return {
				type		: attr('fInp-type'),
				name		: attr('fInp-name'),
				id			: attr('fInp-id'),
				value		: attr('fInp-value'),
				styleClass	: attr('fInp-class'),
				optionsKey	: attr('fInp-optkey'),
				readonly	: attr('fInp-readonly') == 'true',
				optionsSet	: attr('fInp-optset'),
				fieldKey	: attr('fInp-fieldkey'),
				refgroupid	: attr('fInp-refgroupid'),
				refgroupdtmplid:attr('fInp-refGroupDtmplid'),
				refgroupltmplid:attr('fInp-refGroupLtmplid'),
				mainmenuid	: attr('fInp-mainmenuid'),
				menuid	: attr('fInp-menuid'),
				refcognitiontitle:attr('fInp-refCognitionTitle'),
				refshowtitle:attr('fInp-refShowTitle'),
				$page		: $page
			};
		};
		var $tables = [];
		$doms.each(function(){
			var $table = $(this).closest('table');
			for(var i in $tables){
				if($table.is($tables[i])){
					return;
				}
			}
			$tables.push($table);
		});
		def.resolve(function(){
			$doms.each(function(){
				var $this = $(this);
				var param = paramGetter($this);
				var fInp = new FieldInput(param);
				var $sames = $page.find('.field-value[value-field-name="' + param.name + '"]');
				//字段与模板组合默认字段相同时，禁用字段编辑
				if($sames.filter('.premises-container *').length > 0){
					fInp.setDisabled();
				}
				//fieldName相同的字段，将其统一
				$sames.not('.premises-container *').each(function(){
					var otherInput = $(this).find('.field-input').data('field-input');
					if(otherInput){
						fInp.relateInput(otherInput);
						fInp.removeFormName();
					}
				});
				$this.append(fInp.getDom()).data('field-input', fInp);
			});
		}, function(){
			for(var i in $tables){
				refreshTable($tables[i]);
			}
		}, $doms);
		return def.promise();
	};
	
	
	function validate(form){
		switch(form.validateName){
			case 'required'	:
				if(form.value === ''){
					validateError(form);
					return false
				}
				return true;
				break;
			default :
				return true;
		}
	}
	
	function validateError(form){
		form.$item.addClass('field-validate-error');
	}
	
	
	
	function refreshTable($table){
		var $titles = $('thead tr.title-row th', $table); 
		$('tbody tr', $table).each(function(i){
			var $tr = $(this);
			var $tds = $tr.children('td');
			$tds.eq(0).children('span').text(i + 1);
			for(var j = 0; j < $tds.length - 1; j ++){
				var nameFormat = $titles.eq(j).attr('fname-format');
				var inputName = nameFormat.replace('ARRAY_INDEX_REPLACEMENT', i);
				$tds.eq(j).find(':text,select,textarea,input[type="hidden"],input[type="number"]').each(function(){
					$(this).attr('name', inputName);
				})
				.end().find('.cpf-field-input').each(function(){
					var fieldInputObject = $(this).data('fieldInputObject');
					if(fieldInputObject){
						fieldInputObject.setFormName(inputName);
					}
				});
			}
		});
	}
	
});