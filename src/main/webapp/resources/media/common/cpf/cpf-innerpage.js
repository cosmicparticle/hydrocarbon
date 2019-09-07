/**
 * 
 */
define(function(require, exports, module){
	var $CPF = require('$CPF'),
		Utils = require('utils')
		;
	
	$CPF.addDefaultParam({
		//内嵌页面的class，当初始化某个页面时，内部存在该class的元素时，会将其认为是一个内嵌页面
		innerPageClass			: 'cpf-inner-page',
		//内嵌页面的id属性名，通过该id可以找到该页面
		innerPageIdAttrName		: 'inner-page-id',
		innerPageURLAttrName	: 'url',
		innerPageLoadingClass	: 'inner-page-loading',
		innerPageLoadingImg		: ''
	});
	
	$CPF.putPageInitSequeue(12, function($page){
		//在tab和dialog加载时，页面中的所有嵌入页面
		$('.' + $CPF.getParam('innerPageClass'), $page).each(function(){
			var $this = $(this);
			var pageId = $this.attr($CPF.getParam('innerPageIdAttrName'));
			var page = new InnerPage({
				id			: pageId,
				parent		: $page.getLocatePage(),
				$content	: $this,
				onPageLoad	: function(){
					
				}
			});
			require('page').putPage(page.getId(), page.getPage());
		});
		
	});
	
	function InnerPage(_param){
		var defaultParam = {
			id			: Utils.uuid(5, 32),
			parent		: null,
			$content	: undefined,
			onPageLoad	: $.noop
		};
		var param = $.extend({}, defaultParam, _param);
		var _this = this,
			formData = new FormData($(param.$content).find('form')[0]), 
			url;
		var pageType = 'innerPage';
		
		var Page = require('page');
		
		var page = new Page({
			type		: pageType,
			id			: param.id,
			pageObj		: _this,
			$content	: param.$content,
			$container	: param.$content
		});
		
		this.getId = function(){
			return param.id;
		}
		
		this.getPage = function(){
			return page;
		}
		
		this.getContent = function(){
			return param.$content;
		}
		
		this.getType = function(){
			return pageType;
		};
		
		this.refresh = function(){
			if(!url){
				var _url = this.getContent().attr($CPF.getParam('innerPageURLAttrName'));
				if(!_url){
					var $form = $('form', this.getContent()).first();
					_url = $form.attr('action');
				}
				if(_url){
					this.loadContent(_url, null, formData);
				}else{
					$.error('刷新时没有找到URL');
				}
			}else{
				this.loadContent(url, null, formData);
			}
		};
		
		this.loadContent = function(content, _title, _formData){
			if(typeof content === 'string'){
				var dUrl = content;
				var dFormData = _formData;
				_this.showLoading();
				require('ajax').ajax(dUrl, dFormData, {
					page		: page,
					whenSuc		: function(data, dataType){
						if(dataType === 'html'){
							url = dUrl;
							formData = dFormData;
							_this.loadContent($('<div>').html(data));
						}
					},
					afterLoad	: function(){
						_this.closeLoading();
					}
				});
			}else if(content instanceof $){
				try{
					_this.showLoading();
					this.getContent().html(content.html());
					_this.showLoading();
					$CPF.initPage(_this.getContent());
					param.onPageLoad.apply(this);
				}catch(e){console.error(e)}
				finally{
					_this.closeLoading();
				}
			}
		};
		
		var $loading = $('<div class="' + $CPF.getParam('innerPageLoadingClass') + '"></div');
		var loadingImg = $CPF.getParam('innerPageLoadingImg');
		if(loadingImg){
			$loading.css('line-height', this.getContent().outerHeight() + 'px');
			$loading.append('<img id="loading-gif" src="' + loadingImg + '" />');
		}
		this.showLoading = function(){
			$loading.appendTo(this.getContent()).show();
		};
		
		this.closeLoading = function(){
			$loading.hide();
		};
		
		this.close = function(){
			
		}
		
	}
	
	$.extend(InnerPage, {
		/**
		 * 
		 */
		bindInnerPage	: function(_param){
			
		}
	});
	
	
	module.exports = InnerPage;
	
});
