define(function(require, exports, module){
	"use strict";
	var Ajax = require('ajax');
	var Utils = require('utils');
	var Tmpl = require('tmpl');
	var $CPF = require('$CPF');
	var EntityPaginator = require('entity/js/entity-paginator');
	var CriteriaRendererFactory = require('entity/js/criteria-render-factory');
	exports.init = function(_param){
		var defParam = {
			$page			: null,
			validateSign	: null,
			except			: '',
			groupId			: null,
			$submitButton	: null
		};
		
		var param = $.extend({}, defParam, _param);
		
		param.excepts = param.except.split(',');
		var $page = param.$page;
		
		var status = Utils.createStatus({
			dialogType		: null,
			menu			: null,
			config			: null,
			queryKey		: null,
			selectedCodes	: []
		});
		
		var doWhen = Utils.DoWhen(function(){return status.getStatus('dialogType')});
		
		require('tmpl').load('media/jv/entity/tmpl/entity-select.tmpl').done(function(tmplMap){
			status
				.bind('config', renderFrame)
				.bind('queryKey', loadEntities)
				.bind('frameRendered', loadEntities)
				.bind('entities', renderEntities)
				.bind('selectedCodes', renderConfirmButtonStatus)
				;
			var $P = Tmpl.getPlaceholderQuery($page);
		
			loadConfig();
			startQuery();
			
			
			/**
			 * 绑定确定事件
			 */
			$page.getLocatePage().bind('footer-submit', function(data){
				var selectedCodes = status.getStatus('selectedCodes');
				if(selectedCodes && selectedCodes.length > 0){
					return createEntityLoader(selectedCodes, param.validateSign, param.groupId);
				}
			});
			
			/**
			 * 从后台加载配置数据
			 */
			function loadConfig(){
				Ajax.ajax('api2/meta/tmpl/select_config/' + param.validateSign + '/' + param.groupId).done(function(data){
					status.setStatus('dialogType', data.config.type);
					status.setStatus(data, ['menu', 'config']);
				});
			}
			/**
			 * 在当前页面上下文重新发起一次新的查询
			 */
			function startQuery(criterias){
				$CPF.showLoading();
				var excepts = {
					excepts	: param.except
				}; 
				Ajax.ajax('api2/entity/curd/query_select_entities/' + param.validateSign + '/' + param.groupId, $.extend({}, criterias, excepts)).done(function(data){
					if(data.queryKey){
						status.setStatus('queryKey', data.queryKey);
						$CPF.closeLoading();
					}
				});
			}
			
			/**
			 * 从后台加载实体列表（树形视图加载第一层）
			 */
			function loadEntities(){
				status.setStatus('selectedCodes', []);
				doWhen(['stmpl', 'ltmpl'], function(){
					var paginator = status.getStatus('paginator');
					if(paginator) paginator.totalCount = null;
					goPage(1, 10);
				});
				doWhen('ttmpl', function(){
					var config = status.getStatus('config');
					var queryKey = status.getStatus('queryKey');
					if(queryKey && status.getStatus('frameRendered')){
						require('entity/js/entity-tree').initTree({
							$page,
							queryKey,
							defaultNodeTmpl	: config.nodeTmpl,
							menuId			: param.validateSign,
							renderOperates	: false,
							checkableNodeIds: config.checkableNodeIds
						}).bind('node-check', function(data){
							var selectedCodes = status.getStatus('selectedCodes');
							if(data.checked){
								if(param.excepts.indexOf(data.entityCode) >= 0){
									require('dialog').notice('该实体已经存在，不能选择', 'error');
									data.cancel = true;
									return false;
								}
								selectedCodes.push(data.entityCode);
							}else{
								selectedCodes.splice(selectedCodes.indexOf(data.entityCode), 1);
							}
							status.setStatus('selectedCodes', selectedCodes);
						});
					}
				});
			}
			
			/**
			 * 跳转页码
			 */
			function goPage(pageNo, pageSize){
				var queryKey = status.getStatus('queryKey');
				if(queryKey && status.getStatus('frameRendered')){
					$CPF.showLoading();
					Ajax.ajax('api2/entity/curd/ask_for/' + queryKey, {pageNo, pageSize}, function(data){
						status.setStatus(data, ['pageInfo', 'isEndList', 'entities']);
						$CPF.closeLoading();
					});
				}
			}
			/**
			 * 根据模板渲染页面框架
			 */
			function renderFrame(){
				var config = this.getStatus('config');
				var dialogType = this.getStatus('dialogType');
				var criterias = $.grep(config.criterias, function(c){return c.queryShow == 1});
				//渲染条件区域，仅在条件条数大于0时
				if(criterias && criterias.length > 0){
					tmplMap['btn-query'].replaceIn($page, {}, {query: function(){startQuery(CriteriaRendererFactory.collectCriterias($(this).closest('form')))}});
					CriteriaRendererFactory.replaceFor(criterias, $P('criterias'));
				}
				
				//渲染实体区域
				tmplMap['select-entities'].replaceIn($page, {dialogType, config},{}, function($entitiesArea){
					doWhen(['stmpl', 'ltmpl'], function(){
						//渲染表格
						var $table = $('>table', $entitiesArea);
						//绑定每一行的选定事件
						require('selectable-table').bind($table);
						$table.on('row-selected-change', function(e, $checkedRows){
							status.setStatus('selectedCodes', $.map($checkedRows, function($row){return $($row).attr('data-code')}));
						});
						//渲染表头
						tmplMap['table-header'].replaceIn($page, {
							columns	: config.columns
						}, {});
						//创建分页器
						var paginator = new EntityPaginator({
							$plh	: $('style[target="paginator"]', $entitiesArea),
							goPage
						});
						status.setStatus('paginator', paginator);
					});
				});
				
				status.setStatus('frameRendered', true);
			}
			
			/**
			 * 渲染实体显示
			 */
			function renderEntities(){
				var entities = status.getStatus('entities');
				doWhen(['stmpl', 'ltmpl'], function(){
					var columns = status.getStatus('config').columns;
					tmplMap['entity-rows'].replaceIn($page, {entities, columns});
					refreshPaginator();
				});
			}
			
			/**
			 * 根据当前上下文刷新分页器
			 */
			function refreshPaginator(){
				var paginator = status.getStatus('paginator');
				var pageInfo = status.getStatus('pageInfo');
				paginator.endPageNo = pageInfo.virtualEndPageNo;
				paginator.queryKey = status.getStatus('queryKey');
				paginator.render();
			}
			
			/**
			 * 根据当前上下文，刷新确认按钮的状态
			 */
			function renderConfirmButtonStatus(){
				var selectedCodes = status.getStatus('selectedCodes');
				if(selectedCodes && selectedCodes.length > 0){
					param.$submitButton.removeAttr('disabled');
				}else{
					param.$submitButton.attr('disabled', 'disabled');
				}
			}
			
		});
	}
	
	/**
	 * 
	 */
	function createEntityLoader(codes, validateSign, groupId){
		var entitiesLoader = function(dfieldIds){
			var deferred = $.Deferred();
			if($.isArray(dfieldIds) && dfieldIds.length > 0){
				Ajax.ajax('api2/entity/curd/load_entities/' + validateSign + '/' + groupId, {
					codes		: codes.join(),
					dfieldIds	: dfieldIds.join()
				}, function(data){
					if(data.status === 'suc'){
						deferred.resolve(data.entities);
					}else{
						$.error('获取数据错误');
					}
				});
			}
			return deferred.promise();
		};
		entitiesLoader.codes = codes;
		return entitiesLoader;
	}
	exports.createEntityLoader = createEntityLoader;
	
	
});