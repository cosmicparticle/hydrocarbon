/**
 * 表单提交模块
 * 表单提交有以下几种情况
 * 	1.查询
 * 		该情况下，表单提交之后依然会返回html代码，此时需要把html代码放到标签页或者弹出框中
 * 	2.修改
 * 		该情况下，表单提交之后会对数据库进行操作。处理结束之后只会返回处理的状态json。此时需要前后台统一该状态json，并让js直接根据状态信息处理回调
 * 	3.
 */
define(function(require, exports, module){
	var $CPF = require('$CPF'),
		Page = require('page'),
		Ajax = require('ajax')
		;
	
	$CPF.addDefaultParam({
		
	});
	
	function formatFormData($form, formData){
		+function(){
			var $select2 = $form.find('select.cpf-select2.format-submit-value');
			$select2.each(function(){
				try{
					var $thisSelect = $(this),
					name = $thisSelect.attr('name');
					if(name){
						var values = formData.getAll(name);
						if(values && $.isArray(values)){
							formData['delete'](name);
							formData.append(name, values.join());
						}
					}
				}catch(e){}
			});
		}();
		+function(){
			var $daterangepicker = $form.find('.cpf-daterangepicker.format-submit-value,.cpf-textrange.format-submit-value').filter('span,div');
			$daterangepicker.each(function(){
				var $this = $(this),
					name = $this.attr('data-name');
				if(name){
					var fieldInput = $this.data('field-input');
					if(fieldInput){
						formData['delete'](name);
						formData.append(name, fieldInput.getValue());
					}
				}
			});
		}();
	}
	
	function initFormElement($page){
		$('form', $page).not('.nform').submit(function(e, handlerFunc){
			if(typeof CKEDITOR === 'object'){
				for (var key in CKEDITOR.instances){
					if($(CKEDITOR.instances[key].element.$).closest(this).length > 0){
						CKEDITOR.instances[key].updateElement();
					}
				}
			}
			var $this = $(this),
				page = $this.getLocatePage(),
				formData = new FormData(this)
			;
			if(!page){
				return;
			}
			var validator = $this.data('bootstrapValidator');
			if(validator && $this.is('.validate-form')){
				try{
					validator.validate();
				}catch(e){
					console.error(e);
					return false;
				}
				if(!validator.isValid()){
					return false;
				}
			}
			formatFormData($this, formData);
			var url = $this.attr('action'),
				confirm = $this.attr('confirm'),
				Dialog = require('dialog'),
				_submit = function(){
					//构造提交事件
					var submitEvent = $.Event('cpf-submit');
					var canceled = false;
					submitEvent.doCancel = function(){canceled = true};
					var result = $this.trigger(submitEvent, [formData, $this, page]);
					if(typeof handlerFunc === 'function'){
						handlerFunc.apply($this[0], [formData, $this, page]);
					}
					try{
						if(!canceled){
							page.loadContent(url, undefined, formData, undefined, function(data, dataType){
								$this.trigger('cpf-submited', [data, dataType]);
							});
							$this.trigger('cpf-submitting', [formData, $this, page]);
						}
					}catch(e){
						console.error(e);
					}finally{
						return false;
					}
				};
			if(confirm && Dialog){
				Dialog.confirm(confirm, function(yes){
					if(yes){
						_submit();
					}
				});
			}else{
				return _submit();
			}
		}).filter('.validate-form').each(function(){
			//初始化验证插件
			$(this).bootstrapValidator();
			//绑定重新校验表单事件
			$(':input', this).on('cpf-revalidate', function(){
				var $thisInput = $(this);
				var fieldName = $thisInput.attr('name');
				var bv = $thisInput.closest('form').data('bootstrapValidator');
				if(bv && fieldName){
					bv.updateStatus(fieldName, 'NOT_VALIDATED', null);
					bv.validateField(fieldName);
				}
			});
		}).end().submit(function(e){
			//阻止跳转
			  e.preventDefault();
		});
	}
	function initFormInput($page){
		//绑定在文本框的回车事件
		$('form :text', $page).keypress(function(e){
			if(e.keyCode === 13){
				$(this).closest('form').trigger('cpf-submit');
			}
		});
		$('form :text.datepicker', $page).each(function(){
			require('utils').datepicker(this);
		});
		$('form :text.datetimepicker', $page).each(function(){
			require('utils').datetimepicker(this);
		});
		$('form :text.timepicker', $page).each(function(){
			require('utils').timepicker(this);
		});
		$(':text.cpf-field-decimal,input[type="number"].cpf-field-decimal', $page).on('input', function(){
			this.value = this.value.replace(/[^\d\-\.]/g, '').replace(/^(.+)\-/g, '$1').replace(/(\d+)\.(\d*)\./, '$1.$2');
		});
		$(':text.cpf-field-int,input[type="number"].cpf-field-int', $page).on('input', function(){
			this.value = this.value.replace(/[^\d\-]/g, '').replace(/(\d+)\-+(\d*)/, '$1$2').replace(/\-+/, '-');
		});
		$('form div.cpf-daterangepicker,form span.cpf-daterangepicker,form span.cpf-textrange', $page).each(function(){
			var $div = $(this);
			var name = $div.is('.format-submit-value')? null: $div.attr('data-name'),
				value = $div.attr('data-value');
			if($div.children().length === 0){
				var FieldInput = require('field/js/field-input.js');
				if(FieldInput){
					var fieldType = $div.is('.cpf-textrange')? 'range': 'daterange';
					var range = new FieldInput({
						type	: fieldType,
						name	: name,
						value	: value
					});
					$div.append(range.getDom()).data('field-input', range);
				}
			}
		});
		
		require('select2');
		if($.fn.select2){
			$('form select.cpf-select2', $page).each(function(){
				$(this).select2({
					theme			: "bootstrap",
					width			: null,
					allowClear		: true,
					placeholder		: '',
				});
			});
		}
		/**
		 * 初始化下拉框的值
		 */
		$('form select', $page).each(function(){
			var $select = $(this);
			var val = $select.attr('data-value');
			if(val){
				if($select.is('.cpf-select2[multiple]')){
					$select.val(val.split(',')).trigger('change');
					return;
				}
				$(this).val(val).trigger('change');
			}
		});
		/**
		 * 初始化页面的所有勾选框
		 * 勾选框为span.cpf-checkbox，勾选框对应内容直接放在元素内。元素支持以下几个属性
		 * 1.class包含checked，则勾选框默认将勾选上
		 * 2.input-id 勾选框的表单的id
		 * 3.checkbox-class， 勾选框实际展示元素的class（用于为勾选框添加其他样式）
		 * 4.name 勾选框表单的name
		 * 5.value 勾选框表单的value
		 * 事件
		 * 	cpf-toggle-checked事件，用于触发切换勾选框的勾选状态
		 * 	cpf-checked-change事件，勾选状态更改时触发，不可手动触发
		 * 		
		 */
		$('span.cpf-checkbox', $page).each(function(){
			var $this = $(this);
			var $span = $('<span>');
			var $checkbox = null;
			var checkboxClass = $this.attr('checkbox-class');
			$this.prepend($span.addClass(checkboxClass));
			if($this.attr('input') !== 'false'){
				var inputId = $this.attr('input-id');
				var name = $this.attr('name') || '';
				var value = $this.attr('value');
				$checkbox = $('<input type="checkbox" />')
									.attr('name', name)
									.val(value)
									.attr('id', inputId)
									.hide();
				$checkbox.prop('checked', $this.is('.checked'));
				$this.prepend($checkbox).removeClass('checked');
			}
			$this.on('cpf-toggle-checked', function(e, checked){
				var hasArg = typeof checked === 'boolean';
				var toCheckVal;
				if($checkbox){
					toCheckVal = hasArg? checked: !$checkbox.prop('checked');
					$checkbox.prop('checked', toCheckVal);
				}else{
					$this.toggleClass('checked', hasArg? checked: undefined);
					toCheckVal = $this.is('.checked');
				}
				$this.trigger('cpf-checked-change', [toCheckVal]);
			});
			$this.click(function(){$this.trigger('cpf-toggle-checked')});
		});
	}
	
	$CPF.putPageInitSequeue(4, function($page){
		initFormElement($page);
		initFormInput($page);
		/**
		 * 
		 */
		$($page).on('cpf-check-all-checkbox', function(e, checkboxGroup, checked){
			var $checkboxGroup;
			if(checkboxGroup){
				$checkboxGroup = $('span.cpf-checkbox[cpf-checkbox-group="' + checkboxGroup + '"]', $page);
			}else{
				$checkboxGroup = $('span.cpf-checkbox', $page);
			}
			$checkboxGroup.trigger('cpf-toggle-checked', [checked]);
		});
		/**
		 * 绑定批量勾选（取消）对应勾选框的勾选状态的点击事件
		 * 绑定对象有以下属性
		 * 
		 */
		$('.cpf-check-all', $page).click(function(){
			var $this = $(this);
			$page.trigger('cpf-check-all-checkbox', [$this.attr('cpf-checkbox-group'),  $this.attr('cpf-checked') !== 'false'])
		});
	});
	
	/**
	 * 切换显示表单的错误信息，要求$formControl必须是.form-group下的.form-control才能看到效果
	 * 如果要移除错误信息，那么传入第二个参数为空，如果errorKey为空，将移除所有的错误信息
	 */
	exports.toggleError = function($formControl, errorMsg, errorKey){
		$formControl = $($formControl);
		var $formGroup = $($formControl).closest('.form-group');
		if($formGroup.length > 0){
			if(errorKey){
				$formControl.nextAll('small.help-block[error-key="' + errorKey + '"]').remove();
			}else{
				$formControl.nextAll().remove();
			}
			if(errorMsg){
				$formGroup.addClass('has-error');
				$formControl.after('<small class="help-block" error-key="' + (errorKey || '') + '">' + errorMsg + '</small>');
			}else{
				$formGroup.removeClass('has-error');
			}
		}
	}
	exports.clearAllError = function($container){
		$container
			.find('.has-error').removeClass('has-error')
			.end()
			.find('small.help-block').remove();
	}
	
	exports.formatFormData = formatFormData;
	exports.initFormElement = initFormElement;
	exports.initFormInput = initFormInput;
});