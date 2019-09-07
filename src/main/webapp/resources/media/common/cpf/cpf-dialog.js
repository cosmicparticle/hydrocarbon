define(function(require, exports, module){
	var $CPF = require('$CPF'),
		utils = require('utils'),
		Page = require('page'),
		Ajax = require('ajax');
	
	$CPF.addDefaultParam({
		dialogEventSelector	: '.dialog',
		dialogIdGenerate	: function(id){
			return 'dialog_' + id;
		}
	});
	
	$CPF.putPageInitSequeue(3, function($page){
		bindDialogEvent($page);
	});
	
	var CLASS_MODAL = 'modal',
		CLASS_DIALOG = 'modal-dialog',
		CLASS_CONTENT = 'modal-content',
		CLASS_HEADER = 'modal-header',
		CLASS_TITLE = 'modal-title',
		CLASS_CLOSE = 'close',
		CLASS_SUBMIT = 'modal-submit',
		CLASS_BODY = 'modal-body',
		CLASS_BODY_WRAPPER = 'modal-body-wrapper',
		CLASS_FOOTER = 'modal-footer'
		;
	var dialogMap = {};
	function Dialog(_param){
		var _this = this,
			bodySize = utils.getPageOffset()
			;
		var defaultParam = {
			id			: utils.uuid(5, 32),
			title		: '标题',
			content		: '',
			autoClose	: true,
			onShow		: $.noop,
			onClose		: $.noop,
			onSubmit	: $.noop,
			afterLoad	: $.noop,
			isModal		: true,
			width		: bodySize.width * 3/5,
			height		: bodySize.height * 3/5,
			top			: 0,//bodySize.top + bodySize.Height * 1/5,
			events		: {
				afterClose		: null
			}
		};
		var param = $.extend({}, defaultParam, _param);
		var id = String(param.id),
			title = param.title,
			url, formData
			;
		dialogMap[id] = this;
		var model =
			'<div class="fade ' + CLASS_MODAL + '" role="dialog" id="' + $CPF.getParam('dialogIdGenerate')(id) + '" aria-hidden="true">'
				+ '<div class="' + CLASS_DIALOG + '">' 
					+ '<div class="' + CLASS_CONTENT + '">'
						+ '<div class="' + CLASS_HEADER + '">'
							+ '<button type="button" class="close" data-dismiss="modal">×</button>'
							+ '<h4 class="' + CLASS_TITLE + '">' + param.title + '</h4>'
						+ '</div>'
						+ '<div class="' + CLASS_BODY + '"><div class="' + CLASS_BODY_WRAPPER + '"></div></div>'
					+ "</div>"
				+ '</div>'
			+ '</div>',
			$model = $(model)
			;
		//使窗口可拖动
		$model.draggable({   
		    handle: ".modal-header",   
		    cursor: 'move',
		    refreshPositions: false
		});  
		//调整弹出框的尺寸
		$model.on('show.bs.modal', function () {
			setModalSize($model, param);
			//将弹出框的滚动条设置为自动显示
			$wrapper.parent().css({
				overflowX	: 'auto',
				overflowY	: 'auto'
			});
			var $dialog = $model.children('.' + CLASS_DIALOG);
			var size = {
				width	: $dialog.width(),
				height	: $dialog.height()
			}
			param.onShow.apply(_this, [null, size]);
		});
		//
		$model.on('hidden.bs.modal', function () {
			if(typeof param.onClose === 'function'){
				var result = param.onClose.call(this);
				if(result === false){
					return;
				}
			}
			$model.remove();
			dialogMap[id] = undefined;
			_this.destruct();
		});
		
		var $wrapper = $('.' + CLASS_BODY_WRAPPER, $model),
			$content = $('.' + CLASS_CONTENT, $model),
			$title = $('.' + CLASS_TITLE, $model)
			;
		var page = new Page({
			$content 	: $content,
			id			: param.id,
			pageObj		: this,
			type		: 'dialog',
			$container	: $model
		});
		this.getPage = function(){
			return page;
		};
		this.getId = function(){
			return id;
		};
		this.getFooter = function(){
			return $content.children('.' + CLASS_FOOTER).last();
		};
		/**
		 * 动态加载内容的方法
		 * @param url 页面的链接或者页面的dom对象
		 */
		this.loadContent = function(content, _title, _formData, _contentType, _whenLoaded){
			if(typeof content === 'string'){
				var dUrl = content;
				formData = _formData;
				$CPF.showLoading();
				//根据url打开弹出框页面
				Ajax.ajax(dUrl, formData, {
					page	: page,
					whenSuc	: function(data, dataType){
						if(dataType === 'html'){
							url = dUrl;
							_this.loadContent($('<div>').html(data), _title);
						}
						if(typeof _whenLoaded === 'function'){
							_whenLoaded.apply(_this, [data, dataType]);
						}
					},
					afterLoad: function(){
						$CPF.closeLoading();
					},
					setHost		: false
				});
			}else if(content instanceof $){
				if(_contentType === 'dom'){
					$wrapper.append(content);
				}else{
					//直接加载content
					$wrapper.html(content.html());
				}
				var $title = $wrapper.children('title').first();
				if($title.length > 0 && !_title){
					$title.remove();
					var __title = $title.text();
					if(__title){
						_title = __title;
					}
				}
				//将页面内的页脚部分移动到弹出框的外面
				var $footer = $wrapper.children('.' + CLASS_FOOTER).last();
				var existFooter = $content.children('.' + CLASS_FOOTER);
				if(existFooter.length > 0){
					existFooter.last().replaceWith($footer);
				}else{
					$footer.appendTo($content);
				}
				//处理底部框中的按钮的事件
				dealFooterButton($footer, $content);
				//绑定关闭事件
				if(typeof param.onClose === 'function'){
					$('button.' + CLASS_CLOSE, $model).each(function(){
						$(this).off('click', hideModal)
								.on('click', hideModal)
					});
				}
				if(typeof _title === 'string' && _title != ''){
					this.setTitle(_title);
				}
				$CPF.initPage($wrapper);
				param.afterLoad.apply(_this, []);
			}
			return this;
		};
		/**
		 * 刷新页面，必须从url获得内容
		 */
		this.refresh = function(){
			this.loadContent(url, title, formData);
		};
		/**
		 * 隐藏弹出框
		 */
		function hideModal(){
			$model.modal('hide');
		}
		
		this.getDom = function(){
			return $model;
		};
		//关闭弹出框，并移除弹出框的dom
		this.close = function(){
			hideModal();
			this.getEventCallbacks('afterClose').fire([this]);
		};
		//显示弹出框
		this.show = function(){
			Page.putPage(id, page);
			var $m = this.getDom();
			try{
				var backdropZIndex = $m.data('backdropZIndex');
				if(backdropZIndex !== undefined){
					$m.css('zIndex', Number(backdropZIndex) + 1);
				}
			}catch(e){}
			$m.modal({backdrop: 'static', keyboard: false});
		};
		//最小化弹出框
		this.minimize = function(){
			
		};
		//最大化弹出框
		this.maximize = function(){
			
		};
		/**
		 * 设置弹出框的标题
		 */
		this.setTitle = function(_title){
			title = _title;
			$title.text(title);
		};
		this.getTitle = function(){
			return title;
		};
		/**
		 * 析构
		 */
		this.destruct = function(){
			Page.remove(id);
		};
		/**
		 * 
		 */
		this.getEventCallbacks = function(eventName, flag){
			if(eventName && typeof eventName === 'string'){
				var event = param.events[eventName];
				if(!event){
					param.events[eventName] = event = $.Callbacks(flag || 'stopOnFalse');
				}
				return event;
			}
		}
		/**
		 * 内部函数，用于处理弹出框底部框中的按钮的事件
		 */
		function dealFooterButton($footer, $content){
			var submitSelector = 'button.submit,button[type=submit],input[type="submit"],input.submit[type="button"]',
				resetSelector = 'button.reset,button[type=reset],input[type="reset"],input.reset[type="button"]'
			$(submitSelector, $footer).click(function(){
				var forForm = $($(this).attr('for'), $content);
				var data = _this.getPage().trigger('footer-submit', []);
				if(typeof param.onSubmit !== 'function' || param.onSubmit.apply(this, [data, function(){page.close()}]) !== false){
					try{
						forForm.submit();
					}catch(e){}
					if(param.autoClose){
						page.close();
					}
				}
			});
			$(resetSelector, $footer).click(function(){
				var forForm = $($(this).attr('for'), $content);
				if(forForm.length > 0){
					forForm[0].reset();
				}
			});
		}
	}
	/**
	 * 自定义模态框的尺寸
	 */
	function setModalSize($modal, param){
		var top	 	= param.top,
			left 	= param.left,
			width	= param.width,
			height	= param.height
			;
		//先把最外面一层设置为绝对定位
		$modal.css({
			position	: 'absolute',
			overflow	: 'hidden',
			marginTop	: top,
			marginLeft	: left
		});
		//dialog层设置尺寸
		$modal.children('.' + CLASS_DIALOG).css({
			width	: width,
			height	: height
		})
		.children('.' + CLASS_CONTENT).css({})
		.children('.' + CLASS_BODY).css({
			height		: function(){
				return height - $modal.find('.' + CLASS_HEADER).height()
			},
			overflowY	: 'scroll',
	    	overflowX	: 'hidden'
		})
		;
		
	}
	
	
	function bindDialogEvent($page){
		//遍历当前页面中要打开弹出框的标签，并绑定点击事件
		$($CPF.getParam('dialogEventSelector'), $page).each(function(){
			var $this = $(this),
				title = $this.attr('title'),
				url = $this.attr('href'),
				target = $this.attr('target'),
				width = $this.attr('width'),
				height = $this.attr('height')
				;
			$(this).click(function(e){
				e.preventDefault();
				Dialog.openDialog(url, title, target,{
					width	: width,
					height	: height
				});
				/*var dialog = new Dialog({
					title	: title,
					url		: url
				});
				dialog.getDom().modal();*/
				return false;
			});
		});
		Dialog.tooltip($('[data-toggle="tooltip"]', $page));
	}
	
	$.extend(Dialog, {
		openDialog	: function(url, title, id, param){
			var dialog = new Dialog($.extend({
				title	: title,
				id		: id
			}, param));
			dialog.getDom().data(param.domData);
			//直接加载弹出框
			dialog.loadContent(url, param.title, param.reqParam, param.contentType)
				.show();
			return dialog;
		},
		/**
		 * 
		 */
		openFrameDialog	: function(url, title, id, param){
			var $wrap = $('<div>');
			var $iframe = $('<iframe scrolling="no" frameboder="0" border="0" style="width:100%;height:100%;border:none">');
			$iframe.attr('src', url).attr('name', 'cpf-dialog-frame' + id);
			var dialog = new Dialog($.extend({
				title	: title,
				id		: id,
				onShow	: function(){
					this.getDom().find('.' + CLASS_BODY).css({
						padding		: 'none',
						overflow	: 'hidden'
					});
				}
			}, param));
			
			dialog.loadContent($wrap.append($iframe)).show();
			return dialog;
		},
		getDialog	: function(dialogId){
			return dialogMap[dialogId];
		},
		closeDialog	: function(dialogId){
			var dialog = this.getDialog(dialogId);
			if(dialog){
				dialog.close();
			}
		},
		notice		:  function(msg, type){
			if(!msg || !type){
				return;
			}
			//Notify的参数说明
			//1.提示语
			//2.显示位置，由样式控制，前缀为toast-
			//3.隐藏时间
			//4.提示类型(danger,warning,info,success,blue,palegreen)，由样式控制，前缀为toast-
			//5.图标类型
			//6.是否显示关闭按钮
			var nTypeMap = {
				'error'		: {
					type	: 'danger',
					icon	: 'fa-bolt'
				},
				'warning'	: {
					type	: 'warning',
					icon	: 'fa-warning'
				},
				'success'	: {
					type	: 'success',
					icon	: 'fa-check',
					defer	: 1000
				},
				'info'		: {
					type	: 'info',
					icon	: 'fa-envelope'
				}
			};
			var nTypeObj = nTypeMap[type];
			if(nTypeObj){
				Notify(msg, 'center', nTypeObj.defer || '3000', nTypeObj.type, nTypeObj.icon, false);
			}
		},
		/**
		 * 弹出确认框
		 */
		confirm		: function(msg, callback, _param){
			var defer = $.Deferred();
			var defaultParam = {
				domHandler	: $.noop,
				width		: '300px',
				height		: '200px',
				top			: '100px'
			};
			var param = $.extend({}, defaultParam, _param)
			var confirmId = utils.uuid(5, 62),
				title = '操作提示',
				confirmModel = 
					'<div>' +
						'<div class="dialog-confirm-msg">' + msg + '</div>' + 
						'<div class="' + CLASS_FOOTER + '">' +
							'<button class="confirm-btn-yes btn btn-default"> 是 </button>' +
							'<button class="confirm-btn-no btn btn-primary"> 否 </button>' +
						'</div>' + 
					'</div>',
					$confirm = $(confirmModel)
					;
			param.domHandler.apply(this, [$('div.dialog-confirm-msg:first', $confirm), $confirm]);
			var dialog = Dialog.openDialog($confirm, title, confirmId, {
				width	: param.width,
				height	: param.height,
				top		: param.top,
				domData	: {
					backdropZIndex	: 9999
				}
			});
			dialog.getFooter().find('button.confirm-btn-yes,button.confirm-btn-no').click(function(){
				var isYes = $(this).is('.confirm-btn-yes');
				var page = dialog.getPage();
				if(page instanceof Page){
					var result = (callback || $.noop)(isYes, page);
					if(result !== false){
						if(isYes){
							defer.resolve(page);
						}
						page.close();
					}
				}
			});
			return defer.promise();
		},
		/**
		 * 在指定位置弹出下拉菜单展示，并提供点选项后的回调
		 */
		promptSelect	: function(_param){
			var defaultParam = {
				//展示选项数组，可以是字符串数组，也可以是对象数组，但是元素对象必须提供title属性
				data		: [],
				//菜单显示的位置
				target		: null,
				container	: document.body
			};
			var param = $.extend({}, defaultParam, _param);
			var def = $.Deferred();
			require('tmpl').load('media/admin/tmpl/tmpl/tmpl-modules.tmpl').done(function(tmpl){
				var data = [];
				for(var i in param.data){
					var ele = param.data[i];
					if(typeof ele === 'string'){
						data.push({
							title	: ele
						})
					}else if(typeof ele === 'object'){
						data.push(ele);
					}else{
						$.error('展示的菜单的元素必须是字符串或者是包含title属性的object')
					}
				}
				
				var $dom = tmpl.tmpl({
					array	: data
				});
				utils.place($dom, param.target, 'bottom', param.container);
				$dom.find('li').click(function(){
					var index = $(this).attr('data-index');
					if(index){
						def.resolve(data[index]);
					}
					$dom.remove();
					return false;
				});
				$(document).one('click', function(){
					$dom.remove();
				});
			});
			return def.promise();
			
		},
		prompt	: function(msg, defaultMsg, callback, _param){
			var defaultParam = {
				domHandler	: $.noop,
				width		: '300px',
				height		: '200px',
				top			: '100px',
				title		: '请输入',
				promptId	: utils.uuid(),
				allowEmpty	: false
			};
			var param = $.extend({}, defaultParam, _param);
			if(typeof defaultMsg === 'function'){
				callback = defaultMsg;
				defaultMsg = '';
			}
			var model = '<div>' + 
					'<div class="dialog-prompt-msg">' + msg + '</div>' + 
					'<div class="dialog-prompt-input-wrapper">' +
						'<input type="text" />' +
					'</div>' + 
					'<div class="' + CLASS_FOOTER + '">' +
						'<button class="prompt-btn-confirm btn btn-default"> 确定 </button>' +
						'<button class="prompt-btn-cancel btn btn-primary"> 取消 </button>' +
					'</div>' + 
				'</div>';
			var $model = $(model);
			$(':text', $model).val(defaultMsg);
			var dialog = Dialog.openDialog($model, param.title, param.promptId, {
				width	: param.width,
				height	: param.height,
				top		: param.top
			});
			var $btnConfirm = dialog.getFooter().find('button.prompt-btn-confirm');
			$(':text', dialog.getDom()).keyup(function(e){
				if(e.keyCode === 13){
					$btnConfirm.trigger('click');
				}
				if(!param.allowEmpty){
					if($(this).val() === ''){
						$btnConfirm.attr('disabled', 'disabled');
					}else{
						$btnConfirm.removeAttr('disabled');
					}
				}
			}).trigger('keyup');
			
			dialog.getFooter().find('button.prompt-btn-confirm,button.prompt-btn-cancel').click(function(){
				var isYes = $(this).is('.prompt-btn-confirm');
				var val = $(':text', dialog.getDom()).val();
				if(isYes && !param.allowEmpty && val === ''){
					return false;
				}
				var page = dialog.getPage();
				if(page instanceof Page){
					var result = null;
					if(isYes){
						result = callback.apply(this, [val, page]);
					}
					if(result !== false){
						page.close();
					}
				}
			});
		},
		tooltip	: function($target){
			if($.fn.tooltip){
				$($target).each(function(){
					var $this = $(this);
					var placement = $this.attr('data-placement') || 'top';
					$(this).tooltip({
						placement
					});
				});
			}
		}
	});
	
	
	module.exports = Dialog;
	
});