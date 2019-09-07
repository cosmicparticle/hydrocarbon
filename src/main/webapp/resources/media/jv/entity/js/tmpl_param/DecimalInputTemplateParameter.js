define(function(require, exports, module){
	var AbstractSingleInputTemplateParameter = require('entity/js/tmpl_param/AbstractSingleInputTemplateParameter');
	/**
	 * 
	 */
	function DecimalInputTemplateParameter(){
		AbstractSingleInputTemplateParameter.call(this);
		this.tmplKey = 'input-decimal';
	}
	
	require('utils').extendClass(DecimalInputTemplateParameter, AbstractSingleInputTemplateParameter);
	
	module.exports = DecimalInputTemplateParameter;
	
});