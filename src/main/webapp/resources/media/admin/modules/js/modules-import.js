/**
 * 
 */
define(function(require, exports, momdules){
	"use strict";
	var Dialog = require('dialog')
		,Ajax = require('ajax')
		,$CPF = require('$CPF')
		;
	var msgTypeMap = {
		INFO	: '常规',
		SUC		: '成功',
		ERROR	: '错误',
		WARN	: '警告'
	}
	function getMsgTypeTitle(msgType){
		return msgTypeMap[msgType] || '未知';
		
	}
	
	exports.initPage = function($page, menuId){
		var $feedback = $('#feedback-msg', $page);
		var $form = $('form', $page);
		
		
		//轮询处理对象
		var handler = Ajax.poll({
			startupReqMethod	: 'ajax',
			startupURL			: $form.attr('start-url'),
			progressURL			: $form.attr('status-url'),
			msgIndexRequestName	: 'msgIndex',
			whenStartupResponse	: function(data, uuid){
				$('#break', $page).show();
				$('#submit', $page).attr('disabled', 'disabled');
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
			whenComplete		: function(res){
				Dialog.notice('导入完成', 'success');
				$('#progress span', $page).text('导入完成');
				$('#submit', $page).removeAttr('disabled').text('重新导入');
				$('#break', $page).hide();
				$('#feedback-instance', $page).text('导入完成');
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
			handleWithMessageSequence	: function(msgSequeue){
				var begin = msgSequeue.beginIndex;
				var Utils = require('utils');
				var filterMap = {};
				$('#message-filter label[msg-type] :checkbox', $page).each(function(){
					var $this = $(this);
					filterMap[$this.closest('label').attr('msg-type')] = $this.prop('checked');
				});
				for(var i in msgSequeue.messages){
					var msg = msgSequeue.messages[i];
					var timeStr = Utils.formatDate(new Date(msg.createTime), 'yyyy-MM-dd hh:mm:ss:S');
					$feedback.append(
							$('<p>')
								.attr('data-index', begin + i)	
								.addClass(msg.type)
								.append($('<span>').text(getMsgTypeTitle(msg.type) + '\t' + timeStr + '\t'))
								.append($('<span class="content">').text(msg.text))
								.toggle(filterMap[msg.type] != false)
							
						);
				}
				Utils.scrollTo($feedback);
			}
		});
		
		
		
		$('#submit', $page).click(function(){
			var file = $('#file', $page)[0].files[0];
			if(file){
				Dialog.confirm('确认导入？', function(yes){
					if(yes){
						handler.start({
							file	: file 
						});
					}
				});
			}else{
				Dialog.notice('请选择一个文件', 'warning');
			}
		});
		$('#break', $page).click(function(){
			if(handler.isPolling()){
				Dialog.confirm('确认停止当前的导入任务？', function(){
					handler.breaks();
				});
			}
		});
		$('#link-import-tmpl', $page).click(function(){
			Dialog.openDialog('admin/modules/import/tmpl/' + menuId, '字段', undefined, {
				width	: 1000,
				height	: 500
			});
		});
		
		$('#message-filter label[msg-type] :checkbox', $page).change(function(){
			var $this = $(this);
			var msgType = $this.closest('label').attr('msg-type');
			$feedback.find('p.' + msgType).toggle($this.prop('checked'));
		});
		
		+function(){
			var clipboard = new ClipboardJS($('#btn-copy-feedback-msg', $page)[0], {
				target		: function(){return $('#feedback-msg', $page)[0]}
			});
			clipboard.on('success', function(e) {
				if(e.text){
					Dialog.notice('已将内容复制到粘贴板中', 'success');
				}
			});
			
			clipboard.on('error', function(e) {
				Dialog.notice('复制失败', 'error');
			});
		}();
		
		
		
	};
	
	
});