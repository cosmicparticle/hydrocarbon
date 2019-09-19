/**
 * 人口编辑的编辑功能中，用于匹配生成适用于对应字段的表单
 */
define(function(require, exports, module) {
	"use strict";
	var Dialog = require('dialog');
	function FieldInput(_param) {
		var defaultParam = {
			// 字段类型
			// text ： 普通文本
			// textarea ： 长文本
			// int ：整数
			// decimal ：小数
			// select ： 单选下拉框
			// preselect ：单选可编辑下拉框
			// multiselect : 多选下拉框
			// caseelect : 级联下拉框
			// checkbox : 多选
			// radio : 单选
			// date : 日期选择
			// time : 时间选择
			// datetime : 日期时间选择
			// daterange : 日期范围选择
			// datetimerange : 日期时间范围选择
			// autocomplete : 自动完成框
			// label : 多选标签
			// image : 图片文件
			// file : 文件
			// range : 文本范围
			type : 0,
			// 表单的name（提交的字段名）
			name : null,
			// 表单的id
			id : null,
			// 默认显示的值
			value : null,
			// 要添加的class
			styleClass : '',
			readonly : false,
			// 当类型是select、checkbox、radio时，可用的选项
			// 数组的元素有三个属性（view/value/attrs)
			options : null,
			// 当没有传入options，但是传入optionKey时，
			// 会自动去FieldInput.GLOBAL_OPTIONS中根据该key去获取options
			optionsKey : null,
			// 当没有传入options和optionsKey，并且optionsSet不为空时，会将其转换成options
			optionsSet : '',
			// 用于标记字段，只在类型是label时有效
			fieldKey : null,
			// 已经生成的表单元素，如果传入了该值，那么就不会根据其他参数再生成表单元素
			$dom : null,
			// 检测表单的函数，如果错误，返回错误信息(string)，否则检测成功
			validator : $.noop,
			$page : null,
			$container : null
		};

		var param = $.extend({}, defaultParam, _param);
		var _this = this;
		if (!param.options) {
			if (param.optionsKey != undefined) {
				param.options = FieldInput.GLOBAL_OPTIONS[param.optionsKey];
			} else {
				if (param.optionsSet) {
					param.options = resolveOptionsSet(param.optionsSet);
				}
			}
		}
		if (!param.$container || param.$container.length == 0) {
			if (!param.$page || param.$page.length == 0) {
				param.$container = $(document.body);
			} else {
				param.$container = param.$page.find('.field-input-container');
				if (param.$container.length == 0) {
					param.$container = param.$page;
				}
			}
		}
		var ui = {
			tipError : function($dom, message) {
				var $dom = $($dom);
				$dom
						.tooltip(
								{
									title : message,
									trigger : 'manual',
									container : param.$container,
									template : '<div class="tooltip field-input-error-tip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
								}).tooltip('show');
				$dom.addClass('field-input-error');
			},
			removeError : function($dom) {
				$dom.removeClass('field-input-error');
				$dom.tooltip('destroy');
			}
		};
		function resolveOptionsSet(arg) {
			if (typeof arg === 'string') {
				arg = arg.trim();
				try {
					var arr = $.parseJSON(arg);
					if ($.isArray(arr)) {
						return arr;
					} else {
						$.error();
					}
				} catch (e) {
					var matcher = arg.match(/^\[(([^\,]+\,?)*)\]$/);
					if (matcher != null) {
						var mainSnippet = matcher[1];
						var reg = /([^\,]+)\,?/g;
						var snippet;
						var arr = [];
						do {
							snippet = reg.exec(mainSnippet);
							if (snippet) {
								arr.push(snippet[1].trim());
							}
						} while (snippet);
						for ( var i in arr) {
							arr[i] = {
								view : arr[i],
								value : arr[i]
							}
						}
						return arr;
					}
				}
			}
		}
		/**
		 * 检查构造表单元素的参数是否正常
		 */
		function checkBuildParam() {
		}

		function setNormalAttrs($dom) {
			if (param.name) {
				$dom.attr('name', param.name);
			}
			if (param.id) {
				$dom.attr('id', param.id);
			}
			$dom.change(function(e, ignoredTrigger) {
				if (ignoredTrigger !== true) {
					_this.__triggerValueChanged();
				}
			});
		}
		;

		var domBuilder = {
			// 普通文本框
			'text' : function() {
				var $text = $('<input type="text" />');
				setNormalAttrs($text);
				if (param.value) {
					$text.val(param.value);
				}
				return $text;
			},
			// 长文本输入
			'textarea' : function() {
				var $ta = $('<textarea></textarea>');
				setNormalAttrs($ta);
				if (param.value) {
					$ta.val(param.value);
				}
				return $ta;
			},
			'password' : function() {
				var Utils = require('utils');
				var $span = $('<span class="cpf-field-input-password">');
				var $view = $('<span class="cpf-field-input-password-view">')
						.appendTo($span);
				var $psd = $('<input type="password" autocomplete="off"/>')
						.attr('id', Utils.uuid()), $repsd = $(
						'<input type="password" autocomplete="off" />').attr(
						'id', Utils.uuid());
				var $psdContainer = $(
						'<span class="cpf-field-input-password-wrapper">')
						.append($psd).append($repsd);
				var disabled = false;
				var valueChanged = false;
				$span.attr('id', param.id);
				var viewVal = '******';
				if (param.value) {
					$psd.val(param.value);
					$repsd.val(param.value);
					$view.text(viewVal);
				}
				$view.click(function() {
					if (!disabled) {
						$psdContainer.appendTo($span);
						$psd.focus();
					}
				});
				$psd
						.add($repsd)
						.blur(
								function() {
									setTimeout(
											function() {
												if (document.activeElement.id !== $psd[0].id
														&& document.activeElement.id !== $repsd[0].id) {
													checkPasswordDiff();
												}
											}, 50);
								});
				$span.val = function() {
					return $psd.val();
				};
				$span.funcMap = {
					setDisabled : function(toDisabled) {
						disabled = toDisabled != false;
					},
					setReadonly : function(toReadonly) {
						disabled = toReadonly != false;
					},
					getSubmitData : function() {
						return $span.val();
					},
					isValueChanged : function() {
						return valueChanged;
					},
					validate : function(ui) {
						return checkPasswordDiff();
					}
				}
				$span.addClass('cpf-field-input').data('fieldInputObject',
						_this);
				function checkPasswordDiff() {
					var val1 = $psd.val(), val2 = $repsd.val();
					if (!val1 && !val2) {
						$view.text('');
						valueChanged = true;
						ui.removeError($span);
						$psdContainer.detach();
					} else if (val1 === val2) {
						$view.text(viewVal);
						valueChanged = true;
						ui.removeError($span);
						$psdContainer.detach();
					} else {
						$span.addClass('cpf-field-input-password-invalid');
						ui.tipError($span, '密码不一致');
						return false;
					}
				}
				return $span;
			},
			'int' : function() {
				var $text = $('<input type="text" />');
				setNormalAttrs($text);
				$text.on('input', function() {
					this.value = this.value.replace(/[^\d\-]/g, '').replace(
							/(\d+)\-+(\d*)/, '$1$2').replace(/\-+/, '-');
				})
				if (param.value) {
					$text.val(param.value);
				}
				return $text;
			},
			'decimal' : function() {
				var $text = $('<input type="number" />');
				setNormalAttrs($text);
				if (param.value) {
					$text.val(param.value);
				}
				return $text;
			},
			// 下拉选择框
			'select' : function(withoutEmpty, tags) {
				var $span = $('<span class="field-input-wrapper">');
				var $select = $('<select>').appendTo($span);
				setNormalAttrs($select);
				var shouldSetValue = param.value !== undefined
						&& param.value !== '';
				if (withoutEmpty != true) {
					var $defOption = $('<option value="">--请选择---</option>');
					$select.append($defOption);
					$select.val('');
				}
				if ($.isArray(param.options)) {
					var optionsHasValue = false;

					for ( var i in param.options) {
						var option = param.options[i];
						if (option.view) {
							// 构造选项dom
							var $option = $('<option>');
							// 显示内容
							$option.text(option.view);
							// 设置属性
							if (typeof option.attrs === 'object') {
								$option.attr(option.attrs);
							}
							// 设置选项值
							if (option.value) {
								$option.attr('value', option.value);
							}
							if (shouldSetValue && option.value === param.value) {
								optionsHasValue = true;
							}
							$select.append($option);
						}
					}
					if (tags !== null && $.fn.select2) {
						var tagsParam = {
							tags : true,
							closeOnSelect : false
						}
						$select.select2($.extend({
							theme : "bootstrap",
							width : null
						}, tags === true ? tagsParam : {}));
						if (tags === true) {
							if (shouldSetValue && !optionsHasValue) {
								$select.append($('<option>').attr('value',
										param.value).text(param.value));
							}
							var $optionSearcher = function() {
								return $('.select2-container--open .select2-search__field')
							};
							var permitClose = false;
							$(document).on('keyup', $optionSearcher(),
									function(e) {
										if (e.keyCode === 13) {
											permitClose = true;
											$select.select2('close');
										}
									});
							$select.on(
									'select2:select',
									function(e) {
										$optionSearcher().val(
												e.params.data.text).focus()
												.select();
									}).on(
									'select2:closing',
									function(e) {
										if (!permitClose) {
											var $searcher = $optionSearcher();
											permitClose = true;
											e.preventDefault();
											$select.val($searcher.val())
													.trigger('change').select2(
															'close');
										}
									}).on('select2:close', function(e) {
								if (!permitClose) {
									e.preventDefault();
									permitClose = true;
								}
							}).on('select2:open', function(e) {
								permitClose = false;
							});
						}
					}
					if (param.value !== undefined && param.value !== '') {
						$select.val(param.value).trigger('change');
					}
				}
				$span.val = function(value, ignoredChange) {
					if (arguments.length > 0) {
						$select.val(value);
						$select.trigger('change', [ ignoredChange ]);
					} else {
						return $select.val();
					}
				};
				$span.funcMap = {
					setReadonly : function(toReadonly) {
						if (toReadonly == false) {
							$select.removeAttr('disabled');
							var $hidden = $select.data('instead-input');
							if ($hidden) {
								$hidden.remove();
							}
						} else {
							var val = $select.val();
							$select.attr('disabled', 'disabled');
							var formName = $select.attr('name');
							if (formName) {
								var $hidden = $('<input type="hidden" />')
										.attr('name', formName).val(val);
								$select.after($hidden).data('instead-input',
										$hidden);
							}
						}
					}
				};
				return $span;
			},
			'preselect' : function() {
				return this['select'](false, true);
			},
			'select-without-empty' : function() {
				return this['select'](true, null);
			},
			'date' : function() {
				var $text = this['text']();
				var value = param.value;
				var Utils = require('utils');
				if (typeof value === 'number') {
					value = Utils.formatDate(value, 'yyyy-MM-dd');
				}
				if (typeof value === 'string') {
					$text.val(value);
				}
				$text.addClass('field-input-readonly').attr('readonly',
						'readonly').keydown(function(e) {
					if (e.keyCode == 8) {
						$text.val('');
						return false;
					}
				});
				Utils.datepicker($text, param.$container, param.$container);
				$text.funcMap = {
					setReadonly : function(toReadonly) {
						if (toReadonly == false) {
							Utils
									.datepicker($text, scrollEle,
											param.$container);
						} else {
							$text.datetimepicker('remove');
						}
					}
				};
				return $text;
			},
			'yearmonth' : function() {
				var $text = this['text']();
				var value = param.value;
				var Utils = require('utils');
				if (typeof value === 'number') {
					value = Utils.formatDate(value, 'yyyy-MM');
				}
				if (typeof value === 'string') {
					$text.val(value);
				}
				$text.addClass('field-input-readonly').attr('readonly',
						'readonly').keydown(function(e) {
					if (e.keyCode == 8) {
						$text.val('');
						return false;
					}
				});
				Utils
						.yearMonthPicker($text, param.$container,
								param.$container);
				$text.funcMap = {
					setReadonly : function(toReadonly) {
						if (toReadonly == false) {
							Utils.yearMonthPicker($text, scrollEle,
									param.$container);
						} else {
							$text.datetimepicker('remove');
						}
					}
				};
				return $text;
			},
			'datetime' : function() {
				var $text = this['text']();
				var value = param.value;
				var Utils = require('utils');
				if (typeof value === 'number') {
					value = Utils.formatDate(value, 'yyyy-MM-dd hh:mm:ss');
				}
				if (typeof value === 'string') {
					$text.val(value);
				}
				$text.addClass('field-input-readonly').attr('readonly',
						'readonly').keydown(function(e) {
					if (e.keyCode == 8) {
						$text.val('');
						return false;
					}
				});
				Utils.datetimepicker($text, param.$container, param.$container);
				$text.funcMap = {
					setReadonly : function(toReadonly) {
						if (toReadonly == false) {
							Utils
									.datepicker($text, scrollEle,
											param.$container);
						} else {
							$text.datetimepicker('remove');
						}
					}
				};
				return $text;
			},
			'time' : function() {
				var $text = this['text']();
				var value = param.value;
				var Utils = require('utils');
				if (typeof value === 'number') {
					value = Utils.formatDate(value, 'hh:mm:ss');
				}
				if (typeof value === 'string') {
					$text.val(value);
				}
				$text.addClass('field-input-readonly').attr('readonly',
						'readonly').keydown(function(e) {
					if (e.keyCode == 8) {
						$text.val('');
						return false;
					}
				});
				Utils.timepicker($text, param.$container, param.$container);
				$text.funcMap = {
					setReadonly : function(toReadonly) {
						if (toReadonly == false) {
							Utils
									.timepicker($text, scrollEle,
											param.$container);
						} else {
							$text.datetimepicker('remove');
						}
					}
				};
				return $text;
			},
			'checkbox' : function() {
				return this['multiselect']('options');
			},
			'label' : function() {
				return this['multiselect']('labels');
			},
			'relation_existion' : function() {
				return this['multiselect']('options');
			},
			'multiselect' : function(source) {
				var options = null;
				if (!source) {
					if ($.isArray(param.options)) {
						source = 'options';
					} else if (param.fieldKey) {
						source = 'labels';
					}
				}

				if (source === 'options') {
					options = param.options;
				} else if (source === 'labels') {
					options = FieldInput.GLOBAL_LABELS[param.fieldKey];
				}

				if ($.isArray(options)) {
					var strOptions = [];
					if (options.length > 0) {
						if (typeof options[0] === 'object') {
							for ( var i in options) {
								strOptions[i] = options[i].value;
							}
						} else if (typeof options[0] === 'string') {
							$.merge(strOptions, options);
						}
					}
					var $div = $('<div>');
					$div
							.append('<span class="cpf-select-sign cpf-select-sign-and"></span>')
					var $select = $('<select multiple="multiple" >').appendTo(
							$div);
					setNormalAttrs($select);
					if (param.styleClass) {
						$select.addClass(param.styleClass);
					}
					var S2 = require('select2');
					if ($.fn.select2) {
						$select.select2({
							theme : "bootstrap",
							width : null,
							data : strOptions

						});
					}
					$div.val = function(value, trigger) {
						if (value === undefined) {
							var v = $select.val();
							if (typeof v === 'string') {
								return v;
							} else if (!v) {
								return '';
							} else if ($.isArray(v)) {
								return v.join();
							}
						} else if (typeof value === 'string') {
							return $div.val(value.split(','), trigger);
						} else if ($.isArray(value)) {
							$select.val(value).trigger('change');
							return $div;
						}
					}
					$div.funcMap = {
						setReadonly : function(toReadonly) {
							if (toReadonly == false) {
								$select.removeAttr('disabled');
							} else {
								$select.attr('disabled', 'disabled');
							}
						}
					};
					if (param.value) {
						$div.val(param.value, false);
					}
					return $div;
				}
			},
			'caselect' : function() {
				var CAS_SPLITER = '->';
				var disabled = false;
				var valueChanged = true;
				var $span = $('<span class="cpf-field-input-caselect">');
				var $input = $('<span class="cpf-field-input-caselect-input">');
				var $selSpan = $('<span class="cpf-field-input-caselectt-sels">');
				$span.append($input);

				$input.click(function(e) {
					e.stopImmediatePropagation();
					if (!disabled) {
						require('utils').instead($input, $selSpan,
								param.$container);
						$input.show().css('visibility', 'hidden');
						var blur = function(e1) {
							if ($(e1.target).closest($selSpan).length == 0) {
								$selSpan.hide();
								$input.text($span.val()).css('visibility',
										'visible');
								_this.validate();
								$(document.body).off('click', blur);
							}
						}
						$(document.body).on('click', blur);
					}
					return false;
				});

				var atIndex = param.optionsKey.indexOf('@');
				if (param.optionsKey && atIndex > 0) {
					var fieldGroupId = param.optionsKey.substring(0, atIndex), fieldLevel = parseInt(param.optionsKey
							.substring(atIndex + 1, param.optionsKey.length));
					for (var i = 1; i <= fieldLevel; i++) {
						var $select = $('<select><option value="">--请选择--</option></select>');
						$select.change(function() {
							var $this = $(this);
							var groupId = $this.val();
							appendOption($this.next('select'), groupId);
						});
						$selSpan.append($select);
					}
					var appendOption = function($select, groupId, val) {
						var def = $.Deferred();
						if ($select && $select.length > 0) {
							var $next = $select;
							while ($next.length > 0) {
								$next.children('option:gt(0)').remove();
								$next = $next.next('select');
							}
							if (groupId) {
								require('ajax')
										.ajax(
												'admin/field/cas_ops/'
														+ groupId,
												{},
												function(data) {
													if (data.status === 'suc') {
														for ( var i in data.options) {
															var option = data.options[i];
															$select
																	.append('<option value="'
																			+ option.id
																			+ '">'
																			+ option.title
																			+ '</option>');
														}
														if (typeof val === 'string'
																&& val) {
															var thisVal = val;
															var spliterIndex = val
																	.indexOf(CAS_SPLITER);
															if (spliterIndex >= 0) {
																thisVal = val
																		.substring(
																				0,
																				spliterIndex);
															}
															groupId = $select
																	.children(
																			'option')
																	.filter(
																			function() {
																				return this.text === thisVal
																			})
																	.attr(
																			'value');
															if (groupId) {
																$select
																		.val(groupId);
																val = val
																		.substring(
																				spliterIndex + 2,
																				val.length);
																return appendOption(
																		$select
																				.next('select'),
																		groupId,
																		val)
																		.done(
																				function(
																						valArr) {
																					def
																							.resolve($
																									.merge(
																											[ thisVal ],
																											valArr));
																				});
															}
														}
														def.resolve([ '' ]);
													}
												}, {
													method : 'GET',
													cache : true
												});
							}
						} else {
							def.resolve([]);
						}
						return def.promise();
					}
					$span.val = function(val) {
						if (val === undefined) {
							val = '';
							$selSpan.children('select').each(
									function() {
										var $select = $(this);
										if ($select.val() !== '') {
											val += require('utils')
													.getCheckedOption($select)
													.text()
													+ CAS_SPLITER;
										} else {
											return false;
										}
									});
							if (val != '') {
								val = val.substring(0, val.length
										- CAS_SPLITER.length);
							}
							return val;
						} else if (typeof val === 'string') {
							appendOption($selSpan.children('select').eq(0),
									fieldGroupId, val)
									.done(
											function(valArr) {
												var valStr = '';
												for ( var i in valArr) {
													if (valArr[i]) {
														valStr += valArr[i]
																+ CAS_SPLITER;
													}
												}
												if (valStr != '') {
													valStr = valStr
															.substring(
																	0,
																	valStr.length
																			- CAS_SPLITER.length);
												}
												$input.text(valStr);
											});
						}
					};
					$span.funcMap = {
						setDisabled : function(toDisabled) {
							disabled = toDisabled != false;
						},
						setReadonly : function(toReadonly) {
							disabled = toReadonly != false;
						},
						getSubmitData : function() {
							return $span.val();
						},
						isValueChanged : function() {
							return valueChanged;
						},
						validate : function(ui) {
							var completed = true;
							if ($span.val()) {
								$selSpan.children('select').each(function() {
									if (!$(this).val()) {
										completed = false;
										return false;
									}
								});
							}
							if (!completed) {
								ui.tipError($input, '级联属性不完整');
								return false;
							} else {
								ui.removeError($input);
							}
						}
					};
					$span.addClass('cpf-field-input').data('fieldInputObject',
							_this);
					$span.val(param.value || '');
					return $span;
				}
			},
			'range' : function() {
				var $start = $('<input type="text" />'), $end = $('<input type="text" />'), $div = $('<span class="field-input-range">');
				$div.append($start);
				$div.append('~');
				$div.append($end);
				$div.val = function(value) {
					if (!value) {
						var start = $start.val(), end = $end.val();
						return start + '~' + end;
					} else {
						if (typeof value === 'string') {
							var split = value.split('~');
							$start.val(split[0]);
							$end.val(split[1]);
						}
					}
				};
				$div.funcMap = {
					isEmpty : function() {
						return $start.val() === '' && $end.val() === '';
					}
				};
				if (param.value) {
					$div.val(param.value);
				}
				return $div;
			},
			'daterange' : function() {
				var $start = $('<input type="text" />'), $end = $('<input type="text" />'), $div = $('<span class="field-input-date-range">');
				$div.append($start);
				$div.append('~');
				$div.append($end);
				require('utils').datepicker($start).on('changeDate',
						function() {
							var start = $(this).val() || '0-0-0';
							$end.datetimepicker('setStartDate', start);
							_this.__triggerValueChanged();
						});
				require('utils').datepicker($end).on('changeDate', function() {
					var end = $(this).val() || '9999-12-31';
					$start.datetimepicker('setEndDate', end);
					_this.__triggerValueChanged();
				});
				$div.val = function(value) {
					if (!value) {
						var start = $start.val(), end = $end.val();
						return start + '~' + end;
					} else {
						if (typeof value === 'string') {
							var split = value.split('~');
							$start.val(split[0]).trigger('changeDate');
							$end.val(split[1]).trigger('changeDate');
						}
					}
				};
				$div.funcMap = {
					isEmpty : function() {
						return $start.val() === '' && $end.val() === '';
					}
				};
				if (param.value) {
					$div.val(param.value);
				}
				return $div;
			},
			'image' : function() {
				return this['file']({
					accept : 'image/*'
				});
			},
			'file' : function(_param) {
				var fileParam = $.extend({
					// multiple : false, //是否多选
					maxSize : 4096
				// 文件不得大于4M
				}, _param);

				var $container = $('<span class="cpf-file-input-container cpf-field-input">');

				var $thumb = $('<span class="cpf-file-input-thumb">');
				$container.append($thumb);

				var originFileURL = null;
				var fileChanged = null;
				var inputFile;
				var $fileInput = $('<input type="file" />').change(function(e) {
					var files = e.currentTarget.files;
					if (files && files.length == 1) {
						var file = files.item(0);
						setFile({
							file : file
						});
					}
					$(this).val('');
				});
				var $operates = $('<span class="cpf-file-input-operates">')
						.append(
								$('<i class="fa fa-times">').click(
										function() {
											require('dialog').confirm(
													'是否移除该文件？', function(yes) {
														if (yes) {
															showFileChooser();
															fileChanged = true;
														}
													});
										})).append(
								$('<i class="fa fa-download">').click(
										function() {
											if (originFileURL) {
												require('ajax').download(
														originFileURL);
											}
										}));

				function setFile(fileData) {
					if (fileData.file) {
						// 通过浏览器选择的文件
						if (fileData.file.size > fileParam.maxSize * 1024) {
							// 大小限制
							return showError('文件大小不得超过' + fileParam.maxSize
									+ 'KB');
						}
						if (/^image\/.+$/.test(fileData.file.type)) {
							// 图片文件，进行预览
							var reader = new FileReader();
							reader.onload = function(e1) {
								showPicFile(fileData.file.name,
										e1.target.result, true)
							};
							reader.readAsDataURL(fileData.file);
						} else {
							// 其他类型文件，展示内置图标
							showUnpicFile(fileData.file.name, true);
						}
						inputFile = fileData.file;
						$operates.find('.fa-download').hide();
						fileChanged = true;
					} else if (fileData.src || fileData.url) {
						var src = fileData.src || fileData.url;
						var index = src.lastIndexOf('/');
						if (index >= 0) {
							var fileName = src.substring(index + 1, src.length);
							if (require('utils').isPhoto(fileName)) {
								// 图片文件
								showPicFile(fileName, src, false);
							} else {
								showUnpicFile(fileName, false);
							}
							originFileURL = src;
						}
					}
				}
				function showPicFile(fileName, fileSrc, isLocated) {
					$operates.detach();
					$thumb.empty().append(
							$('<img>').attr('src', fileSrc).attr('alt',
									fileName).attr('title', fileName).addClass(
									isLocated ? 'cpf-file-located' : ''))
							.append($operates);
				}
				function showUnpicFile(fileName, isLocated) {
					$operates.detach();
					$thumb
							.empty()
							.append(
									$('<img>')
											.attr('src',
													getFileIconSrc(fileName))
											.attr('alt', fileName)
											.attr('title', fileName)
											.addClass(
													isLocated ? 'cpf-file-located'
															: '')
											.attr('onerror',
													'this.src="media/common/plugins/icons/OTHER.ico"'))

							.append($operates);
				}

				function getFileIconSrc(fileName) {
					var dotIndex = fileName.lastIndexOf('.');
					if (dotIndex >= 0) {
						var suffix = fileName.substring(dotIndex + 1,
								fileName.length);
						return 'media/common/plugins/icons/'
								+ suffix.toUpperCase() + '.png';
					}
					return;
				}

				function showError(msg) {
					require('dialog').notice(msg, 'error');
				}

				function showFileChooser() {
					originFileURL = null;
					$operates.detach();
					$thumb.empty().append($('<i>').click(function() {
						$fileInput.trigger('click')
					}));
				}

				var fileSrc = param.value;
				if (fileSrc) {
					setFile({
						src : fileSrc
					});
				} else {
					showFileChooser();
				}
				fileChanged = false;
				$container.val = function(value) {
					if (!value) {
						if (inputFile) {
							// 如果是选择文件后要上传的，则返回文件对象
							return inputFile;
						} else {
							// 其他情况下是传入文件的url，
							// 那么返回当前控件的文件是否有被修改过的标记
							return '';
						}
					} else {
						// 设置值
						if (value instanceof File) {
							setFile({
								file : file
							});
						} else if (typeof value === 'object') {
							setFile(file);
						} else if (typeof value === 'string') {
							setFile({
								url : value
							});
						}
					}
				};
				$container.funcMap = {
					setDisabled : function(toDisabled) {
						if (toDisabled) {
							$operates.find('.fa-times').hide();
						} else {
							$operates.find('.fa-times').show();
						}
					},
					setReadonly : function(toReadonly) {
						if (toReadonly != false) {
							$container.addClass('file-readonly');
							$operates.find('.fa-times').hide();
							if (inputFile == null && !originFileURL) {
								$thumb.text('无文件');
							}
						} else {
							$container.removeClass('file-readonly');
							$operates.find('.fa-times').show();
							if (inputFile == null && !originFileURL) {
								$thumb.html('<i></i>');
							}
						}
					},
					getSubmitData : function() {
						return $container.val();
					},
					isValueChanged : function() {
						return fileChanged;
					}
				};
				$container.data('fieldInputObject', _this);
				if (param.readonly === true) {
					$container.funcMap.setReadonly(true);
				}
				return $container;

			},
			'refselect' : function() {
				var pa = _param;

				var menuid = pa.menuid ? pa.menuid : mainmenuid;

				var $container = $('<span class="cpf-refselect-input-container cpf-field-input">');

				var $thumb = $('<span class="cpf-refselect-input-thumb">');
				
				var $operates = $('<span class="cpf-refselect-input-operates">')
				.append(
						$('<i class="fa fa-times">').click(
								
								function() {
									var $this = $(this);
									$this.closest('span .cpf-refselect-input-thumb');
									require('dialog').confirm(
											'是否移除该引用？', function(yes) {
												if (yes) {
													setValue("", $thumb);
												}
											});
								}));
				
				setValue(pa.value, $thumb);
				$container.append($thumb);
				var $page = $container;

				function setValue(value, $thumb) {
					$thumb.html("");
					var $code = $('<input   type="hidden" />');
					setNormalAttrs($code);
					$code.val(value.substring(0, 32));
					var $i;
					$thumb.append($code);
					if (!value) {
						$i=$('<i group-id class="open-select-dialog"> <i/> ');
						$thumb.append($i);
						$i.click(function() {
							var $this = $(this);
							var existCodes = [];
							var fields = [ pa.refcognitiontitle,
									pa.refshowtitle ];
							Dialog.openDialog(
											"admin/modules/curd/rel_selection/"
													+ menuid + '/'
													+ pa.refgroupid,
											undefined,
											undefined,
											{
												width : 1000,
												height : 400,
												onSubmit : function(entitiesLoader) {
													appendRelValue(
															entitiesLoader,
															fields,
															$this.closest('span .cpf-refselect-input-thumb'));
												}
											});

						}
								);
						
					} else {
						$i=$('<i  class="open-detail-dialog" group-id > ' + value.substring(32) + ' <i/>');
						$i.attr('code',value.substring(0, 32));
						$thumb.append($i);
						$i.click(
								function() {
									var $this = $(this);
									var existCodes = [];
									var fields = [ pa.refcognitiontitle,
											pa.refshowtitle ];
									Dialog.openDialog(
													"admin/modules/curd/detail/"
															+ menuid + '/'+pa.refgroupid+'/'
															+ $this.attr("code"),
													undefined,
													undefined,
													{
														width : 1000,
														height : 500
													});

								});
						$thumb.append($operates);
					}
					
				}

				

				function appendRelValue(entitiesLoader, fields, $span) {

					entitiesLoader(fields)
							.done(
									function(entities) {
										console.log(entities);
										if (entitiesLoader.codes.length > 0) {
											var value = entitiesLoader.codes[0]
													+ entities[entitiesLoader.codes[0]][fields[1]];
											setValue(value, $span);
										}
									});
				}
				
				

				
				$container.funcMap = {
					setDisabled : function(toDisabled) {
						if (toDisabled) {
							$operates.find('.fa-times').hide();
						} else {
							$operates.find('.fa-times').show();
						}
					},
					setReadonly : function(toReadonly) {
						if (toReadonly != false) {
							$container.addClass('ref-readonly');
							$operates.find('.fa-times').hide();
							if (!pa.value) {
								$thumb.text('无');
							}
						} else {
							$container.removeClass('ref-readonly');
							if (!pa.value) {
								setValue("",$thumb);
							}
						}
					},
					getSubmitData : function() {
						return $container.val();
					}
					
				};
				
				if (param.readonly === true) {
					$container.funcMap.setReadonly(true);
				}

				return $container;
			},
			'relselect' : function() {
				var pa = _param;

				var menuid = pa.menuid ? pa.menuid : pa.mainmenuid;

				var $container = $('<span class="cpf-refselect-input-container cpf-field-input">');

				var $thumb = $('<span class="cpf-refselect-input-thumb">');

				setValue(pa.value, $thumb);
				$container.append($thumb);
				var $page = $container;

				function setValue(value, $thumb) {
					$thumb.html("");
					
					if(!pa.refgroupid){
						$thumb.append(value.substring(32));
						$container.removeClass("cpf-refselect-input-container");
						$thumb.removeClass("cpf-refselect-input-thumb");
						return;
					}
					
					var $i;

					$i = $('<i  class="open-detail-dialog" group-id > '
							+ value.substring(32) + ' <i/>');
					$i.attr('code', value.substring(0, 32));
					$thumb.append($i);
					$i.click(function() {
						var $this = $(this);
						var existCodes = [];
						var fields = [ pa.refcognitiontitle, pa.refshowtitle ];
						Dialog.openDialog("admin/modules/curd/detail/" + menuid
								+ '/' + pa.refgroupid + '/'
								+ $this.attr("code"), undefined, undefined, {
							width : 1000,
							height : 500
						});

					});
				}

				$container.funcMap = {
					setDisabled : function(toDisabled) {
						
					},
					setReadonly : function(toReadonly) {
						if (toReadonly != false) {
							$container.addClass('ref-readonly');
							if (!pa.value) {
								$thumb.text('无');
							}
						} else {
							$container.removeClass('ref-readonly');
							if (!pa.value) {
								setValue("",$thumb);
							}
						}
					},
					getSubmitData : function() {
						return $container.val();
					}
					
				};
				
				//不管三七二十一，都是只读
				$container.funcMap.setReadonly(true);
				

				return $container;
			}
		};

		this.__buildDom = function() {
			checkBuildParam();
			var $dom = (param.type && domBuilder[param.type] || function() {
				return $('<input type="hidden" />')
			}).apply(domBuilder);
			return $dom;
		};

		this.getName = function() {
			return param.name;
		}

		this.getType = function() {
			return param.type;
		}
		/**
		 * 根据参数生成表单元素（只生成一次）
		 */
		this.getDom = function() {
			if (param.$dom) {
				return param.$dom;
			} else {
				param.$dom = this.__buildDom();
				if (param.$dom) {
					try {
						if (param.readonly) {
							this.setReadonly();
						}
					} catch (e) {
					}
				}
				return param.$dom;
			}
		};
		/**
		 * 获得当前表单的值
		 */
		this.getValue = function() {
			switch (param.type) {
			case 'label':
				/*
				 * var labels = [];
				 * this.getDom().find(':checkbox:checked').each(function(){
				 * labels.push($(this).val()); }); return labels; break;
				 */
			case 'select':
			default:
				try {
					return this.getDom().val();
				} catch (e) {
					return '';
				}

			}
		};
		/**
		 * 手动设置当前表单的值
		 */
		this.setValue = function(val, ignoreTrigger) {
			switch (param.type) {
			case 'select':
			default:
				try {
					this.getDom().val(val, ignoreTrigger);
				} catch (e) {

				}

			}
			if (!ignoreTrigger) {
				this.__triggerValueChanged();
			}
		}

		function onSelectFocus() {
			this.defaultIndex = this.selectedIndex
		}
		function onSelectChange() {
			this.selectedIndex = this.defaultIndex
		}
		function onSelectMousedown() {
			return false
		}

		this.setDisabled = function(toDisabled) {
			var $dom = this.getDom();
			if ($dom.funcMap
					&& typeof $dom.funcMap['setDisabled'] === 'function') {
				$dom.funcMap['setDisabled'](toDisabled);
			} else {
				var $inputs = $dom.filter(':input').add($dom.find(':input'));
				if (toDisabled != false) {
					$inputs.each(function() {
						var $input = $(this);
						$input.attr('disabled', 'disabled').data(
								'disabled-setted', true);
					});
				} else {
					$inputs.each(function() {
						var $input = $(this);
						if ($input.data('disabled-setted')) {
							$input.removeData('disabled-setted').removeAttr(
									'disabled');
						}
					});
				}
			}
		}

		this.isEmpty = function() {
			var $dom = this.getDom();
			if ($dom.funcMap && typeof $dom.funcMap['isEmpty'] === 'function') {
				$dom.funcMap['isEmpty']();
			} else {
				return !this.getValue();
			}
		}

		this.setReadonly = function(toReadonly) {
			var $dom = this.getDom();
			if ($dom.funcMap
					&& typeof $dom.funcMap['setReadonly'] === 'function') {
				$dom.funcMap['setReadonly'](toReadonly);
			} else {
				var $inputs = $dom.filter(':input').add($dom.find(':input'));
				if (toReadonly != false) {
					$inputs.each(function() {
						var $input = $(this);
						if ($input.is('select')) {
							$input.on('focus', onSelectFocus).on('change',
									onSelectChange).on('mousedown',
									onSelectMousedown).data('readonly-setted',
									true);
						} else {
							$input.attr('readonly', 'readonly').data(
									'readonly-setted', true);
						}
					})
				} else {
					$inputs.each(function() {
						var $input = $(this);
						if ($input.data('readonly-setted')) {
							if ($input.is('select')) {
								$input.off('focus', onSelectFocus).off(
										'change', onSelectChange).off(
										'mousedown', onSelectMousedown)
										.removeAttr('readonly-setted');
							} else {
								$input.removeData('readonly-setted')
										.removeAttr('readonly');
							}
						}
					});
				}
			}
		}
		var relatedInputs = new Set();
		/**
		 * 关联当前控件和另一个控件，使得两个控件的值同步
		 */
		this.relateInput = function(otherInput) {
			if (!relatedInputs.has(otherInput)
					&& otherInput instanceof FieldInput) {
				this.getDom().on('field-input-changed', function(e, thisInput) {
					otherInput.setValue(thisInput.getValue(), true);
				});
				relatedInputs.add(otherInput);
				otherInput.relateInput(this);
			}
			return this;
		}

		this.removeFormName = function() {
			var $dom = this.getDom();
			var $inputs = $dom.filter(':input').add($dom.find(':input')).each(
					function() {
						var $this = $(this);
						$this.removeAttr('name');
					});
			return this;
		}

		/**
		 * 重置表单的值
		 */
		this.resetValue = function(ignoreTrigger) {
			this.setValue(param.value);
			if (!ignoreTrigger) {
				this.__triggerValueChanged();
			}
		}

		this.__triggerValueChanged = function() {
			if (param.$dom) {
				param.$dom.trigger('field-input-changed', [ this ]);
			}
		}

		/**
		 * 检测当前表单的合法性
		 */
		this.validate = function() {
			if (doDomFuncMap('validate', [ ui ]) !== false) {
				param.validator.apply(this, [ this.getValue() ]);
			} else {
				return false;
			}
		}

		/**
		 * 
		 */
		this.getComparatorMap = function(callback) {
			return FieldInput.getGlobalComparators(param.type, callback);
		}

		function doDomFuncMap(funcName, args) {
			var $dom = _this.getDom();
			if ($dom && $dom.funcMap && $dom.funcMap[funcName]) {
				return $dom.funcMap[funcName].apply(_this, args);
			}
		}

		this.getSubmitData = function() {
			return doDomFuncMap('getSubmitData');
		}

		this.isValueChanged = function() {
			return doDomFuncMap('isValueChanged');
		}

		this.setFormName = function(formName) {
			if (formName !== undefined) {
				param.name = formName;
				doDomFuncMap('setFormName', [ formName ]);
			}
		}
	}

	$.extend(
					FieldInput,
					{
						globalOptionsCacheTimeLineMap : {},
						globalOptionsCacheMap : {},
						/**
						 * 加载全局的选项map loadGlobalOptions(url,
						 * reqParam)：从后台加载所有选项数据
						 */
						loadGlobalOptions : function(url, reqParam) {
							var deferred = $.Deferred();
							var originOptions = FieldInput.GLOBAL_OPTIONS;
							var TIMELINE = 30000;
							if (typeof url === 'string') {
								var timeline = this.globalOptionsCacheTimeLineMap[url];
								var now = (new Date()).getTime();
								if (!timeline || now - timeline > TIMELINE) {
									require('ajax')
											.ajax(
													url,
													reqParam,
													function(data) {
														FieldInput
																.loadGlobalOptions(
																		data)
																.done(
																		function() {
																			FieldInput.globalOptionsCacheMap[url] = data;
																			FieldInput.globalOptionsCacheTimeLineMap[url] = now;
																			deferred
																					.resolve([
																							data,
																							originOptions ]);
																		});
													});
								} else {
									deferred
											.resolve([
													FieldInput.globalOptionsCacheMap[url],
													originOptions ]);
								}
							} else if (typeof url === 'object') {
								FieldInput.GLOBAL_OPTIONS = url;
								FieldInput.GLOBAL_LABELS = url.LABELS_MAP;
								FieldInput.globalOptionsLoaded = true;
								deferred.resolve([ url, originOptions ]);
							}
							return deferred.promise();
						},
						globalOptionsLoaded : false,
						// 全局选项，
						GLOBAL_OPTIONS : {},
						GLOBAL_LABELS : {},
						GLOBAL_COMPARATOR_MAP : null,
						getGlobalComparators : function(inputType, callback) {
							function _callback() {
								(callback || $.noop)
										(FieldInput.GLOBAL_COMPARATOR_MAP[inputType].comparators);
							}
							if (FieldInput.GLOBAL_COMPARATOR_MAP == null) {
								FieldInput.GLOBAL_COMPARATOR_MAP = $
										.Callbacks();
								FieldInput.GLOBAL_COMPARATOR_MAP.add(_callback);
								require('ajax')
										.loadResource(
												'media/admin/field/json/comparator-map.json')
										.done(
												function(data) {
													var callbacks = FieldInput.GLOBAL_COMPARATOR_MAP;
													FieldInput.GLOBAL_COMPARATOR_MAP = data;
													callbacks.fire();
												});
							} else if (typeof FieldInput.GLOBAL_COMPARATOR_MAP.fire === 'function') {
								FieldInput.GLOBAL_COMPARATOR_MAP.add(_callback);
							} else {
								_callback();
							}
						},
						validateForm : function(form) {
							var validateResult = true;
							$(form)
									.find('.cpf-field-input')
									.each(
											function() {
												var fieldInputObject = $(this)
														.data(
																'fieldInputObject');
												if (fieldInputObject instanceof FieldInput) {
													if (fieldInputObject
															.validate() === false) {
														validateResult = false;
													}
												}
											});
							return validateResult;
						},
						bindSubmitData : function(form, formData) {
							$(form)
									.find('.cpf-field-input')
									.each(
											function() {
												var fieldInputObject = $(this)
														.data(
																'fieldInputObject');
												if (fieldInputObject instanceof FieldInput) {
													var formName = fieldInputObject
															.getName();
													if (fieldInputObject
															.isValueChanged()
															&& formName
															&& !formData
																	.has(formName)) {
														var submitData = fieldInputObject
																.getSubmitData();
														if (submitData
																|| submitData === '') {
															formData.append(
																	formName,
																	submitData);
														}
													}
												}
											});
						},
						compare : function(x, y, fieldType) {
							switch (fieldType) {
							default:
								return x > y ? 1 : x < y ? -1 : 0;
							}
						}
					});

	module.exports = FieldInput;
});