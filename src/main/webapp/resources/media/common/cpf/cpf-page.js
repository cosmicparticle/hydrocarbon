define(function(require, exports, module){
	var $CPF = require('$CPF');
	
	$CPF.addDefaultParam({
		//用于将Page对象放到容器的jQuery对象的data当中
		pageDataKey			: 'PAGE_DATA_KEY',
		//页面类
		pageContentClass	: 'cpf-page-content',
	});
	
	
	$.fn.extend({
		/**
		 * 获得当前节点的所在页面的页面对象
		 */
		getLocatePage	: function(){
			var $container = $(this).closest('.' + $CPF.getParam('pageContentClass'));
			if($container.length > 0){
				var page = $container.first().data($CPF.getParam('pageDataKey'));
				if(page instanceof Page){
					return page;
				}
			}
		}
	});
	
	$CPF.putPageInitSequeue(5, function($page){
		$($page).on('click', 'a.jump[href]', function(){
			location.href = $(this).attr('href');
			return false;
		});
		$($page).on('click', 'a.open-link[href]', function(){
			var $this = $(this);
			window.open($this.attr('href') , '_blank');
			return false;
		});
		var page = $($page).getLocatePage();
		if(page instanceof Page){
			if(page.getType() === 'dialog'){
				$(page.getContainer()).on('click', 'a[href],button[href],i[href]', function(e){
					var $this = $(this);
					var href = $this.attr('href');
					var je = /^javascript:(.*)$/;
					if(je.test(href)){
						try{
							eval(je.exec(href)[1]);
						}catch(e){}
					}else if(href){
						if(href.match('^#.*$')){
							return;
						}
						var reg = /^page:(\w+)$/;
						var regJquery = /^page:#([\w\-_]+)\.([\w_]+)$/;
						if(reg.test(href)){
							var action = reg.exec(href)[1];
							switch(action){
							case 'refresh'	:
								$page.getLocatePage().refresh();
								break;
							case 'close'	:
								$page.getLocatePage().close();
								break;
							}
						}else if(regJquery.test(href)){
							var exec = regJquery.exec(href);
							var id = exec[1],
								method = exec[2];
							try{
								$('#' + id, $page)[method]();
							}catch(e){}
						}else if($this.attr('choose-key')){
							var chooseKey = $this.attr('choose-key');
							require('dialog').openDialog(href, $this.attr('title'), $this.attr('target'), {
								onSubmit	: function(data){
									$('[crn-' + chooseKey + ']', $page).each(function(){
										var $ele = $(this);
										var propName = $ele.attr('crn-' + chooseKey);
										if(propName){
											if($ele.is('a,span,div,i')){
												$ele.text(data[0][propName]);
											}else if($ele.is('input[type="text"],input[type="hidden"],textarea,select,input[type="number"]')){
												$ele.val(data[0][propName]);
											}
											$ele.trigger('CpfAfterChoose', [data[0][propName], data[0], data]);
										}
									});
									
									$('#listTemplateId', $page).val(data[0].id);
									$('#choose-ltmpl', $page).text(data[0].title);
								}
							})
						}else{
							goPage(this, page);
						}
					}
					return false;
				});
			}else{
				$($page).on('click', 'a[href],button[href],i[href]', function(){
					var $this = $(this);
					if(!$this.is('.tab,.dialog')){
						var href =$this.attr('href');
						var je = /^javascript:(.*)$/;
						if(je.test(href)){
							try{
								eval(je.exec(href)[1]);
							}catch(e){}
						}else if(href){
							if(href.match('^#.*$')){
								return;
							}
							var confirmStr = $this.attr('confirm');
							if(confirmStr){
								require('dialog').confirm(confirmStr, function(yes){
									if(yes) goPage($this, page);
								});
							}else{
								var reg = /^page:(\w+)$/; 
								var regJquery = /^page:#([\w\-_]+)\.([\w_]+)$/;
								if(reg.test(href)){
									var action = reg.exec(href)[1];
									switch(action){
									case 'refresh'	:
										$page.getLocatePage().refresh();
										break;
									case 'close'	:
										$page.getLocatePage().close();
										break;
									}
								}else if(regJquery.test(href)){
									var exec = regJquery.exec(href);
									var id = exec[1],
										method = exec[2];
									try{
										$('#' + id, $page)[method]();
									}catch(e){}
								}else if($this.attr('choose-key')){
									var chooseKey = $this.attr('choose-key');
									require('dialog').openDialog(href, $this.attr('title'), $this.attr('target'), {
										onSubmit	: function(data){
											$('[crn-' + chooseKey + ']', $page).each(function(){
												var $ele = $(this);
												var propName = $ele.attr('crn-' + chooseKey);
												if(propName){
													if($ele.is('a,span,div,i')){
														$ele.text(data[0][propName]);
													}else if($ele.is('input[type="text"],input[type="hidden"],textarea,select,input[type="number"]')){
														$ele.val(data[0][propName]);
													}
												}
											});
											
											$('#listTemplateId', $page).val(data[0].id);
											$('#choose-ltmpl', $page).text(data[0].title);
										}
									})
								}else{
									goPage($this, page);
								}
							}
						}
						return false;
					}
				});
			}
		}
		
	});
	function goPage(dom, targetPage){
		var target = $(dom).attr('target'),
			href = $(dom).attr('href'),
			title = $(dom).attr('title'),
			pageType = $(dom).attr('page-type') || 'dialog'
			;
		if(target && require('utils').startsWith(target, '@')){
			var pageId = target.substr(1);
			//根据id获得获得对应的Page对象
			targetPage = Page.getPage(pageId);
			if(!(targetPage instanceof Page)){
				//没有找到Page对象，那么就创建一个
				if(pageType === 'dialog'){
					var Dialog = require('dialog');
					var dialog = new Dialog({
						id		: pageId,
						title	: title
					});
					targetPage = dialog.getPage();
				}else if(pageType === 'tab'){
					var Tab = require('tab');
					var tab = new Tab({
						id		: pageId,
						title	: title
					});
					tab.insert();
					targetPage = tab.getPage();
				}
			}
		}
		var formData = {};
		if($(dom).is('.cpf-batch-checked')){
			var batchRange = $(dom).attr('batch-range') || '';
			$('.cpf-checkbox[name]' + batchRange, $(dom).getLocatePage().getContent()).each(function(){
				var $checkbox = $(this),
					name = $checkbox.attr('name');
				if($checkbox.is('.checked') || $(':checkbox:checked', $checkbox).length === 1){
					var l = formData[name];
					if(!l){
						formData[name] = l = [];
					}
					l.push($checkbox.attr('value'));
				}
			});
		}
		targetPage.loadContent(href, title, formData);
		var tPageType = targetPage.getType();
		if(tPageType === 'dialog'){
			targetPage.getPageObj().show();
		}else if(tPageType === 'tab'){
			targetPage.getPageObj().activate();
		}
	}
	
	
	var pageMap = {};
	
	/**
	 * 页面类
	 * 页面类型包括标签页(tab)、弹出框(dialog)，以及主页(home)
	 */
	function Page(_param){
		var $content = _param.$content,
			type = _param.type,
			id = _param.id,
			pageObj = _param.pageObj,
			$container = _param.$container
			;
		$content
			.addClass($CPF.getParam('pageContentClass'))
			.data($CPF.getParam('pageDataKey'), this);
		
		var callbackMap = require('utils').CallbacksMap(this);
		this.getId = function(){
			return id;
		};
		this.getContent = function(){
			return $content;
		};
		this.getType = function(){
			return type;
		};
		this.getPageObj = function(){
			return pageObj;
		};
		this.getContainer = function(){
			return $container;
		};
		this.refresh = function(){
			if(typeof pageObj.refresh === 'function'){
				pageObj.refresh();
			}
		};
		this.loadContent = function(url, _title, formData, _contentType, _whenLoaded){
			if(typeof pageObj.loadContent === 'function'){
				pageObj.loadContent(url, _title, formData, _contentType, _whenLoaded);
			}
		};
		this.close = function(){
			if(typeof pageObj.close === 'function'){
				pageObj.close();
			}
		};
		var eventMap = {};
		this.bind = function(eventName, callback){
			if(typeof eventName === 'string' && typeof callback === 'function'){
				eventMap[eventName] = callback;
			}
		};
		this.trigger = function(eventName, args){
			if(typeof eventName === 'string'){
				var callback = eventMap[eventName];
				if(typeof callback === 'function'){
					try{
						return callback.apply(this, args);
					}catch(e){}
				}
			}
		}
		/**
		 * 
		 */
		this.getEventCallbacks = function(){
			if(typeof pageObj.getEventCallbacks === 'function'){
				return pageObj.getEventCallbacks.apply(pageObj, arguments);
			}
		}
	}
	
	$.extend(Page, {
		putPage		: function(pageId, page){
			pageMap[pageId] = page;
		},
		getPage		: function(pageId){
			return pageMap[pageId];
		},
		remove		: function(pageId){
			pageMap[pageId] = undefined;
		}
	});
	
	
	//将整个Page类作为对外接口
	module.exports = Page;
	
});