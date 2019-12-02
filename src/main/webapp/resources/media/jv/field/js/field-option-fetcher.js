define(function(require, exports, module){
	//当fetchPool中不为空的话，超过该时间阈值没有commit的话，那么自动commit
	var AUTO_COMMIT_TIMER = 1500;
	
	var globalFetcher = null;
	
	function Fetcher(){
		this.fetchPool = [];
		this.deferSequence = [];
		this.afterCommitCallbacks = $.Callbacks();
		/*this.timer = setInterval(function(){
			
		}, AUTO_COMMIT_TIMER);*/
	}
	
	/**
	 * 
	 */
	Fetcher.prototype.fetch = function(fieldId){
		var defer = $.Deferred();
		if(this.fetchPool.indexOf(fieldId) < 0){
			this.fetchPool.push(fieldId);
			this.deferSequence.push({
				fieldId, defer,
				time	: new Date().getTime()
			});
		}
		return defer.promise();
	}
	
	/**
	 * 提交批量获取字段枚举
	 */
	Fetcher.prototype.commit = function(){
		var allDoneDefer = $.Deferred();
		if(this.fetchPool.length > 0){
			var fieldIds = this.fetchPool.join();
			var deferSequence = this.deferSequence;
			this.fetchPool = [];
			this.deferSequence = [];
			var _this = this;
			require('ajax').ajax('api2/meta/dict/field_options',{fieldIds})
				.done(function(data){
					var optionsMap = data.optionsMap;
					$.each(deferSequence, function(i){
						var options = optionsMap[this.fieldId];
						this.defer.resolve(options);
						if(i == deferSequence.length - 1){
							allDoneDefer.resolve(options);
							_this.afterCommitCallbacks.fire();
						}
					});
				});
		}else{
			allDoneDefer.resolve([]);
			this.afterCommitCallbacks.fire();
		}
		return allDoneDefer.promise();
	}
	
	Fetcher.prototype.afterCommit = function(callback){
		this.afterCommitCallbacks.add(callback);
	}
	
	Fetcher.getGlobalFetcher = function(){
		if(!globalFetcher){
			globalFetcher = new Fetcher();
		}
		return globalFetcher;
	}
	
	module.exports = Fetcher;
	
});