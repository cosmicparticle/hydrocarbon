/**
 * 字段选择器
 */
define(function(require1, exports, module){
	var cachableFieldJson = {}; 
	
	function getCachableFieldJson(reqURL, reqParam){
		var defer = $.Deferred();
		var key = reqURL + $.param(reqParam || {});
		if(cachableFieldJson[key]){
			defer.resolve(cachableFieldJson[key]);
		}else{
			require1('ajax').ajax(reqURL, reqParam, function(data){
				cachableFieldJson[key] = data;
				defer.resolve(data);
			});
		}
		return defer.promise();
	}
	
	function FieldSearch(_param){
		var defaultParam = {
			//是否单选.未完成
			single			: false,
			$container		: $(),
			reqDataURL		: '',
			reqDataParam	: {},
			disablePicked	: true,
			afterPicked		: $.noop,
			//选择后，是否在自动完成文本框中同步该选项
			textPicked		: false,
			//是否显示数组字段
			showArrayComposite	: true,
			//是否显示复合字段
			hideCompositeFields	: false,
			//字段过滤器
			fieldFilters	: [],
			compositeId		: undefined,
			fieldModes		: ['field'],
			fieldMode		: 'field',
			afterPickedComposite	: $.noop,
			exceptComposites: []
		};
		
		var param = $.extend({}, defaultParam, _param);
		var _afterPicked = param.afterPicked;
		var _this = this;

		var disabledFieldSet = new Set();
		var bindedSearchTexts = new Set();
		
		param.afterPicked = function(){
			param.afterChoose.apply(_this, arguments);
			_afterPicked.apply(_this, arguments);
		};
		
		var loadFieldDataDeferred = null;
		function afterLoadFieldData(callback){
			if(loadFieldDataDeferred == null){
				loadFieldDataDeferred = $.Deferred();
				var reqParam = $.extend({}, {
					withCompositeFields	: !param.hideCompositeFields
				}, param.reqDataParam);
				getCachableFieldJson(param.reqDataURL, reqParam).done(function(__compositeData){
					var __fieldKeyData = {};
					var __fieldData = transferInfoToFields(__compositeData, __fieldKeyData);
					loadFieldDataDeferred.resolve(__fieldData, __compositeData, __fieldKeyData);
				});
				
			}
			loadFieldDataDeferred.done(callback);
		}
		function transferInfoToFields(compositeData, fieldKeyData){
			var fieldData = [];
			for(var i in compositeData){
				var thisComposite = compositeData[i];
				if(thisComposite.addType == 5){
					thisComposite.__type__ = 'relation';
				}else if(thisComposite.addType == 4){
					thisComposite.__type__ = 'multiattr';
				}
				for(var j in thisComposite.fields){
					var thisField = thisComposite.fields[j];
					fieldData.push(
							fieldKeyData['id_' + thisField.id] = {
									id			: thisField.id,
									name		: thisField.name,
									cname		: thisField.cname,
									type		: thisField.type,
									c_id		: thisComposite.c_id,
									c_name		: thisComposite.name,
									c_cname		: thisComposite.cname,
									title		: thisField.cname,
									c_title		: thisComposite.cname,
									optGroupId	: thisField.optionGroupId,
									optGroupKey	: thisField.optionGroupId + (thisField.casLevel? ('@' + thisField.casLevel): ''),
									fieldPattern: thisField.fieldPattern,
									pointModuleName	: thisField.pointModuleName,
									composite	: $.extend({}, thisComposite, {
											data	: {}
									}),
									__type__	: 'field',
									data		: {}
							});
				}
			}
			return fieldData;
		}
		
		function whenPickField(fieldId, args){
			_this.enableField(fieldId, param.disablePicked == false).done(function(field){
				if(param.textPicked){
					try{
						setTextsValue(field.cname);
					}catch(e){}
				}
				param.afterPicked.apply(_this, $.merge([field], args || []));
			});
		}
		function whenPickComposite(compositeId, args){
			_this.enableComposite(compositeId, param.disablePicked == false).done(function(composite){
				if(param.textPicked){
					try{
						setTextsValue(composite.cname);
					}catch(e){}
				}
				param.afterPicked.apply(_this, $.merge([composite], args || []));
			});
		}
		
		var __$fieldPicker = null;
		var __fieldPickerDeferred = $.Deferred(),
			__loadingFieldPicker = false;
		
		function filterTmplData(composites){
			var result = [];
			if($.isArray(composites)){
				for(var i in composites){
					var composite = composites[i];
					if(param.compositeId && composite.c_id != param.compositeId){
						continue;
					}
					if(!param.showArrayComposite && composite.isArray == 1){
						continue;
					}
					if(param.exceptComposites){
						if(param.exceptComposites instanceof Set && param.exceptComposites.has(composite.c_id.toString())
							|| $.inArray(composite.c_id, param.exceptComposites) >= 0){
							continue;
						}
					}
					if(composite.fields){
						for(var j in composite.fields){
							var field = composite.fields[j];
							field.isShow = true;
							if($.isArray(param.fieldFilters) && param.fieldFilters.length > 0){
								for(var k in param.fieldFilters){
									var filter = param.fieldFilters[k];
									try{
										if(field.type == filter){
											field.isShow = false;
											break;
										}
									}catch(e){}
								}
							}
						}
					}
					result.push(composite);
				}
			}
			return result;
		}
		
		/**
		 * 传入一个函数，获得字段选择器的dom，并对其进行处理
		 */
		function fieldpickerHandler(callback){
			afterLoadFieldData(function(fieldData, compositeData){
				
				if(!__loadingFieldPicker){
					__loadingFieldPicker = true;
					loadGlobalTmpl().done(function(tmpl){
						var _compositeData = filterTmplData(compositeData);
						__$fieldPicker = tmpl.tmpl({
							composites	: _compositeData,
							hasFieldMode: function(modeName){
								return $.inArray(modeName, param.fieldModes) >= 0;
							},
							pickerKey	: require1('utils').uuid(5, 62)
						});
						$('.fieldpicker-field-item', __$fieldPicker).click(function(){
							var $this = $(this);
							if(!$this.is('.disabled')){
								var fieldId = $this.attr('data-id');
								if(fieldId){
									whenPickField(fieldId);
								}
							}
						});
						$('.fieldpicker-composite-item', __$fieldPicker).click(function(){
							var $this = $(this);
							if(!$this.is('.disabled')){
								var compositeId = $this.attr('data-id');
								if(compositeId){
									whenPickComposite(compositeId);
								}
							}
						});
						$('ul.dropdown-menu>li>a', __$fieldPicker).click(function(){
							var $this = $(this);
							var $li = $this.closest('li.dropdown');
							$li.find('a.dropdown-toggle span').text($this.text());
						});
						var $pickerMode = $('.fieldpicker-mode', __$fieldPicker);
						var $modeOl = $('>ol', $pickerMode);
						$('>i', $pickerMode).click(function(e){
							$modeOl.toggle();
							e.preventDefault();
							return false;
						});
						$(document.body).click(function(){
							$modeOl.hide();
						});
						//选择模式
						$('>li', $modeOl).click(function(){
							var $this = $(this);
							var mode = $this.attr('fieldpicker-mode');
							_this.changeFieldMode(mode);
						});
						(callback || $.noop)(__$fieldPicker, true);
						__fieldPickerDeferred.resolve();
					});
				}else{
					__fieldPickerDeferred.done(function(){
						(callback || $.noop)(__$fieldPicker, false);
					});
				}
			});
		}
		function setTextsValue(fieldTitle){
			bindedSearchTexts.forEach(function(t){
				$(t).typeahead('val', fieldTitle);
			})
		}
		this.getFieldMode = function(){
			return param.fieldMode;
		}
		this.changeFieldMode = function(mode){
			if(mode && mode != this.getFieldMode()){
				fieldpickerHandler(function($fieldPicker){
					var $pickerMode = $('.fieldpicker-mode', $fieldPicker);
					var $mode = $('>ol>li[fieldpicker-mode="' + mode + '"]', $pickerMode);
					if($mode.length > 0){
						changeToFieldMode(mode);
						$('>i', $pickerMode).text(mode.charAt(0).toUpperCase());
						$mode.siblings().removeClass('selected');
						$mode.filter('[fieldpicker-mode="' + mode + '"]').addClass('selected');
						param.fieldMode = mode;
					}
				});
			}
		}
		function changeToFieldMode(mode){
			fieldpickerHandler(function($fieldPicker){
				var $nav = $fieldPicker.children('ul.nav');
				switch(mode){
					case 'field':
						bindedSearchTexts.forEach(function(t){
							$(t).prop('disabled', false);
						})
						require1('utils').removeStyle($nav, 'display');
						$('>.tab-content>.tab-pane', $fieldPicker).each(function(){
							var $pane = $(this);
							if($pane.is('.composites-tab')){
								$pane.hide();
							}else{
								require1('utils').removeStyle($pane, 'display');
							}
						});
						break;
					case 'relation':
						bindedSearchTexts.forEach(function(t){
							$(t).prop('disabled', true);
						})
						$nav.css('display', 'none');
						$('>.tab-content>.tab-pane', $fieldPicker).each(function(){
							var $pane = $(this);
							if($pane.is('.relations-tab')){
								$pane.show();
							}else{
								$pane.css('display', 'none');
							}
						});
						break;
					case 'multiattr':
						bindedSearchTexts.forEach(function(t){
							$(t).prop('disabled', true);
						})
						$nav.css('display', 'none');
						$('>.tab-content>.tab-pane', $fieldPicker).each(function(){
							var $pane = $(this);
							if($pane.is('.multiattrs-tab')){
								$pane.show();
							}else{
								$pane.css('display', 'none');
							}
						});
						break;
					default:
				}
			});
		}
		
		
		/**
		 * 绑定自动完成的功能到某个文本输入框
		 */
		this.bindTypeahead = function($search, __param){
			var thisParam = $.extend({}, {
				afterSelected	: $.noop
			}, __param);
			var _afterSelected = thisParam.afterSelected;
			thisParam.afterSelected = function(){
				__param.afterChoose.apply(_this, arguments);
				_afterSelected.apply(this, arguments);
			}
			if($search && $search.length > 0){
				afterLoadFieldData(function(fieldData){
					//数据源
					var bloodhound = new Bloodhound({
						datumTokenizer 	: Bloodhound.tokenizers.obj.whitespace(['cname', 'c_cname']),
						queryTokenizer 	: Bloodhound.tokenizers.whitespace,
						local			: fieldData
					});
					$search.typeahead({
					}, {
						display		: 'cname',
						source 		: bloodhound.ttAdapter(),
						templates	: {
							suggestion	: Handlebars.compile('<p><strong>{{cname}}</strong>-<i>{{c_cname}}</i></p>')
						}
					}).bind('typeahead:select', function(e, suggestion){
						var $this = $(this);
						var fieldId = suggestion.id;
						if(param.disablePicked){
							_this.isFieldDisabled(fieldId).done(function(disabled){
								if(disabled){
									require1('dialog').notice('不能选择该字段', 'error');
								}else{
									_this.enableField(suggestion.id, false).done(function(field){
										thisParam.afterSelected.apply(_this, [field, $this]);
									});
								}
							});
						}else{
							_this.getFieldData(fieldId).done(function(field){
								thisParam.afterSelected.apply(_this, [field, $this]);
							});
						}
					}).each(function(){
						bindedSearchTexts.add(this);
					});
				});
			}
		};
		
		this.getFieldPicker = function(){
			var deferred = $.Deferred();
			fieldpickerHandler(function($fieldPicker, free){
				deferred.resolve($fieldPicker, free)
			});
			return deferred.promise();
		}
		
		/**
		 * 切换字段选择框的显示状态
		 */
		this.togglePicker = function($pickerContainer, toShow){
			var deferred = $.Deferred();
			fieldpickerHandler(function($fieldPicker, free){
				if($pickerContainer === false){
					$fieldPicker.hide();
				}else{
					if($fieldPicker.closest($pickerContainer).length == 1){
						$fieldPicker.toggle(toShow);
					}else{
						if(param.$container){
							if($pickerContainer[0] !== param.$container[0]){
								var $pickerContainerOffsetParent = $pickerContainer[0].offsetParent;
								var $n = param.$container[0];
								//计算当前按钮位置，并在该位置弹出选择框
								var offsetTop = 0,
									offsetLeft = 0;
								while($n && $n.offsetParent !== $pickerContainerOffsetParent){
									offsetTop += $n.offsetTop;
									offsetLeft += $n.offsetLeft;
									$n = $n.offsetParent;
								}
								if($n){
									offsetTop += $n.offsetTop - 55;
									offsetLeft += $n.offsetLeft - 100;
									$fieldPicker.addClass('appendout').css({
										left	: offsetLeft + 'px',
										top		: (offsetTop) + 'px'
									});
								}else{
									$.error('text不在picker的定位容器内');
								}
							}
						}
						$pickerContainer.append($fieldPicker.show());
					}
					if($fieldPicker.is(':visible')){
						var toActiveIndex = $fieldPicker.find('.fieldpicker-field-item.disabled').closest('.tab-pane').index();
						if(toActiveIndex >= 0){
							_this.activeTab(toActiveIndex);
						}
					}
				}
				deferred.resolve($fieldPicker);
			});
			return deferred.promise();
		};
		
		/**
		 * 获得字段数据，该方法是异步操作，返回Deferred
		 */
		this.getFieldData = function(fieldId, callback){
			var def = $.Deferred();
			afterLoadFieldData(function(fData, cData, fieldKeyData){
				var field = fieldKeyData['id_' + fieldId];
				(callback || $.noop)(field);
				def.resolve(field);
			});
			return def.promise();
		};
		this.getCompositeData = function(compositeId, callback){
			var def = $.Deferred();
			afterLoadFieldData(function(fData, cData, fieldKeyData){
				var composite = null;
				for(var i in cData){
					if(cData[i].c_id == compositeId){
						composite = cData[i];
						break;
					}
				}
				(callback || $.noop)(composite);
				def.resolve(composite);
			});
			return def.promise();
		}
		/**
		 * 获得绑定的页面元素
		 */
		this.getContainer = function(){
			return param.$container;
		};
		
		
		/**
		 * 启用字段（参数toEnable为false时为禁用，其他情况均为启用）
		 * 该方法是异步操作，返回一个Deferred对象
		 */
		this.enableField = function(fieldId, toEnable){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldpicker){
				var $toDisable = $('a.fieldpicker-field-item[data-id="' + fieldId + '"]', $fieldpicker);
				$toDisable.toggleClass('disabled', toEnable === false);
				_this.getFieldData(fieldId).done(function(field){
					if(field){
						if(toEnable === false){
							if(!param.single){
								if(field.composite.isArray){
									//选择的字段是一个数组字段，锁定当前选择器的标签页
									_this.lockTabByCompositeId(field.composite.c_id);
								}else{
									hideArrayComposites();
								}
							}
							disabledFieldSet.add(fieldId.toString());
						}else{
							disabledFieldSet['delete'](fieldId.toString());
							if(disabledFieldSet.size === 0){
								if(!param.single){
									if(field.composite.isArray){
										_this.lockTabByCompositeId(field.composite.c_id, false);
									}else{
										hideArrayComposites(false);
									}
								}
							}
						}
					}
					def.resolve(field, $fieldpicker);
				});
			});
			return def.promise();
		}
		this.enableComposite = function(compositeId, toEnable){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldpicker){
				var $toDisable = $('a.fieldpicker-composite-item[data-id="' + compositeId + '"]', $fieldpicker);
				$toDisable.toggleClass('disabled', toEnable === false);
				_this.getCompositeData(compositeId).done(function(composite){
					def.resolve(composite);
				});
			});
			return def.promise();
		}
		
		
		/**
		 * 判断字段是否被禁用
		 */
		this.isFieldDisabled = function(fieldId){
			var def = $.Deferred();
			isDisabledFieldWhenLocked(fieldId).done(function(isDisabledField){
				if(disabledFieldSet.has(fieldId.toString()) || isDisabledField){
					return def.resolve(true);
				}else{
					_this.getFieldData(fieldId).done(function(field){
						if(param.hideCompositeFields && field && field.composite.isArray){
							return def.resolve(true);
						}
					});
				}
				def.resolve(false);
			});
			return def.promise();
		}
		/**
		 * 选择某个字段
		 * @param fieldId 字段的id
		 */
		this.select = function(fieldId, args){
			this.getFieldData(fieldId).done(function(field){
				if(field){
					setTextsValue(field.cname);
					whenPickField(fieldId, $.isArray(args)? args: [args]);
				}
			});
		};
		var locked = false, lockedFields = new Set();
		/**
		 * 判断字段是否在锁定模式下，是禁用的字段
		 */
		function isDisabledFieldWhenLocked(fieldId){
			var def = $.Deferred();
			if(locked){
				_this.getFieldData(fieldId).done(function(field){
					if(locked && field){
						_this.getLockedCompositeId().done(function(compositeId){
							def.resolve(field.composite.c_id.toString() != compositeId.toString());
						});
					}else{
						def.resolve(false);
					}
				});
			}else{
				def.resolve(false);
			}
			return def.promise();
		}
		function hideArrayComposites(toHide){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldPicker){
				$('ul.nav-tabs li>a[data-toggle="tab"]', $fieldPicker).each(function(){
					var $li = $(this).closest('li');
					if($li.is('.array-field')){
						$li.toggle(toHide === false);
					}
				});
				param.hideCompositeFields = toHide != false;
				def.resolve();
			});
			return def.promise();
		}
		this.hideArrayComposites = hideArrayComposites;
		this.getLockedCompositeId = function(){
			var def = $.Deferred();
			if(locked){
				fieldpickerHandler(function($fieldPicker){
					def.resolve($('ul.nav-tabs li.active[data-id]', $fieldPicker).attr('data-id'));
				});
			}else{
				def.resolve();
			}
			return def.promise();
		}
		this.lockTabByCompositeId = function(compositeId, toLock){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldPicker){
				var tabIndex = $('ul.nav-tabs li[data-id]', $fieldPicker).index($('ul.nav-tabs li[data-id="' + compositeId + '"]', $fieldPicker));
				_this.lockTab(tabIndex, toLock).done(function(){
					def.resolve();
				});
				
			});
			return def.promise();
		}
		/**
		 * 锁定选择器的标签页，
		 * 并且限制自动完成的字段只能选择该标签页下的字段
		 * @param tabIndex 标签页索引，如果不传入，则锁定当前打开的标签页
		 */
		this.lockTab = function(tabIndex, toLock){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldPicker){
				if(typeof tabIndex === 'boolean'){
					toLock = tabIndex;
					tabIndex = undefined;
				}
				if(tabIndex === undefined){
					tabIndex = -1;
					$('ul.nav-tabs li>a[data-toggle="tab"]', $fieldPicker).each(function(i, a){
						if($(a).parent().is('.active')){
							tabIndex = i;
							return false;
						}
					});
					
					_this.lockTab(tabIndex, toLock).done(function(){
						def.resolve();
					});
				}else{
					_this.activeTab(tabIndex).done(function($tabTitle){
						var toHideTab = toLock === false;
						$('ul.nav-tabs li>a[data-toggle="tab"]', $fieldPicker).each(function(){
							var $li = $(this).closest('li');
							if($li.not($tabTitle)){
								$li.toggle(toHideTab);
							}
						});
						$tabTitle.show();
						locked = !toHideTab;
						def.resolve();
					});
				}
			});
			return def.promise();
		}
		
		/**
		 * 激活指定索引的标签页
		 */
		this.activeTab = function(tabIndex){
			var def = $.Deferred();
			fieldpickerHandler(function($fieldPicker){
				$('.tab-pane', $fieldPicker).removeClass('active');
				var $tabTitle = $('ul.nav-tabs li[data-id]>a', $fieldPicker).eq(tabIndex).trigger('click');
				var $li = $tabTitle.closest('li');
				$('.tab-pane' + $tabTitle.attr('href'), $fieldPicker).addClass('active');
				def.resolve($li);
			});
			return def.promise();
		}
		
		
		var released = false;
		this.release = function(){
			param = undefined;
			__$fieldPicker = null;
			__fieldPickerDeferred = undefined;
			__loadingFieldPicker = undefined;
			_afterPicked = param.afterPicked;
			released = true;
		};
		this.isReleased = function(){
			return released;
		}
	}
	
	var $model = $('<div class="input-icon field-search">'
			+ '<span class="search-input-wrapper">'
			+ '<input type="text" class="search-text-input form-control input-xs glyphicon-search-input" autocomplete="off" placeholder="输入添加的字段名" />'
			+ '</span>'
			+ '<i class="glyphicon glyphicon-search blue"></i>'
			+ '<i title="选择字段" class="glyphicon glyphicon-th blue field-picker-button"></i>'
			+ '</div>');
	
	var globalFieldSearchTemplateDeferred = null;
	function loadGlobalTmpl(){
		if(globalFieldSearchTemplateDeferred == null){
			globalFieldSearchTemplateDeferred = $.Deferred();
			require1('tmpl').load('media/admin/field/tmpl/tmpl-fieldsearch.tmpl').done(function(tmpl){
				globalFieldSearchTemplateDeferred.resolve(tmpl);
			});
		}
		return globalFieldSearchTemplateDeferred.promise();
	}
	
	$.extend(FieldSearch, {
		build	: function(param){
			var $search = $model.clone();
			return exports.bind($search);
		},
		bind	: function($search, param){
			var $textInput = $search.find('.search-text-input');
			var reqDataURL = undefined;
			if(!param.module){
				param.module = 'people';
			}
			reqDataURL = 'admin/field/json/' + param.module;
			var search = new FieldSearch($.extend({}, {
				$container		: $search,
				afterChoose		: undefined,
				afterPicked		: undefined,
				afterSelected	: undefined,
				reqDataURL		: reqDataURL
			}, param));
			(param.textInputHandler || $.noop).apply(search, [$textInput]);
			search.bindTypeahead($textInput, param);
			var $button = $search.find('.field-picker-button');
			$button.click(function(){
				search.togglePicker(param.$pickerContainer || $search);
			});
			$($search.getLocatePage().getContent().children()).on('mouseup', function(e){
				var $target = $(e.target);
				search.getFieldPicker().done(function($fieldPicker){
					if($target.closest($fieldPicker).length === 0 && $target.closest($search).length === 0){
						search.togglePicker(false);
					}
				});
			});
			return search;
		}
	});
	
	module.exports = FieldSearch;
});