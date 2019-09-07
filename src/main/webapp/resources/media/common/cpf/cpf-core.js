/**
 * $CPF插件核心
 */
define(function(require, exports, module){
	var Utils = require('utils');
	
	var initSequeue = [],
		pageInitSequeue = [],
		defaultParamSequeue = [],
		$loading = undefined,
		loadingTimer = null,
		_data = {}
	;
	var $CPF = {
		/**
		 * 添加默认参数，用于其他模块添加默认参数用
		 * 该默认参数可以在cpf调用init方法时被覆盖
		 * @param _param Object对象。插件可以往这里添加默认参数（在$CPF.init()调用之前有效）
		 */
		addDefaultParam : function(_param){
			defaultParamSequeue.push(_param);
		},
		/**
		 * 获得初始化参数，在$CPF.init()调用之后有效
		 * @param key 参数名
		 */
		getParam	: function(key){
			return this.param[key];
		},
		/**
		 * 初始化CPF插件，在初始化参数之后会逐一调用initSequeue的函数
		 * @param _param
		 */
		init		: function(_param){
			var defaultParam = {
				//加载层图片路径
				loadingImg		: ''
			};
			var deferParamKeyArray = [];
			for(var i in defaultParamSequeue){
				for(var key in defaultParamSequeue[i]){
					if(defaultParam[key]){
						//默认参数名冲突
						$.error('Conflict occured when extend default parameter, '
								+ 'default parameter name must be unique.'  
								+ 'The conflict parameter name is [' + key + ']');
					}else{
						if(defaultParamSequeue[i][key] instanceof DeferParam){
							deferParamKeyArray.push(key);
						}
					}
				}
				$.extend(defaultParam, defaultParamSequeue[i]); 
			}
			var param = {};
			$.extend(param, defaultParam, _param);
			this.param = param;
			for(var i in deferParamKeyArray){
				var deferKey = deferParamKeyArray[i];
				if(param[deferKey] === defaultParam[deferKey]){
					param[deferKey] = defaultParam[deferParamKeyArray[i]].getParamValue();
				}
			}
			for(var i in initSequeue){
				initSequeue[i].initFunc.call(this);
			}
			
		},
		/**
		 * 添加初始化序列
		 * @param initFunc
		 * @param initOrder
		 */
		putInitSequeue	: function(initOrder, initFunc){
			putSequeue(initOrder, initFunc, initSequeue);
		},
		/**
		 * 初始化页面
		 * @param $page
		 */
		initPage	: function($page){
			for(var i in pageInitSequeue){
				pageInitSequeue[i].initFunc.call(this, $page);
			}
			Utils.botByDom($page, 'cpf-page-inited');
		},
		/**
		 * 添加页面初始化序列
		 * @param initOrder
		 * @param initFunc
		 */
		putPageInitSequeue	: function(initOrder, initFunc){
			putSequeue(initOrder, initFunc, pageInitSequeue);
		},
		/**
		 * 显示加载层，并阻止用户点击
		 */
		showLoading			: function(whenShutdown){
			if($loading){
				$loading.appendTo(document.body).modal('show');
			}else{
				$loading = $('<div id="loading-container"><img id="loading-gif" src="' + this.param.loadingImg + '" /></div>');
				$loading
					.css('lineHeight', document.body.clientHeight + 'px')
					.css('zIndex', '99998')
					.data('backdropZIndex', '99999')
					.appendTo(document.body).modal({
					keyboard	: false
				});
			}
			if(loadingTimer){
				clearTimeout(loadingTimer);
			}
			loadingTimer = setTimeout(function(){
				var $btnCloseLoading = $('<i title="关闭遮罩" class="btn-close-loading">').click(function(){
					$CPF.closeLoading();
					(whenShutdown || $.noop).apply();
				}).appendTo(document.body);
				if($loading.data('btnCloseLoading')){
					$loading.data('btnCloseLoading').remove();
				}
				$loading.data('btnCloseLoading', $btnCloseLoading);
			}, $CPF.getParam('loadingTimeout') || 7000);
		},
		/**
		 * 显示加载层，并阻止用户点击
		 */
		closeLoading		: function(){
			if($loading){
				$loading.modal('hide');
				if($loading.data('btnCloseLoading')){
					$loading.data('btnCloseLoading').remove();
				}
				if(loadingTimer){
					clearTimeout(loadingTimer);
				}
			}
		},
		data				: function(key, value){
			if(typeof key === 'string'){
				if(value !== undefined){
					_data[key] = value;
					return $CPF;
				}else{
					return _data[key];
				}
			}
		}
	};
	
	/**
	 * 用于延迟获取函数的返回值
	 */
	function DeferParam(func){
		this.getParamValue = function(){
			return func.apply(this);
		};
	}
	
	$CPF.DeferParam = DeferParam;
	
	/**
	 * CPF在加载页面之后第1个执行该页面的所有script
	 */
	$CPF.putPageInitSequeue(1, function($page){
		if($page instanceof $){
			$page.off('cpf-check-all-checkbox');
			$page.off('click');
			var page = $($page).getLocatePage();
			if(page instanceof require('page')){
				if(page.getType() === 'dialog'){
					$(page.getContainer()).off('cpf-check-all-checkbox');
					$(page.getContainer()).off('click');
				}
			}
		}
	});
	
	//对外暴露接口
	module.exports = $CPF;
	
	
	/**
	 * 加载并执行页面中的js
	 */
	function loadPageScript($page){
		if(!($page instanceof Document)){
			$('script', $page).each(function(){
				var src = $(this).attr('src');
				if(src){
					$.getScript(src);
				}else{
					var script = $(this).text();
					if(script){
						try{
							eval(script);
						}catch(e){
							console.error(e);
						}
					}
				}
			});
		}
	}
	
	
	
	
	/*************************************************
	 *\私有函数区
	 ************************************************/
	
	/**
	 * 添加函数到有序的序列当中
	 * @param initOrder 函数的执行顺序,可以是整数和undefeined
	 * @param initFunc 执行的函数
	 * @param sequeue 要添加的有序序列（数组）
	 */
	function putSequeue(initOrder, initFunc, sequeue){
		if(typeof initFunc !== 'function'){
			$.error('initFunc is not a function');
		}
		if(initOrder === undefined){
			sequeue.posh({initFunc	: initFunc});
		}else if(Utils.isInteger(initOrder)){
			var i = 0;
			while(i < sequeue.length){
				var obj = sequeue[i];
				if(obj.initOrder == undefined || obj.initOrder > initOrder){
					break;
				}
				i++;
			}
			sequeue.splice(i, 0, {
				initOrder	: initOrder,
				initFunc	: initFunc
			});
		}else{
			$.error('initOrder must be integer or undefined');
		}
	}
	/*************************************************
	 * 私有函数区\
	 ************************************************/
});

