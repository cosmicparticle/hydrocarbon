define(function(require, exports, module){
	var AbstractTemplateParameter = require('entity/js/entity-detail-input').AbstractTemplateParameter;
	
	function CaselectInputTemplateParameter(_param){
		AbstractTemplateParameter.call(this);
		this.tmplKey = 'input-caselect';
		this.param = $.extend({
			optionsKey	: ''
		}, _param);
		
		var _this = this;
		this.setValueChanged(false);
		var value = '';
		var disabled = false;
		var CAS_SPLITER = '->';
		
		var optionsKey = _param.optionsKey;
		var fieldGroupId = null;
		var fieldLevel = null;
		
		var groups = /^(\d+)@(\d+)$/.exec(optionsKey);
		if(groups){
			fieldGroupId = groups[1];
			fieldLevel = parseInt(groups[2]);
		}else{
			throw new Error('caselect的optionsKey不符合规范[optionsKey=' + optionsKey + ']');
		}
		
		var $selectsContainer = buildSelectsContainer();
		
		this.valueGetter = function(){
			return getValue();
		}

		function getValue(){
			var val = '';
			$selectsContainer.children('select').each(function(){
				var $select = $(this);
				if($select.val() !== ''){
					val += require('utils').getCheckedOption($select).text() + CAS_SPLITER;
				}else{
					return false;
				}
			});
			if(val != ''){
				val = val.substring(0, val.length - CAS_SPLITER.length);
			}
			return val;
		}
		
		this.valueSetter = function($span, val, initValueFlag){
			var $input = getInput($span);
			$input.text(val);
			appendOption($selectsContainer.children('select').eq(0), fieldGroupId, val).done(function(valArr){
				var valStr = '';
				for(var i in valArr){
					if(valArr[i]){
						valStr += valArr[i] + CAS_SPLITER;
					}
				}
				if(valStr != ''){
					valStr = valStr.substring(0, valStr.length - CAS_SPLITER.length);
				}
				$input.text(valStr);
			});
			if(initValueFlag !== true){
				_this.setValueChanged(true);
			}
			
			value = val;
		}
		
		this.afterRender = function($span){
			var $input = getInput($span);
			var detailInput = this;
			$input.click(function(e){
				e.stopImmediatePropagation();
				if(!disabled){
					require('utils').instead($input, $selectsContainer, _this.param.$container);
					$input.show().css('visibility', 'hidden');
					var blur = function(e1){
						if($(e1.target).closest($selectsContainer).length == 0){
							$selectsContainer.hide();
							$input.text(getValue()).css('visibility', 'visible');
							_this.validate.apply(detailInput, [$span]);
							$(document.body).off('click', blur);
						}
					}
					$(document.body).on('click', blur);
				}
				return false;
			});
		}
		
		function getInput($span){
			return $('.cpf-field-input-caselect-input', $span);
		}
		
		function buildSelectsContainer(){
			var $span = $('<span class="cpf-field-input-caselectt-sels">');
			for(var i = 1; i <= fieldLevel; i++){
				var $select = $('<select><option value="">---请选择--</option></select>');
				$select.change(function(){
					var $this = $(this);
					var groupId = $this.val();
					appendOption($this.next('select'), groupId);
					_this.setValueChanged(true);
				});
				$span.append($select);
			}
			return $span;
		}
		function appendOption($select, groupId, val){
			var def = $.Deferred();
			if($select && $select.length > 0){
				var $next = $select;
				while($next.length > 0){
					$next.children('option:gt(0)').remove();
					$next = $next.next('select');
				}
				if(groupId){
					require('ajax').ajax('api2/meta/dict/cas_ops/' + groupId, {}, function(data){
						if(data.status === 'suc'){
							for(var i in data.options){
								var option = data.options[i];
								$select.append('<option value="' + option.id + '">' + option.title + '</option>');
							}
							if(typeof val === 'string' && val){
								var thisVal = val;
								var spliterIndex = val.indexOf(CAS_SPLITER);
								if(spliterIndex >= 0){
									thisVal = val.substring(0, spliterIndex);
								}
								groupId = $select
									.children('option')
									.filter(function(){return this.text === thisVal})
									.attr('value');
								if(groupId){
									$select.val(groupId);
									val = val.substring(spliterIndex + 2, val.length);
									return appendOption($select.next('select'), groupId, val).done(function(valArr){
										def.resolve($.merge([thisVal], valArr));
									});
								}
							}
							def.resolve(['']);
						}
					}, {
						method	: 'GET',
						cache	: true
					});
				}
			}else{
				def.resolve([]);
			}
			return def.promise();
		}
		
		
		this.validate = function($span){
			var result = []; 
			var completed = true;
			var val = getValue();
			if(val){
				$selectsContainer.children('select').each(function(){
					if(!$(this).val()){
						completed = false;
						return false;
					}
				});
			}
			if(!completed){
				result.push(this.showError('级联属性不完整', 2, getInput($span)));
				return result;
			}else{
				this.ui.removeError(getInput($span));
			}
		}
		
	}
	require('utils').extendClass(CaselectInputTemplateParameter, AbstractTemplateParameter);
	
	module.exports = CaselectInputTemplateParameter;
	
});