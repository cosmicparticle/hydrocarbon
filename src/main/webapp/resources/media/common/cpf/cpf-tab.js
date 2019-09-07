/**
 * cpf标签页控件
 * 拦截a标签和form标签的跳转动作，转换为在标签页中打开新的页面
 */
define(function(require, exports, module){
	var 
		$CPF = require('$CPF'),
		Page = require('page'),
		Ajax = require('ajax'),
		utils= require('utils')
	;
	//id-tab的map
	var tabMap = {},
		nextTab = 1,
		activatedTabQueue = []
		;
	/**
	 * 设置参数
	 */
	$CPF.addDefaultParam({
		tabIdGenerate	: function(){
			return 'tab_' + nextTab++;
		},
		//默认打开的标签页的名称
		defautTabTitle	: 'new Tab',
		tabTitleClass	: 'main-tab-title',
		//标签页的class
		tabClass		: 'main-tab-content',
		tabWrapperClass	: 'main-tab-content-wrapper',
		//用于将tab对象绑定到标签页的标题dom中
		tabTitleDataKey	: 'tab-title-data-key',
		//从标签页content的data中获取标签页对象的key
		//tabDataKey		: 'CPF_TAB_KEY',
		defaultTab		: new $CPF.DeferParam(function(){
			var tab = new Tab({
				id		: 'cpf-home-tab',
				$title	: $('a[href="#cpf-home-tab"]').closest('li.main-tab-title'),
				$content: $('#cpf-home-tab')
			});
			tabMap[tab.getId()] = tab;
			return tab;
		})
	});
	
	/**
	 * CPF插件调用init后会加载该函数
	 */
	$CPF.putInitSequeue(1, function(){
		/**
		 * init时就为左右移动标签的a绑定事件
		 */	
		moveTab();
	});
	
	/**
	 * CPF在加载页面的时候会第10个执行该函数
	 */
	$CPF.putPageInitSequeue(10, function($page){
		require('utils').scrollTo($($page), 0);
		bindPageTabEvent($page);
	});
	
	function Tab(_param){
		var defaultParam = {
			id				: utils.uuid(5, 32),
			title			: $CPF.getParam('defautTabTitle'),
			content			: '',
			onPageLoad		: $.noop,
			onClose			: $.noop,
			$title			: undefined,
			$content		: undefined,
			events			: {
				afterClose		: null,
				//调用该事件需要修改bootstrap的源码中的Tab.prototype.activate#next方法
				//为$active触发一个事件.trigger('inactivate')
				afterInactivate	: null
			},
			openedStack		: null
		};
		var param = $.extend({}, defaultParam, _param);
		var id = param.id,
			title = param.title,
			_this = this,
			url, formData;
		var tabDomObj;
		if(param.$title && param.$content){
			tabDomObj = {
				$title 	: param.$title,
				$content: param.$content
			};
			title = $('a', param.$title).text();
		}else{
			tabDomObj = buildTabDomObj(id, title);
		}
		
		var page = new Page({
			type		: 'tab',
			id			: id,
			pageObj		: this,
			$content	: tabDomObj.$content,
			$container	: tabDomObj
		});
		
		tabDomObj.$title.data($CPF.getParam('tabTitleDataKey'), this);
		tabDomObj.$title.on('cpf-activate', function(){_this.getEventCallbacks('afterActivate').fire([_this])});
		tabDomObj.$title.on('cpf-inactivate', function(){_this.getEventCallbacks('afterInactivate').fire([_this])});
		this.getId = function(){
			return id;
		};
		this.getPage = function(){
			return page;
		}
		
		this.getTitleDom = function(){
			return tabDomObj.$title;
		};
		this.getContent = function(){
			return tabDomObj.$content;
		}
		/**
		 * 判断当前标签页是否是游离状态的（没有插入到标签组中）
		 */
		this.isFree = function(){
			return !tabMap[this.getId()];
		};
		this.getTitle = function(){
			return title;
		};
		this.setTitle = function(_title){
			var $title = $('a', this.getTitleDom()).text(_title);
			if($title.length > 0){
				title = _title;
			}
			return this;
		};
		/**
		 * 异步加载内容到当前标签页中
		 */
		this.loadContent = function(content, _title, _formData, _contentType, _whenLoaded){
			var free = this.isFree();
			var stop = false;
			var e = {
				stopDefault 	: function(){
					stop = true;
				},
				eventName		: 'beforeLoad'
			}
			this.getEventCallbacks(e.eventName).fireWith(this, [e]);
			if(stop){
				return;
			}
			if(typeof content === 'string'){
				var dUrl = content;
				var dFormData = _formData;
				if(!free && this.isActive()){
					$CPF.showLoading();
				}
				Ajax.ajax(dUrl, dFormData, {
					page		: page,
					whenSuc		: function(data, dataType){
						if(dataType === 'html'){
							url = dUrl;
							formData = dFormData;
							_this.loadContent($('<div>').html(data));
						}
						if(typeof _whenLoaded === 'function'){
							_whenLoaded.apply(_this, [data, dataType]);
						}
					},
					afterLoad	: function(){
						$CPF.closeLoading();
					},
					setHost		: false
				});
			}else if(content instanceof $){
				if(!free && this.isActive()){
					$CPF.showLoading();
				}
				var $title = content.children('title').first();
				if($title.length === 1){
					$title.remove();
					var __title = $title.text();
					if(__title){
						_title = __title;
					}
				}
				try{
					var beforeReloadEvent = this.getEventCallbacks('beforeReload');
					beforeReloadEvent.fire(this);
					beforeReloadEvent.empty();
				}catch(e){}
				this.getContent().html(content.html());
				$CPF.initPage(_this.getContent());
				param.onPageLoad.apply(this);
				$CPF.closeLoading();
			}
			if(_title){
				this.setTitle(_title);
			}
			return this;
		};
		/**
		 * 刷新页面，必须从url获得内容
		 */
		this.refresh = function(){
			this.loadContent(url, title, formData);
		};
		/**
		 * 将当前标签插入到页面当中
		 * @param tab 已经在页面中的标签对象，将会把当前标签页插入到这个标签页后面
		 * 				如果不传入tab，那么将标签页插入到最后一个标签页中
		 */
		this.insert = function(tab, toActivate){
			if(typeof tab === 'boolean'){
				toActivate = tab;
				tab = undefined;
			}else if(toActivate == undefined){
				toActivate = true;
			}
			tab = tab || Tab.getLastTab();
			if(tabMap[tab.getId()]){
				this.getTitleDom().insertAfter(tab.getTitleDom());					
				var warpWidth = parseFloat(tab.getTitleDom().closest(".tab-warp").css("width"));
				var nextWidth = parseFloat(this.getTitleDom().css("width"));
				var ulWidth = parseFloat(tab.getTitleDom().parent().css("width"));
				var moveWidth = ulWidth-nextWidth -warpWidth +34;
				if(ulWidth >= warpWidth){
					$('a.move').css("display","block");
					tab.getTitleDom().parent().css("left",-moveWidth);
				}
				//前面的标签已经显示				
				this.getContent().insertAfter(tab.getContent());
				var origin = tabMap[this.getId()];
				if(origin){
					origin.close();
				}
				//放到容器中
				tabMap[this.getId()] = this;
				Page.putPage(this.getId(), page);
				if(toActivate){
					this.activate();
				}
			}
			return this;
		};
		/**
		 * 激活当前标签
		 */
		this.activate = function(){
			if($(".move").css("display") === "block"){
				var ulDom = $("#main-tab-title-container")
				var ulWidth = parseFloat(ulDom.css("width"));
				var warpWidth =parseFloat(ulDom.closest(".tab-warp").css("width"));
				var thisWidth =parseFloat(this.getTitleDom().css("width"));
				var index = this.getTitleDom().index();
				var excursion = 0;
				var leftLimit = parseFloat(ulDom.css("left"));
				for(var i=0 ;i<=index-1;i++){
					excursion += ulDom.children()[i].offsetWidth;
				}
				if(excursion <-leftLimit){
					ulDom.css('left',34-excursion);
					console.log("i am in left");
				}else if( excursion+thisWidth+leftLimit > warpWidth){
					ulDom.css('left',-(excursion+thisWidth-warpWidth+34));
					console.log("i am in right");
				}	
			}
			var $title = this.getTitleDom();
			$('a', $title).trigger('click');
			if(param.openedStack){
				param.openedStack.push(this);
			}
			return this;
		};
		/**
		 * 判断当前标签页是否有被激活
		 */
		this.isActive = function(){
			return this.getTitleDom().is('.active');
		};
		/**
		 * 关闭标签
		 */
		this.close = function(activateTabId){
			var stop = false;
			var e = {
				stopDefault 	: function(){
					stop = true;
				},
				eventName		: 'beforeClose'
			}
			this.getEventCallbacks(e.eventName).fireWith(this, [e]);
			if(stop){
				return;
			}
			var ulDom = $("#main-tab-title-container")
			var warpWidth = parseFloat(ulDom.closest(".tab-warp").css("width"));
			var result = param.onClose(this);
			var closeWidth = parseFloat(this.getTitleDom().css("width"));
			var ulWidth = parseFloat(ulDom.css("width"));
			var ulLeft = parseFloat(ulDom.css("left"));
			var finalWidth = ulWidth - closeWidth;
			if(result === false){
				return this;
			}
			
			if(param.openedStack){
				param.openedStack.remove(this);
			}
			
			if(this.isActive()){
				var activateTab;
				if(activateTabId){
					activateTab = tabMap[activateTabId];
				}
				if(!activateTab){
					if(param.openedStack && !param.openedStack.isEmpty()){
						var top = param.openedStack.getTop();
						if(top){
							activateTab = top;
						}
					}
					if(!activateTab){
						//不存在关闭后要激活的标签，那么根据策略来激活前后的标签
						var nextTab = this.getNextTab();
						if(nextTab){
							activateTab = nextTab;
						}else{
							var prevTab = this.getPrevTab();
							if(!(prevTab instanceof Tab)){
								activateTab = $CPF.getParam('defaultTab');
							}else{
								activateTab = prevTab;
							}
						}
					}
				}
				activateTab.activate();
			}
			
			//关闭并且移除当前标签对象
			tabMap[this.getId()] = undefined;
			this.getTitleDom().remove();
			this.getContent().remove();
			this.destruct();
			this.getEventCallbacks('afterClose').fire([this]);
			if(finalWidth >= warpWidth){
				if(ulLeft < 0){
					ulDom.css("left", ulLeft+closeWidth)
				}				
			}
			if(finalWidth < warpWidth){
				ulDom.css("left", 0);
				$('a.move').css("display","none");
				ulDom.css("marginLeft", 0);
			}
			return this;
		};
		/**
		 * 获得前一个标签页
		 */
		this.getPrevTab = function(){
			var $prevTitle = this.getTitleDom().prev('.' + $CPF.getParam('tabTitleClass'));
			if($prevTitle.length == 1){
				return $prevTitle.data($CPF.getParam('tabTitleDataKey'));
			}
		};
		/**
		 * 获得后一个标签页
		 */
		this.getNextTab = function(){
			var $nextTitle = this.getTitleDom().next('.' + $CPF.getParam('tabTitleClass'));
			if($nextTitle.length == 1){
				return $nextTitle.data($CPF.getParam('tabTitleDataKey'));
			}
		};
		this.destruct = function(){
			Page.remove(id);
		};
		/**
		 * 
		 */
		this.getEventCallbacks = function(eventName, flag, fn){
			if(eventName){
				if(typeof eventName === 'string'){
					var event = param.events[eventName];
					if(!event){
						param.events[eventName] = event = $.Callbacks(flag || 'stopOnFalse');
					}
					(fn || $.noop)(event);
					return event;
				}else if($.isArray(eventName)){
					for(var i in eventName){
						this.getEventCallbacks(eventName[i], flag, fn);
					}
				}
			}
		}
	
	}
	
	
	/**
	 * 左右移动标签页绑定事件
	 */
	function moveTab(){
		$('.move').on("click",function(e){
			var ulDom = $("#main-tab-title-container");
			var ulWidth = parseFloat(ulDom.css("width"));
			var leftWidth = parseFloat(ulDom.css("left"));
			var warpWidth = parseFloat(ulDom.closest(".tab-warp").css("width"));
			var moveDistance = parseFloat(ulDom.children().last().css("width"));			
			if($(this).hasClass("left")){
				if(-leftWidth<moveDistance){
					ulDom.css("left",34)
				}else{
					ulDom.css("left",leftWidth+moveDistance)
				}
			}else if($(this).hasClass("right")){
				if(ulWidth+leftWidth-34-warpWidth < moveDistance){
					ulDom.css("left",-(ulWidth+34-warpWidth))	
				}else{
					ulDom.css("left",leftWidth-moveDistance);	
				}	
			}
		})
	}
	
	/**
	 * 构造标签页对象
	 * 如果传入的参数中tabId为空，那么将根据配置的tabId生成一个
	 * 如果根据tabId找到标签已经存在，那么将覆盖原来的title后返回原来构造的标签对象
	 */
	function buildTabDomObj(id, tabTitle){
		if(id){
			var tabId = $CPF.getParam('tabIdGenerate')(id);
			return {
				$title : 
					$('<li>').addClass($CPF.getParam('tabTitleClass'))
					.append(
							$('<a>').attr('data-toggle', 'tab')
							.attr('href', '#' + tabId)
							.text(tabTitle)
					).append(
							$('<span>×</span>').click(function(){
								Tab.closeTab(id);
							})
					),
				$content :
					$('<div>').addClass('tab-pane ' + $CPF.getParam('tabClass'))
					.attr('id', tabId)
					.append('<div class="' + $CPF.getParam('tabWrapperClass') + '"></div>')
			};
		}
	}
	
	
	/**
	 * 绑定标签页面事件
	 */
	function bindPageTabEvent($page){
		//阻止跳转
		$($page).on('click', 'a[href]', function(e){
			e.preventDefault();
		});
		/**
		 * 将a标签天跳转页面修改为在标签页中打开
		 */
		$($page).on('click', 'a.tab[href]', $page, function(){
			var _this = $(this);
			var uri = _this.attr('href'),
				tabId = _this.attr('target'),
				title = _this.attr('title')
				;
			var li = $(_this).closest('.sidebar-menu li');
			if(li.length > 0){
				$('li.active', li.closest('.sidebar-menu')).removeClass('active');
				li.addClass('active');
			}
			if(utils.startsWith(uri, $CPF.getParam('tabLinkPrefix'))){
				if(_this.is('.without-refresh')){
					var tab = Tab.getTab(tabId);
					if(tab){
						tab.activate();
						return false;
					}
				}
				try{
					Tab.openInTab(uri, tabId, title);
				}catch(e){
					console.error(e);
				}finally{
					return false;
				}
			}else if(utils.startsWith(uri, '#')){
				return false;
			}
		});
		
	};
	
	var openedStack = new utils.SetStack();
	$.extend(Tab, {
		openInTab	: function(url, tabId, title){
			var tab = Tab.getTab(tabId);
			if(!tab){
				tab = new Tab({
					id			: tabId,
					title		: title,
					openedStack	: openedStack
				});
				tab.insert();
			}
			tab.loadContent(url, title)
				.activate();
			return tab;
		},
		closeTab	: function(tabId){
			var tab = Tab.getTab(tabId);
			if(tab){
				tab.close();
			}
		},
		getLastTab	: function(){
			return $('.' + $CPF.getParam('tabTitleClass'), $('#main-tab-title-container')).last().data($CPF.getParam('tabTitleDataKey'));
		},
		getTab 		: function(tabId){
			return tabMap[tabId];
		},
		openFrameInTab	: function(url, id, param){
			var $wrap = $('<div>');
			var $iframe = $('<iframe scrolling="no" frameboder="0" border="0" style="width:100%;height:100%;border:none">');
			$iframe.attr('src', url).attr('name', 'cpf-tab-frame' + id);
			
			
			var tab = Tab.getTab(id);
			if(!tab){
				tab = new Tab($.extend({
					id			: id,
					onPageLoad	: function(){
						var _this = this;
						var title = param && param.title;
						if(!title){
							$('iframe', this.getContent()).on('load', function(){
								var cWin = this.contentWindow;
								var $title = $('title', cWin.document);
								if($title.length > 0){
									title = $title.eq(0).text();
									_this.setTitle(title);
								}
							});
						}
						this.setTitle(title || '新标签页');
					}
				}, param));
				tab.insert();
			}
			tab.loadContent($wrap.append($iframe))
				.activate();
			return tab;
		}
	});
	
	
	
	/**
	 * 返回模块对象
	 */
	module.exports = Tab;
});