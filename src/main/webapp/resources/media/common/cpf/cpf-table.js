define(function(require, exports, module){
	var Utils = require('utils');
	function Table(_param){
		var defParam = {
			data			: {},
			uri				: '',
			interval		: 5000,
			tmplUri			: 'media/common/cpf/cpf-table.tmpl',
			tmplId			: 'table',
			dataRowClass	: '',
			headerRowClass	: ''
		}
		
		this.param = $.extend({}, defParam, _param);
		
	}
	
	
	Table.prototype.render = function(){
		var defer = $.Deferred();
		var that = this;
		require('tmpl').load(this.param.tmplUri).done(function(tmplMap){
			
			var dom = tmplMap[that.param.tmplId].tmpl(Utils.setProperties(that.param, ['data', 'dataRowClass', 'dataRowClass']));
			defer.resolve(dom);
		});
		return defer.promise();
	}
	
	module.exports = Table;
	
});

