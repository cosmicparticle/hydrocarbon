define(function(require, exports, module){
	"use strict";
	var Form = require('form'),
		Ajax = require('ajax'),
		Utils = require('utils')
	
	exports.init = function($page, moduleName, menuId, 
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
		//轮询处理对象
		var handler = Ajax.poll({
			startupURL			: 'admin/modules/export/start/' + menuId,
			progressURL			: 'admin/modules/export/status',
			whenStartupResponse	: function(data, uuid){
				$msg.text('开始导出');
			},
			progressHandler	: function(progress, res){
				var progressText = parseFloat(progress * 100).toFixed(0);
				var percent = progressText + '%';
				$msg.text(res.statusMsg || '');
				$exportProgress.find('.progress-text').text(percent).css('left', (parseFloat(progressText) - 3) + '%');
				$exportProgress.find('.progress-bar').attr('aria-valuenow', percent).css('width', percent);
			},
			whenComplete		: function(res){
				if(res.uuid){
					$msg.text('导出完成');
					$btnDownload.removeAttr('disabled').off('click').click(function(){
						Ajax.download('admin/modules/export/download/' + res.uuid);
					}).show();
					$btnBreak.off('click').click(function(){
						resetExport(res.uuid);
					});
				}
			},
			whenBreaked			: function(){
				
			},
			whenUnsuccess		: function(res){
				
			}
		});
		$page.getLocatePage().getEventCallbacks(['afterClose', 'beforeReload'], null, function(callbacks){
			callbacks.add(function(){
				handler.disconnect();
			});
		});
		//判断当前session是否有导出工作正在处理
		if(sessionExportStatus.uuid && sessionExportStatus.scope){
			if(sessionExportStatus.scope === 'current'){
				$exportCur.prop('checked', true).trigger('change');
			}else if(sessionExportStatus.scope === 'all'){
				$('#export-range-start', $page).val(sessionExportStatus.rangeStart);
				$('#export-range-end', $page).val(sessionExportStatus.rangeEnd);
				$exportAll.prop('checked', true).trigger('change');
			}
			$withDetail.prop('checked', sessionExportStatus.withDetail === 'true').trigger('change');
			handler.pollWith(sessionExportStatus.uuid);
			startPolling();
		}
		$btnExport.click(function(){
			var scope = $exportAll.prop('checked')? 'all': $exportCur.prop('checked')? 'current': null;
			if(scope){
				var rangeStart = scope == 'all' && $('#export-range-start', $page).val() || undefined,
					rangeEnd = scope == 'all' && $('#export-range-end', $page).val() || undefined,
					withDetail = $withDetail.prop('checked');
				handler.start({
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
			$('.data-range :input', $page).attr('disabled', 'disabled');
			$btnBreak.show().off('click').click(function(){
				$btnBreak.attr('disabled', 'disabled');
				handler.breaks().done(function(){
					$btnBreak.removeAttr('disabled');
					resetExport();
				});
			});
		}
		function resetExport(){
			$exportMsg.hide();
			$('#export-progress', $page).hide();
			$btnExport.show();
			$btnBreak.removeAttr('disabled').hide();
			$btnDownload.hide();
			$exportAll.removeAttr('disabled');
			$exportCur.removeAttr('disabled');
			$withDetail.removeAttr('disabled');
			$('.data-range :input', $page).removeAttr('disabled');
		}
	}
});