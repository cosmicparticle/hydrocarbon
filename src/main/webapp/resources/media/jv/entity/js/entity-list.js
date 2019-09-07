/**
 * 
 */
define(function(require, exports, module){
	"use strict";
	var Poll = require('poll');
	
	
	//导出的全局句柄
	var exportHandler = Poll.global('modules-list');
	
	var CriteriaRenderFactory = require('entity/js/criteria-render-factory.js');
	function renderCriterias(criterias, criteriaValueMap, $criteriaForm){
		var $formButtons = $('>#form-buttons', $criteriaForm);
		
		$criteriaForm.children('.form-group').not($formButtons).remove();
		var fieldIds = [];
		$.each(criterias, function(){
			if(['select', 'multiselect'].indexOf(this.inputType) >= 0){
				fieldIds.push(this.fieldId)
			}
		});
		function doRender(optionsMap){
			$.each(criterias, function(i){
				var tCriteria = this;
				var options = optionsMap && this.fieldId? optionsMap[this.fieldId]: [];
				CriteriaRenderFactory.getRenderer(tCriteria, options).done(function(criteriaRenderer){
					var $formgroup = criteriaRenderer.render(criteriaValueMap[tCriteria.id]);
					if($formgroup){
						if($formButtons){
							$formButtons.before($formgroup);
						}
					}
					if(i == criterias.length - 1){
						require('form').initFormInput($criteriaForm.parent());
					}
				});
			});
		}
		if(fieldIds.length > 0){
			//到后台请求枚举数据
			require('ajax').ajax('api2/meta/dict/field_options', {fieldIds: fieldIds.join()}, function(data){
				doRender(data.optionsMap);
			});
		}else{
			doRender();
		}
	}
	exports.renderCriterias = renderCriterias;
	
	exports.init = function(_param){
		var defParam = {
			$page	: null,
			menuId	: null
		};
		
		var param = $.extend({}, defParam, _param);
		var $page = param.$page;
		var Ajax = require('ajax');
		var $table = $('.list-area>table', $page);
		var $criteriaForm = $('#criteria-form', $page);
		var $formButtons = $('>#form-buttons', $criteriaForm).empty();
		//绑定勾选框对按钮的启用状态的影响
		bindCheckboxAffectButtonEvent();
		
		require('tmpl').load('media/jv/entity/tmpl/entity-list.tmpl').done(function(tmplMap){
			var queryKey = null;
			var menu = null;
			var ltmpl = null
			var entities = null;
			var tmplGroup = null;
			var statView = null;
			var pageNo = 1;
			var pageSize = 10;
			var totalCount = null;
			var pageInfo = null;
			
			var context = require('utils').createContext({
				statView		: null,
				columns			: [],
				oDisabledColIds	: [],
				disabledColIds	: []
			});
			
			context
				.bind('statView', renderViewColsWindow);
			
			//执行加载页面后的第一次查询
			queryList();
			
			
			$criteriaForm.submit(function(e){
				e.preventDefault();
				var criterias = CriteriaRenderFactory.collectCriterias(this);
				queryList(criterias, context.getStatus('oDisabledColIds'));
				return false;
			});
			
			/**
			 * 根据条件查询数据
			 */
			function queryList(criterias, disabledColIds){
				var $CPF = require('$CPF');
				$CPF.showLoading();
				//发起数据请求
				Ajax.ajax('api2/entity/curd/start_query/' + param.menuId, $.extend({
					disabledColIds	: disabledColIds && disabledColIds.join() || ''
				}, criterias), function(data){
					if(!criterias && data.ltmpl){
						menu = data.menu;
						tmplGroup = data.tmplGroup;
						statView = data.statView;
						renderTitle(data);
						//获得列表模板
						ltmpl = data.ltmpl;
						console.log(ltmpl);
						renderCriterias(ltmpl.criterias, data.criteriaValueMap, $criteriaForm);
						renderButtons();
					}
					var disabledColIds = data.disabledColIds || [];
					context.setStatus('disabledColIds', disabledColIds);
					context.setStatus('oDisabledColIds', disabledColIds);
					context.setStatus(ltmpl, ['columns', 'criterias']);
					context.setStatus(data, ['criteriaValueMap', 'statView']);
					renderTableHeader();
					//获得queryKey，查询实体
					if(data.queryKey){
						queryKey = data.queryKey;
						//查询数据
						queryPage(1, 10).done(function(){
							$CPF.closeLoading();
						});
						bindExport();
					}
				});
			}
			
			/**
			 * 根据后台返回的queryKey和分页信息查询实体数据
			 */
			function queryPage(_pageNo, _pageSize){
				if(_pageNo) pageNo = _pageNo;
				if(_pageSize) pageSize = _pageSize;
				var defer = $.Deferred();
				var $CPF = require('$CPF');
				$CPF.showLoading();
				Ajax.ajax('api2/entity/curd/ask_for/' + queryKey, {pageNo,pageSize}, 
					function(data){
						entities = data.entities;
						renderEntities();
						renderPaginator(data.pageInfo);
						$CPF.closeLoading();
						defer.resolve();
				});
				return defer.promise();
			}
			
			function renderTitle(data){
				$('.header-title>h1', $page).text(menu.title + '-列表');
				$('.page-header>.header-buttons', $page)
					.children(':not(.refresh)').remove()
					.end().append(tmplMap['header-buttons'].tmpl({
						moduleWritable	: data.moduleWritable,
						tmplGroup		: tmplGroup,
						statView		: statView,
						menuId			: menu.id,
						menuTitle		: menu.title
					}, {
						toggle	: function(eleSel){
							$(eleSel, $page).toggle();
						},
						recalc	: function(){
							var Dialog = require('dialog');
							Dialog.confirm('确认重新统计？').done(function(){
								var $CPF = require('$CPF');
								$CPF.showLoading();
								Ajax.ajax('api2/entity/curd/recalc/' + param.menuId).done(function(data){
									if(data.status === 'suc'){
										Dialog.notice('操作成功', 'success');
										$page.getLocatePage().refresh();
									}else{
										Dialog.notice('操作失败', 'error');
									}
								}).always(function(){
									$CPF.closeLoading();
								});
							});
						}
					}));

			}
			
			function renderButtons(){
				$formButtons.empty().append(tmplMap['form-buttons'].tmpl({
					tmplGroup	: tmplGroup,
					statView	: statView,
					hasCriterias: ltmpl.criterias && ltmpl.criterias.length > 0
				}, {
					doAction		: function(actionId, actionTitle){
						var codes = [];
						var rowComposites = [];
						var checkedRowGetter = $table.data('checkedRowGetter');
						if(typeof checkedRowGetter === 'function'){
							var $rows = checkedRowGetter();
							if($rows){
								$rows.each(function(){
									var code = $(this).attr('data-code');
									rowComposites.push({code, $row:this});
									codes.push(code);
								});
							}
						}
						var url = null;
						var confirm = '';
						switch(actionId){
							case 'delete':
								url = 'api2/entity/curd/remove/' + param.menuId;
								confirm = '确定删除？共选择了' + codes.length + '项';
								break;
							default:
								url = 'api2/entity/curd/do_action/' + param.menuId + '/' + actionId;
								confirm = '确定执行操作【' + actionTitle + '】？共选择了' + codes.length + '项';
						}
						if(actionId){
							var Dialog = require('dialog');
							Dialog.confirm(confirm, function(yes){
								if(yes){
									require('ajax').ajax(url, {
										codes	: codes.join()
									}).done(function(data){
										if(data.status === 'suc'){
											handleAfterAction(actionId, rowComposites);
											Dialog.notice('执行成功', 'success');
										}else{
											Dialog.notice('执行失败', 'error');
										}
									});
								}
							});
							
						}
					}
				}))
			}
			
			function handleAfterAction(actionId, rowComposites){
				switch(actionId){
					case 'delete':
						$.each(rowComposites, function(){
							$(this.$row).remove();
						});
						if(totalCount != null){
							totalCount -= rowComposites.length;
							renderPaginator();
						}
						break;
					default:
				}
			}
			
			/**
			 * 渲染表头
			 */
			function renderTableHeader(){
				//加载表头
				if(ltmpl && ltmpl.columns){
					var $thead = $('thead>tr', $table).empty();
					$thead.append(tmplMap['th'].tmpl({
						columns			: ltmpl.columns, 
						operates		: ltmpl.operates,
						disabledColIds	: context.getStatus('disabledColIds')
					}));
				}
			}
			
			/**
			 * 渲染表格内的实体
			 */
			function renderEntities(){
				var $tbody = $('tbody', $table).empty();
				$.each(entities, function(i){
					var $row = tmplMap['entity-row'].tmpl({
						index			: i,
						columns			: ltmpl.columns,
						entity			: this,
						operates		: ltmpl.operates,
						menu			: menu,
						disabledColIds	: context.getStatus('disabledColIds')
					}).appendTo($tbody);
				});
			}
			
			function renderViewColsWindow(){
				var statView = context.getStatus('statView');
				if(statView){
					tmplMap['viewcols-window'].replaceIn($page, {
						columns			: context.getStatus('columns'),
						disabledColIds	: context.getStatus('disabledColIds')
					}, {
						toggleSelect: function(col){
							var $span = $(this);
							var disabledColIds = context.getStatus('disabledColIds');
							var disabled = $span.is('.disabled');
							if(disabled){
								$span.removeClass('disabled');
								disabledColIds.splice(disabledColIds.indexOf(col.id), 1);
							}else{
								$span.addClass('disabled');
								disabledColIds.push(col.id)
							}
							console.log(disabledColIds);
						},
						changeCols	: function(){
							var disabledColIds = context.getStatus('disabledColIds');
							var criteriaValueMap = context.getStatus('criteriaValueMap');
							var originCriterias = {};
							for(var criteriaId in criteriaValueMap){
								originCriterias['criteria_' + criteriaId] = criteriaValueMap[criteriaId];
							}
							queryList(originCriterias, disabledColIds);
							
						}
					})
					
				}
			}
			
			/**
			 * 渲染分页器
			 */
			function renderPaginator(_pageInfo){
				if(_pageInfo){
					pageInfo = _pageInfo;
				}
				var $listArea = $('.list-area', $page);
				$listArea.children('.cpf-paginator').remove();
				var endPageNo = pageInfo.virtualEndPageNo;
				if(totalCount != null){
					endPageNo = Math.ceil(totalCount / pageInfo.pageSize);
				}
				var pageNos = generatePageNos(pageInfo.pageNo, endPageNo);
				
				var $paginator = tmplMap['paginator'].tmpl({
					pageInfo	: pageInfo,
					pageNos		: pageNos,
					totalCount	: totalCount
				}, {
					goPage		: function(pageNo){
						queryPage(pageNo);
					},
					changePageSize	: function(){
						var pageSize = $(this).val();
						queryPage(1, pageSize);
					},
					viewCount		: function(){
						var $this = $(this);
						if(!$this.is('.counted')){
							require('ajax').ajax('api2/entity/curd/get_entities_count/' + queryKey, function(data){
								if(data.status === 'suc'){
									totalCount = data.count;
									renderPaginator(pageInfo);
								}
							});
						}
					},
					goPageTo		: function(){
						var pageNo = $('.cpf-paginator-jump-text', $paginator).val();
						if(require('utils').isInteger(pageNo)){
							queryPage(pageNo);
						}
					}
				});
				$('.page-size-select', $paginator).val(pageInfo.pageSize);
				$listArea.append($paginator);
			}
			
			var maxPageCount = 5;
			var lastPageCount = 1;
			
			function generatePageNos(pageNo, pageCount){
				var frontShowBegin = 1, frontShowEnd = pageCount, endShowBegin = undefined;
				if(pageCount > maxPageCount){
					//超过最大显示页数时，只显示部分页数
					//前面显示的页数必须是奇数，如果不是奇数，将会自动减1
					var frontPageCount = maxPageCount - lastPageCount - 1;
					if(frontPageCount%2 == 0){
						frontPageCount--;
					}
					//扣除最后页数和省略符号，剩余的是当前页号旁边显示的页号
					var halfFrontShowCount = (frontPageCount + 1) / 2;
					if(pageNo <= halfFrontShowCount){
						//在前半段，能直接显示第1个页号
						frontShowEnd = frontPageCount;
					}else if(pageNo >= pageCount - halfFrontShowCount){
						//在后半段，能直接显示到最后一个页号
						frontShowBegin = pageCount - maxPageCount + 1;
						frontShowEnd = pageCount;
					}else{
						//在中间，只显示当前页号旁边的几个页号和最后几个页号
						frontShowBegin = pageNo - halfFrontShowCount + 1;
						frontShowEnd = pageNo + halfFrontShowCount - 1;
					}
					if(frontShowEnd < pageCount - lastPageCount){
						endShowBegin = pageCount - lastPageCount + 1;
					}
				}
				var frontPageNos = [], endPageNos = undefined;
				for(var i= frontShowBegin; i <= frontShowEnd; i++){
					frontPageNos.push(i);
				}
				if(endShowBegin){
					endPageNos = [];
					for(var i = endShowBegin; i <= pageCount; i++){
						endPageNos.push(i);
					}
				}
				return {frontPageNos, endPageNos};
			}
			
			
			
			var exportBinded = false;
			function bindExport(){
				if(exportBinded){
					return;
				}
				require('ajax').ajax('api2/entity/export/session_progress', function(data){
					var sessionExportStatusUuid = data.progressUUID;
					
					
					var $exportAll = $('#export-all', $page),
					$exportCur = $('#export-current-page', $page),
					$exportMsg = $('#export-msg', $page),
					$withDetail = $('#with-detail', $page),
					$msg = $('p', $exportMsg);
					
					$exportAll.change(function(e, flag){
						var checked = $exportAll.prop('checked');
						if(!flag){
							$exportCur.prop('checked', !checked).trigger('change', [true]);
						}
					});
					
					$exportCur.change(function(e, flag){
						var checked = $exportCur.prop('checked');
						if(!flag){
							$exportAll.prop('checked', !checked).trigger('change', [true]);
						}
						var $dataRange = $('.data-range', $page);
						if(checked){
							$dataRange.hide();
						}else{
							$dataRange.show();
						}
					});
					var $btnExport = $('#do-export', $page),
					$btnBreak = $('#do-break', $page),
					$btnDownload = $('#do-download', $page);
					//页面一开始加载时的初始化表单参数
					
					var $exportProgress = $('#export-progress', $page);
					
					//先将当前页面添加到订阅者中
					var subscriber = exportHandler.addSubscriber({
						key					: param.menuId,
						startupReqMethod	: 'ajax',
						startupURL			: 'api2/entity/export/start/' + param.menuId + '/' + queryKey,
						progressURL			: 'api2/entity/export/status',
						whenStartupResponse	: function(data, uuid){
							$msg.text('开始导出');
						},
						data				: {
							menuTitle	: menu.title,
							sourceMenuId: param.menuId,
						},
						progressHandler		: progressHandler,
						whenCompleted		: function(res){
							if(res.uuid){
								$msg.text('导出完成');
								$btnDownload.removeAttr('disabled').off('click').click(function(){
									Ajax.download('api2/entity/export/download/' + res.uuid + '?@token=' + Ajax.getAuthToken());
								}).show();
								$btnBreak.off('click').click(function(){
									resetExport();
								});
							}
						},
						whenBreaked			: function(){
							resetExport();
						},
						subscribeFunctions	: {
							progressHandler		: progressHandler,
							whenCompleted		: function(res){
								resetExport();
							},
							whenSubscribed		: function(e){
								var working = this.getGlobalPoll().getWorkingSubscriber();
								if(working){
									toggleWait(working);
								}
							},
							whenBreaked			: function(){
								resetExport();
							}
						}
					});
					function progressHandler(progress, res){
						var progressText = parseFloat(progress * 100).toFixed(0);
						var percent = progressText + '%';
						$msg.text(res.statusMsg || '');
						$exportProgress.find('.progress-text').text(percent).css('left', (parseFloat(progressText) - 3) + '%');
						$exportProgress.find('.progress-bar').attr('aria-valuenow', percent).css('width', percent);
					}
					
					//如果全局句柄当前没有在执行导出，那么根据从后台获得的参数来构造一次导入事件
					//判断当前session是否有导出工作正在处理
					if(sessionExportStatusUuid ){
						if(exportHandler.getStatus() != 'working'){
							//当前没有正在轮询的订阅者
							Ajax.ajax('api2/entity/export/work/' + sessionExportStatusUuid).done(function(work){
								if(work.menuId == param.menuId){
									if(work.scope === 'current'){
										$exportCur.prop('checked', true).trigger('change');
									}else if(work.scope === 'all'){
										$('#export-range-start', $page).val(work.rangeStart);
										$('#export-range-end', $page).val(work.rangeEnd);
										$exportAll.prop('checked', true).trigger('change');
									}
									$withDetail.prop('checked', work.withDetail == 'true').trigger('change');
									//menu对应
									subscriber.pollWith(work.uuid);
								}else{
									//menu不对应
									//创建空回调的订阅者
									var workingSubscriber = exportHandler.addSubscriber({
										startupURL			: 'api2/entity/export/start/' + work.queryKey,
										progressURL			: 'api2/entity/export/status',
										data				: {
											menuTitle	: work.menuTitle,
											sourceMenuId: work.menuId
										},
									});
									//启动空回调的轮询
									workingSubscriber.pollWith(work.uuid);
								}
								startPolling();
							});
						}
					}
					$btnExport.click(function(){
						var scope = $exportAll.prop('checked')? 'all': $exportCur.prop('checked')? 'current': null;
						if(scope){
							var rangeStart = scope == 'all' && $('#export-range-start', $page).val() || undefined,
							rangeEnd = scope == 'all' && $('#export-range-end', $page).val() || undefined,
							withDetail = $withDetail.prop('checked');
							subscriber.starts({
								scope		: scope,
								rangeStart	: rangeStart,
								rangeEnd	: rangeEnd,
								withDetail	: withDetail,
								sourceMenuId: param.menuId
							});
							startPolling();
						}else{
							$.error('导出范围不能为null');
						}
						
					});
					//轮询处理对象
					$page.getLocatePage().getEventCallbacks(['beforeClose', 'beforeLoad'], 'unique', function(callbacks){
						callbacks.add(function(e){
							if(exportHandler && exportHandler.getWorkingSubscriber() == subscriber){
								if(e.eventName === 'beforeClose'){
									require('dialog').notice('当前页面正在执行导出，需要等待导出结束后，才允许关闭', 'error');
								}else if(e.eventName === 'beforeLoad'){
									require('dialog').notice('当前页面正在执行导出，需要等待导出结束后，才允许刷新', 'error');
								}
								e.stopDefault();
							}else{
								exportHandler.removeSubscriber(subscriber);
							}
						});
					});
					function startPolling(){
						$exportMsg.show();
						$exportAll.attr('disabled', 'disabled');
						$exportCur.attr('disabled', 'disabled');
						$withDetail.attr('disabled', 'disabled');
						$exportProgress.find('.progress-text').text('0%').css('left', 0);
						$exportProgress.find('.progress-bar').attr('aria-valuenow', 0).css('width', 0);
						$exportProgress.show();
						$btnExport.hide();
						$btnDownload.show().attr('disabled', 'disabled');
						$('.external-export-message', $page).hide();
						$('.data-range :input', $page).attr('disabled', 'disabled');
						$btnBreak.show().off('click').click(function(){
							$btnBreak.attr('disabled', 'disabled');
							exportHandler.breaks();
						});
					}
					function resetExport(){
						$exportMsg.hide();
						$('#export-progress', $page).hide();
						$btnExport.show();
						$btnBreak.removeAttr('disabled').hide();
						$btnDownload.hide();
						$('.range-toggle', $page).show();
						$exportAll.removeAttr('disabled').trigger('change');
						$exportCur.removeAttr('disabled').trigger('change');
						$withDetail.removeAttr('disabled');
						$('.external-export-message', $page).hide();
						$('.data-range :input', $page).removeAttr('disabled');
					}
					function toggleWait(working){
						startPolling();
						var $menuLink = $('#export-menu-link', $page);
						var menuId = working.getData('menuId');
						$menuLink.text(working.getData('menuTitle'))
							.attr('href', 'jv/entity/curd/list/' + working.getData('sourceMenuId'))
							.attr('target', 'entity_list_' + working.getData('sourceMenuId'))
							.addClass('tab');
						$('.range-toggle', $page).hide();
						$('.data-range', $page).hide();
						$('.external-export-message', $page).show();
					}
				});
				exportBinded = true;
			}
		
		});
		//绑定表格中勾选框对按钮事件影响
		function bindCheckboxAffectButtonEvent(){
			$table.on('row-selected-change', function(e, $checkedRows){
				var $actionButtons = $('button.action-button', $page);
				var $btnDelete = $('#btn-delete', $page);
				if($checkedRows.length === 0){
					$actionButtons.attr('disabled', 'disabled');
					$btnDelete.attr('disabled', 'disabled');
				}else{
					$actionButtons.removeAttr('disabled');
					$btnDelete.removeAttr('disabled');
					if($checkedRows.length > 1){
						$actionButtons.filter('[data-multiple="0"]').attr('disabled', 'disabled');
					}
				}
			});
		}
	};
	
	
	
});