define(function(require, exports, module){
	var AbstractTemplateParameter = require('entity/js/entity-detail-input').AbstractTemplateParameter;
	
	
	function SelectInputTemplateParameter(_param){
		AbstractTemplateParameter.call(this);
		this.tmplKey = 'input-select';
		var _this = this;
		
		this.param = $.extend({
			optonsKey			: null,
			options				: [],
			fieldOptionsFetcher	: require('field/js/field-option-fetcher.js').getGlobalFetcher(),
			withoutEmpty		: false,
			tags				: false,
			shouldSetValue		: false,
			optionsHasValue		: true
		}, _param)
		
		var fieldOptionsFetcher = this.param.fieldOptionsFetcher;
		
		this.setValueChanged(false);
		
		this.data = {
			options			: [],
			withoutEmpty	: this.param.withoutEmpty,
		};
		
		this.prepare = function(resolve, defer){
			if(this.param.options){
				this.data.options = this.param.options;
				resolve();
			}else if(this.param.optionsKey){
				fieldOptionsFetcher.fetch(this.param.optionsKey).done(function(options){
					_this.data.options = options;
					resolve();
				});
			}
		}
		
		function getSelect($dom){
			 return $('select[input-role="select"]', $dom);
		}
		
		this.getErrorWrapper = function($dom){
			return $('.select2-selection', $dom);
		}
		
		this.valueGetter = function($dom){
			return getSelect($dom).val();
		}
		this.valueSetter = function($dom, value, initValueFlag){
			return getSelect($dom).val(value).trigger('change',  [initValueFlag]);
		}
		this.afterRender = function($dom){
			fieldOptionsFetcher.afterCommit(function(){
				var $select = getSelect($dom);
				bindSelect2($select, _this.param);
				$select.change(function(e, initValueFlag){
					if(initValueFlag !== true){
						_this.setValueChanged(true);
					}
				});
			});
		}
		this.bindValueChanged = function($dom, callback){
			getSelect($dom).change(callback);
		}
		
	}
	require('utils').extendClass(SelectInputTemplateParameter, AbstractTemplateParameter);
	
	//$.extend(SelectInputTemplateParameter.prototype, new AbstractTemplateParameter());
	
	function bindSelect2($select, param){
		var tags = param.tags, 
			shouldSetValue = param.shouldSetValue, 
			optionsHasValue = param.optionsHasValue;
		
		var tagsParam = {
			tags			: true,
			closeOnSelect	: false
		}
		$select.select2($.extend({
			theme	: "bootstrap",
			width	: null
		}, tags === true? tagsParam: {}));
		
		
		if(tags === true){
			if(shouldSetValue && !optionsHasValue){
				$select.append($('<option>').attr('value', param.value).text(param.value));
			}
			var $optionSearcher = function(){return $('.select2-container--open .select2-search__field')};
			var permitClose = false;
			$(document).on('keyup', $optionSearcher(), function(e){
				if(e.keyCode === 13){
					permitClose = true;
					$select.select2('close');
				}
			});
			$select.on('select2:select', function(e){
				$optionSearcher().val(e.params.data.text).focus().select();
			}).on('select2:closing', function(e){
				if(!permitClose){
					var $searcher = $optionSearcher();
					permitClose = true;
					e.preventDefault();
					$select.val($searcher.val()).trigger('change').select2('close');
				}
			}).on('select2:close', function(e){
				if(!permitClose){
					e.preventDefault();
					permitClose = true;
				}
			}).on('select2:open', function(e){
				permitClose = false;
			});
		}
	}
	
	module.exports = SelectInputTemplateParameter;
});