/**
 * 
 */
define(function(require, exports, module){
	"use strict";
	
	var Utils = require('utils');
	
	function startupQuery(menuId, criterias){
		return require('ajax').ajax('api2/entity/curd/tree/' + menuId, $.extend({}, criterias));
	}
	
	function requireEntities(key, pageNo){
		return require('ajax').ajax('api2/entity/curd/ask_for/' + key, {
			pageNo	: pageNo
		});
	}
	exports.init = function(_param){
		var defParam = {
			$page			: null,
			menuId			: null
		};
		var param = $.extend({}, defParam, _param);
		
		var $page = param.$page;
		var $criteriaForm = $('#criteria-form', $page);
		startupQuery(param.menuId).done(function(data){
			$('.header-title>h1', $page).text(data.menu.title + '-树形视图');
			//渲染条件控件
			require('entity/js/entity-list.js')
				.renderCriterias(data.ltmpl.criterias, data.criteriaValueMap, $criteriaForm);
			//添加树形节点的样式
			if(data.nodeCSS){
				$page.prepend($('<style>').html(data.nodeCSS));
				$('#entities-tree-container', $page).addClass('cpf-tree-id-' + data.tmplGroup.treeTemplateId);
			}
				
			initTree($.extend({
				queryKey		: data.queryKey,
				defaultNodeTmpl	: data.nodeTmpl,
				isRenderButton	: 
					data.ltmpl.criterias 
					&& data.ltmpl.criterias.length > 0 
					&& data.tmplGroup.hideQueryButton != 1
			}, param))
		});
	}
	
	
	function initTree(_param){
		var defParam = {
			$page			: null,
			queryKey		: null,
			defaultNodeTmpl	: null,
			menuId			: null,
			renderOperates	: true,
			checkableNodeIds: []
		};
		var param = $.extend({}, defParam, _param);
		
		var $page = param.$page;
		var $criteriaForm = $('#criteria-form', $page);
		
		var events = {}; 
		
		function getEvent(eventName){
			var event = events[eventName];
			if(!events[eventName]){events[eventName] = $.Callbacks('stopOnFalse')}
			return events[eventName];
		}
		
		require('tmpl').load('media/jv/entity/tmpl/entity-tree.tmpl').done(function(tmplMap){
			
			var $entitiesTreeContainer = $('#entities-tree-container', $page);
			
			var $nodeItemTmpl = tmplMap['node-item-tmpl'],
				$loadMoreTmpl = tmplMap['load-more-tmpl'],
				$relsTmpl = tmplMap['rels-tmpl'];
			
			//渲染查询按钮
			renderButton(param.isRenderButton);
			//加载根节点的第一页节点
			renderFirstPage(param.queryKey);
			
			function renderFirstPage(queryKey){
				$entitiesTreeContainer.empty();
				requireEntities(queryKey, 1).done(function(data){
					
					var $lis = renderEntities(data, param.defaultNodeTmpl);
					var $ul = $('<ul>').append($lis);
					$entitiesTreeContainer.append($ul);
				});
			}
			
			
			function renderEntities(data, nodeTmpl, hasLoadMore){
				var nodes = [];
				$.each(data.entities, function(index){
					var uuid = Utils.uuid(5, 62);
					var node = $.extend({}, this, {
						text	: this.text,
						index	: index,
						uuid	: uuid
					});
					nodes.push(node);
				});
				
				var rels = [];
				if(nodeTmpl.relations){
					$.each(nodeTmpl.relations, function(){
						rels.push({
							id		: this.id,
							title	: this.title
						});
					});
				}
				var hasRelations = rels.length > 0;
				var uuidMap = {};
				var $lis = [];
				$.each(nodes, function(){
					uuidMap[this.uuid] = this;
					var $li = $nodeItemTmpl.tmpl($.extend({hasRelations, nodeTmpl, 
						renderOperates: param.renderOperates,
						checkableNodeIds: param.checkableNodeIds}, this), {
						openPage	: function(type, nodeId, code, title){
							require('tab').openInTab('jv/entity/curd/node_' + type +  '/' + param.menuId + '/' + nodeId + '/' + code, 
									'entity_' + type + '_' + nodeId + '_' + code, 
									title);
						}
					});
					$lis.push($li);
				});
				//var $ul = $nodesTmpl.tmpl({nodes, hasRelations, isEndList: data.isEndList});
				
				var isDirect = rels.length <= 1 && nodeTmpl.isDirect == 1;
				
				var bindThisItemsEvent = function($items){
					bindItemEvent($items).setFirstExpand(function(expandChildren, setLoading){
						var entityCode = this.closest('[entity-code]').attr('entity-code');
						
						function loadAndAppendRelEntities(relId, $relLi, expandChildren, setLoading){
							//设置节点的加载标志，防止重复加载
							setLoading(true);
							requireRelsQueryKey(entityCode, relId).done(function(queryData){
								if(queryData.queryKey){
									requireEntities(queryData.queryKey, 1).done(function(relEntityData){
										if(relEntityData.entities){
											var $relEntitiesLis = renderEntities(relEntityData, queryData.nodeTmpl);
											var $relEntitiesUl = $('<ul>').append($relEntitiesLis);
											$relLi.append($relEntitiesUl);
										}
										expandChildren();
										//加载结束，取消加载标志
										setLoading(false);
									}).fail(function(){
										console.log('查询失败[key=' + queryData.queryKey + ']');
									});
								}
							}).fail(function(){
								console.error('创建查询失败')
							});
						}
						
						if(isDirect == 1){
							//直接显示唯一关系的子实体
							var relId = rels[0].id;
							loadAndAppendRelEntities(relId, this, expandChildren, setLoading);
						}else{
							var $rels = $relsTmpl.tmpl({rels});
							//绑定点击关系时的展开
							bindItemEvent($('>li[rel-id]', $rels)).setFirstExpand(function(expandChildren, setLoading){
								var relId = this.attr('rel-id');
								//TODO：调用接口获得该关系下的所有实体
								console.log(entityCode + '/' + relId);
								loadAndAppendRelEntities(relId, this, expandChildren, setLoading);
							});
							this.append($rels);
							expandChildren();
						}
					});
				}
				bindThisItemsEvent($lis);
				
				if(!data.isEndList && !hasLoadMore){
					var $loadMore = $loadMoreTmpl.tmpl();
					var currentPageNo = data.pageInfo.pageNo;
					$loadMore.click(function(){
						//设置标记开始加载下一页
						//调用接口返回下一页的数据
						requireEntities(data.queryKey, currentPageNo + 1).done(function(nextData){
							//根据数据渲染node
							var $nextLis = renderEntities(nextData, nodeTmpl, true);
							currentPageNo = nextData.pageInfo.pageNo;
							$.each($nextLis, function(){
								$loadMore.before(this);
							});
							if(nextData.isEndList){
								$loadMore.remove();
							}
						});
					});
					$lis.push($loadMore);
				}
				
				return $lis;
			}
			
			function requireRelsQueryKey(entityCode, relTmplId){
				return require('ajax').ajax(
						'api2/entity/curd/start_query_rel/' 
						+ param.menuId + '/' + entityCode + '/' + relTmplId)
					.done(function(data){
						console.log(data);
					});
			}
			function bindItemEvent($lis){
				var firstExpandCallback = $.noop;
				var result = {
						setFirstExpand	: function(callback){
							firstExpandCallback = callback || $.noop;
						}
				};
				$.each($lis, function(){
					$('>a>label', this).click(function(){
						var $label = $(this);
						var entityCode = $label.closest('[entity-code]').attr('entity-code');
						var $a = $label.closest('a');
						var toChecked = !$a.is('.node-checked');
						var p = {entityCode, checked:toChecked, cancel:false};
						getEvent('node-check').fireWith($label, [p])
						if(p.cancel != true){
							$label.closest('a').toggleClass('node-checked', toChecked);
						}
					
					});
					$('>a>i', this).click(function(){
						var $li = $(this).closest('li');
						if($li.data('node-children-loading') === true){
							return;
						}
						var expandChildren = function(){$li.toggleClass('node-expanded')};
						var setLoading = function(loading){$li.data('node-children-loading', !!loading)}
						if($li.children('ul').length === 0){
							firstExpandCallback.apply($li, [expandChildren, setLoading]);
						}else{
							expandChildren();
						}
					});
					/*$('i[action-type]', this).click(function(){
						doAction.apply(this, [$(this).attr('action-type')]);
					});*/
				});
				return result;
			}
			
			function renderButton(isRenderButton){
				tmplMap['form-buttons']
					.tmpl({isRenderButton}, {
						rootQuery	: function(){
							var criterias = require('entity/js/criteria-render-factory').collectCriterias($criteriaForm);
							startupQuery(param.menuId, criterias).done(function(data){
								renderFirstPage(data.queryKey);
							});
						}
					})
					.appendTo($('#form-buttons', $criteriaForm));
			}
			
			/*function doAction(actionType, actionId){
				var $li = $(this).closest('li[node-id]');
				var nodeId = $li.attr('node-id'),
				code = $li.attr('entity-code');
				switch(actionType){
				case 'detail':
					require('tab').openInTab('jv/entity/curd/node_detail/' + param.menuId + '/' + nodeId + '/' + code, 
							'node_detail_' + nodeId + '_' + code);
					break;
				case 'update':
					require('tab').openInTab('jv/entity/curd/node_update/' + param.menuId + '/' + nodeId + '/' + code, 
							'node_update_' + nodeId + '_' + code);
					break;
				}
			}*/
		});
		return {
			bind	: function(eventName, callback){
				getEvent(eventName).add(callback);
			}
		}
	}
	
	exports.initTree = initTree;
});