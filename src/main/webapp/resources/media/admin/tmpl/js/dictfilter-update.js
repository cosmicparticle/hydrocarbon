/**
 * 
 */
define(function(require, exports, module){
	exports.initPage = function($page){
		$('#save', $page).click(function(){
			$('form', $page).submit();
		});
	}
});