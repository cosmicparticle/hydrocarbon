define(function(require, exports, module){
	var AbstractSingleInputTemplateParameter = require('entity/js/tmpl_param/AbstractSingleInputTemplateParameter');
	/**
	 * 
	 */
	function TextInputTemplateParameter(){
		AbstractSingleInputTemplateParameter.call(this);
		this.tmplKey = 'input-refselect';
	}
	require('utils').extendClass(RefselectInputTemplateParameter, AbstractSingleInputTemplateParameter);
	
	module.exports = RefselectInputTemplateParameter;
});