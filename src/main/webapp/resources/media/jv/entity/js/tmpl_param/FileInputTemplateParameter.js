define(function(require, exports, module){
	var AbstractTemplateParameter = require('entity/js/entity-detail-input').AbstractTemplateParameter;
	
	function FileInputTemplateParameter(_param){
		AbstractTemplateParameter.call(this);
		this.tmplKey	= 'input-file'
		var _this = this;
		var param = $.extend({
			maxSize		: 4096		//文件不得大于4M
		}, _param);
		
		//已经保存到后台的文件的URL(即可以下载的文件链接)
		var originFileURL = null;
		//当前通过表单控件选择的系统文件对象
		var inputFile = null;
		//文件是否被修改过
		this.setValueChanged(false);
		
		var $thumb = $('<span class="cpf-file-input-thumb">');
		var $operates = buildOperates();
		
		//用于触发弹出框选择系统文件的表单
		var $fileInput = $('<input type="file" />');
		bindFileInputChangeEvent();
		//初始化状态
		showFileChooser();
		
		var changedCallback = $.Callbacks();
		
		this.valueGetter = function($dom){
			if(inputFile){
				//如果是选择文件后要上传的，则返回文件对象
				return inputFile;
			}else{
				//其他情况下是传入文件的url，
				//那么返回当前控件的文件是否有被修改过的标记
				return '';
			}
		}
		
		this.valueSetter = function($dom, file, initValueFlag){
			if(file){
				//设置值
				if(file instanceof File){
					setFile({
						file	: file
					});
				}else if(typeof file === 'object'){
					setFile(file);
				}else if(typeof file === 'string'){
					setFile({
						url	: file
					});
				}else{
					return;
				}
			}
		}
		
		this.afterRender = function($dom){
			$thumb.appendTo($dom);
		}
		
		this.bindValueChanged = function($dom, callback){
			$fileInput.change(callback);
		}
		
		function buildOperates(){
			var $operates = $('<span class="cpf-file-input-operates">')
			var $removeBtn = $('<i class="fa fa-times">').appendTo($operates);
			var $downloadBtn = $('<i class="fa fa-download">').appendTo($operates);
			
			$removeBtn.click(function(){
				require('dialog').confirm('是否移除该文件？', function(yes){
					if(yes){
						showFileChooser();
						_this.valueChanged = true;
					}
				});
			});
			
			$downloadBtn.click(function(){
				if(originFileURL){
					require('ajax').download(originFileURL);
				}
			});
			
			return $operates;
		}
		
		/**
		 * 绑定文件控件的修改事件，用于打开弹出框选择系统文件
		 */
		function bindFileInputChangeEvent(){
			$fileInput.change(function(e){
				var files = e.currentTarget.files;
				if(files && files.length == 1){
					var file = files.item(0);
					setFile({
						file	: file
					});
				}
				$(this).val('');
			});
		}
		
		function setFile(fileData){
			if(fileData.file){
				//通过浏览器选择的文件
				if(fileData.file.size > param.maxSize * 1024){
					//大小限制
					return showError('文件大小不得超过' + param.maxSize + 'KB');
				}
				if (/^image\/.+$/.test(fileData.file.type)) {
					//图片文件，进行预览
					var reader = new FileReader();
					reader.onload = function(e1) {
						showPicFile(fileData.file.name, e1.target.result, true)
					};
					reader.readAsDataURL(fileData.file);
				}else{
					//其他类型文件，展示内置图标
					showUnpicFile(fileData.file.name, true);
				}
				inputFile = fileData.file;
				$operates.find('.fa-download').hide();
				_this.valueChanged = true;
			}else if(fileData.src || fileData.url){
				var src = fileData.src || fileData.url;
				var index = src.lastIndexOf('/');
				if(index >= 0){
					var fileName = src.substring(index + 1, src.length);
					if(require('utils').isPhoto(fileName)){
						//图片文件
						showPicFile(fileName, src, false);
					}else{
						showUnpicFile(fileName, false);
					}
					originFileURL = src;
				}
			}
		}
		
		/**
		 * 显示图片文件
		 */
		function showPicFile(fileName, fileSrc, isLocated){
			$operates.detach();
			$thumb.empty()
				.append($('<img>')
						.attr('src', fileSrc)
						.attr('alt', fileName)
						.attr('title', fileName)
						.addClass(isLocated? 'cpf-file-located': ''))
				.append($operates);
		}
		/**
		 * 显示非图片文件
		 */
		function showUnpicFile(fileName, isLocated){
			$operates.detach();
			$thumb.empty()
				.append($('<img>')
						.attr('src', getFileIconSrc(fileName))
						.attr('alt', fileName)
						.attr('title', fileName)
						.addClass(isLocated? 'cpf-file-located': '')
						.attr('onerror', 'this.src="media/common/plugins/icons/OTHER.ico"'))
				.append($operates);
		}
		
		/**
		 * 非图片文件，根据后缀获得格式对应的
		 */
		function getFileIconSrc(fileName){
			var dotIndex = fileName.lastIndexOf('.');
			if(dotIndex >= 0){
				var suffix = fileName.substring(dotIndex + 1, fileName.length);
				return 'media/common/plugins/icons/' + suffix.toUpperCase() + '.png';
			}
			return ;
		}
		
		function showError(msg){
			require('dialog').notice(msg, 'error');
		}
		
		function showFileChooser(){
			originFileURL = null;
			$operates.detach();
			$thumb.empty().append($('<i>').click(function(){
				$fileInput.trigger('click')
			}));
		}
	}
	
	require('utils').extendClass(FileInputTemplateParameter, AbstractTemplateParameter);
	
	module.exports = FileInputTemplateParameter;
	
});