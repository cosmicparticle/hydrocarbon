/**
 * 
 */
define(function(require, exports, module){
	var Utils = require('utils'),
		Ajax = require('ajax');
	
	function PollSubscriber(globalPoll, _param){
		Utils.Subscriber.call(this);
		var defaultParam = {
				//订阅者的标识，如果key相同，并且subscribers里有相同key的对象，那么覆盖回调
				key						: '',
				//相同key的情况下，覆盖(replace)还是追加(append)回调
				keyStrategy				: 'replace',
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
				//每次请求消息的最多条数,默认不限制
				maxMsgCount				: '',
				checkCompleted			: function(res, progress){
					return res.completed ==  true;
				},
				messageSequenceGetter	: function(res){return res['messageSequence']},	
				//存放数据
				data					: {},
				
				//当当前订阅者发起轮询请求，后台成功
				whenStartupResponse	: function(){},
				//当当前订阅者发起轮询成功时的回调
				whenStarted			: function(){},
				//当当前订阅者发起轮询失败时的回调
				whenStartRefused	: function(){},
				whenUnsuccess		: function(res){},
				//处理当前进度轮询请求的回调
				progressHandler		: function(){},
				//当轮询完成时的回调
				whenCompleted		: function(){},
				//当轮询被主动打断的回调
				whenBreaked			: function(){},
				//当轮询失败时的回调
				whenRequestError	: function(){},
				//处理消息队列
				handleWithMessageSequence: function(msgSequence){},
				subscribeFunctions	: {
					//当其他线程成功发起了轮询，当前订阅者被通知到时的回调
					whenSubscribed		: function(){},
					//处理当前进度轮询请求的回调
					progressHandler		: function(){},
					//当轮询完成时的回调
					whenCompleted		: function(){},
					//当轮询被主动打断的回调
					whenBreaked			: function(){},
					//当轮询失败时的回调
					whenRequestError	: function(){},
					//处理消息队列
					handleWithMessageSequence: function(msgSequence){},
				}
		};
		
		this.param = $.extend({}, defaultParam, _param);
		
		this.getSubscribers = function(){
			return globalPoll.getSubscribers();
		}
		this.getGlobalPoll = function(){
			return globalPoll;
		}
		
		for(var funcName in this.param.subscribeFunctions){
			this.bind(funcName, this.param.subscribeFunctions[funcName]);
		}
		this.getData = function(key){
			return this.param.data[key];
		}
		
		this.setData = function(key, value){
			this.param.data[key] = value;
		}
		this.data = {
			status		 		: 'inited',
			disconnected 		: false,
			pollDataContext	 	: null,
			currentMessageIndex	: -1
		}
		this.breakedCallbacks = $.Callbacks();
		
	}
	Utils.inherit(PollSubscriber, Utils.Subscriber);
	PollSubscriber.prototype.starts = function(reqParam){
		
		this.data.status = 'start';
		this.data.disconnected = false;
		this.data.pollDataContext = null;
		this.data.currentMessageIndex = -1;
		var _this = this;
		
		Ajax[_this.param.startupReqMethod](this.param.startupURL, $.extend({}, this.param.startupReqParameters, reqParam), function(data){
			if(data.status === 'refused'){
				_this.data.status = 'refused';
				try{
					_this.param.whenStartRefused.apply(_this, [data]);
				}catch(e){console.error(e)}
				try{
					_this.getSubscribers().invoke('whenSubscribed', _this, [], [_this], _this);
				}catch(e){console.error(e)}
			}
			var uuid = data[_this.param.uuidResponseName];
			var r = null;
			try{
				r = _this.param.whenStartupResponse.apply(_this, [data, uuid]);
			}catch(e){console.error(e)}
			if(r !== false && uuid){
				//_this.checkBreaked();
				try{
					_this.data.status = 'started';
					_this.param.whenStarted.apply(_this, [data, uuid]);
					_this.getSubscribers().invoke('whenSubscribed', _this, [], [_this], _this);
				}catch(e){console.error(e)}
				_this.pollWith(uuid, data);
			}
		});
	}
	
	PollSubscriber.prototype.breaks = function(){
		var hasInterrupt = this.data.status == 'breaked';
		this.data.status = 'breaked';
		var _this = this;
		return {
			done	: function(callback){
				if(typeof callback === 'function'){
					if(hasInterrupt){
						callback();
					}else{
						_this.breakedCallbacks.add(callback);
					}
				}
			}
		};
	}
	
	PollSubscriber.prototype.getStatus = function(){
		return this.data.status;
	}
	
	
	
	PollSubscriber.prototype.checkBreaked = function(){
		if(this.data.status === 'breaked'){
			try{
				this.breakedCallbacks.fire(this);
				this.breakedCallbacks.empty();
			}catch(e){}
			this.param.whenBreaked.apply(this, []);
			this.getSubscribers().invoke('whenBreaked', this, [], [this], this);
			
		}
	}
	
	PollSubscriber.prototype.pollWith = function(uuid, data){
		var _this = this;
		_this.data.pollDataContext = data;
		data = data || {};
		_this.data.status = 'polling';
		function _(){
			if(_this.data.disconnected){
				return;
			}
			//_this.checkBreaked();
			var parameters = {};
			parameters[_this.param.uuidRequestName] = uuid;
			parameters.interrupted = _this.data.status != 'polling';
			if(_this.param.msgIndexRequestName){
				parameters[_this.param.msgIndexRequestName] = _this.data.currentMessageIndex + 1;
			}
			if(typeof _this.param.progressReqParameters === 'function'){
				$.extend(parameters, _this.param.progressReqParameters.apply(_this.param, [data, uuid]));
			}
			if(_this.param.maxMsgCount){
				parameters['maxMsgCount'] = _this.param.maxMsgCount;
			}
			Ajax.ajax(_this.param.progressURL, parameters, function(res){
				//_this.checkBreaked();
				//如果需要消息队列，那么需要返回一个对象，
				//对象内包含消息队列数组，以及这些消息的起始和终止消息的index
				var msgSequence = _this.param.messageSequenceGetter.apply(_this.param, [res]);
				if(msgSequence && $.isArray(msgSequence.messages) && msgSequence.endIndex){
					_this.data.currentMessageIndex = msgSequence.endIndex;
					try{
						_this.param.handleWithMessageSequence.apply(_this, [msgSequence]);
						_this.getSubscribers().invoke('handleWithMessageSequence', _this, [msgSequence], [_this], _this);
					}catch(e1){console.error(e1)}
				}
				//轮询请求获得回复
				if(res.status === 'suc'){
					//获得进度
					var progress = _this.param.progressGetter.apply(_this.param, [res], [], _this);
					progress = progress > _this.param.progressMax? _this.param.progressMax: progress;
					try{
						_this.param.progressHandler.apply(_this, [progress, res]);
						_this.getSubscribers().invoke('progressHandler', _this, [progress, res], [_this], _this);
					}catch(e){console.error(e)}
					
					//如果工作已经完成，那么执行操作
					if(_this.param.checkCompleted.apply(_this.param, [res, progress])){
						_this.data.status = 'completed';
						_this.param.whenCompleted.apply(_this, [res, data]);
						_this.getSubscribers().invoke('whenCompleted', _this, [res, data], [_this], _this);
					}else{
						//如果工作已经被中断，那么执行操作
						if(res.breaked === true){
							_this.breaks();
							_this.checkBreaked();
							//_this.param.whenBreaked.apply(_this, [res]);
							//_this.getSubscribers().invoke('whenBreaked', _this, [res], [_this], _this);
						}else{
							//如果工作没有完成，并且没有被中断，就再次发起轮询请求
							setTimeout(_, 1000);
							return;
						}
					}
				}else{
					//轮询请求发生可知异常，根据策略是否再次发起轮询状态请求
					try{
						if(_this.param.whenUnsuccess.apply(_this.param, [res]) === true){
							setTimeout(_, 1000);
							return;
						}
					}catch(e){}
				}
				_this.data.pollDataContext = null;
				_this.data.polling = false;
			}, {
				whenErr		: function(){
					//轮询请求后台发生未知异常，此时的执行方式
					try{
						_this.param.whenRequestError.apply(_this, arguments);
						_this.subscribes.invoke('whenRequestError', _this.param, arguments, [], _this);
						if(_this.param.whenUnsuccess.apply(_this.param, [res]) === true){
							setTimeout(_, 1000);
							return;
						}
					}catch(e){}
					_this.data.status = 'error';
				}
			});
		}
		_();
	}
	
	PollSubscriber.prototype.setMaxMsgCount = function(maxMsgCount){
		this.param.maxMsgCount = maxMsgCount;
	}
	
	
	
	function GlobalPoll(key){
		var subscribers = new Utils.Subscribers();
		this.getSubscribers = function(){
			return subscribers;
		}
	}
	$.extend(GlobalPoll.prototype, {
		addSubscriber	: function(args){
			var subscriber = new PollSubscriber(this, args);
			this.getSubscribers().add(subscriber);
			subscriber.invoke('whenSubscribed', subscriber, []);
			return subscriber;
		},
		removeSubscriber: function(subscriber){
			return this.getSubscribers().remove(subscriber);
		},
		getStatus		: function(){
			var working = this.getWorkingSubscriber();
			if(working){
				return 'working';
			}else{
				return 'ready';
			}
		},
		getWorkingSubscriber	: function(){
			var subscribers = this.getSubscribers();
			for(var i = 0; i < subscribers.length; i++ ){
				var subscriber = subscribers[i];
				var status = subscriber.getStatus();
				if(status === 'polling' 
					|| status == 'start'
					|| status == 'started'){
					return subscriber;
				}
			}
		},
		breaks			: function(){
			var def = $.Deferred();
			var subscriber = this.getWorkingSubscriber();
			if(subscriber){
				subscriber.breaks().done(function(){
					def.resolve(subscriber);
				});
			}
			return def.promise();
		}
	});
	
	/**
	 * 轮询查询当前进度
	 * @return 返回一个操作对象
	 */
	function globalPoll(key){
		return new GlobalPoll(key);		
	}
	
	
	exports.global = globalPoll;
});