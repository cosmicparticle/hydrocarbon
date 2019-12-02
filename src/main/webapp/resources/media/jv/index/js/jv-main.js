define(function(require, exports){
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
	var defer = $.Deferred();
	var $CPF = require('$CPF');
	var Ajax = require('ajax');
	var Page = require('page');
	require('form');
	require('paging');
	require('dialog');
	require('tree');
	require('tab');
	require('innerpage');
	require('css');
	require('control');
	require('checkbox');
	require('event');
	$CPF.putPageInitSequeue(12, function($page){
		$(':text.dtrangepicker', $page).each(function(){
			require('utils').daterangepicker($(this));
		});
		require('selectable-table').bind($('table.row-selectable', $page));
	});
	$CPF.init({
		loadingImg			: 'media/admin/cpf/image/loading.gif',
		innerPageLoadingImg	: 'media/admin/cpf/image/innerpage-loading.gif',
		maxPageCount		: 8,
		sessionInvalidURL	: 'jv/main/login',
		tabLinkPrefix		: 'jv/',
		//加载层最多持续多久后出现关闭加载按钮
		loadingTimeout		: 7000,
		ajaxHost			: seajs.data.vars.ajaxHost || '',
		CORS				: true
	});
	$CPF.showLoading();
	//初始化当前页面
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
    Ajax.loadResource('media/jv/custompage/json/halloween.json').done(function(halloween){
		echarts.registerTheme('halloween', halloween);
	});
    defer.resolve(require);
    exports.deferred = defer.promise();
    /*try{
    	require('main/js/statis-func.js');
    }catch(e){}*/
    
});
