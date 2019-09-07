/**
 * 
 */

define(function(require, exports, module){
	exports.requireEntities = function(key, pageNo){
		return require('ajax').ajax('admin/modules/curd/askfor_entities/' + key + '/' + pageNo, {
			
		}).done(function(data){
			console.log(data);
		});
	}
});