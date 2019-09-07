define(function(require, exports, module){
	"use strict";
	
	var msgTypeMap = {
			INFO	: '常规',
			SUC		: '成功',
			ERROR	: '错误',
			WARN	: '警告'
	}
	function getMsgTypeTitle(msgType){
		return msgTypeMap[msgType] || '未知';
		
	}
	
	exports.initPage = function(_param){
		var defParam = {
			$page		: null,
			menuId		: null
		};
		var param = $.extend({}, defParam, _param);
		var Utils = require('utils');
		var Dialog = require('dialog')
			,Ajax = require('ajax')
			,$CPF = require('$CPF')
			;
		var context = Utils.createContext({
			maxShowMsgCount		: 100,
			showMessages		: [],
			failedRowsFileUUID	: null
		});
		var $page = param.$page;
		
		
		var $feedback = $('#feedback-msg', $page);
		var $form = $('form', $page);
		
		
		require('tmpl').load('media/jv/entity/tmpl/entity-import.tmpl').done(function(tmplMap){
			
			context
				.bind('showMessages', renderMessages)
				.bind('maxShowMsgCount', changeMaxShowMsgCount)
				.bind('failedRowsFileUUID', toggleDownloadLogBtn)
				;
			
			var importHandler = require('poll').global('entity-import');
			
			var importSubscriber = importHandler.addSubscriber({
				key					: param.menuId,
				startupReqMethod	: 'ajax',
				startupURL			: 'api2/entity/import/start/' + param.menuId + '?exportFaildFile=1',
				progressURL			: 'api2/entity/import/status',
				msgIndexRequestName	: 'msgIndex',
				maxMsgCount			: context.getStatus('maxShowMsgCount'),
				whenStartupResponse	: function(data, uuid){
					$('#break', $page).show();
					$('#submit', $page).attr('disabled', 'disabled');
					context.setStatus('showMessages', []);
					$feedback.append($('<p>').text('============开始导入============'));
				},
				progressHandler	: function(progress, res){
					var progressText = parseFloat(progress * 100).toFixed(0);
					
					$('#progress', $page)
						.find('.progress-bar')
						.attr('aria-valuenow', progressText)
						.css('width', progressText + '%')
						.find('span')
						.text(progressText + '%');
					
					var remain = res.totalCount - res.current;
					
					var msg = '剩余' + remain + '条';
					if(res.lastInterval && res.lastInterval > 0){
						msg += '，当前速率' + (parseFloat(1000 / res.lastInterval)).toFixed(2) + '条/秒，'
						+ '预计剩余时间' + parseFloat(remain * res.lastInterval / 1000).toFixed(0) + '秒';
					}
					$('#feedback-instance', $page).text(msg);
				},
				whenCompleted		: function(res){
					Dialog.notice('导入完成', 'success');
					$('#progress span', $page).text('导入完成');
					$('#submit', $page).removeAttr('disabled').text('重新导入');
					$('#break', $page).hide();
					$('#feedback-instance', $page).text('导入完成');
					if(res.failedRowsFileUUID){
						context.setStatus('failedRowsFileUUID', res.failedRowsFileUUID);
					}
				},
				whenBreaked			: function(res){
					Dialog.notice('导入被中断', 'warning');
					$('#submit', $page).removeAttr('disabled').text('重新导入');
					$('#break', $page).hide();
					$('#feedback-instance', $page).text('导入被中断');
				},
				whenUnsuccess		: function(res){
					if(res.status === 'error' && res.msg){
						Dialog.notice(res.msg, 'error');
						$('#feedback-instance', $page).text('请求导入状态时发生错误');
					}
				},
				handleWithMessageSequence	: function(msgSequence){
					var begin = msgSequence.beginIndex;
					
					var maxShowMsgCount = context.getStatus('maxShowMsgCount');
					var showMessages = context.getStatus('showMessages'); 
					if(msgSequence.messages.length >= maxShowMsgCount){
						showMessages = msgSequence.messages.slice(-maxShowMsgCount);
						setMessagesIndex(showMessages, begin + msgSequence.messages.length - maxShowMsgCount);
					}else if(showMessages.length + msgSequence.messages.length > maxShowMsgCount){
						setMessagesIndex(msgSequence.messages, begin);
						showMessages = showMessages.splice(maxShowMsgCount - msgSequence.messages.length).concat(msgSequence.messages);
					}else{
						setMessagesIndex(msgSequence.messages, begin);
						showMessages = showMessages.concat(msgSequence.messages);
					}
					context.setStatus('showMessages', showMessages);
				}
			});
			
			function setMessagesIndex(messages, begin){
				$.each(messages, function(i){this.index = begin + i});
			}
			
			function renderMessages(){
				var messages = context.getStatus('showMessages');
				if(messages && messages.length > 0){
					
					var filterMap = {};
					$('#message-filter label[msg-type] :checkbox', $page).each(function(){
						var $this = $(this);
						filterMap[$this.closest('label').attr('msg-type')] = $this.prop('checked');
					});
					
					var $shownMessages = $feedback.children('p[data-index]');
					$shownMessages.each(function(){
						var $msg = $(this);
						if(parseInt($msg.attr('data-index')) < messages[0].index){
							$msg.remove();
						}
					});
					var lastIndex = parseInt($shownMessages.last().attr('data-index')) || -1;
					$.each(messages, function(){
						if(this.index > lastIndex){
							var timeStr = Utils.formatDate(new Date(this.createTime), 'yyyy-MM-dd hh:mm:ss:S');
							tmplMap['message'].tmpl($.extend({
								typeTitle	: getMsgTypeTitle(this.type),
								timeStr		: timeStr
							}, this))
								.toggle(filterMap[this.type] != false)
								.appendTo($feedback);
						}
					});
				}else{
					$feedback.empty();
				}
				Utils.scrollTo($feedback);
			}
			
			
			$('#submit', $page).click(function(){
				var file = $('#file', $page)[0].files[0];
				if(file){
					Dialog.confirm('确认导入？', function(yes){
						if(yes){
							importSubscriber.starts({
								file	: file 
							});
						}
					});
				}else{
					Dialog.notice('请选择一个文件', 'warning');
				}
			});
			$('#break', $page).click(function(){
				Dialog.confirm('确认停止当前的导入任务？', function(){
					importSubscriber.breaks();
				});
			});
			$('#link-import-tmpl', $page).click(function(){
				Dialog.openDialog('jv/entity/curd/import_tmpl/' + param.menuId, '字段', undefined, {
					width	: 1000,
					height	: 500
				});
			});
			
			$('#message-filter label[msg-type] :checkbox', $page).change(function(){
				var $this = $(this);
				var msgType = $this.closest('label').attr('msg-type');
				$feedback.find('p.' + msgType).toggle($this.prop('checked'));
			});
			
			$('#import-log-setting', $page).click(function(){
				var dialogLogSetting = require('dialog').openDialog(tmplMap['log-setting'].tmpl({
					maxShowMsgCount	: context.getStatus('maxShowMsgCount')
				}, {
					limitMax	: function(){
						this.value=parseInt(this.value)>5000?5000:this.value;
					}
				}), '导出日志设置', undefined, {
					width		: 400,
					height		: 300,
					contentType	: 'dom',
					onSubmit	: function(){
						var $DialogLogSetting = dialogLogSetting.getDom();
						var maxMsgCount = $('#maxShowMsgCount', $DialogLogSetting).val();
						context.changeStatus('maxShowMsgCount', parseInt(maxMsgCount));
					}
				});
			});
			
			function changeMaxShowMsgCount(){
				var maxShowMsgCount = context.getStatus('maxShowMsgCount');
				importSubscriber.setMaxMsgCount(maxShowMsgCount);
			}
			
			function toggleDownloadLogBtn(){
				var failedRowsFileUUID = context.getStatus('failedRowsFileUUID');
				$('#import-log-download', $page).toggle(!!failedRowsFileUUID);
			}
			$('#import-log-download', $page).click(function(){
				var failedRowsFileUUID = context.getStatus('failedRowsFileUUID');
				if(failedRowsFileUUID){
					Ajax.download('api2/entity/export/download/' + failedRowsFileUUID);
				}
			});
		});
		
		
		
	}
	
});