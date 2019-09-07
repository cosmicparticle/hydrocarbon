define(function(require, exports){
	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	var SEQUENCE_MAP = {}
	var sFocus;
	var bindOrTriggerMap = {};
	var eventFieldMap = {};
	var NOOP = function(){};
	$.extend(exports, {
		assert		: function(val, msgWhenFalse){
			if(!val){
				$.error(msgWhenFalse);
			}
		},
		/**
		 * 判断一个是否是整数，不包含判断类型
		 */
		isInteger	: function(o){
			return (o | 0) == o;
		},
		/**
		 * 清除字符串前后的空格
		 */
		trim		: function(str){
			if(typeof str === 'string'){
				return str.trim();
			}
			return str;
		},
		removeElement: function(array, ele){
			return array.splice(array.indexOf(ele), 1);
		},
		startsWith	: function(source, snippit){
			if (snippit == null || snippit == "" || source.length == 0
					|| snippit.length > source.length)
				return false;
			if (source.substring(0, snippit.length) == snippit)
				return true;
			else
				return false;
			return true;
		},
		endWith		: function(source, snippit){
			if (snippit == null || snippit == "" || source.length == 0
					|| snippit.length > source.length)
				return false;
			if (source.substring(source.length - snippit.length, source.length) == snippit)
				return true;
			else
				return false;
			return true;
		},
		isPhoto		: function(fileName){
			if(typeof fileName === 'string'){
				var reg = /.*\.(gif|jpg|jpeg|png|bmp|ico)$/i;
				return reg.test(fileName);
			}
		},
		/**
		 * 将数组内的元素用特定的分隔符连接成字符串
		 * @param array 数组对象，数组内元素可以是任意类型，不可省略
		 * @param spliter 字符串，作为数组元素的连接符。可省略，默认为","
		 * @param itemGetter 函数对象，用于将array的元素对象构造出字符串内每一节的子串，可省略，默认直接获取元素对象
		 */
		join		: function(array, spliter, itemGetter){
			if(typeof spliter === 'function'){
				itemGetter = spliter;
				spliter = undefined;
			}
			spliter = spliter || ',';
			itemGetter = itemGetter || function(ele){return ele}
			var str = '';
			if($.isArray(array)){
				for(var i in array){
					str += itemGetter.apply(array, [array[i]]) + spliter;
				}
				if(str.length > 0){
					str = str.substring(0, str.length - spliter.length);
				}
			}
			return str;
		},
		/**
		 * 获得dom的位置和尺寸
		 * 如果没有传入参数，则获取body的位置和尺寸
		 */
		getPageOffset: function($page){
			var page = document.body;
			if($page instanceof $){
				page = $page.get(0);
			}
			return {
				top		: page.offsetTop,
				left	: page.offsetLeft,
				width	: page.offsetWidth,
				height	: page.offsetHeight
			};
		},
		setProperties	: function(source, target, propertyNames){
			if(arguments.length === 2 && $.isArray(target)){
				propertyNames = target;
				target = {};
			}
			for(var i in propertyNames){
				var propertyName = propertyNames[i];
				target[propertyName] = source[propertyName];
			}
			return target;
		},
		/**
		 * 获得随机字符串
		 * @param len 随机字符串长度，默认32
		 * @param radix 字符维度。如果传入10，则生成的字符串的每个字符都是0~9，如果传入16，则为0~F。默认16，最大62
		 * @return 随机字符串
		 */
		uuid		: function(len, radix){
			var chars = CHARS, uuid = [], i;
			len = len || 32;
			radix = radix || 16;
			if(radix > chars.length){
				radix = chars.length;
			}
			for (i = 0; i < len; i++){
				uuid[i] = chars[0 | Math.random() * radix];
			}
			return uuid.join('');
		},
		/**
		 * 遍历树形结构对象
		 * @param node 要遍历的树的根节点
		 * @param childrenGetter 从父节点获得子节点的方法
		 * @param func 遍历每个节点要执行的方法
		 * @return 调用遍历方法时，第一个return false的节点会被返回
		 * 			如果始终没有调用到return false，那么会返回一个包含所有元素的数组（先序遍历）
		 */
		iterateTree	: function(node, childrenGetter, func){
			var array = [node];
			if(node && typeof func === 'function'){
				try{
					result = func(node);
					if(result === false){
						return node;
					}
				}catch(e){
					console.error(e);
				}
				if(typeof childrenGetter === 'function'){
					var children = childrenGetter(node);
					if($.isArray(children)){
						for(var i in children){
							var itrResult = this.iterateTree(children[i]);
							if(typeof result === 'object'){
								return result;
							}else if($.isArray(itrResult)){
								$.merge(array, itrResult);
							}
						}
					}
				}
			}
			return array;
		},
		/**
		 * 如果值是一个函数，那么会根据参数计算之后得到返回值
		 * 否则会直接返回对象
		 * 如果还传入了checkFn，那么会在返回之前先检验是否符合，符合的话返回值，否则返回undefined
		 * @param val {any} 要返回的值或者要计算的函数
		 * @param args {Array<any>} 如果val是函数的话，那么会传入的参数
		 * @param checkFn {Function(any)} 用于检验值的函数，如果传入了函数，那么仅返回true的时候会校验成功并返回
		 */
		applyValue	: function(val, args, checkFn){
			var checkFn = typeof checkFn === 'function'? checkFn: returnTrue;
			var value = val;
			if(typeof val === 'function'){
				value = val.apply(this, args);
			}
			return checkFn(value) == true? value: undefined;
		},
		/**
		 * 切换jquery对象的class。
		 * 如果jquery对象本来都没有class1和class2,或者都有class1和class2，则不处理
		 * @param jqObj {jQuery}要切换的JqueryDom对象
		 * @param class1 {String}
		 * @param class2 {String}
		 * @param flag {Boolean} 为true的话，jqObj一定有class1没有class2；为false的话，jqObj有class2没有class1
		 */
		switchClass	: function(jqObj, class1, class2, flag, callback){
			var hasClass1 = jqObj.is('.' + class1),
				hasClass2 = jqObj.is('.' + class2);
			if((hasClass1 ^ hasClass2) === 1){
				if(typeof flag === 'function'){
					callback = flag;
					flag = hasClass2;
				}else{
					callback = (typeof callback === 'function')? callback: $.noop;
					flag = flag || hasClass2;
				}
				jqObj.toggleClass(class1, flag);
				jqObj.toggleClass(class2, !flag);
				try{
					callback.apply(jqObj, [flag]);
				}catch(e){}
			}
			return this;
		},
		/**
		 * 切换对象的一般属性。
		 * @param attrName 属性名
		 * @param value1 优先属性，当属性不存在，或者属性值不是value1和value2中的一个，那么将会变成value1
		 * @param value2 切换属性
		 */
		toggleAttr	: function(jqObj, attrName, value1, value2){
			$(jqObj).each(function(){
				var $jqObj = $(this);
				var value = $jqObj.attr(attrName);
				if(value === value1){
					$jqObj.attr(attrName, value2);
				}else{
					$jqObj.attr(attrName, value1);
				}
			});
		},
		/**
		 * 将dom元素的内容设置为数字编辑器
		 */
		NumberEdit	: function(_param, whenEnter){
			var defaultParam = {
				$target		: null,
				scope		: document,
				whenEnter	: $.noop
			};
			var param = {};
			if(_param instanceof $){
				$.extend(param, defaultParam, {
					$target		: _param,
					whenEnter	: whenEnter
				});
			}else{
				$.extend(param, defaultParam, _param);
			}
			$(param.scope).keydown(function(e){
				if($(e.target).is(':text,textarea')){
					return;
				}
				console.log(e.keyCode);
				var $number = param.$target,
					oNumber = $number.text();
				if(e.keyCode >= 48 && e.keyCode <= 57){
					oNumber = oNumber === '0'? '': oNumber;
					oNumber += String(e.keyCode - 48);
					$number.text(oNumber);
				}else if(e.keyCode == 13){
					var _return = param.whenEnter(parseInt(oNumber));
					if(_return !== false){
						//回车时将数字置零
						$number.text(0);
					}
				}else if(e.keyCode == 8){
					if(oNumber.length > 1){
						oNumber = oNumber.substr(0, oNumber.length - 1);
					}else{
						oNumber = '0';
					}
					$number.text(oNumber);
				}
			});
		},
		/**
		 * 将滚动条滑动到指定元素的位置
		 */
		scrollTo	: function($container, position){
			var $position
			if(position instanceof $){
				$position = position;
			}else if(position === 0){
				$position = $container.children('div,span').first();
			}else{
				$position = $container.children().last()
			}
			if($container.offset() && $position.offset()){
				$container.scrollTop(
						$position.offset().top - $container.offset().top + $container.scrollTop()
				);
			}
		},
		/**
		 * 将checkbox数组串联成互斥勾选
		 */
		mutexCheckbox	: function($checkboxs){
			var FLAG = this.uuid(5, 62);
			$.each($checkboxs, function(){
				var $this = $(this);
				$this.change(function(e){
					var checked = $this.prop('checked');
					if(checked){
						$.each($checkboxs, function(){
							$(this).not($this).filter(':checked').prop('checked', false).trigger('change', [FLAG]);
						});
					}
				});
			});
		},
		/**
		 * 验证联系号码的格式
		 */
		testContactNumber	: function(contact){
			return /^1[34578]\d{9}$/.test(contact)
			|| /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,8}$/.test(contact)
		},
		/**
		 * 格式化日期
		 */
		formatDate			: function(date, fmt){
			if(typeof date === 'string' && fmt === undefined){
				fmt = date;
				date = new Date();
			}
			if(date instanceof Date){
				var o = { 
						"M+" : date.getMonth()+1,                 //月份 
						"d+" : date.getDate(),                    //日 
						"h+" : date.getHours(),                   //小时 
						"m+" : date.getMinutes(),                 //分 
						"s+" : date.getSeconds(),                 //秒 
						"q+" : Math.floor((date.getMonth()+3)/3), //季度 
						"S"  : date.getMilliseconds()             //毫秒 
				}; 
				if(/(y+)/.test(fmt)) {
					fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length)); 
				}
				for(var k in o) {
					if(new RegExp("("+ k +")").test(fmt)){
						fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
					}
				}
				return fmt; 
			}
		},
		/**
		 * 获得当天时间的零点Date对象
		 * @param date {Date} 传入要获取零点的那天的某个时间对象，不传入时，取当天
		 * @return {Date} 零点时的时间对象
		 */
		getDate			: function(date, incDay){
			if(!(date instanceof Date)){
				date = new Date();
			}else{
				date = new Date(date);
			}
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			if(typeof incDay === 'number' && incDay > 0){
				date = new Date(Date.parse(date) + incDay * 86400000);
			}
			return date;
		},
		converteFormdata: function(formdata){
			if(formdata instanceof $){
				formdata = formdata[0];
			}
			if(!(formdata instanceof FormData)){
				formdata = new FormData(formdata);
			}
			var result = {};
			formdata.forEach(function(val, key){
				if(val !== undefined){
					if($.isArray(result[key])){
						result[key].push(val);
					}else if(result[key] !== undefined){
						result[key] = [result[key], val];
					}else{
						result[key] = val;
					}
				}
			});
			return result;
		},
		/**
		 * 获得选择框选择的选项option
		 */
		getCheckedOption: function(select){
			var $select  = $(select);
			if($select.is('select')){
				var val = $select.val();
				return $select.find('option[value="' + val + '"]');
			}
		},
		/**
		 * 移除一个元素样式，对css样式无影响
		 */
		removeStyle		: function(dom, styleName){
			if(styleName){
				var style = $(dom).attr('style');
				if(style){
					var reg = new RegExp(styleName + '\\s*:\\s*([^;]+;)|([^;]+$)', 'gi')
					style = style.replace(reg, '');
					$(dom).attr('style', style);
				}
			}
			return this;
		},
		/**
		 * 自增序列
		 * @param key 表示序列的键
		 * @param key 序列的起始值，默认为0
		 */
		getNextSequence	: function(key, start){
			key = key || 'DEFAULT_KEY';
			var currentSeq = SEQUENCE_MAP[key];
			if(!currentSql){
				currentSeq = exports.isInteger(start)? parseInt(start): 0;
			}
			SEQUENCE_MAP[key] = currentSeq + 1;
			return currentSeq;
		},
		datepicker		: function($dom,scrollEle, $page){
			$dom = $($dom);
			if($dom.is(':text')){
				return $dom.datetimepicker({
					format		: 'yyyy-mm-dd',
					language	: 'zh-CN',
					weekStart	: 1,
					autoclose	: true,
					minView		: 'month',
					bootcssVer	: 3,
					container	: $page
				});
			}
		},
		yearMonthPicker	: function($dom, scrollEle, $page){
			$dom = $($dom);
			if($dom.is(':text')){
				return $dom.datetimepicker({
					format		: 'yyyy-mm',
					language	: 'zh-CN',
					autoclose	: true,
					bootcssVer	: 3,
					startView	: 3,
					minView		: 3,
					maxView 	: 3,
					pickerPosition: "bottom-right",
					container	: $page
				});
			}
		},
		datetimepicker	: function($dom, scrollEle, $page){
			$dom = $($dom);
			if($dom.is(':text')){
				return $dom.datetimepicker({
					format		: 'yyyy-mm-dd hh:ii:ss',
					language	: 'zh-CN',
					weekStart	: 1,
					autoclose	: true,
					bootcssVer	: 3,
					minView		: 0,
					minuteStep	: 1,
					pickerPosition: "bottom-right",
					container	: $page
				});
			}
		},
		timepicker		: function($dom, scrollEle, $page){
			$dom = $($dom);
			if($dom.is(':text')){
				return $dom.datetimepicker({
					format		: 'hh:ii:ss',
					language	: 'zh-CN',
					startView	: 1,
					autoclose	: true,
					bootcssVer	: 3,
					maxView		: 'hour',
					minView		: 0,
					minuteStep	: 1,
					pickerPosition: "bottom-right",
					container	: $page
				});
			}
		},
		/**
		 * 获取焦点
		 */
		focus		: function($dom){
			return $($dom).focus(function(){
				sFocus = $(this);
			});
		},
		daterangepicker: function($dom, _param){
			var defaultParam = {
					format 				: 'YYYY-MM-DD HH:mm:ss',
					timePicker			: true,
					timePicker12Hour	: false,
					timePickerIncrement : 5,
					separator			: '~',
					locale				: {
						applyLabel	: '确定',
		                cancelLabel: '取消',
		                fromLabel: '从',
		                toLabel: '到',
						daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],  
		                monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',  
	                        '七月', '八月', '九月', '十月', '十一月', '十二月' ]
				}
			};
			var param = $.extend({}, defaultParam, _param);
			return $($dom).daterangepicker(param);
		},
		ymrangepicker: function($dom, _param){
			var defaultParam = {
					format 				: 'YYYY-MM',
					timePicker			: true,
					timePicker12Hour	: false,
					timePickerIncrement : 5,
					separator			: '~',
					locale				: {
						applyLabel	: '确定',
		                cancelLabel: '取消',
		                fromLabel: '从',
		                toLabel: '到',
						daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],  
		                monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',  
	                        '七月', '八月', '九月', '十月', '十一月', '十二月' ]
				}
			};
			var param = $.extend({}, defaultParam, _param);
			return $($dom).daterangepicker(param);
		},
		triggerInField	: function(fieldName, eventName, args, target){
			if(typeof fieldName === 'string' && typeof eventName === 'string'){
				var eventMap = eventFieldMap[fieldName];
				if(eventMap){
					var callbackStack = eventMap[eventName];
					if(callbackStack){
						var event = {
								fieldName	: fieldName,
								eventName	: eventName
						};
						var eventArgs = [event];
						if($.isArray(args)){
							eventArgs = $.merge(eventArgs, args);
						}else{
							eventArgs.push(args);
						}
						if(!target){
							target = this;
						}
						for(var i = callbackStack.length - 1; i >= 0; i--){
							try{
								if(callbackStack[i].apply(target, eventArgs) === false){
									return false;
								}
							}catch(e){
								console.error(e);
							}
						}
					}
				}
			}
		},
		bindInField		: function(fieldName, eventName, callback){
			if(typeof fieldName === 'string' && typeof eventName === 'string'){
				if(typeof callback === 'function'){
					var eventMap = eventFieldMap[fieldName];
					if(!eventMap){
						eventFieldMap[fieldName] = eventMap = {};
					}
					var callbackStack = eventMap[eventName];
					if(!callbackStack){
						eventMap[eventName] = callbackStack = [];
					}
					callbackStack.push(callback);
				}
			}
		},
		trigger		: function(eventName, args){
			return this.triggerInField('defaultField', eventName, args);
		},
		bind		: function(eventName, callback){
			return this.bindInField('defaultField', eventName, callback);
		},
		botByDom	: function(dom, eventName, callback){
			var $dom = $(dom);
			if($dom.length == 1 && typeof eventName === 'string' && eventName){
				var fullEventKey = 'cpf-botByDom-' + eventName;
				if(callback === false){
					$dom.off(fullEventKey);
					$dom.removeData(fullEventKey);
				}else{
					var isUndefined = callback === undefined,
						isFunction = typeof callback === 'function';
					if(isUndefined){
						//如果已经绑定了事件，那么就直接触发
						//如果没有绑定事件，那么添加标记，令事件在绑定时直接触发
						var events = $._data($dom[0], 'events')[fullEventKey];
						if(events && events.length > 0){
							$dom.trigger(fullEventKey);
							$dom.removeData(fullEventKey);
						}else{
							$dom.data(fullEventKey, 1);
						}
					}else if(isFunction){
						//如果标记不为空，那么直接触发回调
						//如果标记为空，那么绑定回调
						if($dom.data(fullEventKey)){
							$dom.one(fullEventKey, callback).trigger(fullEventKey);
							$dom.removeData(fullEventKey);
						}else{
							$dom.one(fullEventKey, callback);
						}
					}
				}
			}
		},
		/**
		 * 绑定和触发
		 * 当A使用bindOrTrigger(event, callback)方法绑定了一个事件，必须等待B用bindOrTrigger(event)触发该事件。
		 * 与普通的bind-trigger方法不同的是：用该方法绑定事件时，如果已经有方法调用了触发的方法，那么在绑定之后将会立刻触发事件。
		 * 之后，如果有其他方法再次调用触发方法，将会直接触发。如果重新绑定了事件，那么也会在绑定之后立刻触发重新绑定的回调。
		 * 如果想要重新绑定并令其重新触发，只能传入callback为false，那么将会重新初始化该事件
		 */
		bindOrTrigger	: function(event, callback){
			if(typeof event === 'string'){
				if(callback === false){
					bindOrTriggerMap['event_' + event] = undefined;
					return this;
				}
				var obj = bindOrTriggerMap['event_' + event];
				if(!obj){
					bindOrTriggerMap['event_' + event] = obj = {};
				}
				if(callback === undefined || $.isArray(callback)){
					if(typeof obj.callback === 'function'){
						obj.callback.apply(this, callback);
					}
					obj.param = callback;
					obj.flag = true;
				}else if(typeof callback === 'function'){
					obj.callback = callback;
					if(obj.flag){
						this.bindOrTrigger(event, obj.param);
					}
				}
			}
		},
		bindTap		: function(target, handler){
			$(target).on('cpf-tap', handler);
			//自定义tap
			$(target).on("touchstart", function(e) {
			    if(!$(e.target).hasClass("disable")) $(e.target).data("isMoved", 0);
			});
			$(target).on("touchmove", function(e) {
			    if(!$(e.target).hasClass("disable")) $(e.target).data("isMoved", 1);
			});
			$(target).on("touchend", function(e) {
			    if(!$(e.target).hasClass("disable") && $(e.target).data("isMoved") == 0) $(e.target).trigger("cpf-tap");
			});
		},
		/**
		 * 计算地球上两个坐标的直线距离， 单位公里
		 */
		distanceBetween	: function(posA, posB){
			var lngA = posA.lng, latA = posA.lat,
				lngB = posB.lng, latB = posB.lat;
			var R = 6371.004;//地球半径
			var c = Math.sin(latA) * Math.sin(latB) * Math.cos(lngA - lngB) + Math.cos(latA) * Math.cos(latB);
			return R * Math.acos(c) * Math.PI / 180;
		},
		/**
		 * 将元素插入到$parent的索引为index的子元素后面，
		 * 如果$parent内没有子元素，或者不传入index，则直接插入
		 */
		appendTo		: function($target, $parent, index, childrenFilter){
			if($target instanceof $ && $parent instanceof $){
				var $siblings = $parent.children().filter(childrenFilter);
				if(typeof childrenFilter === 'string'){
					$siblings = $siblings.filter(childrenFilter);
				}
				if(index === undefined || $siblings.length <= index){
					$parent.append($target);
				}else{
					$target.insertAfter($siblings[index]);
				}
			}
		},
		/**
		 * 将元素插入到$parent的索引为index的子元素前面，
		 * 如果$parent内没有子元素，或者不传入index，则直接插入
		 */
		prependTo		: function($target, $parent, index, childrenFilter){
			if($target instanceof $ && $parent instanceof $){
				var $siblings = $parent.children();
				if(typeof childrenFilter === 'string'){
					$siblings = $siblings.filter(childrenFilter);
				}
				if(index === undefined){
					$parent.prepend($target);
				}else if($siblings.length <= index){
					$parent.append($target);
				}else{
					$target.insertBefore($siblings[index]);
				}
			}
		},
		/**
		 * 替换元素内容为文本框，用于编辑元素内容
		 * @param inputClass 文本框要添加的样式
		 */
		toEditContent	: function($target, inputClass){
			var callbackMap = {
				confirmed	: 	$.Callbacks('stopOnFalse')
			};
			var $this = $($target);
			var title = $this.text();
			var $input = 
				$('<input type="text" class="dblclicked" />')
				.addClass(inputClass)
				.val(title)
				.keypress(function(e){
					if(e.keyCode === 13){
						confirmTitle();
					}
				})
				.blur(confirmTitle);
			$input.appendTo($this.empty()).select();
			function confirmTitle(){
				var newTitle = $input.val();
				var blankExp = /^\s*$/;
				if(blankExp.test(newTitle)){
					newTitle = title;
				}
				$input.remove();
				$this.text(newTitle);
				callbackMap['confirmed'].fire(newTitle, $this);
			}
			var result = {
					bind	: function(eventName, callback){
						callbackMap[eventName].add(callback);
						return result;
					}
			}
			return result;
		},
		CallbacksMap		: function(context){
			return new CallbacksMap(context);
		},
		/**
		 * 继承方法。
		 * 寄生式的继承，将父类的原型传递给子类。
		 * 子类的构造函数还另外需要调用父类的构造函数(superClass.apply(this, arguments)，来完成完整的继承
		 */
		extendClass			: function(subClass, superClass){
			if(typeof superClass === 'function' && typeof subClass === 'function'){
				var f = function(){};
				f.prototype = superClass.prototype;
				subClass.prototype = new f();
				subClass.__superPrototype = f.prototype;
				subClass.prototype.constructor = subClass;
			}
		},
		/**
		 * 将json字符串转换为对象。
		 * 如果不能转换或者转换时报错，那么将返回null
		 */
		parseJSON			: function(_json){
			var json = null;
			try{
				json = $.parseJSON(_json);
			}catch(e){}
			return json;
		},
		swap				: function(array, x, y){
			if(!$.isArray(array)){
				$.error('第一个参数必须是数组');
			}
			if(x < 0 || y < 0 || x >= array.length || y >= array.length){
				$.error('索引必须小于数组长度' + array.length);
			}
			array.splice(x, 1, array.splice(y, 1, array[x])[0]);
		},
		merge			: function(){
			if(arguments.length > 0){
				var supportSet = typeof Set === 'function';
				var first = arguments[0];
				if($.isArray(first) || (supportSet && first instanceof Set)){
					var second = arguments[1];
					if($.isArray(second) || (supportSet && first instanceof Set)){
						addAToB(second, first);
					}
					if(arguments.length > 2){
						return exports.merge.apply(exports, $.merge([], first, arguments.slice(2)));
					}else{
						return first;
					}
				}
			}
		},
		place			: function($dom, $site, direction, $container){
			var offset, top, left, containerOffset;
			if ($container) {
				containerOffset = $($container).offset();
			} else {
				containerOffset = $(document.body).offset();
		    }
			$site = $($site);
			$dom = $($dom);
			$dom.appendTo($container);
			
			offset = $site.offset();
	        left = offset.left;
			
	        var bodyWidth = document.body.clientWidth || window.innerWidth;
	        if (left + $dom.width() > bodyWidth) {
	          left = bodyWidth - $dom.width();
	        }
	        
	        top = offset.top;
	        
	        
	        top = top - containerOffset.top;
	        left = left - containerOffset.left;

	        if(direction === 'top'){
	        	top -= $dom.height();
	        }else if(direction === 'bottom'){
	        	top += $site.height();
	        }
	        $dom.css({
	          top:    top,
	          left:   left
	        });
		},
		instead			: function($ori, $target, $container){
			exports.place($target, $ori, '', $container);
			$ori.hide();
			$target.show();
		},
		inherit			: function(SubType, SuperType){
			var s = SubType;
			// 创建一个没有实例方法的类
			var Super = function(){};
			Super.prototype = SuperType.prototype;
			//将实例作为子类的原型
			SubType.prototype = new Super();
			SubType.prototype.constructor = s;
		},
		getScrollbarWidth: function() {
		    var oP = document.createElement('p'),
		        styles = {
		            width: '100px',
		            height: '100px',
		            overflowY: 'scroll'
		        }, i, scrollbarWidth;
		    for (i in styles) oP.style[i] = styles[i];
		    document.body.appendChild(oP);
		    scrollbarWidth = oP.offsetWidth - oP.clientWidth;
		    oP.remove();
		    return scrollbarWidth;
		},
		writeFormData	: function(formData){
			formData.forEach(function(value, key){
				console.log(key, value);
			});
		}
	});
	
	function addAToB(a, b){
		if($.isArray(b)){
			if($.isArray(a)){
				for(var i in a){
					b.push(a[i]);
				}
			}else if(a instanceof Set){
				a.forEach(function(e){
					b.push(e);
				});
			}
		}else if(b instanceof Set){
			if($.isArray(a)){
				for(var i in a){
					b.add(a[i]);
				}
			}else if(a instanceof Set){
				a.forEach(function(e){
					b.add(e);
				});
			}
		}
	}
	
	/**
	 * 封装jquery的回调列表，使其支持多个事件
	 */
	function CallbacksMap(_context){
		var context = null
		if(typeof _context === 'object'){
			context = _context;
			this.bindMethod(context);
		}else{
			context = this;
		}
		var map = {};
		/**
		 * 获得回调
		 */
		this.get = function(eventName){
			if(eventName || eventName === 0){
				var callback = map[eventName.toString()];
				if(!callback){
					callback = map[eventName.toString()] = $.Callbacks();
				}
				return callback;
			}
		};
		/**
		 * 添加回调
		 */
		this.put = function(eventName, callback){
			try{
				this.get(eventName).add(callback);
			}catch(e){}
		};
		/**
		 * 重新添加回调，如果传入的callback为null，那么直接把原来的回调清空
		 */
		this.replace = function(eventName, callback){
			if(eventName || eventName === 0){
				if(typeof callback === 'function' || callback === null){
					var callbacks = map[eventName.toString()] = $.Callbacks('stopOnFalse');
					callbacks.add(callback);
				}
			}
		}
		/**
		 * 执行回调
		 */
		this.fire = function(eventName, args){
			this.fireWith(context, eventName, args);
		};
		
		this.fireWith = function(_context, eventName, args){
			try{
				this.get(eventName).fireWith(_context, args);
			}catch(e){console.error(e)}
		};
		/**
		 * 清空某个事件的回调
		 */
		this.empty = function(eventName){
			try{
				this.get(eventName).empty();
			}catch(e){}
		}
		
	}
	
	CallbacksMap.prototype.bindMethod = function(target){
		var _this = this;
		target.addCallback = function(eventName, callback){
			if(typeof eventName === 'object'){
				for(var key in eventName){
					if(typeof eventName[key] === 'function'){
						target.addCallback(key, eventName[key]);
					}
				}
			}else if(typeof eventName === 'string' && typeof callback === 'function'){
				_this.put(eventName, callback);
			}
			return target;
		}
	};
	
	/**
	 * 集合栈
	 */
	function SetStack(){
		this.array = [];
	}
	
	SetStack.prototype.getTop = function(){
		return this.array[this.array.length - 1];
	}
	
	SetStack.prototype.push = function(ele){
		this.remove(ele);
		this.array.push(ele);
	}
	SetStack.prototype.pop = function(){
		return this.array.pop();
	}
	
	SetStack.prototype.remove = function(ele){
		var index = $.inArray(ele, this.array);
		if(index >= 0){
			this.array.splice(index, 1);
		}
	}
	SetStack.prototype.isEmpty = function(){
		return this.array.length == 0;
	}
	exports.SetStack = SetStack;
	
	
	function Subscriber(param){
		var funcMap = {};
		
		this.invoke = function(funcName, invoker, args){
			if(typeof funcMap[funcName] === 'function'){
				funcMap[funcName].apply(invoker || this, args);
			}
		}
		
		this.bind = function(funcName, func){
			if(typeof funcName === 'string' && typeof func === 'function'){
				funcMap[funcName] = func;
			}
		}
	}
	
	function Subscribers(){
		Array.call(this);
	}
	
	exports.inherit(Subscribers, Array);
	$.extend(Subscribers.prototype, {
		add 	: function(subscriber){
			if(subscriber instanceof Subscriber){
				this.push(subscriber);
				return subscriber;
			}
		},
		
		remove	: function(ele){
			if(typeof ele === 'number'){
				return this.splice(ele, 1);
			}else{
				var index = $.inArray(ele, this);
				if(index >= 0){
					return this.remove(index);
				}
			}
		},
		forEach	: function(itr){
			for(var i = 0; i < this.length; i++){
				itr.apply(this[i], [i, this[i]]);
			}
		},
		invoke	: function(funcName, invoker, args, excepts, calledSubscriber){
			excepts = excepts || [];
			if(funcName){
				this.forEach(function(i, subscriber){
					if($.inArray(subscriber, excepts) < 0){
						try{
							subscriber.invoke(funcName, invoker, args);
						}catch(e){
							console.error(e);
						}
					}
				});
				/*for(var i in this){
					var subscriber = this[i];
					
				}*/
			}
		}
	});
	
	
	
	
	exports.Subscriber = Subscriber;
	exports.Subscribers = Subscribers;
	
	
	function Context(_properties){
		this.properties = $.extend({}, _properties);
		this.callbacksMap = {}
		this.selfishCallbacksMap = {};
		this.domMap = {};
	}
	Context.prototype.getStatus = function(propertyName, defValue){
		if(this.properties.hasOwnProperty(propertyName)){
			return this.properties[propertyName];
		}else{
			return defValue;
		}
	}
	/**
	 * 设置状态的字段值
	 * 第一个参数为字符串时，第二个参数为该字符串对应的字段要设置的值
	 * 第一个参数为对象时，第二个参数可选为字符串数组，字符串数组表示要覆盖的字段名集合
	 */
	Context.prototype.setStatus = function(propertyName, propertyValue){
		if(arguments.length == 1) return this.changeStatus(propertyName);
		return this.changeStatus(propertyName, propertyValue, true);
	}
	
	Context.prototype.changeStatus = function(propertyName, propertyValue, forceTrigger){
		if(typeof propertyName === 'string'){
			var before = this.properties[propertyName];
			if(arguments.length == 1){
				propertyValue = before;
				forceTrigger = true;
			}
			if(!forceTrigger && before === propertyValue) {
				return this;
			}
			this.properties[propertyName] = propertyValue;
			console.debug('status Changed[' + propertyName + ']', propertyValue);
			this.trigger(propertyName, [{
				before, after: propertyValue
			}]);
		}else if(typeof propertyName === 'object'){
			if($.isArray(propertyValue)){
				for(var i = 0; i < propertyValue.length; i++){
					var pName = propertyValue[i];
					this.setStatus(pName, propertyName[pName], forceTrigger);
				}
			}else{
				for(var key in propertyName){
					this.setStatus(key, propertyName[key], forceTrigger);
				}
			}
		}
		return this;
	}
	
	Context.prototype.bind = function(propertyName, callback){
		if($.isArray(propertyName)){
			for(var i in propertyName){this.bind(propertyName[i], callback)}
			return this;
		}
		exports.assert(typeof propertyName == 'string' && !!propertyName, '第一个参数必须是不为空的字符串');
		if($.isArray(callback)){
			for(var i = 0; i < callback.length; i++){
				this.bind(propertyName, callback[i]);
			}
			return this;
		}
		exports.assert(typeof callback == 'function', '第二个参数必须是函数对象');
		if(!this.callbacksMap[propertyName]){
			this.callbacksMap[propertyName] = $.Callbacks('stopOnFalse');
		}
		this.callbacksMap[propertyName].add(callback)
		return this;
	}
	
	Context.prototype.trigger = function(propertyName, parameters){
		if(this.callbacksMap[propertyName]){
			this.callbacksMap[propertyName].fireWith(this, parameters);
			var selfishCallbacks = this.selfishCallbacksMap[propertyName];
			if(selfishCallbacks && !selfishCallbacks.trigged && this.getStatus(propertyName)){
				selfishCallbacks.trigged = true;
				selfishCallbacks.callbacks.fireWith(this, parameters);
				selfishCallbacks.callbacks.empty();
			}
		}
		return this;
	}
	
	/**
	 * 当字段第一次被设置不为空值的时候，触发callback
	 * 后面再次修改字段值的时候将不会触发
	 */
	Context.prototype.selfish = function(propertyName, callback){
		var value = this.getStatus(propertyName);
		if(!value){
			if(!this.selfishCallbacksMap[propertyName]){
				this.selfishCallbacksMap[propertyName] = {
					trigged 	: false,
					callbacks	: $.Callbacks()
				};
			}
			this.selfishCallbacksMap[propertyName].callbacks.add(callback);
		}else{
			callback.apply(this, [value]);
		}
	}
	
	Context.prototype.setDom = function(propertyName, dom){
		exports.assert(typeof propertyName == 'string' && !!propertyName, '第一个参数必须是不为空的字符串');
		this.domMap[propertyName] = dom;
	}
	
	Context.prototype.getDom = function(propertyName){
		exports.assert(typeof propertyName == 'string' && !!propertyName, '第一个参数必须是不为空的字符串');
		return this.domMap[propertyName];
	}
	
	Context.prototype.loadTmplMap = function(tmplMapURI, tmplMapStatusName){
		var _this = this;
		return require('tmpl').load(tmplMapURI).done(function(tmplMap){
			_this._tmplMapStatusName = tmplMapStatusName || 'tmplMap';
			_this.setStatus(_this._tmplMapStatusName, tmplMap);
		});
	}
	Context.prototype.getTmplMap = function(){
		if(this._tmplMapStatusName){
			return this.getStatus(this._tmplMapStatusName);
		}
	}
	
	exports.createContext = exports.createStatus = function(f){return new Context(f)}
	
	/**
	 * 构建一个方法对象，方法对象的原型为(types1, callback1, types2, callback2..., elseCallback)
	 * 表示用typeGetter方法获得的值在types中的时候，执行对应的callback。如果都不存在，那么执行elseCallback
	 */
	exports.DoWhen = function(typeGetter){
		return function(){
			var currentType = typeGetter();
			for(var i = 0; i < arguments.length; i+=2){
				var types = arguments[i];
				var callback = arguments[i + 1];
				
				if(typeof types === 'string'){
					types = [types];
				}else if(typeof types === 'function'){
					return types(currentType);
				}else if(types instanceof RegExp){
					types = new RegExp('^' + types.source + '$');
					if(types.test(currentType)){
						return (callback || $.noop)(currentType);
					}else{
						continue;
					}
				}
				if($.isArray(types) && types.indexOf(currentType) >= 0){
					return (callback || $.noop)(currentType);
				}
			}
		}
		
	}
	
	function returnTrue(){return true;}
	function returnFalse(){return false;}
});