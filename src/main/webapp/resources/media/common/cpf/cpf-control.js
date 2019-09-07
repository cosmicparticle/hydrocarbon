/**
 * 封装bootstrapt的控件
 * 包括
 * 1.tagsinput
 * 2.
 */

define(function(require, exports, module){
	var $CPF = require('$CPF');
	
	$CPF.putPageInitSequeue(11, function($page){
		var Page = require('page');
		var page = $($page).getLocatePage();
		if(page instanceof Page){
			if($.fn.tagsinput){
				//初始化所有data-role为tagsinput的text
				$(':text[data-role="tagsinput"]', $page).each(function(){
					var $this = $(this);
					var itemText = $this.attr('data-ti-itemText')
					;
					$this.tagsinput({
					});
				});
			}
		}
		
		
	});
	
	
	
	function Control(){
		
	}
	
	function TagsInput(){
		
	}
	
	
	Control.TagsInput = TagsInput;
	
	
	module.exports = Control;
});