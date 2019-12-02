define(function(require, exports, module){
	var AbstractSingleInputTemplateParameter = require('entity/js/tmpl_param/AbstractSingleInputTemplateParameter');
	/**
	 * 
	 */
	function IntInputTemplateParameter(){
		AbstractSingleInputTemplateParameter.call(this);
		this.tmplKey = 'input-int';
		var _this = this;
		this.afterRender = function($dom){
			$dom.on('input',function(){
				this.value = this.value.replace(/[^\d\-]/g, '').replace(/(\d+)\-+(\d*)/, '$1$2').replace(/\-+/, '-');
		    });
			_this._bindValueChanged($dom);
		}
	}
	require('utils').extendClass(IntInputTemplateParameter, AbstractSingleInputTemplateParameter);
	
	module.exports = IntInputTemplateParameter;
});