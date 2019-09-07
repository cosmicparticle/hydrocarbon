define(function(require, exports, module){
	//设置重新获取模板的超时时间，当为0或者null时不会重新获取
	var MAX_REQUIRE_TIME_MILL = 30000;
	function Template(_param){
		var defaultParam = {
			source	: '',
			id		: '',
			$script	: $()
		};
		
		var param = $.extend({}, defaultParam, _param);
		
		this.getPath = function(){
			return param.source + (param.id? '#' + param.id: '');
		}
		
		/**
		 * 
		 */
		this.tmpl = function(obj, events, resultData){
			var _this = this;
			if(typeof $.fn.tmpl === 'function'){
				var $result = param.$script.tmpl(obj);
				$result
					.filter('style[plh-data]')
					.add($result.find('style[plh-data]'))
					.each(function(){
						var dataStr = $(this).attr('plh-data');
						var data = eval('with(obj){r=' + dataStr + '}');
						$(this).data('plh-data', data);
					});
				var bindResult = require('event').bindScopeEvent($result, events, obj, false);
				if(resultData){
					resultData.bindResult = bindResult;
				}
				return $result;
			}
		};
		
		/**
		 * 当前模板生成DOM替换指定style元素
		 * @param $plhs 被替换的style元素
		 * @param data 模板生成DOM时需要的数据，可以是对象类型，也可以是函数类型。
		 * 				函数类型的data的参数会传入style元素绑定的plh-data对象
		 * @param events 模板中绑定的事件集
		 * @param callback 每个style元素被替换后的回调，
		 * 				回调第一个参数是替换后的DOM，
		 * 				第二个参数是模板生成DOM时所用的数据对象
		 */
		this.replaceFor = function($plhs, data, events, callback){
			function getData(_$plh){
				var plhData = $(_$plh).data('plh-data');
				if(typeof data === 'function'){
					return data(plhData);
				}else{
					if(plhData){
						return $.extend({data:plhData}, data);
					}else{
						return data;
					}
				}
			}
			callback = callback || $.noop;
			
			var _this = this;
			$plhs = $plhs.filter('style');
			var $results = $();
			function replace(rebuild){
				$plhs.each(function(){
					var $plhDom = $(this).data('plh-dom');
					if($plhDom){
						$plhDom.remove();
					}
				})
				var $clone = null;
				$plhs.each(function(i){
					var $this = $(this);
					var _data = getData(this);
					var $result = null;
					var tmplResultData = {};
					if(rebuild){
						$result = _this.tmpl(_data, events, tmplResultData);
					}else if(!$clone){
						$result = _this.tmpl(_data, events, tmplResultData);
						$clone = $result.clone(true);
					}else{
						$result = $clone.clone(true);
					}
					$this.after($result).data('plh-dom', $result);
					if(tmplResultData.bindResult && tmplResultData.bindResult.afterRenderCallbacks){
						tmplResultData.bindResult.afterRenderCallbacks.fire();
					}
					$results = $results.add($result);
					callback.apply(_this, [$result, _data, i == $plhs.length - 1, i]);
				});
			}
			replace(typeof data === 'function');
			return $results;
		}
		
		/**
		 * 在scope里找到与当前模板相同id的style元素，进行替换
		 */
		this.replaceIn = function($scope, data, events, callback){
			var sel = 'style[target="' + param.id + '"]';
			var $plhs = $scope.filter(sel).add($(sel, $scope));
			return this.replaceFor($plhs, data, events, callback);
		}
		
		/**
		 * 
		 */
		this.getScript = function(){
			return param.$script;
		}
		
	}
	
	
	
	var tmplMap = {};
	var reqMap = {};
	Template.load = function(url, reqParam, tmplParam){
		var deferred = $.Deferred();
		var time = new Date().getTime();
		if(tmplMap[url]){
			if(MAX_REQUIRE_TIME_MILL && time - tmplMap[url].time > MAX_REQUIRE_TIME_MILL){
				tmplMap[url] = null;
				return Template.load.apply(this, arguments);
			}
			deferred.resolve(tmplMap[url].tmpl);
		}else{
			if(reqMap[url]){
				reqMap[url].push(deferred);
			}else{
				reqMap[url] = [deferred];
				require('ajax').loadResource(url).done(function(data){
					var $container = $('<tmpls>').html(data);
					var $tmpls = $container.children('script[id]');
					if($tmpls.length > 0){
						var scriptMap = {};
						$tmpls.each(function(){
							var $script = $(this);
							var id = $script.attr('id');
							scriptMap[id] = new Template($.extend({}, {
								source	: url,
								id		: id,
								$script	: $script
							}, tmplParam));
						});
						tmplMap[url] = {time,tmpl:scriptMap};
						$.each(reqMap[url], function(){
							this.resolve(scriptMap);
						});
					}else{
						var $script = $('<script>');
						$script.html(data);
						var tmpl = new Template($.extend({}, {
							source	: url,
							$script	: $script
						}, tmplParam));
						tmplMap[url] = {time,tmpl};
						$.each(reqMap[url], function(){
							this.resolve(tmpl);
						});
					}
					reqMap[url] = null;
				});
			}
		}
		return deferred.promise();
	};
	
	Template.getPlaceholderQuery = function($page){
		return function(target){
			return $('style[target="' + target + '"]', $page);
		}
	}
	
	module.exports = Template;
});