define(function(require, exports, module){
	var AbstractTemplateParameter = require('entity/js/entity-detail-input').AbstractTemplateParameter;
	/**
	 * 
	 */
	function AbstractSingleInputTemplateParameter(){
		AbstractTemplateParameter.call(this);
		var _this = this;
		this.setValueChanged(false);
		this.afterRender = function($dom){
			_this._bindValueChanged($dom);
		};
		this._bindValueChanged = function($dom){
			$dom.change(function(){
				_this.setValueChanged(true);
			})
		}
		this.bindValueChanged = function($dom, callback){
			$dom.change(callback);
		}
		this.setReadonly = function($dom, readonlyStatus){
			if(readonlyStatus){
				$dom.attr('readonly', 'readonly');
			}else{
				$dom.removeAttr('readonly');
			}
		}
		
	}
	require('utils').extendClass(AbstractSingleInputTemplateParameter, AbstractTemplateParameter);
	$.extend(AbstractSingleInputTemplateParameter.prototype, {
		valueGetter	: function($dom){
			return $dom.val();
		},
		valueSetter	: function($dom, value){
			return $dom.val(value);
		}
		
	});
	
	module.exports = AbstractSingleInputTemplateParameter;
});