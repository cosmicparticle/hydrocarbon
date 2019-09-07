define(function(require, exports, module){
	"use strict";
	
	function requireTemplateMap(){
		return require('tmpl').load('media/jv/entity/tmpl/entity-detail-input.tmpl');
	}
	function DetailInput(_param){
		this.param = $.extend({
			type				: null,
			options				: null,
			dfieldId			: null,
			fieldId				: null,
			optionsKey			: null,
			$page				: null,
			labelKey			: null,
			$container			: null,
			fieldOptionsFetcher	: null,
			defaultValue		: ''
		}, _param);
		this.dom = null
		this.name = null;
		var _this = this;
		var ui = {
			builded		: false,
			isShowing	: false,
			isHidding	: false,
			tipError	: function($dom, message){
				var $dom = $($dom);
				function show(){
					ui.isShowing = true;
					$dom.one('shown.bs.tooltip', function(){
						ui.isShowing = false;
					});
					$dom.tooltip({
						title		: message,
						trigger		: 'manual',
						container	: _this.param.$container,
						template	: '<div class="tooltip field-input-error-tip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
					}).tooltip('show');
					ui.builded = true;
					$dom.addClass('field-input-error');
				}
				if(ui.isHidding){
					$dom.one('hidden.bs.tooltip', function(){
						show();
					});
				}else{show()}
			},
			removeError	: function($dom){
				if(!ui.builded){return}
				function hide(){
					ui.isHidding = true;
					$dom.one('hidden.bs.tooltip', function(){
						ui.isHidding = false;
					});
					$dom.removeClass('field-input-error');
					$dom.tooltip('hide');
				}
				if(ui.isShowing){
					$dom.one('shown.bs.tooltip', function(){
						hide();
					});
				}else{hide()}
			}
		};
		this.ui = ui;
		
	}
	
	
	$.extend(DetailInput.prototype, {
		getDetailFieldId	: function(){
			return this.param.dfieldId;
		},
		getName		: function(){
			return this.name;
		},
		setName		: function(name){
			this.name = name;
		},
		appendToFormData	: function(formData, formName){
			var tmplParam = this.getInputTemplateParameter();
			if(tmplParam.formDataAppender){
				return tmplParam.formDataAppender.apply(this, [this.dom, formData, formName]);
			}else{
				var val = this.getValue();
				if(val !== undefined && val !== null){
					formData.set(formName, this.getValue());
				}
			}
		},
		getValue	: function(){
			var tmplParam = this.getInputTemplateParameter();
			return tmplParam.valueGetter.apply(this, [this.dom]);
		},
		setValue	: function(val, initValueFlag){
			var tmplParam = this.getInputTemplateParameter();
			return tmplParam.valueSetter.apply(this, [this.dom, val, initValueFlag]);
		},
		enableDefaultValue	: function(initValueFlag){
			if(this.param.defaultValue){
				this.setValue(this.param.defaultValue, initValueFlag);
			}
		},
		isValueChanged	: function(){
			var tmplParam = this.getInputTemplateParameter();
			if(tmplParam.isValueChanged){
				return tmplParam.isValueChanged(this, [this.dom]);
			}else{
				return true;
			}
		},
		showError		: function(msg, validateLevel, $dom){
			var tmplParam = this.getInputTemplateParameter();
			if(validateLevel == 2){
				this.ui.tipError($dom || tmplParam.getErrorWrapper(this.dom), msg);
			}
			return {
				message		: msg
			}
		},
		removeError		: function($dom){
			var tmplParam = this.getInputTemplateParameter();
			this.ui.removeError($dom || tmplParam.getErrorWrapper(this.dom));
		},
		/**
		 * 校验表单数据
		 * @param validateLevel 校验等级
		 * 		0或者不传入时校验,但不返回错误信息；
		 * 		1时校验所有表单，将错误的表单组装成数组并返回
		 * 		2时校验所有表单，将错误的表单加注信息，并组装成数组后返回
		 */
		validate		: function(validateLevel){
			if(this.dom){
				var result = [];
				var validators = this.param.validators;
				this.removeError();
				if(validators.indexOf('required') >= 0){
					//不为空校验
					if(this.isValueEmpty()){
						result.push(this.showError('表单不能为空', validateLevel));
					}
				}
				//表单自定义的校验
				var tmplParam = this.getInputTemplateParameter();
				if(tmplParam.validate){
					var customValidate = tmplParam.validate.apply(this, [this.dom]);
					if(customValidate){
						$.merge(result, customValidate);
					}
				}
				return result;
			}
			throw new Error('还没有初始化dom，不能进行验证');
		},
		setReadonly		: function(readonlyStatus){
			var tmplParam = this.getInputTemplateParameter();
			tmplParam.setReadonly.apply(this, [this.dom, readonlyStatus]);
		},
		isValueEmpty	: function(){
			var tmplParam = this.getInputTemplateParameter();
			if(this.tmplParam.isValueEmpty){
				return this.tmplParam.isValueEmpty.apply(this, [this.dom]);
			}else{
				return !this.getValue();
			}
		},
		getInputTemplateParameter	: function(){
			if(this.tmplParam){
				return this.tmplParam;
			}
			throw new Error('没有初始化表单的TemplateParameter对象，请调用renderDOM方法');
		},
		renderDOM	: function(preparedCallback){
			var defer = $.Deferred();
			var _this = this;
			if(!this.dom){
				requireTemplateMap()
					.done(function(tmplMap){
						_this._getTemplateParameter().done(function(tmplParam){
							_this.tmplMap = tmplMap;
							_this.dom = tmplMap[tmplParam.tmplKey].tmpl($.extend({
								fieldType	: _this.param.type,
							}, tmplParam.data), tmplParam.events);
							_this.tmplParam = tmplParam;
							tmplParam.bindValueChanged(_this.dom, function(e, initValueFlag){
								if(initValueFlag !== true){
									_this.validate(2)
								}
							});
							tmplParam.afterRender.apply(_this, [_this.dom]);
							defer.resolveWith(_this, [_this.dom]);
						});
						(preparedCallback || $.noop)();
					});
			}else{
				defer.resolveWith(_this, [_this.dom]);
			}
			return defer.promise();
		},
		_getTemplateParameter	: function(){
			var defer = $.Deferred();
			var _this = this;
			function prepare(tmplParamFileName, args){
				var tmplParameter = null;
				if(typeof tmplParamFileName === 'object'){
					tmplParameter = tmplParamFileName;
				}else{
					var TemplateParamter = null;
					if(typeof tmplParamFileName === 'function'){
						TemplateParamter = tmplParamFileName;
					}
					tmplParameter = new TemplateParamter(args);
				}
				tmplParameter.prepare(function(){defer.resolve(tmplParameter)}, defer);
			}
			switch(this.param.type){
				case 'text':
					prepare(require('entity/js/tmpl_param/TextInputTemplateParameter'));
					break
				case 'int':
					prepare(require('entity/js/tmpl_param/IntInputTemplateParameter'));
					break
				case 'decimal':
					prepare(require('entity/js/tmpl_param/DecimalInputTemplateParameter'));
					break;
				case 'date':
					prepare(require('entity/js/tmpl_param/DateInputTemplateParameter'), {
						$container	: this.param.$container
					});
					break;
				case 'select':
					prepare(require('entity/js/tmpl_param/SelectInputTemplateParameter'), {
						optionsKey			: this.param.fieldId,
						options				: this.param.options,
						fieldOptionsFetcher	: this.param.fieldOptionsFetcher
					});
					break;
				case 'preselect':
					prepare(require('entity/js/tmpl_param/SelectInputTemplateParameter'), {
						optionsKey			: this.param.fieldId,
						options				: this.param.options,
						fieldOptionsFetcher	: this.param.fieldOptionsFetcher,
						withoutEmpty		: false,
						tags				: true
					});
					break;
				case 'caselect':
					prepare(require('entity/js/tmpl_param/CaselectInputTemplateParameter'), {
						optionsKey			: this.param.optionsKey,
						$container			: this.param.$container
					});
					break;
				case 'label':
				case 'multiselect':
					prepare(require('entity/js/tmpl_param/MultiSelectInputTemplateParameter'), {
						optionsKey			: this.param.fieldId,
						options				: this.param.options,
						fieldOptionsFetcher	: this.param.fieldOptionsFetcher
					});
					break;
				case 'file':
					prepare(require('entity/js/tmpl_param/FileInputTemplateParameter'))
					break;
				default	:
					prepare(new AbstractTemplateParameter());
			}
			return defer.promise();
		}
	});
	
	
	
	function AbstractTemplateParameter(){
		this.tmplKey = 'input-unknown';
		this.data = {};
		this.events = {};
		this.valueChanged = true;
		var _this = this;
		this.isValueChanged = function($dom){
			return _this.valueChanged;
		}
		this.setValueChanged = function(valueChanged){
			_this.valueChanged = valueChanged;
		}
	}
	AbstractTemplateParameter.prototype.prepare = function(resolve){resolve()};
	AbstractTemplateParameter.prototype.valueGetter = function($dom){};
	AbstractTemplateParameter.prototype.valueSetter = function($dom){};
	AbstractTemplateParameter.prototype.afterRender = function($dom){};
	AbstractTemplateParameter.prototype.setReadonly = function($dom){};
	AbstractTemplateParameter.prototype.setDisabled = function($dom){};
	AbstractTemplateParameter.prototype.validate = function($span, ui){};
	AbstractTemplateParameter.prototype.formDataAppender = null;
	AbstractTemplateParameter.prototype.bindValueChanged = $.noop;
	AbstractTemplateParameter.prototype.getErrorWrapper = function($dom){return $dom};
	AbstractTemplateParameter.prototype.setReadonly = function($dom, readonlyStatus){};
	
	DetailInput.AbstractTemplateParameter = AbstractTemplateParameter;
	
	module.exports = DetailInput;
});