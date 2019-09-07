define(function(require, exports, module){
	var AbstractSingleInputTemplateParameter = require('entity/js/tmpl_param/AbstractSingleInputTemplateParameter');
	function DateInputTemplateParameter(_param){
		AbstractSingleInputTemplateParameter.call(this);
		this.tmplKey = 'input-date';
		var param = $.extend({
			$container	: null
		}, _param);
		var _this = this;
		this.afterRender = function($dom){
			require('utils').datepicker($dom, param.$container, param.$container);
			_this._bindValueChanged($dom);
		}
	}
	require('utils').extendClass(DateInputTemplateParameter, AbstractSingleInputTemplateParameter);
	
	
	module.exports = DateInputTemplateParameter;
});