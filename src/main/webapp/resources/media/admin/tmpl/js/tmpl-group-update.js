define(function(require, exports, module) {
	var $CPF = require('$CPF');
	var FieldInput = require('field/js/field-input.js');
	exports.init = function($page, moduleName, premisesJson, data) {
		var $chooseLtmpl = $('#choose-ltmpl', $page);

		var $tmplField = $('#tmpl-field', $page);

		var $fieldSearch = $('.field-search', $page);
		var $fieldContainer = $('.field-container', $page);

		$CPF.showLoading();
		FieldInput.loadGlobalOptions('admin/field/enum_json').done(
				function() {
					$CPF.closeLoading();
					var fieldSearch = require('field/js/field-search.js').bind(
							$fieldSearch, {
								single : true,
								textPicked : true,
								module : moduleName,
								showArrayComposite : false,
								fieldFilters : [ 'file' ],
								afterChoose : function(field) {
									showPremiseField(field);
								}
							});
					function showPremiseField(f) {
						fieldSearch.getFieldData(f.id).done(
								function(field) {
									fieldSearch.enableField(field.id, false);
									var fieldData = {
										id : f.premiseId || '',
										fieldId : f.id,
										title : field && field.title || ''
									}
									var $field = $tmplField.tmpl(fieldData);
									$field.data('field-data', fieldData)
											.appendTo($fieldContainer);
									$field.find('.remove-field').click(
											function() {
												$field.remove();
												fieldSearch.enableField(f.id,
														true);
											});
									if (field) {
										var input = new FieldInput({
											type : field.type,
											optionsKey : field.optGroupId,
											fieldKey : field.composite.module
													+ '@' + field.name
										});
										$field.find('.field-view').append(
												input.getDom());
										if (f.value) {
											input.setValue(f.value);
										}
										$field.data('field-input', input);
									}
									// Dtmpl.adjustFieldTitle($field.find('.field-title'));
								});
					}
					for ( var i in premisesJson) {
						var premise = premisesJson[i];
						showPremiseField({
							premiseId : premise.id,
							id : premise.fieldId,
							value : premise.fieldValue
						});
					}
				});

		var $C = require('common/chooser/chooser.js');
		var $JC = require('common/chooser/jumpChooser.js');
		var $RC = require('common/chooser/ractionChooser.js');
		var actionsSortParam = {
			helper : 'clone',
			cursor : 'move',
			opacity : 0.5,
			tolerance : 'pointer',
			distance : 5,
			update : function() {
				refreshActionIndex(this);
			}
		};
		var jumpsSortParam = {
				helper : 'clone',
				cursor : 'move',
				opacity : 0.5,
				tolerance : 'pointer',
				distance : 5,
				update : function() {
					refreshJumpIndex(this);
				}
			};
		var ractionsSortParam = {
				helper : 'clone',
				cursor : 'move',
				opacity : 0.5,
				tolerance : 'pointer',
				distance : 5,
				update : function() {
					refreshRActionIndex(this);
				}
			};
		var $listActions = $('#list-actions', $page).sortable(actionsSortParam), 
		$detailActions = $(
				'#detail-actions', $page).sortable(actionsSortParam);
		var $listJumps = $('#list-jumps', $page).sortable(jumpsSortParam);
		
		var $listRActions = $('#list-ractions', $page).sortable(ractionsSortParam);
		
		var listChooser = $C('#list-action-select', $page).chooser({
			list : data.atmpls,
			onSelected : function(item, tmplAction) {
				appendAction(item, $listActions, tmplAction, true);
				item.hide();
			}
		});
		
		var listJumpChooser = $JC('#list-jump-select', $page).chooser({
			list : data.jtmpls,
			onSelected : function(item, tmplJump) {
				appendJump(item, $listJumps, tmplJump, true);
				item.hide();
			}
		});
		
		var listRActionChooser = $RC('#list-raction-select', $page).chooser({
			list : data.ratmpls,
			onSelected : function(item, tmplRAction) {
				appendRAction(item, $listRActions, tmplRAction);
				item.hide();
			}
		});
		
		var detailChooser = $C('#detail-action-select', $page).chooser({
			list : data.atmpls,
			onSelected : function(item, tmplAction) {
				appendAction(item, $detailActions, tmplAction, false);
				item.hide();
			}
		});
		var $tmplJump = $('#tmpl-jump', $page);
		function appendJump(item, $jumpsBody, tmplJump, multiple) {
			var data = item.data;
			var $row = $tmplJump.tmpl({
				index : $jumpsBody.children('tr').length,
				title : (tmplJump && tmplJump.title) || data.title,
				multiple : multiple || false,
				iconClass: (tmplJump && tmplJump.iconClass) || ''
			});
			$row.data('jump-item', item);
			
			var $multi = $row.find('.multiple');
			$multi.val(tmplJump?tmplJump.multiple:"0");
			
			var $multiCheckbox = $row.find('label.multi-checkbox :checkbox'), $multiTransaction = $row
					.find('label.multi-transactional');
			var $outgoing = $row.find(':checkbox.outgoing');
			$multiCheckbox.change(function() {
				var checked = $(this).prop('checked');
				$multiTransaction.toggleClass('show', checked);
			});
			if(tmplJump && tmplJump.outgoing === 1){
				$outgoing.prop('checked', true);
			}
			$row.find('a.delete').click(function() {
				$row.remove();
				item.show();
				refreshActionIndex($jumpsBody);
			});
			$jumpsBody.append($row);
		}
		
		var $tmplRAction = $('#tmpl-raction', $page);
		function appendRAction(item, $ractionsBody, tmplRAction) {
			var data = item.data;
			var $row = $tmplRAction.tmpl({
				index : $ractionsBody.children('tr').length,
				title : (tmplRAction && tmplRAction.title) || data.title,
				iconClass: (tmplRAction && tmplRAction.iconClass) || ''
			});
			$row.data('raction-item', item);
			
			var $outgoing = $row.find(':checkbox.outgoing');
			
			if(tmplRAction && tmplRAction.outgoing === 1){
				$outgoing.prop('checked', true);
			}
			$row.find('a.delete').click(function() {
				$row.remove();
				item.show();
				refreshActionIndex($ractionsBody);
			});
			$ractionsBody.append($row);
		}
		
		var $tmplAction = $('#tmpl-action', $page);
		function appendAction(item, $actionsBody, tmplAction, multiple) {
			var data = item.data;
			var $row = $tmplAction.tmpl({
				index : $actionsBody.children('tr').length,
				title : (tmplAction && tmplAction.title) || data.title,
				multiple : multiple || false,
				iconClass: (tmplAction && tmplAction.iconClass) || ''
			});
			$row.data('action-item', item);
			var $multi = $row.find('.multiple');
			$multi.val(tmplAction?tmplAction.multiple:"0");
			var $multiCheckbox = $row.find('label.multi-checkbox :checkbox'), $multiTransaction = $row
					.find('label.multi-transactional');
			var $outgoing = $row.find(':checkbox.outgoing');
			$multiCheckbox.change(function() {
				var checked = $(this).prop('checked');
				$multiTransaction.toggleClass('show', checked);
			});
			if(tmplAction && tmplAction.outgoing === 1){
				$outgoing.prop('checked', true);
			}
			$row.find('a.delete').click(function() {
				$row.remove();
				item.show();
				refreshActionIndex($actionsBody);
			});
			$actionsBody.append($row);
		}
		function refreshActionIndex($actionsBody) {
			$($actionsBody).children('tr').each(function(i) {
				$(this).children('td').eq(0).text(i + 1);
			});
		}
		
		function refreshJumpIndex($jumpsBody) {
			$($jumpsBody).children('tr').each(function(i) {
				$(this).children('td').eq(0).text(i + 1);
			});
		}
		
		function refreshRActionIndex($ractionsBody) {
			$($ractionsBody).children('tr').each(function(i) {
				$(this).children('td').eq(0).text(i + 1);
			});
		}

		var IconSelector = require('common/icon/icon-selector');
		var selector = new IconSelector();
		$page.on('click', '.btn-icon-selector', function(){
			var $btn = $(this);
			selector.openSelector().done(function(clazz){
				$btn.empty().append('<i class="' + clazz + '">')
			});
		});
		
		$detailActions.on('change', ':checkbox.outgoing', function(){
			var toChecked = $(this).prop('checked');
			var maxActionCount = 3;
			if(toChecked){
				var checkedCount = $detailActions.find(':checkbox.outgoing:checked').length;
				if(checkedCount > maxActionCount){
					$(this).prop('checked', false);
					require('dialog').notice('最多只能勾选' + maxActionCount +'个按钮的外部显示', 'error');
				}
			}
		});
		(function(prefixs){
			$.each(prefixs, function(i, prefix){
				var $baseFieldsModule = $('[name="' + prefix + '.withModule"]', $page);
				var $baseFieldsDetail = $('[name="' + prefix + '.withDetailTemplate"]', $page);
				var $baseFieldsList = $('[name="' + prefix + '.withListTemplate"]', $page);
				var $baseFieldTemp = $baseFieldsDetail.add($baseFieldsList);
				
				$baseFieldsModule.change(function(){
					if($(this).prop('checked')){
						$baseFieldTemp.prop('checked', false);
					}
				});
				
				$baseFieldTemp.change(function(){
					if($(this).prop('checked')){
						$baseFieldsModule.prop('checked', false);
					}
				});
			})
			
		})(['importDictionaryFilter', 'exportDictionaryFilter']);
		
		
		
		
		var $form = $('form', $page);
		$('.btn-save', $page).click(function(){
			require('dialog').confirm('确认提交？', function(yes){
				$form.trigger('submit');
			});
		});
		
		$form.on(
				'cpf-submit',
				function(e, formData) {
					var $form = $(this);
					formData.append('hideCreateButton', $('#showCreateButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideImportButton', $('#showImportButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideExportButton', $('#showExportButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideQueryButton', $('#showQueryButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideDeleteButton', $('#showDeleteButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideSaveButton', $('#showSaveButton',
							$page).prop('checked') ? '' : 1);
					formData.append('hideTreeToggleButton', $('#showTreeToggleButton',
							$page).prop('checked') ? '' : 1);
					$('.field-item', $page).each(
							function(index) {
								var $this = $(this);
								var fieldData = $this.data('field-data');
								var fieldInput = $this.data('field-input');
								var premiseName = 'premises[' + index + ']';
								formData.append(premiseName + '.id', $this
										.attr('data-id'));
								formData.append(premiseName + '.fieldId',
										fieldData.fieldId);
								formData.append(premiseName + '.fieldValue',
										fieldInput.getValue());
								formData.append(premiseName + '.order', index);
							});
					function appendActions(face, indexStart){
						return function(index){
							var $row = $(this);
							var data = $row.data('action-item').data;
							var id = data.cache.dataId || '';
							var title = $row.find('input.action-title').val();
							var atmplId = data.id;

							var multiple = $row.find('select.multiple').val() || 0;
							var iconClass = $row.find('.btn-icon-selector>i').attr('class') || '';
							var outgoing = $row.find(':checkbox.outgoing').prop('checked')? 1: 0;
							
							var actionName = 'actions[' + (indexStart + index) + ']';
							formData.append(actionName + '.id', id);
							formData.append(actionName + '.title', title);
							formData.append(actionName + '.multiple', multiple);
							formData.append(actionName + '.iconClass', iconClass);
							formData.append(actionName + '.outgoing', outgoing);
							formData.append(actionName + '.atmplId', atmplId);
							formData.append(actionName + '.order', index);
							formData.append(actionName + '.face', face);
						}
					}
					var lactionsCount = $listActions.children('tr').each(appendActions('list', 0)).length;
					$detailActions.children('tr').each(appendActions('detail', lactionsCount));
					
					function appendJumps(face, indexStart){
						return function(index){
							var $row = $(this);
							var data = $row.data('jump-item').data;
							var id = data.cache.dataId || '';
							var title = $row.find('input.jump-title').val();
							var jtmplId = data.id;

							var multiple = $row.find('select.multiple').val() || 0;
							var iconClass = $row.find('.btn-icon-selector>i').attr('class') || '';
							var outgoing = $row.find(':checkbox.outgoing').prop('checked')? 1: 0;
							
							var jumpName = 'jumps[' + (indexStart + index) + ']';
							formData.append(jumpName + '.id', id);
							formData.append(jumpName + '.title', title);
							formData.append(jumpName + '.multiple', multiple);
							formData.append(jumpName + '.iconClass', iconClass);
							formData.append(jumpName + '.outgoing', outgoing);
							formData.append(jumpName + '.jtmplId', jtmplId);
							formData.append(jumpName + '.order', index);
							formData.append(jumpName + '.face', face);
						}
					}
					var ljumpsCount = $listJumps.children('tr').each(appendJumps('list', 0)).length;
					
					function appendRActions(face, indexStart){
						return function(index){
							var $row = $(this);
							var data = $row.data('raction-item').data;
							var id = data.cache.dataId || '';
							var title = $row.find('input.raction-title').val();
							var ratmplId = data.id;

							var iconClass = $row.find('.btn-icon-selector>i').attr('class') || '';
							var outgoing = $row.find(':checkbox.outgoing').prop('checked')? 1: 0;
							
							var ractionName = 'ractions[' + (indexStart + index) + ']';
							formData.append(ractionName + '.id', id);
							formData.append(ractionName + '.title', title);
							formData.append(ractionName + '.iconClass', iconClass);
							formData.append(ractionName + '.outgoing', outgoing);
							formData.append(ractionName + '.ratmplId', ratmplId);
							formData.append(ractionName + '.order', index);
							formData.append(ractionName + '.face', face);
						}
					}
					var lractionsCount = $listRActions.children('tr').each(appendRActions('list', 0)).length;
					
				});
		
		function initChooserSelect(tmplAction){
			return [function(item){
				return item.id === tmplAction.atmplId
			}, function(item){
				item.cache.dataId = tmplAction.id;
			}, tmplAction];
		}
		
		
		
		for(var i = 0; i < data.tmplActions.length; i++){
			var tmplAction = data.tmplActions[i];
			if(tmplAction.face === 'list'){
				listChooser.chooser('select', initChooserSelect(tmplAction));
			}else if(tmplAction.face === 'detail'){
				detailChooser.chooser('select',initChooserSelect(tmplAction));
			}
		}
		
		function initChooserJumpSelect(tmplJump){
			return [function(item){
				return item.id === tmplJump.jtmplId
			}, function(item){
				item.cache.dataId = tmplJump.id;
			}, tmplJump];
		}
		
		for(var i = 0; i < data.tmplJumps.length; i++){
			var tmplJump = data.tmplJumps[i];
			if(tmplJump.face === 'list'){
				listJumpChooser.chooser('select', initChooserJumpSelect(tmplJump));
			}
		}
		
		function initChooserRActionSelect(tmplRAction){
			return [function(item){
				return item.id === tmplRAction.ratmplId
			}, function(item){
				item.cache.dataId = tmplRAction.id;
			}, tmplRAction];
		}
		
		for(var i = 0; i < data.tmplRActions.length; i++){
			var tmplRAction = data.tmplRActions[i];
			if(tmplRAction.face === 'list'){
				listRActionChooser.chooser('select', initChooserRActionSelect(tmplRAction));
			}
		}
		
	}

});