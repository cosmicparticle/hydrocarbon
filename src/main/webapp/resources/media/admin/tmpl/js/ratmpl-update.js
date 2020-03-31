define(function(require, exports, module) {
	var FieldInput = require('field/js/field-input.js');
	var Utils = require('utils');
	var $CPF = require('$CPF');
	exports.init = function($page, moduleName,  data) {
		
		var context = Utils.createContext({
			params		: data.params||[]
		});
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
									
									var tmplMap = context.getStatus('tmplMap');
									fieldSearch.enableField(field.id, false);
									var param = {
										id : f.premiseId || '',
										uuid:Utils.uuid(5, 62),
										fieldId : f.id,
										fieldTitle : field && field.title || ''
									}
									context.getStatus('params').push(param);
									tmplMap['jtmpl-param-row']
										.tmpl({param}, {removeParam})
										.appendTo(context.getDom('jtmpl-param-rows'));

								});
					}
				});
		require('event').prepareToContext($page, context);
		loadTmplMap();
		
		function loadTmplMap(){
			require('tmpl').load('media/admin/tmpl/tmpl/jtmpl-update.tmpl').done(function(tmplMap){
				context.setStatus('tmplMap', tmplMap);
				initParams();
			});
		}
		
		
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
					function appendParams(indexStart){
						return function(index){
							var $row = $(this);
							
							var paramName = $row.find('input.param-name').val();
							
							var fieldId = $row.find('input.param-fieldId').val();
							
							var paramId = $row.find('input.param-id').val();
							
							var paramType = $row.find('select.param-type').val() || 0;
	
							var paramsName = 'jtmplParams[' + (indexStart + index) + ']';
							formData.append(paramsName + '.id', paramId);
							formData.append(paramsName + '.name', paramName);
							formData.append(paramsName + '.fieldId', fieldId);
							formData.append(paramsName + '.paramType', paramType);
							
						}
					}
					var length=$('#jtmpl-param-rows', $page).children('tr').each(appendParams(0)).length;
				}
				
		
		);
		

		function removeParam(param){
			if(param){
				var params = context.getStatus('params');
				if(params){
					Utils.removeElement(params, param);
					$(this).closest('tr').remove();
// context.getDom('form').bootstrapValidator("removeField", param.uuid);
				}
			}
		}
		
		function initParams(){
			var params1 = context.getStatus('params');
			context.getDom('jtmpl-param-rows').empty();
				for(var i = 0; i < params1.length; i++){
					var param0 = params1[i];
					var param = {
					id : param0.id || '',
					uuid:Utils.uuid(5, 62),
					fieldId :param0.fieldId,
					fieldTitle : param0.fieldTitle || '',
					name: param0.name
					}
					context.getStatus('tmplMap')['jtmpl-param-row']
					.tmpl({param}, {removeParam})
					.appendTo(context.getDom('jtmpl-param-rows'));
				}
		}
		
	}
	
	
	

});