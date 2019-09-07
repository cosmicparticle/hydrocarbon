/**
 * 用于初始化页面中元素的样式
 * 以及提供一些样式方法
 */
define(function(require, exports, module){
	var $CPF = require('$CPF'),
		Page = require('page')
		;
	
	$CPF.addDefaultParam({
		styleAttrPrefix	: 'css-',
		styleAttrNames	: ['width', 'display', 'cursor', 'float', 'color']
	});
	/**
	 * 添加页面初始化
	 */
	$CPF.putPageInitSequeue(6, function($page){
		var prefix = $CPF.getParam('styleAttrPrefix'),
			attrNames = $CPF.getParam('styleAttrNames')
			;
		for(i in attrNames){
			var name = attrNames[i];
			$('[' + prefix + attrNames[i] + ']', $page).each(function(){
				var attrVal = $(this).attr(prefix + attrNames[i]);
				if(attrVal){
					$(this).css(name, attrVal);
				}
			});
		}
	});
	
});