define(function(require, exports, module){
	var AbstractSingleInputTemplateParameter = require('entity/js/tmpl_param/AbstractSingleInputTemplateParameter');
	/**
	 * 
	 */
	function TextInputTemplateParameter(){
		AbstractSingleInputTemplateParameter.call(this);
		this.tmplKey = 'input-text';
	}
	require('utils').extendClass(TextInputTemplateParameter, AbstractSingleInputTemplateParameter);
	
	module.exports = TextInputTemplateParameter;
});