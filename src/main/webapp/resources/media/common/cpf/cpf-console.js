define(function(require, exports, module){
	"use strict";
	function Logger(key){
		
	}
	
	Logger.prototype = {
		debug	: function(){
			doInConsole('log', arguments);
			return this;
		},
		info	: function(){
			doInConsole('log', arguments);
			return this;
		},
		log		: function(){
			doInConsole('log', arguments);
			return this;
		},
		error	: function(){
			doInConsole('error', arguments);
			return this;
		}
	}
	
	module.exports = Logger;
	var keyMap = {};
	$.extend(Logger, new Logger('GLOBAL'), {
		getLogger: function(key){
			var logger = keyMap[key];
			if(!logger){
				keyMap[key] = logger = new Console(key);
			}
			return logger;
		}
	});
	
	function doInConsole(method, args){
		if(console && typeof console[method] === 'function'){
			console[method].apply(console, args);
		}
	}
	
});