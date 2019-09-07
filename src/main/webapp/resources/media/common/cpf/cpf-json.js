/**
 * Json对象的计算策略
 * 
 * “|”
 * 		object 	| object
 * 			两个对象的属性的并集。
 * 			如果对象的属性的key不为undefined，则以key去重。
 * 			属性名相同时，也会去重。
 * 			去重时以后面的对象为准。
 * 		array 	| array
 * 			两个数组的并集。
 * 			如果对象的属性的key不为undefined，则以key去重。
 * 			去重时以后面的数组的为准。
 * 			添加之后的元素将添加到第一个数组后面
 * 		number 	| number
 * 			两个数字相加。
 * 		string	| string
 * 			两个字符串拼接
 * 		boolean	| boolean
 * 			两个布尔值做or运算
 * 		null	| any
 * 			如果其中一个为null，在返回另外一个的值
 * “-”
 * 		object 	- object
 * 			两个对象的差集。
 * 			如果
 * 		object 	- array
 * 		array	- array
 * 		array	- object
 * 		number	- number
 * 		string	- string
 * 		boolean - boolean
 * 		null	- null
 * “&”
 * 		object 	& object
 * 		array 	& array
 * 		number 	& number
 * 		string	& string
 * 		boolean	& boolean
 * 		null	& null
 * 		
 * 		
 */
define(function(){
	/**
	 * Json数据类型类
	 */
	function Type(_param){
		this.param = _param;
		this.getName = function(){
			return _param.name;
		};
		this.equals = function(type){
			return this.getName() == type.getName();
		}
	}
	/**
	 * 将souce转换成当前类型的原始对象
	 * @param source
	 */
	Type.prototype.parse = function(source, context){
		if(typeof this.param.parse === 'function'){
			return this.param.parse.apply(this, [source, context]);
		}else{
			return source;
		}
	}
	Type.prototype.isNegative = function(source){
		return _param.negative(source);
	}
	var __tmap = {
		'Object'	: {
			name		: 'object',
			negative	: function(source){
				return source == null
			},
			parse		: function(source){
				if(typeof source !== 'object'){
					$.error('source必须是object类型')
				}
				return source;
			}
		},
		'Array'		: {
			name		: 'array',
			negative	: function(source){
				return source.length === 0;
			},
			parse		: function(source){
				if($.isArray(source)){
					$.error('source必须是数组类型');
				}
				return source;
			}
		},
		'String'		: {
			name		: 'string',
			negative	: function(source){
				return source.length === 0;
			},
			parse		: function(source){
				return source.toString();
			}
		},
		'Number'		: {
			name		: 'number',
			negative	: function(source){
				return source <= 0;
			},
			parse		: function(source){
				return Number(source);
			}
		},
		'Boolean'		: {
			name		: 'boolean',
			negative	: function(source){
				return !source
			},
			parse		: function(source){
				return Boolean(source);
			}
		},
		'Null'		: {
			name		: 'null',
			negative	: function(){
				return true;
			},
			parse		: function(){
				return null;
			}
		},
		'Expression'	: {
			name		: 'expression',
			nagative	: function(source, context){
				
			},
			parse		: function(source, context){
				
			}
		}
	}
	
	for(var key in __tmap){
		Type[key] = new Type(__tmap[key]);
	}
	Type.getBaseType = function(typeName){
		return Type[typeName];
	}
	/**
	 * 获得数据对象的类型
	 * @param source
	 * @returns Type
	 * @error 不支持的对象类型
	 */
	Type.getTypeOf = function(source){
		var sourceType = typeof source;
		if(typeof source === 'object'){
			if($.isPlainObject(source)){
				return Type.Object; 
			}else if($.isArray(source)){
				return Type.Array;
			}else if(source == null){
				return Type.Null;
			}else{
				$.error('source作为对象，只能是PlainObject和Array');
			}
		}else{
			switch(sourceType){
				case 'string':
					if(/^#.+$/.test(source)){
						return Type.Expression;
					}
				case 'number':
				case 'boolean':
					return Type.getBaseType(sourceType);
					break;
				default:
					$.error('不支持的对象类型[' + sourceType + ']');
			}
		}
	}
	/**
	 * 
	 */
	function clone(source){
		if(typeof source === 'object'){
			var result = null;
			if($.isPlainObject(source)){
				result = {};
				$.extend(true, result, source);
			}else if($.isArray(source)){
				result = [];
				for(var i in source){
					result.push(clone(source[i]));
				}
			}else{
				var baseClasses = [Number, String, Boolean, Date];
				for(var i in baseClasses){
					if(source instanceof baseClasses[i]){
						return new baseClasses[i](source);
					}
				}
			}
			return result; 
		}else{
			return source;
		}
	}
	
	/**
	 * 
	 */
	function Json(source, _actualType, parent){
		var actualType = null;
		var sourceType = typeof source;
		var sourceCopy = clone(source);
		parent = parent || null;
		if(_actualType instanceof Type){
			source = _actualType.parse(source);
			actualType = _actualType;
		}else if(_actualType === undefined){
			actualType = Type.getTypeOf(source);
		}else{
			$.error('数据类型应为Type类');
		}
		
		this.getSource = function(){
			return source;
		}
		this.getSourceType = function(){
			return sourceType;
		}
		this.getActualType = function(){
			return actualType;
		}
		this.getParent = function(){
			return parent;
		}
	}
	
	/**
	 * 获得原数据。将在执行构造函数之后重载
	 */
	Json.prototype.getSource = function(){}
	/**
	 * 获得原数据的类型（即typeof source）
	 * @return string
	 */
	Json.prototype.getSourceType = function(){}
	/**
	 * 获得当前数据类型，返回Type对象
	 */
	Json.prototype.getActualType = function(){}
	
	/**
	 * 判断当前数据类型是否是消极的值，不同的类型规则不一致
	 * 
	 * @returns
	 */
	Json.prototype.isNegative = function(){
		var source = this.getSource();
		return this.getActualType().isNegative(source);
	}
	/**
	 * 
	 */
	Json.prototype.getParent = function(){};
	/**
	 * 
	 * @returns {Boolean}
	 */
	Json.prototype.isRoot = function(){
		return this.getParent() === null;
	};
	/**
	 * 
	 * @returns {Json}
	 */
	Json.prototype.getRoot = function(){
		var r = this;
		while(!r.isRoot()){
			r = r.getParent();
		}
		return r;
	}
	/**
	 * 获得Json对象的实际值。针对不是object和array的对象
	 * @returns
	 */
	Json.prototype.value = function(){
		var source = this.getSource();
		if(typeof source !== 'object'){
			return source;
		}else{
			return source.constructor.name;
		}
	}
	
	Json.prototype.toString = function(){
		var source = this.getSource();
		if(source == null){
			return 'null';
		}else if(source === undefined){
			return 'undefined';
		}else{
			return source.toString();
		}
	}
	/**
	 * 判断两个值是否相同
	 * @param another
	 * @returns {Boolean}
	 */
	Json.prototype.equals = function(another){
		if(another instanceof Json){
			return this.getSource() == another.getSource();
		}
	};
	/**
	 * 转换
	 * @param source
	 * @param type
	 * @param context
	 * @return {Json}
	 */
	Json.parse = function(source, type, context){
		if(type.getName() === 'expression'){
			//表达式类型，需要调用上下文和解析器
			var expression = Expression.getExpression(source);
			return expression.invoke(context);
		}else{
			var src = type.parse(source);
			switch(type.getName()){
				case 'string':
				case 'number':
				case 'boolean':
				case 'null':
					return new Json(src);
				case 'object':
					return new JsonObject(src, type, context.getCurrent());
				case 'array':
					return new JsonArray(src);
			}
		}
	}
	
	/**
	 * Json对象类
	 */
	function JsonObject(source, parent){
		Json.call(this, source, Type.Object, parent);
		this.propMap = {};
		
	}
	/**
	 * 
	 * @param propertyName
	 * @returns
	 */
	JsonObject.prototype.get = function(propertyName){
		if(this.has(propertyName)){
			if(!this.propMap[propertyName]){
				var source = this.getSource();
				var propValue = source[propertyName];
				this.propMap[propertyName] = Json.parse(propValue, Type.getTypeOf(propValue), new Context(this, propertyName));
			}
			return this.propMap[propertyName];
		}
	};
	/**
	 * 将属性值转换成新的Json对象，并放到对象当中
	 * @param propertyName 属性名
	 * @param value Json对象或者原始数据
	 * @return 自身
	 */
	JsonObject.prototype.put = function(propertyName, value, valueType){
		if(value instanceof Json){
			var source = this.getSource();
			var valueType = valueType || value.getActualType();
			return this.put(propertyName, source, valueType);
		}else{
			var json = Json.parse(value, valueType || Type.getTypeOf(value), new Context(this, propertyName));
			this.propMap[propertyName] = json;
		}
		return this;
	};
	
	/**
	 * 移除属性
	 * @param propertyName
	 * @returns {JsonObject} 返回自身
	 */
	JsonObject.prototype.remove = function(propertyName){
		this.propMap[propertyName] = undefined;
		this.getSource()[propertyName] = undefined;
		return this;
	}
	
	/**
	 * 
	 * @param propertyName
	 * @returns {Boolean}
	 */
	JsonObject.prototype.has = function(propertyName){
		return this.getSource()[propertyName] !== undefined;
	}
	
	
	
	require('utils').extendClass(JsonObject, Json);
	
	/**
	 * Json数组类
	 */
	function JsonArray(source, parent){
		Json.call(this, Type.Array, Type.Array, parent);
		
		this.get = function(index){
			
		};
		this.add = function(index, element){
			
		};
		this.remove	= function(index){
			
		};
		this.size = function(){
			
		};
	}
	
	require('utils').extendClass(JsonArray, Json);
	
	/**
	 * 执行上下文
	 */
	function Context(current, propName){
		this.p = {
				current	: current,
				propName: propName,
				data	: {}
		};
		if($.isPlainObject(current)){
			$.extend(this.p, current);
		}
	}
	
	/**
	 * 
	 * @returns
	 */
	Context.prototype.getCurrent = function(){
		return this.p.current;
	}
	/**
	 * 
	 * @returns
	 */
	Context.prototype.getPropertyName = function(){
		return this.p.propName;
	}
	
	/**
	 * 
	 */
	function Expression(express){
		
		
	}
	
	/**
	 * 执行表达式，计算返回值
	 * @param context
	 * @returns {Json}
	 */
	Expression.prototype.invoke = function(context){
		return new Json(null);
	}
	
	/**
	 * 
	 * @param expression
	 */
	Expression.getExpression = function(expression){
		var reg = /^#\S+$/;
		if(reg.test(expression)){
			
		}
	}
	
	function Operator(_param){
		var defaultParam = {
			spliter	: null,
			method	: function(left, right){
				
			}
		};
		var param = $.extend({}, defaultParam, _param);
		
		this.getSpliter = function(){
			return param.spliter;
		}
	}
	
	Operator.prototype.invoke = function(){
		
	}
	
	
	
	
	/*
	function Json(source){
		var keyGetter = $.noop;
		this.getKey = function(){
			keyGetter.apply(this, [source]);
		};
		this.setKeyGetter = function(_keyGetter){
			if(typeof _keyGetter === 'function'){
				keyGetter = _keyGetter;
			}
		}
		this.get = function(propertyName){
			
		};
		this.typeOf = function(propertyName){
			return typeof this.get(propertyName);
		};
		
		this.doWith = function(calc, json){
			
		}
		
		var jsonTree = new Json();
		
		function _resolve(express, context){
			var calcExp = /[\+\|\-]/,
				relExp = /(%?[\w_\$]+|\*|\.)/g;
			
			var json = new Json(context);
			var snippets = express.split(calcExp);
			
			var result = new Json();
			
			while(express){
				var calcIndex = express.search(calcExp);
				if(calcIndex >= 0){
					var calcStr = express[calcIndex];
					var prefix = express.substr(0, calcIndex);
					var suffix = express.substr(calcIndex + 1);
					var snippetValue = _resolve(prefix, context);
					result.doWith(calcStr, snippetValue);
					express = suffix;
				}else{
					return json.get(express);
				}
			}
		}
	}*/
});