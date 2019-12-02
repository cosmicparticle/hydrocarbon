/**
 * 
 */
define(function(require, exports, module){
	var globalMapName = 'CPF_TIMER_FN_REPOSITORY',
		globalFnNamePrefix = 'TIMER_FN_';
	
	function Timer(_param){
		var defaultParam = {
			//定时器调用的回调函数
			callback		: $.noop,
			//调用间隔时间(单位毫秒)
			interval		: 0,
			//是否重复
			repeat			: true
		}
		
		var param = $.extend({}, defaultParam, _param);
		
		var utils = require('utils');
		var uuid = utils.uuid(5, 62),
			fnName = globalFnNamePrefix + uuid;
		var timerObj = null;
		var _this = this;
		/**
		 * 启动定时器
		 */
		this.start = function(invokeParam){
			var cls = require('console');
			var gMap = getGlobalMap();
			var invokeFn = window.setInterval;
			var fnStr = globalMapName + '["' + fnName + '"]',
				doTimer = function(){
					var executeStr = fnStr + '()';
					timerObj = invokeFn(executeStr, param.interval);
			};
			gMap[fnName] = function(){
				cls.log('invoke callback');
				var _thisTimerObj = timerObj;
				param.callback.apply(_this, invokeParam);
			}
			//定时任务开始
			doTimer();
			cls.log('start timer');
			return this;
		};
		/**
		 * 停止定时器
		 */
		this.stop = function(){
			window.clearInterval(timerObj);
		};
		/**
		 * 
		 */
		this.getUUID = function(){
			return uuid;
		}
	}
	/**
	 * 从全局中获得map
	 */
	function getGlobalMap(){
		var gMap = window[globalMapName];
		if(!gMap){
			gMap = window[globalMapName] = {};
		}
		return gMap;
	}

	var timerMap = {};
	Timer.createTimer = function(_param){
		var timer = new Timer(_param);
		if(_param.id){
			timerMap['id_' + _param.id] = timer;
		}
		return timer;
	};
	
	Timer.getTimer = function(id){
		return timerMap['id_' + id] || null;
	};
	/**
	 * 
	 * @param id
	 * @returns
	 */
	Timer.removeTimer = function(id){
		var timer = Timer.getTimer(id);
		if(timer instanceof Timer){
			timer.stop();
			timerMap['id_' + id] = undefined;
		}
		return timer;
	}
	
	
	module.exports = Timer;
});

