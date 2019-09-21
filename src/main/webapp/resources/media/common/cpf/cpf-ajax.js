/**
 * 
 */
define(function(require, exports, module){
	var $CPF = require('$CPF'),
		utils = require('utils')
		;
	//用于从LocalStorage中获得token，并在ajax请求时传递到后台
	var AJAX_LOCAL_STORAGE_TOKEN_KEY = 'hydrocarbon-jv-token';
	var AJAX_HEADER_TOKEN_KEY = 'hydrocarbon-token';
	
	$CPF.addDefaultParam({
		//是否在ajax请求时检测返回session状态
		ajaxSessionValid	: true,
		//当session无效的时候，ajax请求返回后需要跳转的地址
		sessionInvalidURL	: '',
		ajaxHost			: '',
		handlersHeader		: $.noop
	});
	
	
	/**
	 * 返回json数据时，将其转换成AjaxPageResponse类对象
	 */
	function AjaxPageResponse(_data){
		var Page = require('page');
		var defaultResponseData = {
			//当前页面的处理方式(close:关闭;refresh:重新加载;redirect:url：跳转)
			localPageAction	: '',
			localPageRedirectURL	: '',
			//要处理响应数据的页面id
			targetPageId	: '',
			//处理方式(refresh/redirect,默认refresh，传入url时则为redirect）
			targetPageAction: '',
			//打开的页面标题
			targetPageTitle	: '',
			targetPageRedirectURL	: '',
			//如果没有找到targetPageId对应的Page，将以什么方式打开页面(redirect下)（dialog/tab,默认dialog）
			targetPageType	: '',
			//响应状态
			status			: '',
			//响应的提示语
			notice			: '',
			//响应提示语的类型
			noticeType		: ''
			
		};
		var data = $.extend({}, defaultResponseData, _data);
		data.localPageAction = data.localPageAction && data.localPageAction;
		data.targetPageAction = data.targetPageAction && data.targetPageAction;
		data.targetPageType = data.targetPageType && data.targetPageType;
		data.noticeType = data.noticeType && data.noticeType;
		this.getLocalPageAction = function(){
			return data.localPageAction;
		};
		this.getLocalPageRedirectURL = function(){
			return data.localPageRedirectURL;
		};
		
		this.getTargetPageId = function(){
			return data.targetPageId;
		};
		
		this.getTargetPageAction = function(){
			return data.targetPageAction;
		};
		this.getTargetPageRedirectURL = function(){
			return data.targetPageRedirectURL;
		};
		
		this.getTargetPageTitle = function(){
			data.targetPageTitle;
		};
		
		this.getTargetPageType = function(){
			return data.targetPageType
		};
		this.getNotice = function(){
			return data.notice;
		};
		this.getNoticeType = function(){
			return data.noticeType;
		};
		
		this.doAction = function(page){
			if(page instanceof $){
				page = page.getLocatePage();
			}
			var localPageAction = this.getLocalPageAction();
			if(localPageAction && page instanceof Page){
				//处理当前页面
				_doAction(localPageAction, page, null, this.getLocalPageRedirectURL());
			}
			var tPageId = this.getTargetPageId(),
				tPageAction = this.getTargetPageAction()
				;
			if(tPageId){
				var tPage = Page.getPage(tPageId);
				if(tPage instanceof Page){
					_doAction(tPageAction, tPage, this.getTargetPageTitle(), this.getLocalPageRedirectURL());
					if(localPageAction === 'close' && tPage.getType() === 'tab'){
						tPage.getPageObj().activate();
					}
				}
			}
			var notice = this.getNotice(),
				noticeType = this.getNoticeType()
				;
			if(notice && noticeType){
				var Dialog = require('dialog');
				if(Dialog){
					Dialog.notice(notice, noticeType);
				}
			}
		}
		
	}
	var REDIRECT_KEY = 'redirect';
	function _doAction(action, page, title, url){
		if(action === 'refresh'){
			page.refresh();
		}else if(action === REDIRECT_KEY){
			page.loadContent(url, title);
		}else if(action === 'close'){
			page.close();
		}
	}
	
	
	
	function ajax(url, formData, whenSuc, _param){
		var defaultParam = {
			//提交类型
			method		: 'POST',
			//当提交请求成功
			whenSuc		: $.noop,
			//当提交请求失败
			whenErr		: $.noop,
			//提交请求无论成功或者失败都会执行
			afterLoad	: $.noop,
			//当前页面
			page		: undefined,
			//
			interval	: 0,
			cache		: false,
			setHost		: true,
			headersHandler	: $.noop
		};
		if(typeof formData === 'function'){
			if($.isPlainObject(whenSuc)){
				_param = whenSuc;
			}else{
				_param = {};
			}
			whenSuc = formData;
			formData = _param.whenSuc;
		}else if($.isPlainObject(whenSuc)){
			_param = whenSuc;
			whenSuc = _param.whenSuc;
		}else{
			_param = _param || {};
		}
		if($.isPlainObject(_param)){
			_param.whenSuc = whenSuc;
		}
		//继承获得参数
		var param = $.extend({}, defaultParam, _param);
		
		var fData = new FormData();
		if($.isPlainObject(formData)){
			for(var key in formData){
				var name = key;
				if($.isArray(formData[key])){
					for(var i in formData[key]){
						fData.append(name, formData[key][i]);
					}
				}else{
					fData.append(name, formData[key]);
				}
			}
		}else if(formData instanceof FormData){
			fData = formData;
		}
		var method = param.method.toLowerCase();
		
		var headers = {};
		($CPF.getParam('handlersHeader') || $.noop)(headers);
		var token = exports.getAuthToken();
		if(token){
			//var isTimeout = new Date().getTime() - tokeObj.time >  $CPF.getParam('ajaxHeaderTokenTimeout');
			headers[AJAX_HEADER_TOKEN_KEY] = token;
		}
		param.headersHandler(headers);
		
		if(param.setHost){
			url = $CPF.getParam('ajaxHost') + url
		}
		
		console.debug('发送请求到' + url);
		console.debug(fData);
		var reqArgs = {};
		if($CPF.getParam('CORS')){
			reqArgs.crossDomain = true;
			reqArgsxhrFields = {
		        withCredentials: true
		    };
		}
		reqArgs = {
			url: 		url,
		    type: 		method,
		    cache: 		param.cache,
		    data: 		method == 'post'? fData: null,
		    processData: false,
		    contentType: false,
		    beforeSend	: function(){
		    	//console.log(arguments);
		    },
		    headers		: headers,
		    success		: function(data, status, jqXHR){
		    	commonHandleSucAjax(data, status, jqXHR);
		    	var resContentType = utils.trim(jqXHR.getResponseHeader("Content-Type"));
		    	if(/^.+\/json;.+$/.test(resContentType)){
		    		//返回的数据是Json格式的数据
		    		try{
		    			var json = data;
		    			if(typeof json === 'string'){
		    				json = $.parseJSON(json)
		    			}
		    			parseFastjsonRef(json, json);
		    			if(json && json['ajax_page_response'] === 'cpf'){
		    				var jRes = new AjaxPageResponse(json);
		    				var result = param.whenSuc(jRes, 'json');
		    				if(result !== false){
		    					jRes.doAction(param.page);
		    				}
		    			}else{
		    				param.whenSuc(json, 'json');
		    			}
		    		}catch(e){
		    			console.error(e);
		    		}
		    	}else if(/^.+\/html;.+$/.test(resContentType)){
		    		//返回的数据是html
		    		param.whenSuc(data, 'html');
		    	}else{
		    		//console.log(resContentType);
		    		param.whenSuc(data, jqXHR);
		    	}
		    },
		    error		: function(jqXHR, textStatus, errorThrown){
		    	console.error(textStatus);
		    	var errResult = param.whenErr();
		    	var Dialog = require('dialog');
		    	if(errResult !== false){
		    		if(Dialog){
		    			if(jqXHR.status === 403){
		    				Dialog.notice('无访问权限', 'error');
		    			}else{
		    				Dialog.notice('请求时发生错误', 'error');
		    			}
		    		}else{
		    			console.error('请求时发生错误');
		    		}
		    	}
		    }	
		};
		return $.ajax(reqArgs).always(function(res) {
			param.afterLoad(res);
		});
	}
	
	var REF_KEY = '$ref';
	/**
	 * FastJson在处理循环依赖引用的时候，只会生成第一次出现的对象，后面再次出现相同引用的对象，
	 * 会以特殊的字符串指向根对象的对应路径
	 */
	function parseFastjsonRef(jsonObj, $){
		if(jsonObj && typeof jsonObj === 'object'){
			for(var k in jsonObj){
				if(jsonObj[k] && typeof jsonObj[k][REF_KEY] === 'string' && jsonObj[k][REF_KEY].startsWith('$.')){
					jsonObj[k] = eval(jsonObj[k][REF_KEY]);
				}
				parseFastjsonRef(jsonObj[k], $);
			}
		}
	}
	
	/**
	 * 以post的方式将obj转换成json字符串，并发送到后台
	 * 后台的控制器需要支持application/json;charset=utf-8的头信息
	 * @param url {String} 请求地址
	 * @param obj {PlainObject} 请求的数据对象，会被转换成json，因此必须是纯粹对象
	 * @param done {Function} 请求成功后的回调函数，有一个参数，是已经对象化的json对象
	 */
	function postJson(url, obj, done){
		var json = JSON.stringify(obj);
		require('console')
			.debug('发送json请求到' + url)
			.debug(json);
		return $.ajax({
			//提交的地址
			url		: url,
			method	: 'POST',
			dataType: 'json',
			headers	: {
				'content-type'	: 'application/json;charset=utf-8'
			},
			data	: json
		}).done(function(data, textStatus, jqXHR){
			commonHandleSucAjax(data, textStatus, jqXHR);
			var json = data;
			if(typeof json === 'string'){
				try{
					json = $.parseJSON(json);
				}catch(e){}
			}
			parseFastjsonRef(json, json);
			done.apply(this, [json, 'done', arguments]);
		}).fail(function(jqXHR, textStatus, errorThrown){
			done.apply(this, [null, 'fail', arguments]);
		});
	}
	
	/**
	 * 用get方法ajax获取资源
	 */
	function loadResource(url, reqParam, ajaxParam){
		var deferred = $.Deferred();
		ajax(url, reqParam, $.extend({}, {
			method	: 'get',
			cache	: true,
			whenSuc	: function(data){
				try{
					data = $.parseJSON(data);
				}catch(e){}
				deferred.resolve(data);
			}
		}, $.extend(ajaxParam, {setHost: false})));
		return deferred.promise();
	}
	
	
	function commonHandleSucAjax(data, textStatus, jqXHR){
		//处理session超时
		if($CPF.getParam('ajaxSessionValid')){
			var sessionStatus = jqXHR.getResponseHeader('cpf-session-status');
			if(sessionStatus === 'invalid'){
				location.href = $CPF.getParam('sessionInvalidURL');
			}
		}
	}
	
	function download(sUrl){
		//iOS devices do not support downloading. We have to inform user about this.
	    if (/(iP)/g.test(navigator.userAgent)) {
	        alert('Your device does not support files downloading. Please try again in desktop browser.');
	        return false;
	    }

	    //If in Chrome or Safari - download via virtual link click
	    if (download.isChrome || download.isSafari) {
	        //Creating new link node.
	        var link = document.createElement('a');
	        link.href = sUrl;

	        if (link.download !== undefined) {
	            //Set HTML5 download attribute. This will prevent file from opening if supported.
	            var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
	            link.download = fileName;
	        }

	        //Dispatching click event.
	        if (document.createEvent) {
	            var e = document.createEvent('MouseEvents');
	            e.initEvent('click', true, true);
	            link.dispatchEvent(e);
	            return true;
	        }
	    }

	    // Force file download (whether supported by server).
	    if (sUrl.indexOf('?') === -1) {
	        sUrl += '?download';
	    }

	    if(!sUrl.match(/^[(http\:)(https\:)]/)){
	    	var base = $('base').attr('href');
	    	if(base){
	    		sUrl = base + sUrl;
	    	}
	    }
	    
	    var oPop = window.open(sUrl, '_blank');
        for(; oPop.document.readyState != "complete"; )
        {
            if (oPop.document.readyState == "complete")break;
        }
        oPop.document.execCommand("SaveAs");
        oPop.close();
	    return true;
	}
	

	download.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	download.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
	
	exports.ajax = ajax;
	exports.postJson = postJson;
	exports.AjaxPageResponse = AjaxPageResponse;
	exports.download = download;
	exports.loadResource = loadResource;
	exports.AJAX_LOCAL_STORAGE_TOKEN_KEY = AJAX_LOCAL_STORAGE_TOKEN_KEY;
	exports.getAuthToken = function(){
		return localStorage.getItem(AJAX_LOCAL_STORAGE_TOKEN_KEY);
	}
	/**
	 * 轮询查询当前进度
	 * @return 返回一个操作对象
	 */
	exports.poll = function(_param){
		var defaultParam = {
			startupURL				: '',
			progressURL				: '',
			startupReqParameters	: {},
			startupReqMethod		: 'postJson',
			uuidResponseName		: 'uuid',
			uuidRequestName			: 'uuid',
			msgIndexRequestName		: '',
			//构造进度获取值参数的方法
			progressReqParameters	: function(startupRes, uuid){},
			//进度值的获取方法
			progressGetter			: function(res){
				return res.current/res.totalCount;
			},
			//进度值的最大值
			progressMax				: 1,
			whenStartupResponse		: function(dara, uuid){},
			progressHandler			: function(progress, res){},
			//进度完成时调用
			whenComplete			: function(res){},
			//当
			whenUnsuccess			: function(res){},
			//当轮询被主动中断的时候
			whenBreaked				: function(res){},
			checkCompleted			: function(res, progress){
				return res.completed ==  true;
			},
			messageSequeueGetter	: function(res){return res['messageSequence']},
			handleWithMessageSequence: function(msgSequeue){}
		};
		var param = $.extend({}, defaultParam , _param);
		var pId = null;
		var callbacksMap = utils.CallbacksMap();
		var interrupted = false;
		var disconnected = false;
		var pollUUID = null, pollDataContext = null;
		var currentMessageIndex = 0;
		var polling = false;
		var handler = {
			getId		: function(){
				return pId;
			},
			start		: function(reqParam){
				interrupted = false;
				disconnected = false;
				pId = utils.uuid();
				pollUUID = null;
				pollDataContext = null;
				currentMessageIndex = 0;
				polling = false;
				console.log('开始轮询[pId=' + pId + ']');
				startPoll(reqParam);
			},
			pollWith	: function(uuid, data){
				pollUUID = uuid;
				pollDataContext = data;
				data = data || {};
				function _(){
					polling = true;
					if(disconnected){
						return;
					}
					checkIntrupt();
					var parameters = {};
					parameters[param.uuidRequestName] = uuid;
					parameters.interrupted = interrupted;
					if(param.msgIndexRequestName){
						parameters[param.msgIndexRequestName] = currentMessageIndex;
					}
					if(typeof param.progressReqParameters === 'function'){
						$.extend(parameters, param.progressReqParameters.apply(param, [data, uuid]));
					}
					ajax(param.progressURL, parameters, function(res){
						checkIntrupt();
						//如果需要消息队列，那么需要返回一个对象，
						//对象内包含消息队列数组，以及这些消息的起始和终止消息的index
						var msgSequeue = param.messageSequeueGetter.apply(param, [res]);
						if(msgSequeue && $.isArray(msgSequeue.messages) && msgSequeue.endIndex){
							currentMessageIndex = msgSequeue.endIndex;
							try{
								param.handleWithMessageSequence.apply(param, [msgSequeue]);
							}catch(e1){console.error(e1)}
						}
						//轮询请求获得回复
						if(res.status === 'suc'){
							//获得进度
							var progress = param.progressGetter.apply(param, [res]);
							progress = progress > param.progressMax? param.progressMax: progress;
							try{
								param.progressHandler.apply(param, [progress, res]);
							}catch(e){console.error(e)}
							
							//如果工作已经完成，那么执行操作
							if(param.checkCompleted.apply(param, [res, progress])){
								param.whenComplete.apply(param, [res, data]);
							}else{
								//如果工作已经被中断，那么执行操作
								if(res.breaked === true){
									interrupted = true;
									checkIntrupt();
									param.whenBreaked.apply(param, [res]);
								}else{
									//如果工作没有完成，并且没有被中断，就再次发起轮询请求
									setTimeout(_, 1000);
									return;
								}
							}
						}else{
							//轮询请求发生可知异常，根据策略是否再次发起轮询状态请求
							try{
								if(param.whenUnsuccess.apply(param, [res]) === true){
									setTimeout(_, 1000);
									return;
								}
							}catch(e){}
						}
						pollUUID = null;
						pollDataContext = null;
						polling = false;
					}, {
						whenErr		: function(){
							//轮询请求后台发生未知异常，此时的执行方式
							try{
								param.whenRequestError.apply(param, arrguments);
								if(param.whenUnsuccess.apply(param, [res]) === true){
									setTimeout(_, 1000);
									return;
								}
							}catch(e){}
							polling = false;
							
						}
					});
				}
				_();
			},
			isPolling	: function(){
				return polling;
			},
			//暂停轮询
			pause 		: function(){
				
			},
			//继续轮询
			continues	: function(){
				
			},
			//中断轮询
			breaks		: function(){
				var hasInterrupt = interrupted;
				interrupted = true;
				return {
					done	: function(callback){
						if(typeof callback === 'function'){
							if(hasInterrupt){
								callback();
							}else{
								callbacksMap.put('break', callback);
							}
						}
					}
				};
			},
			//断开轮询，但不会结束后台的导出线程
			disconnect	: function(){
				disconnected = true;
			},
			//重新连接
			reconnect	: function(){
				disconnected = false;
				handler.pollWith(pollUUID, pollDataContext);
			}
		};
		function checkIntrupt(){
			if(interrupted === true){
				try{
					callbacksMap.fire('break', []);
					callbacksMap.empty('break');
				}catch(e){}
			}
		}
		function startPoll(reqParam){
			exports[param.startupReqMethod](param.startupURL, $.extend({}, param.startupReqParameters, reqParam), function(data){
				var uuid = data[param.uuidResponseName];
				var r = null;
				try{
					r = param.whenStartupResponse.apply(param, [data, uuid]);
				}catch(e){console.error(e)}
				if(r !== false && uuid){
					checkIntrupt();
					handler.pollWith(uuid, data);
				}
			});
		}
		return handler;
		
	}
});