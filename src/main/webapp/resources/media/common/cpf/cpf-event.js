define(function(require, exports, module){
	var EVENT_MAP = {
		'on-click' 		: 'click',
		'on-change'		: 'change',
		'on-input'		: 'input',
		'on-dblclick'	: 'dblclick',
		'on-render'		: null,
		'after-render'	: null
	};
	exports.prepareToContext = function($scope, context){
		$scope
			.filter('[on-prepare]')
			.add($scope.find('[on-prepare]'))
			.each(function(){
				var $this = $(this);
				var value = $this.attr('on-prepare');
				if(value){
					var splited = value.split(';');
					//把dom放到context中
					var domId = splited[0].trim();
					if(domId){
						context.setDom(domId, $this);
					}
					//
					if(splited.length > 1){
						//初始数据的字符串
						var initValueSplited = splited[1].trim().split(':');
						var dependencies = [];
						var uniqueStatus = '';
						if(initValueSplited.length >= 1){
							dependencies = initValueSplited[0].split(',').map(function(depend){return depend.trim()});
							if(dependencies.length === 1){
								//只依赖一个status，那么后面的属性就不需要填写前缀
								uniqueStatus = dependencies[0];
							}
						}
						if(dependencies.length > 0){
							//遍历所有依赖，为所有依赖的对象注册selfish回调，
							//只在依赖对象全部都存在的时候才执行，也只执行一次
							dependencies.forEach(function(depend){
								context.selfish(depend, function(){
									console.debug(dependencies.join());
									//只有当所有依赖的值都存在的时候才会执行初始化
									for(var i in dependencies){
										if(!context.getStatus(dependencies[i]))return;
									}
									//用于初始化的值的来源status对象
									var sourceObj = null;
									if(uniqueStatus){
										sourceObj = context.getStatus(uniqueStatus);
									}
									var setValueSnippets = initValueSplited[1].split(',');
									for(var i in setValueSnippets){
										var propName = setValueSnippets[i];
										var tagAttrName = '';
										var propNameSplited = propName.split('->')
										if(propNameSplited.length > 1){
											propName = propNameSplited[0].trim();
											tagAttrName = propNameSplited[1].trim();
										}
										if(!sourceObj){
											sourceObj = context.properties;
										}
										try{
											var value = eval('with(sourceObj){' + propName + '}');
											//根据->后面的值来判断要执行的操作
											switch(tagAttrName){
												//为text时直接替换标签内的内容
												case 'text':
													$this.text(value);
													break
												default:
													//字符串就放到对应的属性里
													if(tagAttrName){
														$this.attr(tagAttrName, value);
													}else{
														//设置表单值
														$this.val(value).trigger('change');
													}
											}
										}catch(e){
											console.error('解析表达式时发生错误', propName, sourceObj, $this, e);
										}
									}
								});
							});
						}
						
					}
					
				}
			});
	}
	/**
	 * @param $scope 绑定事件的范围，是一个jQueryDom对象
	 * @param events 绑定事件的方法合集对象，绑定的方法会在这个对象中获取
	 * @param doWithObj 绑定的事件中，如果使用有需要使用数据对象作为参数的，那将会在这个对象中获取
	 * @param retainAttr 绑定事件的属性在绑定之后是否保留，默认不保留
	 */
	exports.bindScopeEvent = function($scope, events, doWithObj, retainAttr){
		var afterRenderCallbacks = $.Callbacks();
		for(var eventName in EVENT_MAP){
			$scope
				.filter('[' + eventName + ']')
				.add($scope.find('[' + eventName + ']'))
				.each(function(){
					var $this = $(this);
					var callbackName = $this.attr(eventName);
					var callbackParam = undefined;
					var args = [];
					if(events && callbackName){
						var matcher = /^do:(.+)\((.+)\)$/.exec(callbackName);
						if(matcher){
							callbackName = matcher[1];
							callbackParam = matcher[2];
							var exp = 'with(doWithObj || {}){[' + callbackParam + ']}';
							try{
								args = eval(exp);
							}catch(e){
								console.error($this[0]);
								$.error('模板中无法解析的表达式' + exp);
							}
						}
						if(events[callbackName]){
							if(eventName === 'on-render'){
								callbackParam? 
									events[callbackName].apply(this, args.concat($.merge([], arguments).slice(1)))
									: events[callbackName].apply(this)
							}else if(eventName === 'after-render'){
								//在全部元素渲染后才会执行，执行的时机由外部对象控制
								var that = this;
								var thisArgs = arguments;
								afterRenderCallbacks.add(function(){
									callbackParam? 
											events[callbackName].apply(that, args.concat($.merge([], thisArgs).slice(1)))
											: events[callbackName].apply(that)
								});
							}else{
								$this.on(EVENT_MAP[eventName], callbackParam? function(e){
									e.preventDefault();
									return events[callbackName].apply(this, args.concat($.merge([], arguments).slice(1)));
								}: events[callbackName]);
							}
						}
					}
					if(retainAttr == false){
						$this.removeAttr(eventName);
					}
				});
		}
		return {
			afterRenderCallbacks
		};
	}
});