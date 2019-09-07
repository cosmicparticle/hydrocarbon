define(function(require, exports, module){
	"use strict";
	var Form = require('form'),
		Ajax = require('ajax'),
		Utils = require('utils'),
		Poll = require('poll');
	
	
	//导出的全局句柄
	var exportHandler = Poll.global('modules-list');
	
	
	
		
	exports.init = function($page, moduleName, menuId, 
			menuTitle, 
			pageInfo, 
			sessionExportStatus){
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
		
		var initParam = {};
		Utils.botByDom($page.getLocatePage().getContent(), 'cpf-page-inited', function(){
			var $form = $('form', $page),
				formData = new FormData($form[0]);
			Form.formatFormData($form, formData)
			initParam = Utils.converteFormdata(formData);
			$.extend(initParam, pageInfo);
		});
		
		var $exportProgress = $('#export-progress', $page);
		
		//先将当前页面添加到订阅者中
		var subscriber = exportHandler.addSubscriber({
			key					: menuId,
			startupURL			: 'admin/modules/export/start/' + menuId,
			progressURL			: 'admin/modules/export/status',
			whenStartupResponse	: function(data, uuid){
				$msg.text('开始导出');
			},
			data				: {
				menuTitle	: menuTitle,
				menuId		: menuId
			},
			progressHandler		: progressHandler,
			whenCompleted		: function(res){
				if(res.uuid){
					$msg.text('导出完成');
					$btnDownload.removeAttr('disabled').off('click').click(function(){
						Ajax.download('admin/modules/export/download/' + res.uuid);
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
		if(sessionExportStatus.uuid ){
			if(exportHandler.getStatus() != 'working'){
				//当前没有正在轮询的订阅者
				Ajax.ajax('admin/modules/export/work/' + sessionExportStatus.uuid).done(function(work){
					if(work.menuId == menuId){
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
							startupURL			: 'admin/modules/export/start/' + work.menuId,
							progressURL			: 'admin/modules/export/status',
							data				: {
								menuTitle	: work.menuTitle,
								menuId		: work.menuId
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
					parameters	: initParam
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
				.attr('href', 'admin/modules/curd/list/' + menuId)
				.attr('target', 'entity_list_' + menuId)
				.addClass('tab');
			$('.range-toggle', $page).hide();
			$('.data-range', $page).hide();
			$('.external-export-message', $page).show();
		}
		
		var $actionButtons = $('button.action-button', $page);
		var $btnDelete = $('#btn-delete', $page);
		var $table = $('table', $page).on('row-selected-change', function(e, $checkedRows){
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
		function doAction(actionId, actionTitle){
			var codes = [];
			var checkedRowGetter = $table.data('checkedRowGetter');
			if(typeof checkedRowGetter === 'function'){
				var $rows = checkedRowGetter();
				if($rows){
					$rows.each(function(){
						codes.push($(this).attr('data-code'));
					});
				}
			}
			var url = null;
			var confirm = '';
			switch(actionId){
				case 'delete':
					url = 'admin/modules/curd/remove/' + menuId;
					confirm = '确定删除？共选择了' + codes.length + '项';
					break;
				default:
					url = 'admin/modules/curd/do_action/' + menuId + '/' + actionId;
					confirm = '确定执行操作【' + actionTitle + '】？共选择了' + codes.length + '项';
			}
			if(actionId){
				require('dialog').confirm(confirm, function(yes){
					if(yes){
						require('ajax').ajax(url, {
							codes	: codes.join()
						}, {
							page	: $page
						});
					}
				});
				
			}
		}
		
		$btnDelete.click(function(e){
			e.preventDefault();
			doAction('delete');
		});
		$actionButtons.click(function(e){
			var $this = $(this);
			e.preventDefault();
			doAction($this.attr('data-id'), $this.attr('title'));
		})
		
		
	}
});