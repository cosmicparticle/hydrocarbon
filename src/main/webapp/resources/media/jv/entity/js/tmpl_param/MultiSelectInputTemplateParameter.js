define(function(require, exports, module){
	var AbstractTemplateParameter = require('entity/js/entity-detail-input').AbstractTemplateParameter;
	
	
	function MultiSelectInputTemplateParameter(_param){
		AbstractTemplateParameter.call(this);
		this.tmplKey = 'input-multiselect';
		var _this = this;
		
		this.param = $.extend({
			optonsKey			: null,
			options				: [],
			fieldOptionsFetcher	: require('field/js/field-option-fetcher.js').getGlobalFetcher(),
		}, _param)
		
		var fieldOptionsFetcher = this.param.fieldOptionsFetcher;
		
		_this.setValueChanged(false);
		
		this.data = {
			options	: []
		}
		
		this.valueGetter = function($dom){
			return getSelect($dom).val() || '';
		}
		
		this.valueSetter = function($dom, val, initValueFlag){
			if(val){
				var value = [];
				if($.isArray(val)){
					value = val;
				}else if(typeof val === 'string'){
					value = val.split(',');
				}
				getSelect($dom).val(value).trigger('change', [initValueFlag]);
			}
		}
		
		function getSelect($dom){
			return $('select', $dom);
		}
		
		this.prepare = function(resolve){
			if(this.param.options){
				this.data.options = this.param.options;
				resolve();
			}else if(this.param.optionsKey){
				console.log('multi fetch' , this.param.optionsKey);
				fieldOptionsFetcher.fetch(this.param.optionsKey).done(function(options){
					_this.data.options = options;
					resolve();
				});
			}
		}
		this.afterRender = function($dom){
			fieldOptionsFetcher.afterCommit(function(){
				var $select = getSelect($dom);
				bindSelect2($select);
				$select.change(function(e, initValueFlag){
					if(initValueFlag !== true){
						_this.setValueChanged(true);
					}
				})
			});
		}
		this.bindValueChanged = function($dom, callback){
			getSelect($dom).change(callback);
		}
		this.getErrorWrapper = function($dom){
			return $('.select2-selection', $dom);
		}
	}
	
	function bindSelect2($select, param){
		$select.select2({
			theme	: "bootstrap",
			width	: null
			
		});
	}
	
	require('utils').extendClass(MultiSelectInputTemplateParameter, AbstractTemplateParameter);
	
	module.exports = MultiSelectInputTemplateParameter;
});