define(function(require, exports, modules){
	"use strict";
	var FORM_GROUP_VALUE_FUNC_KEY = 'input-value-func';
	/**
	 * 
	 */
	function CriteriaRenderer(_param){
		var defParam = {
			$tmpl		: null,
			tCriteria	: null,
			$formGrouTmpl	: null,
			options		: null
		};
		var param = $.extend({}, defParam, _param);
		var criteriaName = 'criteria_' + param.tCriteria.id;
		
		this.render = function(renderParam){
			var $input = param.$tmpl.tmpl({
				criteria	: param.tCriteria,
				name		: criteriaName,
				options		: param.options
			});
			var $formGroup = param.$formGrouTmpl.tmpl({
				criteria	: param.tCriteria
			});
			$formGroup.append($input);
			
			bindInputValFunction($formGroup, $input);
			switch(typeof renderParam){
				case 'string':
					$formGroup.data(FORM_GROUP_VALUE_FUNC_KEY)(renderParam);
					break;
				default:
			}
			
			return $formGroup;
		}

		
		function bindInputValFunction($formGroup, $input){
			switch(param.tCriteria.inputType){
				case 'text':
				case 'select':
				case 'multiselect':
				default:
					$formGroup.data(FORM_GROUP_VALUE_FUNC_KEY, $input.val.bind($input));
					
			}
		}
	}
	
	exports.collectCriterias = function($form){
		var criterias = {};
		$('.form-group[criteria-id]', $form).each(function(){
			var $formGroup = $(this);
			var inputValueFunc = $formGroup.data(FORM_GROUP_VALUE_FUNC_KEY);
			if(inputValueFunc){
				criterias['criteria_' + $formGroup.attr('criteria-id')] = inputValueFunc();
			}
		});
		return criterias;
	}
	
	exports.getRenderer = function(tCriteria, options){
		var defer = $.Deferred();
		require('tmpl').load('media/jv/entity/tmpl/criteria-renderer-factory.tmpl').done(function(tmplMap){
			var $tmpl = tmplMap[tCriteria.inputType];
			if(!$tmpl){
				$tmpl = tmplMap['unknown'];
			}
			var renderer = new CriteriaRenderer({
				$tmpl		: $tmpl,
				tCriteria	: tCriteria,
				$formGrouTmpl	: tmplMap['form-group'],
				options		: options
			});
			defer.resolve(renderer);
		});
		return defer.promise();
	}
	
	exports.replaceFor = function(criterias, $plh){
		var fieldIds = [];
		$.each(criterias, function(){
			if(['select', 'multiselect'].indexOf(this.inputType) >= 0){
				fieldIds.push(this.fieldId)
			}
		});
		function doRender(optionsMap){
			var originArray = $plh.data('plh-dom');
			if(originArray){
				originArray.remove();
			}
			var $formGroupArray = $();
			$.each(criterias, function(i){
				var tCriteria = this;
				var options = optionsMap && this.fieldId? optionsMap[this.fieldId]: [];
				exports.getRenderer(tCriteria, options).done(function(criteriaRenderer){
					var $formgroup = criteriaRenderer.render(tCriteria.defaultValue);
					if($formgroup){
						$formGroupArray = $formGroupArray.add($formgroup);
					}
					if(i == criterias.length - 1){
						$plh.after($formGroupArray).data('plh-dom', $formGroupArray);
						require('form').initFormInput($plh.closest('form'));
					}
				});
			});
		}
		if(fieldIds.length > 0){
			//到后台请求枚举数据
			require('ajax').ajax('api2/meta/dict/field_options', {fieldIds: fieldIds.join()}, function(data){
				doRender(data.optionsMap);
			});
		}else{
			doRender();
		}
	}
});
