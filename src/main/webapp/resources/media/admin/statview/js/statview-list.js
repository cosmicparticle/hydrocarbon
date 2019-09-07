/**
 * 
 */
define(function(require, exports, module){
	function StatViewList(){
		
		
	}
	StatViewList.init = function($page, pageParam){
		var $viewcols = $('#viewcols-window>.viewcols-wrapper>span', $page);
		var disabledColIds = ($('#disabledColIds', $page).val() || '').split(',');
		
		$viewcols.click(function(){
			$(this).toggleClass('disabled');
		}).filter(function(){
			return $.inArray($(this).attr('data-id'), disabledColIds) >= 0;
		}).addClass('disabled');
		
		$('#btn-cols-submit', $page).click(function(){
			var disabledColIds = '';
			$viewcols.filter('.disabled').each(function(){
				var $col = $(this);
				disabledColIds += $col.attr('data-id') + ',';
			});
			var $form = $('form', $page);
			$('#disabledColIds', $form).val(disabledColIds);
			$form.submit();
		});
	}
	
	module.exports = StatViewList;
});