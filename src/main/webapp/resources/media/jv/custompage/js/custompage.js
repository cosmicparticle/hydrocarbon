/**
 * 
 */
define(function(require, exports, module){
	function CustomPage(_param){
		var defParam = {
			param	: null,
			context	: null
		};
		var param = Object.assign({}, defParam, _param);
		this.path =  param.path;
	}
	
	
	CustomPage.prototype.support = function(context){
		return true;
	}
	
	CustomPage.prototype.render = function(){
		
	}
	
	module.exports = CustomPage;
})
	
	
