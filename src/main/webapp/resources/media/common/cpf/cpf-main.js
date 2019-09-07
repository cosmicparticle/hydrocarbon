define(function(require, exports, module){
	/**
	 * 插件初始化顺序
	 * 1.tab
	 * 
	 * 
	 * 
	 * 页面初始化顺序
	 * 1.core
	 * 2.paging
	 * 3.dialog
	 * 4.form
	 * 5.page
	 * 6.css
	 * 7.
	 * 8.
	 * 9.
	 * 10.tab
	 * 11.control
	 * 
	 */
	
	var $CPF = require('$CPF');
	require('ajax');
	var Page = require('page');
	require('form');
	require('paging');
	require('dialog');
	require('tree');
	var Tab = require('tab');
	require('innerpage');
	require('css');
	require('control');
	require('checkbox');
	require('event');
	require('tmpl');
	require('field/js/field-search.js')
	$CPF.putPageInitSequeue(12, function($page){
		$(':text.dtrangepicker', $page).each(function(){
			require('utils').daterangepicker($(this));
		});
		$('table.row-selectable', $page).each(function(){
			var $table = $(this);
			$table.data('checkedRowGetter', function(){
				var $rows = $('>tbody>tr', $table);
				return $rows.filter(function(){
					return $(this).find('.row-selectable-checkbox').prop('checked');
				});
			});
			$table.on('change', '.row-selectable-checkbox', function(){
				var $checkedRows = $table.data('checkedRowGetter')();
				var $rows = $('>tbody>tr', $table);
				var $selectAll = $table.find(':checkbox.select-all');
				if($checkedRows.length === 0){
					$selectAll.prop('checked', false);
				}else if($checkedRows.length === $rows.length){
					$selectAll.removeClass('partly').prop('checked', true);
				}else{
					$selectAll.addClass('partly').prop('checked', true);
				}
				$table.trigger('row-selected-change', [$checkedRows]);
			});
			
			$table.on('change', ':checkbox.select-all', function(){
				var $selectAll = $(this);
				$selectAll.removeClass('partly');
				var checkAll = $selectAll.prop('checked');
				$table.children('tbody').find('.row-selectable-checkbox').prop('checked', checkAll);
				$table.trigger('row-selected-change', [checkAll? $('>tbody>tr', $table): $()]);
			});
		});
	});
	$CPF.init({
		loadingImg			: 'media/admin/cpf/image/loading.gif',
		innerPageLoadingImg	: 'media/admin/cpf/image/innerpage-loading.gif',
		maxPageCount		: 8,
		sessionInvalidURL	: 'admin/login',
		tabLinkPrefix		: 'admin/',
		//加载层最多持续多久后出现关闭加载按钮
		loadingTimeout		: 7000,
		handlersHeader		: function(headers){
			 headers['request-category'] = 'cpf-ajax';
		}
	});
	$CPF.showLoading();
	//初始化当前页面
    $CPF.initPage(document);
    $(document).on('click', function(e){
		var $this = $(e.target);
		var $blurHidden = $this.closest('.blur-hidden'); 
		if($blurHidden.length === 0){
			if(!$this.is('.btn-toggle') && $this.closest('.btn-toggle').length == 0){
				$('.blur-hidden').hide();
			}
		}
	});
    $('.account-view').click(function(e){
    	e.stopPropagation();
    	var $accountArea = $(this).parent();
    	$accountArea.toggleClass('open');
    	$(document).one('click', function(){
    		$accountArea.removeClass('open');
    	});
    });
    
    try{
    	require('main/js/statis-func.js');
    }catch(e){}
    exports.openMenu = function(menuId){
    	var $link = $('#sidebar a[l2-menu-id="' + menuId +  '"]');
    	$link.closest('[l1-menu-id]').find('.menu-dropdown').trigger('click');
    	$link.trigger('click');
    };
    
    $CPF.closeLoading();
});
