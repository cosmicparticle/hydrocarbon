/**
 * 
 */
define(function(require, exports, module){
	var Utils = require('utils');
	var FieldSearch = require('field/js/field-search.js');
	var FieldInput = require('field/js/field-input.js');
	
	exports.init = function(_param){
		var defParam = {
			$page			: null,
			moduleName		: null,
			ttmplData		: null,
			configStructure	: null
		}
		var param = $.extend({}, defParam, _param);
		
		var $page = param.$page;
		
		//模块结构元数据
		var configStructure = param.configStructure;
		console.log(configStructure);
		
		//模板初始数据
		var ttmplData = param.ttmplData;
		console.log(ttmplData);
		
		
		//Node模板
		var $nodeConfigTmpl = $('#node-config-tmpl', $page);
		//node的模块配置中所有RABC关系模板
		var $moduleRelTmpl = $('#module-rel-tmpl', $page);
		//已添加的关系模板
		var $selectableRelationTmpl = $('#selectable-relation-tmpl', $page);
		//关系条件字段选择器模板
		var $criteriaFieldSearchTmpl = $('#criteria-field-search-tmpl', $page);
		//条件对象模板
		var $criteriaItemTmpl = $('#criteria-item-tmpl', $page);

		//Node容器
		var $nodeConfigContainer = $('#node-configs-container', $page);
		//添加Node的模块选择框
		var $addNodeType = $('#add-node-type', $page).empty();
		

		
		
		//根据模块结构元数据，初始化配置控件
		var abcNodes = configStructure.abcNodes;
		var abcNodeMap = {};
		var moduleNodeMap = {};
		for(var i in abcNodes){
			var abcNode = abcNodes[i];
			abcNodeMap[abcNode.mappingId] = abcNode;
			moduleNodeMap[abcNode.moduleName] = abcNode;
			$addNodeType.append('<option value="' + abcNode.mappingId + '">' + abcNode.moduleTitle + '</option>');
		}
		
		var thisNode = abcNodeMap[configStructure.rootNodeMappingId];
		
		/**
		 * 构造用于NodeConfig模板的数据对象
		 */
		function buildNodeConfigTmplData(nodeConfig){
			var abcNode = nodeConfig.abcNode;
			var tmplData = {
				nodeId		: nodeConfig.id || '',
				nodeTitle	: nodeConfig.title || abcNode.moduleTitle,
				nodeName	: abcNode.moduleTitle,
				nodeModule	: abcNode.moduleName,
				selector	: nodeConfig.selector || '',
				nodeText	: nodeConfig.nodeText || '',
				nodeColor	: nodeConfig.nodeColor,
				rels		: [],
				selectableRelations	: [],
				uuid		: Utils.uuid(5, 62),
				templateGroupId	: nodeConfig.templateGroupId || '',
				templateGroupTitle	: nodeConfig.templateGroupTitle || '',
				hideDetailButton	: nodeConfig.hideDetailButton || 0,
				hideUpdateButton	: nodeConfig.hideUpdateButton || 0,
				isDirect			: nodeConfig.isDirect
			};
			for(var i in abcNode.rels){
				var rel = abcNode.rels[i];
				tmplData.rels.push({
					mappingId	: rel.mappingId,
					name		: rel.name,
					relIndex	: i
				});
			}
			var relationMap = {};
			for(var i in nodeConfig.relations){
				var relConfig = nodeConfig.relations[i];
				relationMap['id_' + relConfig.id] = relConfig;
				var rel = getNodeRelation(abcNode, relConfig.relationName);
				tmplData.selectableRelations[i] = {
					id			: relConfig.id,
					name		: relConfig.relationName,
					mappingId	: rel.rabcNodeMappingId,
					title		: relConfig.title
				};
			}
			tmplData.relationMap = relationMap;
			return tmplData;
		}
		function getNodeRelation(abcNode, relationName){
			if(abcNode.rels){
				for(var i in abcNode.rels){
					if(abcNode.rels[i].name === relationName){
						return abcNode.rels[i];
					}
				}
			}
		}
		
		/**
		 * 绑定按钮，弹出框选择关系
		 */
		function bindNodeConfigAddRelationEvent($nodeConfig, abcNode){
			var $popup = $('.node-relation-popup', $nodeConfig);
			$('.node-relation-selector>i', $nodeConfig).click(function(){
				var $icon = $(this);
				if($popup.is('.actived')){
					hideRelationPopup();
				}else{
					$popup.appendTo($nodeConfig.find('.node-relations')).addClass('actived');
					
					var $popupOffsetParent = $popup[0].offsetParent;
					var $n = $icon[0];
					//计算当前按钮位置，并在该位置弹出选择框
					var offsetTop = 0,
						offsetLeft = 0;
					while($n && $n.offsetParent !== $popupOffsetParent){
						offsetTop += $n.offsetTop;
						offsetLeft += $n.offsetLeft;
						$n = $n.offsetParent;
					}
					if($n){
						offsetTop += $n.offsetTop - 100;
						offsetLeft += $n.offsetLeft - 2;
						$popup.css({
							left	: offsetLeft + 'px',
							top		: offsetTop + 'px'
						})
					}else{
						$.error('icon不在popup的定位容器内');
					}
					
				}
			});
			//选择关系后添加到selectableRelations里
			$('.node-relation-popup>div', $nodeConfig).click(function(){
				//TODO: 添加关系，激活关系
				var relIndex = $(this).attr('rel-index');
				var rel = abcNode.rels[relIndex];
				if(rel){
					appendSelectableRel(rel, $nodeConfig);
					hideRelationPopup();
				}
			});
			//隐藏弹出框
			function hideRelationPopup(){
				$popup.removeClass('actived').insertAfter($('.node-relation-selector>i', $nodeConfig));
			}
		}
		
		//添加Node到当前页面的容器中
		function addNode(nodeConfig){
			//构造用于NodeConfig模板的数据对象
			var tmplData = buildNodeConfigTmplData(nodeConfig);
			//根据数据构造NodeConfig的DOM
			var $nodeConfig = $nodeConfigTmpl.tmpl(tmplData);
			//将NodeConfig的DOM放到容器中
			$nodeConfigContainer.append($nodeConfig);
			bindNodeTitle($nodeConfig);
			//为NodeConfig的DOM绑定数据和事件
			bindColorpicker($('.node-color', $nodeConfig));
			//绑定移除事件
			bindRemoveEvent($nodeConfig);
			//绑定根节点配置事件
			bindRootNodeEvent($nodeConfig, nodeConfig);
			bindNodeConfigAddRelationEvent($nodeConfig, nodeConfig.abcNode);
			//绑定提示框控件
			bindTooltip($nodeConfig);
			//绑定直接显示子节点的事件
			bindGapEvent($nodeConfig);
			
			//绑定NodeConfig的初始Relation的数据
			$('.selectable-relations>[data-id]', $nodeConfig).each(function(){
				var $selectableRel = $(this);
				var relId = $(this).attr('data-id');
				if(relId){
					var relConfig = tmplData.relationMap['id_' + relId];
					var rel = getNodeRelation(nodeConfig.abcNode, relConfig.relationName);
					if(rel){
						$selectableRel.data('init-rel-config', relConfig);
						$selectableRel.data('data-rel',rel);
					}
				}
			});
			//绑定NodeConfig内所有Relation的代理点击事件
			$nodeConfig.on('click', '.selectable-relations>div', function(){
				var $rel = $(this);
				if(!$rel.is('.selected')){
					enableRelation.apply($rel, [$nodeConfig]);
				}
			}).on('click', '.btn-remove-relation', function(){
				var $rel = $(this).closest('.selectable-relations>div');
				require('dialog').confirm('确认删除该关系节点？').done(function(){
					$rel.remove();
				});
			})
			//关系名可编辑
			.on('dblclick', '.selectable-relations>div>.selectable-relation-title', function(){require('utils').toEditContent(this)});
			return $nodeConfig;
		}
		
		
		//添加Node
		$('#btn-add-node', $page).click(function(){
			var nodeMappingId = $('#add-node-type', $page).val();
			if(nodeMappingId && abcNodeMap[nodeMappingId]){
				var abcNode = abcNodeMap[nodeMappingId];
				addNode({abcNode});
			}
		});
		
		//当前已选的关系
		var $selectedRel = null;

		/**
		 * 在Node中添加关系
		 */
		function appendSelectableRel(rel, $nodeConfig){
			var $selectableRelations = $('.selectable-relations', $nodeConfig);
			$selectableRelations.trigger('add-selectable-relation', [function(){
				var mappingId = rel.mappingId;
				var tmplData = {
					mappingId	: rel.rabcNodeMappingId,
					name		: rel.name,
					id			: rel.id || '',
					title		: rel.name
				}
				var $rel = $selectableRelationTmpl.tmpl(tmplData);
				$rel.data('data-rel', rel);
				/*$('.btn-remove-relation', $rel).click(function(){
					require('dialog').confirm('确认删除该关系节点？').done(function(){
						$rel.remove();
					});
				});*/
				$('.selectable-relations', $nodeConfig).append($rel);
			}]);
		}
		
		 
		/**
		 * 激活某个selectableRelation
		 * 方法的this指向关系的DOM对象
		 */
		function enableRelation($nodeConfig){
			var rel = this.data('data-rel');
			if(rel.rabcNodeMappingId){
				var relationNode = abcNodeMap[rel.rabcNodeMappingId];
				if(relationNode){
					var LtmplUpdate = require('tmpl/js/ltmpl-update.js');

					if($selectedRel){
						var selectedCriteriaHandler = $selectedRel.data('criteriaHandler');
						if(selectedCriteriaHandler){
							$selectedRel.data('criteriaData', selectedCriteriaHandler.getCriteriaData());
						}
					}

					var $criteriaContainer = $('.relation-criterias', $nodeConfig);
					$criteriaContainer.empty();

					var $detailArea = $('.relation-criteria-detail', $nodeConfig);
					var $top = $detailArea.find('>.relation-criteria-detail-top');
					$top.find('>.criteria-field-search').remove();
					var $criteriaFieldSearch = 
							$criteriaFieldSearchTmpl.tmpl().addClass('relation-filter-field-mode')
									.prependTo($top);
					var criteriaData = this.data('criteriaData');
					var initRelConfig = this.data('init-rel-config');
					if(!criteriaData){
						if(initRelConfig){
							criteriaData = initRelConfig.criterias;
						}
					}

					var criteriaHandler = LtmplUpdate.initCriteria({
						$page					: $('.relation-config', $nodeConfig),	
						$criteriaFieldSearch	: $criteriaFieldSearch,
						$fieldPickerContainer	: $('#configs-area', $page),
						moduleName				: relationNode.moduleName,
						$detailArea				,
						$criteriaContainer		: $criteriaContainer,
						$criteriaItemTmpl		: $criteriaItemTmpl,
						criteriaData			: criteriaData,
						filterRelLabels			: rel.labels.map(function(item){
							return {id:item,text:item}
						})
					});

					this.data('criteriaHandler', criteriaHandler);

					$('.criteria-opr-area>i', $nodeConfig).off('click').click(function(){
						criteriaHandler.addCriteria();
					});
					$selectedRel = this;
					$('.selectable-relations', $nodeConfig).children('.selected').removeClass('selected');
					this.addClass('selected');
				}
			}
		}
		
		
		$('#save', $page).click(function(){
			var Dialog = require('dialog');
			var saveData = checkSaveData();
			if(saveData){
				require('ajax').postJson('admin/tmpl/tree/save/' + param.moduleName, saveData, function(data){
					if(data.status === 'suc'){
						Dialog.notice('保存成功', 'success');
						$page.getLocatePage().close();
						var tpage = require('page').getPage(param.moduleName + '_tmpl_tree_list');
						if(tpage){
							tpage.refresh();
						}
					}else{
						Dialog.notice('保存失败', 'error');
					}
				});
			}
		});
		
		function checkSaveData(){
			var saveData = {};
			var Dialog = require('dialog');
			var title = $('#tmplTitle', $page).val();
			if(!title){
				Dialog.notice('请输入模板名称', 'error');
				return null;
			}
			var ttmpl = {
				title,
				module			: param.moduleName,
				defaultNodeColor: $('#def-node-color', $page).val(),
				maxDeep			: $('#max-deep', $page).val(),
				nodes		: []
			};
			saveData.ttmpl = ttmpl;
			
			if(ttmplData){
				ttmpl.id = ttmplData.id || '';
			}
			var $nodeConfigs = $nodeConfigContainer.children('.node-config');
			
			$nodeConfigs.each(function(){
				var $nodeConfig = $(this);
				var node = {
					id				: $nodeConfig.attr('data-id'),
					title			: $('.node-title', $nodeConfig).text(),
					moduleName		: $('.nodeModule', $nodeConfig).val(),
					nodeColor		: $('.node-color', $nodeConfig).val(),
					selector		: $('.node-selector', $nodeConfig).val(),
					text			: $('.node-text', $nodeConfig).text(),
					templateGroupId	: $('#templateGroupId', $nodeConfig).val(),
					hideDetailButton: $('.show-detail-button', $nodeConfig).prop('checked')? '': 1,
					hideUpdateButton: $('.show-update-button', $nodeConfig).prop('checked')? '': 1,
					isRootNode		: $('.is-root-node', $nodeConfig).prop('checked')? 1: '',
					isDirect		: $('.is-direct', $nodeConfig).prop('checked')? 1: '',
					criterias		: [],
					relations		: []
				};
				var nodeCriteriasHandler = $('.ttmpl-root-criterias', $nodeConfig).data('criteriaHandler');
				if(nodeCriteriasHandler){
					node.criterias = nodeCriteriasHandler.getCriteriaData();
				}
				
				$('.node-relations>.node-relation-list>.selectable-relations>div[rel-name]', $nodeConfig).each(function(){
					var $rel = $(this);
					var rel = {
						id			: $rel.attr('data-id'),
						relationName: $rel.attr('rel-name'),
						title		: $rel.find('.selectable-relation-title').text(),
						criterias	: []
					};
					if($selectedRel){
						if($rel.is($selectedRel)){
							var selectedCriteriaHandler = $selectedRel.data('criteriaHandler');
							if(selectedCriteriaHandler){
								$selectedRel.data('criteriaData', selectedCriteriaHandler.getCriteriaData());
							}
						}
					}
					var criteriaData = $rel.data('criteriaData');
					if(criteriaData){
						rel.criterias = criteriaData;
					}else{
						var initRelConfig = $rel.data('init-rel-config');
						if(initRelConfig){
							$.extend(rel, convertToSaveData(initRelConfig));
						}
					}
					
					node.relations.push(rel);
				});
				ttmpl.nodes.push(node);
			});
			return saveData;
		}
		
		function convertToSaveData(initRelConfig){
			var saveData = {
				criterias	: initRelConfig.criterias
			};
			
			return saveData;
		}
		
		bindColorpicker($('#def-node-color', $page));
		
		
		//根据模板初始数据，初始化页面
		if(ttmplData && ttmplData.id){
			if(ttmplData.nodes){
				for(var i in ttmplData.nodes){
					var node = ttmplData.nodes[i];
					var abcNode = moduleNodeMap[node.moduleName];
					//构造方法参数
					var theNode = $.extend({
						abcNode		: abcNode,
							id			: node.id,
							selector	: node.selector,
							nodeText	: node.text,
							relations	: node.relations,
							nodeColor	: node.nodeColor,
							isRootNode	: node.isRootNode,
							criterias	: node.criterias,
							isDirect	: node.isDirect,
							templateGroupId		: node.templateGroupId,
							templateGroupTitle	: node.templateGroupTitle,
							hideDetailButton	: node.hideDetailButton,
							hideUpdateButton	: node.hideUpdateButton
					}, node);
					//添加Node
					addNode(theNode);
				}
			}
		}else{
			//添加默认节点模板
			var rootNode = abcNodeMap[configStructure.rootNodeMappingId];
			var $defRootNode = addNode({abcNode:rootNode});
		}
		
		
	}
	/*function bindSwitchFilterMode($nodeConfig){
		$('.relation-filter-mode-switch', $nodeConfig).change(function(){
			var $criteriaDetail = $('.relation-criteria-detail', $nodeConfig);
			var checked = $(this).prop('checked');
			if(checked){
				$criteriaDetail
					.addClass('relation-filter-mode-label')
					.removeClass('relation-filter-mode-field');
			}else{
				$criteriaDetail
					.addClass('relation-filter-mode-field')
					.removeClass('relation-filter-mode-label');
			}
			
			
			
			
		});
	}*/
	
	function bindNodeTitle($nodeConfig){
		$('.node-title', $nodeConfig).on('dblclick', function(){
			require('utils').toEditContent(this);
		});
	}
	
	function bindColorpicker($texts){
		$texts.each(function(){
			$(this).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
		});
	}
	
	function bindRemoveEvent($nodeConfig){
		$('#btn-remove-node', $nodeConfig).click(function(){
			require('dialog').confirm('确认删除该节点？').done(function(){
				$nodeConfig.remove();
			});
		});
	}
	
	function bindRootNodeEvent($nodeConfig, nodeConfig){
		$('.is-root-node', $nodeConfig).change(function(e, criterias){
			var page = $nodeConfig.getLocatePage();
			//判断当前是否已经有设为根节点的配置，如果已经有了，就alert，并且取消勾选状态
			var $this = $(this);
			var checked = $this.prop('checked');
			var $rootCriteriasContainer = $('.ttmpl-root-criterias', $this.closest('.form-group'));
			if(checked){
				var $isRootNode = $nodeConfig.closest('#node-configs-container').children('.is-root-node:checked');
				var hasChecked = $isRootNode.not($this).length;
				if(hasChecked){
					Dialog.notice('存在设置为根的节点配置');
					$this.prop('checked', false);
					return;
				}
			}else{
				//取消勾选时，移除筛选配置
				$('.criterias-area-body', $nodeConfig).remove();
				$rootCriteriasContainer.removeData('criteriaHandler');
				return;
			}
			//放入筛选定义控件，并且初始化筛选控件
			var criterias = criterias || [];
			var criteriaHandler = initNodeMainCriteria($rootCriteriasContainer, nodeConfig.abcNode.moduleName, criterias);
			$rootCriteriasContainer.data('criteriaHandler', criteriaHandler);
		}).prop('checked', nodeConfig.isRootNode == 1).trigger('change', [nodeConfig.criterias]);
	}
	
	function initNodeMainCriteria($rootCriteriasContainer, mainModule, criteriaData){
		var $page = $rootCriteriasContainer.getLocatePage().getContent();
		var $criteriaArea = $('#node-main-criteria-tmpl', $page).tmpl({
			
		});
		$rootCriteriasContainer.append($criteriaArea);
		
		var $criteriaFieldSearch = $('.criteria-field-search-row .field-search', $criteriaArea)
		var $detailArea = $('.criteria-detail-area', $criteriaArea);
		var $criteriaContainer = $('.criterias-container', $criteriaArea);
		var criteriaHandler = require('tmpl/js/ltmpl-update').initCriteria({
			$page					: $page,	
			$criteriaFieldSearch	: $criteriaFieldSearch,
			$fieldPickerContainer	: $('#configs-area', $page),
			moduleName				: mainModule,
			$detailArea				,
			$criteriaContainer		: $criteriaContainer,
			criteriaData			: criteriaData
		});
		return criteriaHandler;
	}
	function bindTooltip($container){
		require('dialog').tooltip($('[data-toggle="tooltip"]', $container));
	}
	
	function bindGapEvent($nodeConfig){
		var $isDirect = $('.is-direct', $nodeConfig);
		var $selectableRelations = $('.selectable-relations', $nodeConfig);
		$isDirect.change(function(){
			var $this = $(this);
			var checked = $this.prop('checked');
			if(checked){
				var $relations = $selectableRelations.children();
				if($relations.length > 1){
					require('dialog').notice('可选关系多于1的情况下，无法勾选', 'error');
					$this.prop('checked', false);
				}
			}
		});
		$selectableRelations.on('add-selectable-relation', function(e, whenYes, whenNo){
			whenYes = whenYes || $.noop;
			whenNo = whenNo || $.noop;
			var $relations = $selectableRelations.children();
			if($relations.length > 0){
				if($isDirect.prop('checked')){
					require('dialog').confirm('“直接显示关系实体”勾选框被勾选，只能有一个可选关系。点击“是”将取消勾选，并添加可选关系。' +
							'点击“否”将不添加可选关系。', function(yes){
						if(yes){
							$isDirect.prop('checked', false);
							whenYes();
						}else{
							whenNo();
						}
					});
					return;
				}
			}
			whenYes();
		});
	}
	
});