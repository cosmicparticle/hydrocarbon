define(function(require, exports, module){
	var FieldSearch = require('field/js/field-search.js');
	var FieldInput = require('field/js/field-input.js');
	
	var m_fieldInputType;
	function getFieldInputType(){
		var def = $.Deferred();
		if(!m_fieldInputType){
			require('ajax').loadResource('resource/field-input-typemap.json')
			.done(function(obj){
				m_fieldInputType = obj;
				def.resolve(m_fieldInputType);
			});
		}else{
			def.resolve(m_fieldInputType);
		}
		return def.promise();
	}
	exports.init = function($page, tmplData, criteriaData, columnData, module, fieldInputTypeMap, compositeId){
		console.log($page);
		initTmpl($page, tmplData);
		initCriteria($page, criteriaData, module, compositeId);
		if(columnData || columnData === null){
			initListTable($page, tmplData, columnData, module);
		}
		var Dialog = require('dialog');
		var filterMode = !!compositeId;
		$('#save', $page).click(function(){
			var tmplTitle = getTmplTitle();
			if(filterMode || tmplTitle){
				var columnData = getColumnData();
				var criteriaData = getCriteriaData();
				var saveURI = 'admin/tmpl/ltmpl/save';
				if(filterMode){
					saveURI = 'admin/tmpl/dtmpl/arrayitem_filter_save/' + module + '/' + compositeId;
				}
				require('ajax').postJson(saveURI, {
					tmplId		: tmplData? tmplData.id: null,
					module		: module,
					title		: tmplTitle,
					criteriaData: criteriaData,
					columnData	: columnData,
					defPageSize	: $('#pageSize', $page).val(),
					defOrderFieldId: $('#order-field-search', $page).attr('order-field-id'),
					defOrderDir	: $('#isAscending :checkbox', $page).prop('checked')? 'desc': 'asc'
				}, function(data){
					if(data.status === 'suc'){
						Dialog.notice('保存成功', 'success');
						$page.getLocatePage().close();
						if(!filterMode){
							var tpage = require('page').getPage( module + '_ltmpl_list');
							if(tpage){
								tpage.refresh();
							}
						}else{
							var page = $page.getLocatePage();
							if(page.getPageObj() instanceof Dialog){
								var afterSave = page.getPageObj().getEventCallbacks('afterSave');
								if(typeof afterSave === 'function'){
									afterSave.apply(page, [data.filterId]);
								}
							}
						}
					}else{
						Dialog.notice('保存失败', 'error');
					}
				});
			}else{
				Dialog.notice('请输入模板名称', 'warning');
			}
		});
		function getTmplTitle(){
			return $('#tmplTitle', $page).val();
		}
		
		function getColumnData(){
			var columnData = [];
			var $colsContainer = $('.cols-container', $page);
			$colsContainer.children('.row[field-id]').each(function(){
				var $col = $(this);
				var col = {
						title	: $col.find('.col-name').text()
				};
				var fieldId = $col.attr('field-id');
				if(fieldId === 'row-number'){
					col.specField = 'number';
				}else if(fieldId === 'row-operates'){
					var hasDetail = $('#show-operate-detail', $page).prop('checked'),
						hasUpdate = $('#show-operate-update', $page).prop('checked');
					col.specField = 'operate';
					if(hasDetail){
						col.specField += '-d';
					}
					if(hasUpdate){
						col.specField += '-u';
					}
				}else{
					col.fieldId = fieldId;
					col.fieldKey = $col.attr('field-key');
					col.orderable = null;
				}
				columnData.push(col);
			});
			return columnData;
		}
		
		function getCriteriaData(){
			return getContainerCriteriaData($('.criterias-container', $page))
		}
		
	};
	
	function getContainerCriteriaData($container){
		var criteriaData = [];
		$container.children('.criteria-item').each(function(index){
			var criteria = $(this).data('criteria-data');
			var itemData = {
				id				: criteria.getId(),
				title			: criteria.getTitle(),
				fieldAvailable	: false,
				order			: index,
				filterMode		: criteria.getFilterMode()
			};
			if(itemData.filterMode == 'field'){
				if(criteria.isFieldAvailable()){
					var composite = criteria.getComposite();
					if(composite != null){
						itemData.compositeId = composite.c_id;
					}else{
						var field = criteria.getField();
						if(!field){
							require('dialog').notice('条件必须选择一个字段', 'error');
							$.error();
						}else{
							itemData.fieldId = field.id;
							itemData.fieldKey = field.name;
						}
					}
					
					var relationLabelInput = criteria.getRelationLabelInput();
					$.extend(itemData, {
						relation		: 'and',
						comparator		: criteria.getComparatorName(),
						inputType		: criteria.getDefaultValueInput().getType(),
						defVal			: criteria.getDefaultValueInput().getValue(),
						placeholder		: criteria.getPlaceholder(),
						partitions		: [],
						queryShow		: criteria.isQueryShow(),
						relationLabel 	: relationLabelInput && relationLabelInput.getValue(),
						fieldAvailable	: true
					});
				}
				var partitions = criteria.getPartitions();
				for(var i in partitions){
					var partition = partitions[i];
					itemData.push({
						relation	: partition.getRelation(),
						comparator	: partition.getComparatorName(),
						val			: partition.getValue()
					});
				}
			}else if(itemData.filterMode == 'label'){
				$.extend(itemData, {
					fieldAvailable	: true,
					filterLabels	: criteria.getFilterLabels(),
					isExcludeLabel	: criteria.getFilterExclusion()
				})
			}
			criteriaData.push(itemData);
		});
		return criteriaData;
	}

	function initTmpl($page, tmplData){
		if(tmplData){
			$('#tmplTitle', $page).val(tmplData.title);
		}
	}
	
	function initCriteria($page, criteriaData, module, compositeId){
		var criteriaParam = {};
		var filterRelLabels = [];
		if($page.$page){
			criteriaParam = $page;
			$page = criteriaParam.$page;
			criteriaData = criteriaParam.criteriaData;
			module = criteriaParam.moduleName;
			compositeId = criteriaParam.compositeId;
			filterRelLabels = criteriaParam.filterRelLabels;
			criteriaParam.$detailArea.hide();
		}
		var cField = null,
			cComposite = null;
		var $fieldSearch = criteriaParam.$criteriaFieldSearch || $('.criteria-field-search-row .field-search', $page);
		var $fieldSearchInput = $fieldSearch.find(':text');
		
		var $selectedCriteriaItem = null;
		
		function handleSelectedItem(callback){
			if($selectedCriteriaItem && $selectedCriteriaItem.length == 1){
				callback.apply($selectedCriteriaItem.data('criteria-data'), [$selectedCriteriaItem]);
			}
		}
		
		
		var criteriaSearcher = FieldSearch.bind($fieldSearch, {
			single			: true,
			textPicked		: true,
			module			: module,
			fieldFilters	: ['file'], 
			fieldModes		: ['field', 'relation'],
			compositeId		: compositeId,
			$pickerContainer: criteriaParam.$fieldPickerContainer,
			afterChoose		: function(field){
				enableCurrent();
				if(field.__type__ == 'field'){
					cField = field;
					cComposite = null;
					handleSelectedItem(function($item){
						this.setField(field);
						$('.hide-when-no-field', $page).show();
					});
				}else if(field.__type__ == 'relation'){
					cField = null;
					cComposite = field;
					handleSelectedItem(function($item){
						this.setComposite(field);
						$('.hide-when-no-field', $page).show();
					});
				}
			}
		});
		
		function enableCurrent(){
			if(cField != null){
				criteriaSearcher.enableField(cField.id);
			}else if(cComposite != null){
				criteriaSearcher.enableComposite(cComposite.c_id);
			}
		}
		
		
		var $criteriaContainer = criteriaParam.$criteriaContainer || $('.criterias-container', $page);
		
		var $criteriaItemTmpl = criteriaParam.$criteriaItemTmpl || $('#criteria-item-tmpl', $page),
			$criteriaPartitionTmpl = criteriaParam.$criteriaItemTmpl || $('#criteria-partition-tmpl', $page);
		
		var currentCriteria = null;
		
		;
		
		if(filterRelLabels && criteriaParam.$detailArea){
			$('#filter-labels-wrap>select', criteriaParam.$detailArea).select2({
				width: '120px',
				data: filterRelLabels
			}).change(function(e, isValueSetted){
				var labels = $(this).val();
				if(currentCriteria && isValueSetted != true){
					currentCriteria.setFilterLabels(labels);
				}
			});

			$('#filter-labels-exclusion>select', criteriaParam.$detailArea).change(function(e, isValueSetted){
				if(currentCriteria && isValueSetted != true){
					currentCriteria.setFilterExclusion($(this).val());
				}
			});
		}
		
		/**
		 * 显示条件详情
		 */
		function showCriteriaDetail($item){
			if($selectedCriteriaItem){
				$selectedCriteriaItem.removeClass('criteria-selected');
				var selectedCriteria = $selectedCriteriaItem.data('criteria-data');
				if(selectedCriteria.getField()){
					criteriaSearcher.enableField(selectedCriteria.getField().id, true);
				}
			}
			$selectedCriteriaItem = $item.addClass('criteria-selected');
			var criteria = $item.data('criteria-data');
			currentCriteria = criteria;
			showCriteria(criteria);
			var $detailArea = criteriaParam.$detailArea || $('.criteria-detail-area', $page);
			$detailArea.show();
		}
		
		
		function filterFieldInputSelectable($select, field){
			var def = $.Deferred();
			getFieldInputType().done(function(map){
				$select.empty();
				var set = new Set();
				set.add('text');
				var types = require('utils').merge(set, field && map.selectableType[field.criteriaType]);
				if(types){
					types.forEach(function(type){
						$select.append($('<option value="' + type + '">' + map.inputTypeTitleMap[type] + '</option>'))
					});
				}
				def.resolve();
			});
			return def.promise();
		}
		
		function toggleRelationLabelInput($relationLabelRow, labelInput){
			if(labelInput){
				$('#relation-label-value-wrap', $relationLabelRow)
					.children().detach()
					.end().append(labelInput.getDom());
				$relationLabelRow.css('display', 'flex');
			}else{
				$relationLabelRow.css('display', 'none');
			}
		}
		
		function showCriteria(criteria){
			enableCurrent();
			var $criteriaDetailCover = criteriaParam.$criteriaDetailCover || $('#criteria-detail-cover', $page);
			if(!criteria.isFieldAvailable()){
				//条件详情遮罩
				$criteriaDetailCover.addClass('cover-active');
				return ;
			}
			$criteriaDetailCover.removeClass('cover-active');
			var isLabelMode = criteria.getFilterMode() == 'label';
			$('.relation-filter-mode-switch', $page).prop('checked', isLabelMode).trigger('change');
			if(isLabelMode){
				$('#filter-labels-wrap>select', $page).val(criteria.getFilterLabels()).trigger('change');
				$('#filter-labels-exclusion>select', $page).val(criteria.getFilterExclusion()).trigger('change');
				return;
			}else{
				$('#filter-labels-wrap>select', $page).val('').trigger('change');
				$('#filter-labels-exclusion>select', $page).val('0');
			}

			var composite = criteria.getComposite();
			if(composite && composite.__type__ == 'relation'){
				criteriaSearcher.changeFieldMode('relation');
				$fieldSearchInput.val(composite.cname);
				criteriaSearcher.enableComposite(composite.c_id, false).done(function(){
					$('#criteria-detail-field-input-type-row', $page).hide();
					$('.hide-when-no-field', $page).show();
					var queryShow = criteria.isQueryShow();
					$('#toggle-show-criteria', $page).prop('checked', queryShow).trigger('change');
					var $defVal = $('#criteria-default-value-container', $page).children();
					$defVal.detach();
					criteria.detailHandler(function($$){
						var defValInput = criteria.getDefaultValueInput();
						criteria.setDefaultInputType(criteria.getDefaultValueInput());
						$$('#criteria-detail-comparator').val(criteria.getComparatorName());
						$$('#criteria-default-value-container').append(defValInput.getInput());
						$$('#criteria-detail-placeholder').hide();
						$$('#relation-label-row').hide();
					});
					cField = null;
					cComposite = composite;
				})
			}else{
				var field = criteria.getField();
				$('#criteria-detail-field-input-type-row', $page).css('display', 'flex');
				if(field){
					//criteriaSearcher.changeFieldMode('field');
					$fieldSearchInput.typeahead('val', field.cname);
					criteriaSearcher.enableField(field.id, false);
					$('.hide-when-no-field', $page).show();
				}else{
					$fieldSearchInput.typeahead('val', '');
					$('.hide-when-no-field', $page).hide();
				}
				criteriaSearcher.changeFieldMode('field');
				var queryShow = criteria.isQueryShow();
				$('#toggle-show-criteria', $page).prop('checked', queryShow).trigger('change');
				var $defVal = $('#criteria-default-value-container', $page).children();
				$defVal.detach();
				criteria.detailHandler(function($$){
					var defValInput = criteria.getDefaultValueInput();
					filterFieldInputSelectable($$('#field-input-type'), field).done(function(){
						$$('#field-input-type').val(defValInput.getType());
						criteria.setDefaultInputType(criteria.getDefaultValueInput());
						$$('#criteria-detail-comparator').val(criteria.getComparatorName());
						$$('#criteria-default-value-container').append(defValInput.getInput());
						$$('#criteria-detail-placeholder').val(criteria.getPlaceholder());
						toggleRelationLabelInput($$('#relation-label-row'), criteria.getRelationLabelInput())
					})
				});
				cComposite = null;
				cField = field;
			}
		}
		function apppendPartitionDom(partition){
			if(partition){
				var $partitionItem = $('<div class="criteria-detail-partition">');
				$partitionItem
					.append($('<div class="criteria-detail-relation">').append(partition.getRelationSelection().getSelect()))
					.append($('<div class="criteria-detail-comparator">').append(partition.getComparatorSelection().getSelect()))
					.append($('<div class="criteria-detail-value">').append(partition.getValueInput().getInput()))
					.append($('<div class="criteria-detail-partition-operate"><span class="criteria-detail-partition-operate-remove"></span></div>'))
					;
				$('.criteria-detail-partitions-container', $page)
					.find('.criteria-partition-add')
					.before($partitionItem);
			}
		}
		
		/**
		 * 添加条件
		 */
		function addCriteria(_criteriaData, ignoreShow){
			var $criteria = $criteriaItemTmpl.tmpl({
				fieldTitle	: '选择字段'
			});
			var $criteriaDetail = criteriaParam.$detailArea || $('.criteria-detail-area', $page);
			var criteria = new Criteria({
				checkIsCurrent	: function(){
					return currentCriteria == this;
				},
				$detailArea		: $criteriaDetail,
				module			: module
			}, $page);
			$criteria.find('.criteria-property-name span').dblclick(function(){
				require('utils').toEditContent(this).bind('confirmed', function(title){
					criteria.setTitle(title);
				});
			});
			criteria.addCallback({
				afterSetTitle		: function(title){
					$criteria.find('.criteria-property-name span').text(title);
				},
				afterSetField		: function(field){
					$criteria.find('.criteria-property-name span').text(field.cname);
					criteria.detailHandler(function($$){
						$$('#criteria-detail-field-input-type-row').css('display', 'flex');
						filterFieldInputSelectable($$('#field-input-type'), field).done(function(){
							criteria.setDefaultInputType($$('#field-input-type').val());
							toggleRelationLabelInput($$('#relation-label-row'), criteria.getRelationLabelInput());
						})
					});
				},
				afterSetComposite	: function(composite){
					$criteria.find('.criteria-property-name span').text(composite.cname);
					criteria.detailHandler(function($$){
						if(composite.__type__ == 'relation'){
							$$('#criteria-detail-field-input-type-row').hide();
							$$('#criteria-placeholder-row').hide();
							$$('#relation-label-row').hide();
							criteria.setDefaultInputType(criteria.getRelationLabelInput());
						}
					});
				},
				afterSetFilterMode	: function(filterMode){
					var isFieldMode = filterMode !== 'label';
					if(isFieldMode){
						$criteriaDetail
							.addClass('relation-filter-mode-field')
							.removeClass('relation-filter-mode-label');
					}else{
						$criteriaDetail
							.addClass('relation-filter-mode-label')
							.removeClass('relation-filter-mode-field');
					}
				},
				afterSetFilterLabels: function(labels){
					$('#filter-labels-wrap>select', $page).val(labels).trigger('change', [true]);
				},
				afterSetFilterExclusion	: function(isExclude){
					$('#filter-labels-exclusion>select', $page).val(isExclude == 1? 1: 0);
				},
				afterSetPlaceholder	: function(placeholder){
					$('#criteria-detail-placeholder', $page).val(placeholder);
				},
				afterToggleQueryShow: function(toShow){
					$criteria.toggleClass('criteria-hidden', !toShow);
				},
				afterSetComparatorName:	function(comparatorName){
					criteria.detailHandler(function($$){
						$$('#critreia-detail-comparator').val(comparatorName)
					});
				},
				afterAddPartition	: function(partition){
					var $partitionItem = $('#criteria-partition-tmpl', $page).tmpl({
						relationTitle	: partition.getRelation(),
						comparatorTitle	: partition.getComparatorView(),
						value			: partition.getValue()
					});
					$criteria.find('.criteria-partitions-container').append($partitionItem);
					apppendPartitionDom(partition);
					partition.addCallback({
						afterRelationChange		: function(){
							$('.criteria-partition-relation span', $partitionItem).text(this.getRelation());
						},
						afterComparatorChange	: function(){
							$('.criteria-partition-comparator span', $partitionItem).text(this.getComparatorView());
						},
						afterValueChange		: function(){
							$('.criteria-partition-value span', $partitionItem).text(this.getValue());
						}
					});
				},
				afterRemovePartition: function(partition, index){
					$criteria.find('.criteria-partitions-container').children('.criteria-partition').eq(index).remove();
					$('.criteria-detail-partitions-container', $page).children('.criteria-detail-partition').eq(index).remove();
				},
				afterSetDefaultInputType	: function(valueInput){
					var fieldInput = valueInput.getFieldInput();
					if(fieldInput){
						fieldInput.getComparatorMap(function(comparators){
							if(comparators){
								var comparatorName = criteria.getComparatorName();
								var inComparators = false;
								var $comparator = $('#criteria-detail-comparator', $page).empty();
								for(var i in comparators){
									var comparator = comparators[i];
									var classes = comparator['class']? comparator['class'].split(' '): [];
									if(classes.indexOf('negative') < 0){
										var premiseClasses = comparator['premise-classes-e'];
										if(premiseClasses){
											var foc = criteria.getField() || criteria.getComposite();
											if(foc && foc.dataClasses){
												var exist = false;
												for(var i in premiseClasses){
													if($.inArray(premiseClasses[i], foc.dataClasses) >= 0){
														exist = true;
														break;
													}
												}
												if(!exist){
													continue;
												}
											}
										}
										var $option = $('<option value="' + comparator.key + '">' + comparator.title + '</option>');
										$option.addClass(comparator['class']);
										$comparator.append($option);
									}
									if(comparatorName === comparator.key){
										inComparators = true;
									}
								}
								if(comparatorName && inComparators){
									criteria.setComparatorName(comparatorName);
								}else{
									criteria.setComparatorName($comparator.val());
								}
							}
						});
						$('#criteria-default-value-container', $page).empty().append(valueInput.getInput());
						var shown = valueInput.getType() === 'text';
						$('#criteria-placeholder-row', $page).data('shown', shown).toggle(criteria.isQueryShow() && shown);
					}
				}
			});
			$criteria.appendTo($criteriaContainer).data('criteria-data', criteria);
			if(_criteriaData){
				criteria.initFromData(_criteriaData);
			}
			if(!criteria.isFieldAvailable()){
				$criteria.addClass('criteria-field-unavailable');
			}
			if(ignoreShow !== true){
				showCriteriaDetail($criteria);
			}
		}
		
		//点击条件节点时的回调
		$criteriaContainer.off('click').on('click', '.criteria-item:not(.criteria-selected)', function(){
			showCriteriaDetail($(this));
		});
		$criteriaContainer.on('click', '.btn-remove-criteria', function(){
			var $criteriaItem = $(this).closest('.criteria-item');
			require('dialog').confirm('确定删除该条件？', function(yes){
				if(yes){
					$criteriaItem.remove();
					if($criteriaItem.is($selectedCriteriaItem)){
						if(currentCriteria.getField()){
							criteriaSearcher.enableField(currentCriteria.getField().id, true);
						}
						$selectedCriteriaItem = null;
						currentCriteria = null;
						(criteriaParam.$detailArea || $('.criteria-detail-area', $page)).hide();
					}
				}
			});
			return false;
		});
		
		/**
		 * 添加条件
		 */
		$('#add-criteria', $page).click(function(){
			addCriteria();
		});
		$('.relation-filter-mode-switch', $page).off('change').change(function(){
			var filterMode = $(this).prop('checked')? 'label': 'field';
			handleSelectedItem(function(){
				this.setFilterMode(filterMode);
			});
		});
		//切换条件显示状态
		$('#toggle-show-criteria', $page).off('change').change(function(){
			var toShow = $(this).prop('checked');
			var $defaultValueLabel = $('#default-value-label', $page);
			var $placeholderRow = $('#criteria-placeholder-row', $page);
			if($placeholderRow.data('shown')){
				$placeholderRow.toggle(toShow);
			}
			if(toShow){
				$defaultValueLabel.text('默认值');
			}else{
				$defaultValueLabel.text('值');
			}
			//$('.criteria-detail-partitions-container', $page).toggle(!toShow);
			//$('.criteria-detail-show-config-container', $page).toggle(toShow);
			handleSelectedItem(function($item){
				this.toggleQueryShow(toShow);
			});
			//$comparator.trigger('deal-comparator');
		}).trigger('change');
		$('.criteria-partition-add', $page).click(function(){
			handleSelectedItem(function(){
				this.addPartition();
			});
		});
		$('#criteria-detail-placeholder', $page).off('change').change(function(){
			var placeholder = $(this).val();
			handleSelectedItem(function(){
				this.setPlaceholder(placeholder);
			});
		});
		$page.on('click', '.criteria-detail-partition-operate-remove', function(){
			var $partition = $(this).closest('.criteria-detail-partition');
			var index = $partition.index();
			handleSelectedItem(function(){
				this.removePartition(index);
			});
		});
		//切换显示控件
		$('#field-input-type', $page).off('change').change(function(){
			var inputType = $(this).val();
			handleSelectedItem(function(){
				try{
					if(inputType === 'select' 
						|| inputType === 'multiselect'
						|| inputType === 'label'){
						this.setDefaultInputType($.extend({}, this.getField(), {type : inputType}));
					}else{
						this.setDefaultInputType(inputType);
					}
				}catch(e){}
			});
		});
		$('#criteria-detail-comparator', $page).off('change').change(function(){
			var comparatorName = $(this).val();
			handleSelectedItem(function(){
				this.setComparatorName(comparatorName);
			});
		});
		
		var $CPF = require('$CPF');
		$CPF.showLoading();
		FieldInput.loadGlobalOptions('admin/field/enum_json').done(function(){
			if($.isArray(criteriaData) && criteriaData.length > 0){
				$CPF.showLoading();
				+function addCriteriaItem(index){
					var item = criteriaData[index];
					if(item){
						if(item.fieldId){
							if(item.fieldAvailable){
								criteriaSearcher.getFieldData(item.fieldId, function(field){
									addCriteria($.extend({
										fieldData	: field
									}, item), true);
									addCriteriaItem(index + 1);
								});
							}else{
								addCriteria(item, true);
								addCriteriaItem(index + 1);
							}
						}else if(item.compositeId){
							criteriaSearcher.getCompositeData(item.compositeId, function(composite){
								addCriteria($.extend({
									compositeData	: composite
								}, item), true);
								addCriteriaItem(index + 1);
							});
						}else if(item.filterMode === 'label'){
							addCriteria(item, true);
							addCriteriaItem(index + 1);
						}
					}
					$CPF.closeLoading();
				}(0);
			}else{
				$CPF.closeLoading();
			}
		});
		$criteriaContainer.sortable({
			helper 		: "clone",
			cursor 		: "move",// 移动时候鼠标样式
			opacity		: 0.5, // 拖拽过程中透明度
			tolerance 	: 'pointer',
			update		: function(){
			}
		});

		function getCriteriaData(){
			return getContainerCriteriaData($criteriaContainer);
		}

		return {
			addCriteria	: addCriteria,
			getCriteriaData
		}
	}
	
	exports.initCriteria = initCriteria;
	
	/**
	 * 条件类
	 */
	function Criteria(_param, $page){
		var defaultParam = {
			filterMode		: 'field',
			filterLabels	: '',
			isExclude		: null,
			field			: null,
			composite		: null,
			queryShow		: true,
			title			: '',
			field			: null,
			module			: null,
			fieldAvailable	: true,
			titleSetted		: false
		};
		
		var param = $.extend({}, defaultParam, _param);
		
		var callbackMap = require('utils').CallbacksMap(this);
		
		var defaultValueInput = new ValueInput(undefined, $page);
		
		var relationLabelFieldInput = null;
		
		this.initFromData = function(data){
			if(data){
				param.fieldAvailable = data.fieldAvailable != false;
				param.id = data.id;
				if(data.fieldData){
					this.setField(data.fieldData);
				}else if(data.compositeData){
					this.setComposite(data.compositeData);
				}
				this.toggleQueryShow(data.queryShow == 1);
				this.setTitle(data.title);
				//this.setRelation(data.relation);
				this.setComparatorName(data.comparator);
				if(data.fieldData){
					this.setPlaceholder(data.placeholder);
					this.setRelationLabelValue(data.relationLabel);
					if(param.fieldAvailable){
						defaultValueInput = new ValueInput($.extend({}, data.fieldData, {type:data.inputType}), $page);
					}else{
						defaultValueInput = new ValueInput(data.inputType, $page);
					}
				}else if(data.compositeData){
					this.setDefaultInputType(this.getRelationLabelInput());
				}else if(data.filterMode === 'label'){
					this.setFilterMode('label');
					this.setFilterLabels(data.filterLabels);
					this.setFilterExclusion(data.isExcludeLabel);
				}
				defaultValueInput.setValue(data.defaultValue || data.defVal);
			}else{
				$.error();
			}
			
		}
		
		this.setFilterMode = function(filterMode){
			if(filterMode == 'field' || filterMode == 'label'){
				if(!param.titleSetted){
					if(filterMode == 'label'){
						this.setTitle('筛选关系名', true);
					}else{
						this.setTitle('选择字段', true);
					}
				}
				param.filterMode = filterMode;
				callbackMap.fire('afterSetFilterMode', [filterMode]);
			}
		}
		
		this.getFilterMode = function(){return param.filterMode}
		this.getFilterLabels = function(){
			return param.filterLabels;
		}
		this.getFilterExclusion = function(){
			return param.isExclude;
		}
		
		this.setFilterLabels = function(labels, unrecur){
			if(param.filterMode === 'label'){
				if($.isArray(labels)){
					labels = labels.join();
				}
				param.filterLabels = labels;
				if(!unrecur){
					callbackMap.fire('afterSetFilterLabels', [labels]);
				}
			}
		}
		this.setFilterExclusion = function(isExclude, unrecur){
			if(param.filterMode === 'label'){
				 param.isExclude = isExclude;
				 if(!unrecur){
					callbackMap.fire('afterSetFilterExclusion', [isExclude]);
				}
			}
		}
		
		this.addPartition = function(partition){
			if(!partition){
				partition = new Partition(this);
			}
			param.partitions.push(partition);
			callbackMap.fire('afterAddPartition', [partition]);
		}
		
		this.getId = function(){
			return param.id;
		}
		
		/**
		 * 获得字段对象
		 */
		this.getField = function(){
			return param.field;
		};
		/**
		 * 设置条件的字段对象，并重新设置所有条件的所有部分
		 */
		this.setField = function(field){
			if(typeof field === 'object'){
				param.field = field;
				param.composite = null;
				relationLabelFieldInput = null;
				param.title = field.cname;
				//this.setDefaultInputType(field);
				callbackMap.fire('afterSetField', [field]);
			}else if(field !== undefined){
				$.error('setField方法只能从传入field数据对象');
			}
		};
		
		this.setComposite = function(composite){
			if(typeof composite === 'object'){
				param.composite = composite;
				param.field = null;
				relationLabelFieldInput = null;
				param.title = composite.cname;
				callbackMap.fire('afterSetComposite', [composite]);
			}else if(field !== undefined){
				$.error('setComposite方法只能从传入Composite数据对象');
			}
		}
		
		this.getComposite = function(){
			return param.composite;
		}
		
		/**
		 * 获得条件字段的标题（可以自定义）
		 */
		this.getTitle = function(){
			return param.title;
		}
		
		this.isFieldAvailable = function(){
			return param.fieldAvailable;
		}
		
		/**
		 * 设置条件字段的标题
		 */
		this.setTitle = function(_title, ignoreTitleSetted){
			param.title = _title;
			if(ignoreTitleSetted != true){
				param.titleSetted = true;
			}
			
			callbackMap.fire('afterSetTitle', [_title]);
		}
		
		/**
		 * 获得条件的所有部分
		 */
		this.getPartitions = function(){
			return param.partitions;
		};
		
		/**
		 * 获得条件中字段的类型
		 */
		this.getFieldType = function(){
			if(param.field){
				return param.field.type;
			}
		};
		
		/**
		 * 该条件在查询中是否要被显示
		 */
		this.isQueryShow = function(){
			return param.queryShow;
		};
		
		this.toggleQueryShow = function(toShow){
			if(toShow === undefined){
				toShow = !this.isQueryShow();
			}
			param.queryShow = toShow;
			callbackMap.fire('afterToggleQueryShow', [toShow]);
		};
		
		
		/**
		 * 切换表单的类型
		 * @param inputType 可以是string，也可以是字段数组对象field
		 */
		this.setDefaultInputType = function(inputType){
			if(inputType instanceof ValueInput){
				defaultValueInput = inputType;
			}else{
				defaultValueInput = new ValueInput(inputType, $page);
			}
			callbackMap.fire('afterSetDefaultInputType', [defaultValueInput]);
		}
		
		/**
		 * 获得条件在查询中显示时，会用什么比较关系来进行查询
		 * @return {String}
		 */
		this.getComparatorName = function(){
			return param.comparatorName;
		};
		
		/**
		 * 设置比较关系的名称
		 */
		this.setComparatorName = function(comparatorName){
			param.comparatorName = comparatorName;
			callbackMap.fire('afterSetComparatorName', [comparatorName]);
		}
		
		/**
		 * 获得条件在查询中显示时，会以什么控件来显示(依赖于field-input.js)
		 * @return 
		 */
		this.getDefaultValueInput = function(){
			return defaultValueInput;
		};
		
		this.getPlaceholder = function(){
			return param.placeholder;
		}
		
		this.setPlaceholder = function(placeholder){
			param.placeholder = placeholder;
			callbackMap.fire('afterSetPlaceholder', [placeholder]);
		}
		
		
		this.getRelationLabelInput = function(){
			var field = this.getField();
			var relationComposite = null;
			if(field && field.composite && field.composite.__type__ == 'relation'){
				relationComposite = field.composite;
			}else{
				relationComposite = this.getComposite();
			}
			if(relationComposite && relationComposite.__type__ == 'relation'){
				if(!relationLabelFieldInput){
					relationLabelFieldInput = new FieldInput({
						type	: 'relation_existion',
						fieldKey: param.module + '@' + relationComposite.name,
						value	: param.data && param.data.relationLabel,
						options :relationComposite.relationSubdomain
					});
				}
			}else{
				relationLabelFieldInput = null;
			}
			return relationLabelFieldInput;
		};
		
		this.setRelationLabelValue = function(relationLabel){
			var relationLabelInput = this.getRelationLabelInput();
			if(relationLabelInput != null){
				relationLabelInput.setValue(relationLabel);
			}
		}
		
		/**
		 * 移除部分
		 */
		this.removePartition = function(index){
			if(index < param.partitions.length){
				var removePartition = param.partitions.splice(index, 1);
				callbackMap.fire('afterRemovePartition', [removePartition, index]);
			}
		};
		/**
		 * 用于处理详情的展示
		 */
		this.detailHandler = function(callback){
			if(typeof param.checkIsCurrent === 'function' 
				&& param.checkIsCurrent.apply(this, [])
				&& param.$detailArea instanceof $){
				callback.apply(this, [function(selector, context){
					if(context){
						if(typeof context === 'string'){
							return $(selector, $(context, param.$detailArea));
						}else{
							return $(selector, context);
						}
					}else{
						return $(selector, param.$detailArea);
					}
				}, param.$detailArea]);
			}
		};
		
		if(!param.partitions || param.partitions.length == 0){
			param.partitions = [];
		}
		
	}
	
	
	var COMPARATOR_MAP_URL = 'field/json/comparator-map.json';
	/**
	 * 加载字段类型和比较符的映射关系对象
	 * @returns
	 */
	Criteria.loadComparatorMap = function(){
		var deferred = $.Deferred();
		if(!Criteria.COMPARATOR_MAP){
			if(COMPARATOR_MAP_URL){
				require('ajax').ajax(COMPARATOR_MAP_URL, {}, function(data){
					if(typeof data === 'string'){
						data = $.parseJSON(data);
					}
					Criteria.COMPARATOR_MAP = data;
					deferred.resolve(data);
				});
			}
		}else{
			deferred.resolve(Criteria.COMPARATOR_MAP);
		}
		return deferred.promise();
	};
	
	/**
	 * 条件的部分
	 */
	function Partition(criteria){
		if(!(criteria instanceof Criteria)){
			$.error('必须传入Criteria对象');
		}
		var _this = this;
		var callbackMap = require('utils').CallbacksMap(this);
		
		var field = criteria.getField();
		
		var selRel = Selection.createRelationSelect('', false).bindChange(function(){
			callbackMap.fire('afterRelationChange');
		});
		var selCpr = (new Selection()).bindChange(function(){
			callbackMap.fire('afterComparatorChange');
		});
		selCpr.setOptionMap({
			's1'	: '包含',
			's2'	: '开头为'
		});
		
		var valueInput = new ValueInput(field);
		valueInput.bindChange(function(){
			callbackMap.fire('afterValueChange');
		});
		
		this.getCriteria = function(){
			return criteria;
		}
		/**
		 * 获得部分的逻辑关系
		 */
		this.getRelation = function(){
			return selRel.getView();
		};
		/**
		 * 
		 */
		this.getRelationSelection = function(){
			return selRel;
		}
		/**
		 * 获得部分的比较关系
		 */
		this.getComparatorView = function(){
			return selCpr.getView();
		};
		/**
		 * 
		 */
		this.getComparatorSelection = function(){
			return selCpr;
		}
		/**
		 * 获得部分的值
		 */
		this.getValue = function(){
			return valueInput.getValue();
		}
		this.getValueInput = function(){
			return valueInput;
		}
	}
	
	
	function Selection(optionsMap, clazz){
		var $select = $('<select>').addClass(clazz);
		this.setOptionMap = function(_optionsMap){
			if($.isPlainObject(_optionsMap)){
				optionsMap = _optionsMap;
				$select.empty();
				for(var key in _optionsMap){
					$select.append('<option value="' + key + '">' + _optionsMap[key] + '</option>');
				}
			}
		}
		this.getOptionMap = function(){
			return optionsMap;
		};
		
		this.setValue = function(optionKey){
			$select.val(optionKey);
			return this;
		};
		this.getValue = function(){
			return $select.val();
		};
		this.getView = function(){
			return $('option[value="' + this.getValue() + '"]', $select).text();
		}
		this.getSelect = function(){
			return $select;
		};
		this.bindChange = function(callback){
			$select.change(callback);
			return this;
		}
		this.setOptionMap(optionsMap);
	}
	
	Selection.createRelationSelect = function(clazz, hasAnd){
		var options = {};
		if(hasAnd){
			options.and = '与';
		}
		options.or = '或';
		return new Selection(options, clazz);
	}
	
	function ValueInput(field, $page){
		var fieldInput = null;
		var defaultValue = null,
			placeholder = null;
		var $detail = $page.find('div.detail').eq(0);
		if(typeof field === 'string'){
			fieldInput = new FieldInput({
				type		: field,
				$page		: $page,
				$container	: $detail
			});
		}else if(typeof field === 'object'){
			if(field.__type__ == 'field'){
				var fParam = {
						optionsKey	: field.optGroupId,
						fieldKey	: field.composite.module + '@' + field.name,
						$page		: $page,
						$container	: $detail
				};
				fieldInput = new FieldInput($.extend({}, field, fParam));
			}else if(field instanceof FieldInput){
				fieldInput = field;
			}
		}else{
			fieldInput = new FieldInput({
				type	: 'text',
				$container	: $detail
			});
		}
		function viewTransfer(val, fieldInput){
			if(fieldInput){
				switch(fieldInput.getType()){
				case 'select':
					var $select = fieldInput.getDom();
					var $option = $('option[value="' + val + '"]', $select);
					if($option.length > 0){
						return $option.text();
					}else{
						return val;
					}
					break;
				default: 
					return val;
				}
			}else{
				return '';
			}
		}
		this.getFieldInput = function(){
			return fieldInput;
		};
		this.getType = function(){
			if(fieldInput){
				return fieldInput.getType();
			}
		}
		this.setViewTransfer = function(_viewTransfer){
			viewTransfer = _viewTransfer;
		}
		this.getValue = function(){
			return fieldInput? fieldInput.getValue(): '';
		}
		this.getView = function(){
			return viewTransfer(this.getValue(), fieldInput);
		}
		this.bindChange = function(callback){
			
		}
		this.getInput = function(){
			if(fieldInput){
				return fieldInput.getDom();
			}
		}
		this.setValue = function(val){
			if(fieldInput){
				fieldInput.setValue(val);
			}
			return this;
		}
		if(this.getType() === 'label'){
			fieldInput.getDom().css('width', '85%');
		}
	}
	
	
	function initListTable($page, tmplData, columnData, module){
		
		
		var addColSearcher = FieldSearch.bind($('#addcol-field-search', $page), {
			afterChoose		: addColumn,
			module			: module,
			showArrayComposite	: false,
			fieldFilters	: ['file']
		});
		var $orderFieldSearch = $('#order-field-search', $page);
		var orderField = null;
		//排序字段的
		var orderColFieldSearcher = FieldSearch.bind($orderFieldSearch, {
			single			: true,
			textPicked		: true,
			module			: module,
			afterChoose		: function(field){
				if(orderField){
					orderColFieldSearcher.enableField(orderField.id);
				}
				orderField = field;
				$orderFieldSearch.attr('order-field-id', orderField.id);
			},
			textInputHandler: function($textInput){
				$textInput.change(function(){
					if($textInput.val() === ''){
						$orderFieldSearch.removeAttr('order-field-id');
						orderColFieldSearcher.enableField(orderField.id);
						orderField = null;
					}
				});
			}
		});
		//列操作区
		var $colsContainer = $('.cols-container', $page);
		//列处理元素的模板
		var $colRowTmpl = $('#col-row-tmpl', $page);
		
		var $operateMap = {
				update	: $('<a href="#" class="btn btn-info btn-xs edit operate-update"><i class="fa fa-edit"></i>修改</a>'),
				detail	: $('<a href="#" class="btn btn-success btn-xs operate-detail"><i class="fa fa-book"></i>详情</a>')
		};
		
		var $previewTable = $('.table-preview-area table', $page);
		var colTable = new ColumnTable({
			columnsGetter	: function(){
				var columns = [];
				$colsContainer.children().each(function(){
					var $row = $(this);
					var fieldId = $row.attr('field-id');
					var column = new Column({
						$domination		: $row,
						$head			: $('thead th[field-id=""]', $previewTable),
						$cells			: $('thead th[field-id="' + fieldId + '"], tbody td[field-id="' + fieldId + '"]', $previewTable),
						table			: colTable,
						colId			: fieldId.toString(),
						name			: $row.find('.col-name').text(),
						fieldAvailable	: !$row.is('.col-field-unavailable')
					});
					columns.push(column);
				});
				return columns;
			},
			$table			: $previewTable,
			headCell		: function($th, column, i, $row){
				$th.text(column.getName());
				$th.addClass(column.isFieldAvailable()? '': 'col-field-unavailable');
			},
			bodyCell		: function($td, column, i, $row){
				if(column.getId() === 'row-number'){
					$td.text(i + 1);
				}else if(column.getId() === 'row-operates'){
					if(isOperateChecked('detail')){
						$td.append($operateMap['detail'].clone());
					}
					if(isOperateChecked('update')){
						$td.append($operateMap['update'].clone());
					}
					
				}else{
					$td.addClass(column.isFieldAvailable()? '': 'col-field-unavailable');
					//TODO:设置单元格的默认值
				}
			}
		});
		
		/**
		 * 判断某个操作是否被勾选
		 * 当前可用操作包括(update、remove)
		 */
		function isOperateChecked(operateName){
			return $('#show-operate-' + operateName, $page).prop('checked');
		}
		/**
		 * 切换
		 */
		function toggleOperate(operateName, flag){
			$previewTable.find('[field-id="row-operates"]').filter('td').each(function(){
				var $cell = $(this);
				var $origin = $cell.find('a.operate-' + operateName);
				if(flag){
					if($origin.length == 0){
						var Utils = require('utils');
						var indexMap = {
							detail	: 0,
							update	: 1
						};
						Utils.prependTo($operateMap[operateName].clone(), $cell, indexMap[operateName]);
					}
				}else{
					$origin.remove();
				}
			});
		}
		
		/**
		 * 添加普通字段列的方法
		 */
		function addColumn(field, withSync){
			if(field.fieldAvailable === undefined){
				field.fieldAvailable = true;
			}
			var $colRow = $colRowTmpl.tmpl($.extend({}, {
				withoutOpr	: false
			}, field)).appendTo($colsContainer);
			var $operateCol = $colsContainer.children('.row.operate-col');
			if($operateCol.length > 0){
				$operateCol.appendTo($colsContainer);
			}
			if(withSync !== false){
				colTable.syncByColumns();
			}
		}
		
		//切换序号列
		function toggleNumberColumn(flag){
			var $numberCol = $colsContainer.children('.row.number-col');
			if(flag){
				if($numberCol.length == 0){
					$colRowTmpl.tmpl({
						id				: 'row-number',
						cname			: '序号',
						withoutOpr		: true,
						c_name			: '',
						fieldAvailable	: true
					}).addClass('number-col').prependTo($colsContainer);
					colTable.syncByColumns();
				}
			}else{
				$numberCol.remove();
				colTable.syncByColumns();
			}
		}
		
		//切换操作列
		function toggleOperateColumn(flag){
			var $operateCol = $colsContainer.children('.row.operate-col');
			if(flag){
				if($operateCol.length == 0){
					$colRowTmpl.tmpl({
						id			: 'row-operates',
						cname		: '操作',
						withoutOpr	: true,
						c_name		: '',
						fieldAvailable	: true
					}).addClass('operate-col').appendTo($colsContainer);
					colTable.syncByColumns();
				}
			}else{
				$operateCol.remove();
				colTable.syncByColumns();
			}
		}
		//绑定拖拽
		$('.cols-container', $page).sortable({
			helper 		: "clone",
			cursor 		: "move",// 移动时候鼠标样式
			opacity		: 0.5, // 拖拽过程中透明度
			tolerance 	: 'pointer',
			update		: function(){
				colTable.syncByColumns();
			}
		});
		
		$('#toggle-number-col', $page).change(function(e){
			toggleNumberColumn($(this).prop('checked'));
		}).trigger('change');
		
		$('#toggle-operate-col', $page).change(function(){
			var operateShow = $(this).prop('checked');
			toggleOperateColumn(operateShow);
			$('#show-operate', $page).toggle(operateShow);
		}).trigger('change');
		
		$('#show-operate-update', $page).change(function(){
			toggleOperate('update', isOperateChecked('update'));
		});
		$('#show-operate-detail', $page).change(function(){
			toggleOperate('detail',isOperateChecked('detail'));
		});
		
		//绑定移除列事件
		$page.on('click', '.col-delete', function(){
			var fieldId = $(this).closest('.row[field-id]').attr('field-id');
			colTable.removeColumn(fieldId);
			addColSearcher.enableField(fieldId);
		});
		
		$page.on('dblclick', '.cols-container .col-name', function(){
			require('utils').toEditContent(this).bind('confirmed', function(text, $this){
				var fieldId = $this.closest('.row[field-id]').attr('field-id');
				if(fieldId){
					var $th = $('.table-preview-area thead th[field-id="' + fieldId + '"]', $page);
					$th.text(text);
				}
			});
		});
		function initByData(tmplData, columnData){
			if(tmplData){
				orderColFieldSearcher.select(tmplData.defaultOrderFieldId);
				$('#isAscending :checkbox', $page).prop('checked', tmplData.defaultOrderDirection === 'desc');
				$('#pageSize', $page).val(tmplData.defaultPageSize);
			}
			if($.isArray(columnData)){
				var checkedNumberCol = false,
				checkedOperateCol = false;
				var operateReg = /^operate(\-d)?(\-u)?(\-r)?$/;
				for(var i in columnData){
					var column = columnData[i];
					if(column.specialField === 'number'){
						checkedNumberCol = true;
						$('#toggle-number-col', $page).prop('checked', true).trigger('change');
					}else if(operateReg.test(column.specialField)){
						checkedOperateCol = true;
						$('#toggle-operate-col', $page).prop('checked', true).trigger('change');
						var res = operateReg.exec(column.specialField);
						$('#show-operate-detail', $page).prop('checked', !!res[1]).trigger('change');
						$('#show-operate-update', $page).prop('checked', !!res[2]).trigger('change');
					}else{
						addColumn({
							columnId 		: column.id,
							id				: column.fieldId,
							c_name			: column.compositeName,
							name			: column.fieldName,
							cname			: column.title,
							withoutOpr		: !!column.specialField,
							fieldAvailable	: column.fieldAvailable != false
						}, false);
						addColSearcher.enableField(column.fieldId, false);
					}
				}
				colTable.syncByColumns();
				if(!checkedNumberCol){
					$('#toggle-number-col', $page).prop('checked', false).trigger('change');
				}
				if(!checkedOperateCol){
					$('#toggle-operate-col', $page).prop('checked', false).trigger('change');
				}
			}else{
				$('#toggle-number-col', $page).trigger('change');
				$('#toggle-operate-col', $page).trigger('change');
			}
		};
		initByData(tmplData, columnData)
	}
	
	
	/**
	 * 基于列的表格对象
	 */
	function ColumnTable(_param){
		var defaultParam = {
			//列对象获取函数
			columnsGetter	: $.noop,
			//对应的表格dom
			$table			: $(),
			headCell		: $.noop,
			//用于生成数据单元格的方法
			bodyCell		: $.noop
		};
		
		var param = $.extend({}, defaultParam , _param);
		
		var _this = this;
		var columns = [];
		function reloadColumns(){
			columns = param.columnsGetter();
			return columns;
		}
		
		/**
		 * 将列对象插入表格的指定索引的列
		 */
		function insertTableCell(column, i){
			//插入表头列
			var $headRows = $('thead tr', param.$table);
			$headRows.each(function(){
				var $row = $(this);
				var $th = $('<th>').attr('field-id', column.getId());
				try{
					param.headCell.apply(_this, [$th, column, i, $row]);
				}catch(e){console.error(e)}
				var $siblings = $row.children('th');
				if($siblings.length > i){
					$siblings.eq(i).before($th);
				}else{
					$row.append($th);
				}
			});
			
			//插入数据列
			var $rows = $('tbody tr', param.$table);
			$rows.each(function(){
				var $row = $(this);
				var $td = $('<td>').attr('field-id', column.getId());
				try{
					param.bodyCell.apply(_this, [$td, column, i, $row]);
				}catch(e){console.error(e)}
				var $siblings = $row.children('td');
				if($siblings.length > i){
					$siblings.eq(i).before($td);
				}else{
					$row.append($td);
				}
			});
		}
		
		/**
		 * 根据列的字段id或者列索引获得列
		 */
		this.getColumn = function(colId){
			var cols = reloadColumns();
			if(typeof colId === 'number'){
				return cols[colId];
			}else if(typeof colId === 'string'){
				for(var i in cols){
					if(cols[i].getId() === colId){
						return cols[i];
					}
				}
			}
		};
		
		/**
		 * 根据当前列数据同步表格的列
		 */
		this.syncByColumns = function(){
			var cols = reloadColumns();
			var colIds = new Set();
			for(var i in cols){
				var col = cols[i];
				colIds.add(col.getId());
				if(col.getCells().length == 0){
					//该行在表格中没有对应的列
					insertTableCell(col, parseInt(i));
				}else{
					cols[i].moveTo(i);
				}
			}
			param.$table.find('th,td').filter(function(){
				var fieldId = $(this).attr('field-id');
				return !colIds.has(fieldId);
			}).remove();
		}
		
		/**
		 * 移除列
		 */
		this.removeColumn = function(colId){
			var col = this.getColumn(colId);
			if(col){
				col.remove();
			}
		};
	}
	
	function Column(_param){
		var defaultParam = {
			//主导控制对象
			$domination		: $(),
			//表头单元格
			$head			: $(),
			//列的所有单元格（包含表头）
			$cells			: $(),
			//列所在的表格对象
			table			: null,
			//列的id
			colId			: '',
			name			: '',
			data			: '',
			fieldAvailable	: true
		};
		
		var param = $.extend({}, defaultParam, _param);
		
		if(!param.colId){
			$.error('请传入列的id');
		}
		
		/**
		 * 获得列的id
		 */
		this.getId = function(){
			return param.colId;
		};
		
		this.getName = function(){
			return param.name;
		};
		this.getCells = function(){
			var cells = [];
			cellsHandler(function($cell){cells.push($cell)});
			return cells;
		}
		/**
		 * 遍历列的所有单元格
		 */
		function cellsHandler(handler){
			if(param.$cells instanceof $){
				param.$cells.each(function(){
					(handler || $.noop)($(this));
				});
			}else if($.isArray(param.$cells)){
				for(var i in param.$cells){
					$(param.$cells[i]).each(function(){
						(handler || $.noop)($(this));
					});
				}
			}
		}
		/**
		 * 移除列
		 */
		this.remove = function(){
			cellsHandler(function($cell){$cell.remove()});
			param.$domination.remove();
		};
		
		/**
		 * 移动元素的索引
		 * @param $ele 要移动的元素
		 * @param index 移动后的索引
		 * @param slibingSelector 兄弟元素的选择器
		 */
		function move($ele, index, slibingSelector){
			var $parent = $ele.parent();
			var $siblings = $parent.children(slibingSelector);
			var originIndex = $siblings.index($ele);
			if(originIndex !== index){
				if($siblings.length <= index){
					$parent.append($ele);
				}else{
					$parent.children(slibingSelector).eq(index).before($ele);
				}
			}
		}
		
		/**
		 * 将列移动到指定索引位置
		 */
		this.moveTo = function(index){
			if(index >= 0){
				move(param.$domination, index, '*');
				cellsHandler(function($cell){
					move($cell, index, 'td,th');
				});
			}
		}
		
		this.isFieldAvailable = function(){
			return param.fieldAvailable;
		}
	}
	
	
});