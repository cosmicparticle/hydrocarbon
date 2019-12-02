/**
 * 
 */
define(function(require, exports, module){
	var PATHS = {
		'/home'	: require('custompage/path/js/custompage-home')
	};
	
	exports.initPage = function(_param){
		var defParam = {
			path	: ''
		}
		
		var param = $.extend({}, defParam, _param);
		if(!param.path.startsWith('/')){
			param.path = '/' + param.path;
		}
		var Utils = require('utils');
		var Dialog = require('dialog');
		
		var context = Utils.createContext({
			
		});
		
		var TargetPage = PATHS[param.path];
		if(!TargetPage){
			Dialog.notice('不存在的自定义页面（' + param.path + '）');
			$.error('不存在的自定义页面', param.path);
		}else{
			var targetPage = new TargetPage({
				param, context
			});
			targetPage.render();
		}
		
	}
});