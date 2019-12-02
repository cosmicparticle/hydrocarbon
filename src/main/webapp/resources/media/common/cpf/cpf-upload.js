/**
 * 封装jQuery File Upload插件
 */
define(function(require, exports, module){
	//加载插件
	require('COMMON/plugins/fileUpload/jquery.fileupload.js');
	var utils = require('utils');
	
	var 
		//每个文件显示的宽度
		ITEM_WIDTH_EM = 7,
		//每个文件显示的class
		ITEM_CLASS = 'cpf-upload-file-item'
	;
	var $itemTmpl = $('<div>'
			+ '<div class="cpf-upload-file-icon-container">'
			+ '<div class="cpf-upload-do-area">'
			+ '<span class="cpf-upload-do-remove fa fa-trash-o" title="删除"></span>'
			+ '<span class="cpf-upload-do-upload fa fa-upload" title="上传"></span></div>'
			+ '<img class="cpf-upload-file-icon" />'
			+ '</div>'
			+ '<label class="cpf-upload-file-name"></label>'
			+ '<div class="cpf-upload-progressbar"></div>'
			+ '</div>').addClass(ITEM_CLASS);
	
	function Upload(_param){
		var _this = this;
		var defaultParam = {
			url				: '',
			$container		: null,
			multiple		: false,
			paramName		: 'file',
			//每一页最多能显示的文件个数
			viewItemMax	: 4,
		};
		var param = $.extend({}, defaultParam, _param);
		var $container = param.$container,
			$wrapper = $('.cpf-upload-files-wrapper', $container),
			$uploadBtn = $('.cpf-upload-do-uploadall', $container),
			$removeBtn = $('.cpf-upload-do-removeall', $container)
			;
		//上传的文件
		var fileDatas = [];
		
		var curPageIndex = 0,
			$prevPageBtn = $('.cpf-upload-files-prev', $container).hide(),
			$nextPageBtn = $('.cpf-upload-files-next', $container).hide()
			;
		
		this.getFileInput = function(){
			return $('.cpf-upload-control', $container);
		}
		/**
		 * 获得所有文件的数据
		 */
		this.getFileDatas = function(){
			return fileDatas;
		}
		/**
		 * 初始化文件上传
		 */
		_this.getFileInput().fileupload({
			url			: param.url,
			paramName	: param.paramName,
	        dataType: 'json',
	        progressInterval	: 50,
	        //添加文件回调
	        add	: function(e, obj){
	        	console.log(obj);
	        	for(var i in obj.files){
	        		var file = obj.files[i];
					var url = URL.createObjectURL(file);
					var $item = $itemTmpl.clone();
					$('.cpf-upload-file-icon', $item)
						.attr('src', url)
						.attr('alt', file.name)
						;
					$('.cpf-upload-file-name', $item).text(file.name);
					$wrapper.append($item);
					obj.context = {
						file	: file,
						$item	: $item,
						data	: obj,
						url		: url
					};
					fileDatas.push(obj.context);
	        	}
	        	whenItemChange();
	        },
	        //进度条
			progress: function (e, data) {
				console.log(data);
				var $item = data.context.$item;
		        var progress = parseInt(data.loaded / data.total * 100, 10);
		        $('.cpf-upload-progressbar', $item).css('width', progress + '%');
		    }
	    });
		/**
		 * 拖拽事件
		 */
		$('.cpf-upload-drag-area', $container).on('dragenter', function(){
			_this.getFileInput().trigger('dragenter', arguments);
		}).on('dragover', function(){
			_this.getFileInput().trigger('dragover', arguments);
		}).on('dragleave', function(){
			_this.getFileInput().trigger('dragleave', arguments);
		});
		/**
		 * 添加文件
		 */
		$('.cpf-upload-do-addfile', $container).click(function(){
			_this.getFileInput().click();
		});
		/**
		 * 全部上传
		 */
		$('.cpf-upload-do-uploadall', $container).click(function(){
			require('dialog').confirm('确定上传全部文件？', function(yes){
				if(yes){
					//从头开始一个个上传
					uploadItemBegin(0);
				}
			});
		});
		$('.cpf-upload-do-removeall', $container).click(function(){
			require('dialog').confirm('确定移除全部文件？', function(yes){
				if(yes){
					_this.removeAll();
				}
			});
		});
		/**
		 * 从索引为i的文件开始上传
		 */
		function uploadItemBegin(i, count){
			if(fileDatas.length > i && (count === undefined || (typeof count === 'number' && count > 0))){
				var fileObj = fileDatas[i];
				_this.showPage(i);
				if(!fileObj.uploaded){
					var $thisUploadBtn = fileObj.$item.find('.cpf-upload-do-upload');
					$thisUploadBtn.hide();
					fileObj.data.submit().done(function(data){
						if(data.status === 'suc'){
							fileObj.uploaded = true;
						}else{
							utils.removeStyle($thisUploadBtn, 'display');
						}
						uploadItemBegin(++i, typeof count === 'number'? --count : undefined);
					});
				}else{
					uploadItemBegin(++i, typeof count === 'number'? --count : undefined);
				}
			}
		}
		
		/**
		 * 获得控件内的文件的个数
		 */
		this.getItemCount = function(){
			return $wrapper.children('.' + ITEM_CLASS).length;
		}
		
		function whenItemChange(){
			var itemCount = _this.getItemCount();
			$wrapper.css('width', (itemCount * ITEM_WIDTH_EM) + 'em');
			$uploadBtn.toggle(itemCount > 0);
			$removeBtn.toggle(itemCount > 0);
			//检测长度，如果文件数大于最大可显示数，那么显示按钮，否则隐藏
			showFilePage(curPageIndex);
			if(itemCount <= param.viewItemMax){
				$prevPageBtn.hide();
				$nextPageBtn.hide();
			}
			//如果当前的页数到达或者超过总个数，显示最后一页内容
			if(checkPageEnd()){
				_this.showLastPage();
			}
		}
		
		function getMaxPageIndex(){
			var itemCount = _this.getItemCount();
			if(itemCount <= param.viewItemMax){
				return 0;
			}else{
				return itemCount - param.viewItemMax;
			}
		}
		function showFilePage(pageIndex){
			if(pageIndex >= 0 && pageIndex < _this.getItemCount()){
				var maxPageIndex = getMaxPageIndex();
				if(pageIndex > maxPageIndex){
					pageIndex = maxPageIndex;
				}
				$wrapper.css('left', (-pageIndex * ITEM_WIDTH_EM) + 'em');
				curPageIndex = pageIndex;
				$prevPageBtn.toggle(curPageIndex != 0);
				$nextPageBtn.toggle(!checkPageEnd());
			}
		}
		
		
		
		/**
		 * 弹出框显示文件信息
		 */
		function showFileInDialog(index){
			var fd = fileDatas[index];
			if(fd){
				var url = fd.url,
					Dialog = require('dialog')
					;
				Dialog.openDialog('admin/test/showFile', '文件详情', 'fileDetail', {
					afterLoad	: function(){
						$('#file-name', this.getDom()).text(fd.file.name);
						$('#file-view', this.getDom()).append($('<img>').attr('src', fd.url).css('max-width', '100%'));
					}
				});
			}
		}
		
		this.showPage = showFilePage;
		/**
		 * 显示最后一页
		 */
		this.showLastPage = function(){
			showFilePage(getMaxPageIndex());
		};
		function checkPageEnd(){
			return curPageIndex + param.viewItemMax >= _this.getItemCount();
		}
		//上一页回调
		$prevPageBtn.click(function(){
			showFilePage(curPageIndex - 1);
		});
		//下一页回调
		$nextPageBtn.click(function(){
			if(!checkPageEnd()){
				showFilePage(curPageIndex + 1);
			}
		});
		/**
		 * 移除索引为i的文件
		 */
		this.remove = function(index){
			$wrapper.children('.' + ITEM_CLASS).eq(index).remove();
			fileDatas.splice(index, 1);
			if(curPageIndex > 1){
				curPageIndex--;
			}
			whenItemChange();
		}
		/**
		 * 移除所有文件
		 */
		this.removeAll = function(){
			$wrapper.children('.' + ITEM_CLASS).remove();
			fileDatas = [];
			curPageIndex = 0;
			whenItemChange();
		};
		//绑定移除事件
		$wrapper.on('click', '.cpf-upload-do-remove', function(yes){
			var $this = $(this);
			require('dialog').confirm('确定移除该文件？', function(yes){
				if(yes){
					var index = $wrapper.children('.' + ITEM_CLASS).index($this.closest('.' + ITEM_CLASS));
					_this.remove(index);
				}
			});
			return false;
		});
		/**
		 * 上传索引为i的文件
		 */
		this.upload = function(index){
			uploadItemBegin(index, 1);
			return this;
		}
		//绑定上传事件
		$wrapper.on('click', '.cpf-upload-do-upload', function(){
			var $this = $(this);
			require('dialog').confirm('确定上传该文件', function(yes){
				if(yes){
					var index = $wrapper.children('.' + ITEM_CLASS).index($this.closest('.' + ITEM_CLASS));
					_this.upload(index, 1);
				}
			});
			return false;
		});
		//绑定文件展示事件
		$wrapper.on('click', '.cpf-upload-file-item', function(){
			var index = $wrapper.children('.' + ITEM_CLASS).index($(this).closest('.' + ITEM_CLASS));
			showFileInDialog(index);
			return false;
		});
	}
	
	Upload.bind = function($dom){
		return new Upload({
			$container	: $dom,
			url			: $dom.attr('url'),
			paramName	: $dom.attr('name')
		});
	};
	
	Upload.createUpload = function($dom){
		
	};
	
	
	module.exports = Upload;
});