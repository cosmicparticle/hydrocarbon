/**
 * 
 */
define(function(require, exports, module){
	
	var $CPF = require('$CPF');
	
	$CPF.addDefaultParam({
		ccheckboxClass			: 'ccheckbox',
		ccheckboxCheckedClass	: 'checked',
		ccheckboxChangeEventName: 'ccheckbox-change',
		ccheckboxGroupIdAttrName: 'ccheckbox-group-id',
		ccheckboxDataKey		: 'ccheckboxDataKey',
		ccheckboxGroupDataKey	: 'ccheckboxGroupDataKey'
	});
	
	
	function CcheckboxGroup(_param){
		var Utils = require('utils');
		var defaultParam = {
			groupId		: Utils.uuid(),
			checkboxs	: [],
			value		: '',
			whenChanged	: $.noop
		};
		
		var param = $.extend({}, defaultParam, _param);
		var _this = this;
		function bindCheckbox(ccheckbox){
			if(ccheckbox instanceof Ccheckbox){
				ccheckbox.getLabel().data($CPF.getParam('ccheckboxGroupDataKey'), _this);
				ccheckbox.getInput().data($CPF.getParam('ccheckboxGroupDataKey'), _this);
				ccheckbox.getLabel().attr($CPF.getParam('ccheckboxGroupIdAttrName'), param.groupId);
				ccheckbox.getInput().on('cpf-checkbox-change', function(e, flagChanged){
					var changedCheckboxs = [], checkedCheckboxs = [];
					var checked = ccheckbox.isChecked();
					if(flagChanged){
						changedCheckboxs.push(ccheckbox);
					}
					if(checked && ccheckbox.getType() === 'radio'){
						for(var i in param.checkboxs){
							var curr = param.checkboxs[i];
							var curChecked = curr.isChecked();
							if(ccheckbox != curr){
								if(curr.getType() == 'radio'){
									if(curChecked){
										changedCheckboxs.push(curr);
									}
									curr.toggleChecked(false, true);
								}else if(curChecked){
									checkedCheckboxs.push(curr);
								}
							}else{
								checkedCheckboxs.push(ccheckbox);
							}
						}
					}
					var checkedValues = [];
					for(var i in checkedCheckboxs){checkedValues.push(checkedCheckboxs[i].getValue())}
					param.whenChanged.apply(_this, [checkedValues, checkedCheckboxs, changedCheckboxs]);
				});
			}else{
				$.error('参数必须是Ccheckbox对象');
			}
		}
		
		this.init = function(){
			for(var i in param.checkboxs){
				bindCheckbox(param.checkboxs[i]);
			}
			this.setValue(param.value);
		}
		
		this.setValue = function(val){
			if(typeof val === 'number' && Utils.isInteger(val) && val >= 0){
				//参数是一个数字时，勾选索引为该数字的选项
				var checkbox = param.checkboxs[val];
				if(checkbox){
					checkbox.toggleChecked(true);
				}
			}else if($.isArray(val)){
				//参数是一个数组时，勾选数组内所有元素的值
				for(var i in val){
					this.setValue(val[i]);
				}
			}else if(typeof val === 'string'){
				var valSet = new Set();
				var split = val.split(',');
				for(var i in split){
					valSet.add(split[i]);
				}
				for(var i in param.checkboxs){
					var checkbox = param.checkboxs[i];
					if(checkbox instanceof Ccheckbox){
						var value = checkbox.getValue();
						if(valSet.has(value)){
							checkbox.toggleChecked(true);
						}
					}
				}
			}
		}
		this.getValue = function(){
			var val = [];
			for(var i in param.checkboxs){
				var checkbox = param.checkboxs[i];
				val.push(checkbox.getValue());
			}
			return val;
		}
		function swapCheckbox(i, j){
			require('utils').swap(param.checkboxs, i, j);
		}
		function replace(index){
			if(index < param.checkboxs.length - 1){
				if(!param.checkboxs[index].isChecked()){
					for(var i = index + 1; i < param.checkboxs.length; i++){
						if(param.checkboxs[i].isChecked()){
							param.checkboxs[index].swapDom(param.checkboxs[i]);
							swapCheckbox(index, i);
							return replace(i + 1);
						}
					}
				}else{
					return replace(index + 1);
				}
			}
		}
		this.autoSort = function(){
			replace(0);
		}
		this.init();
		
	}
	
	function Ccheckbox(_param){
		var defaultParam = {
			$label	: null,
			$input	: null,
			value	: ''
		};
		
		var param = $.extend({}, defaultParam, _param);
		var _this = this;
		
		/**
		 * 初始化勾选框
		 */
		this.init = function(){
			var ccheckboxChangeEventName = $CPF.getParam('ccheckboxChangeEventName');
			var ccheckboxClass = $CPF.getParam('ccheckboxClass');
			var ccheckboxDataKey = $CPF.getParam('ccheckboxDataKey');
			param.$label = param.$label.eq(0);
			param.$input = param.$input.eq(0);
			param.$label.addClass(ccheckboxClass).data(ccheckboxDataKey, this);
			param.$input.addClass(ccheckboxClass).data(ccheckboxDataKey, this);
			if(param.value){
				param.$input.val(param.value);
			}else{
				param.value = param.$input.val();
			}
		}
		
		if(param.$label instanceof $ && param.$input instanceof $){
			var type = param.$input.attr('type');
			if(type == 'checkbox' || type == 'radio'){
				this.init();
			}else{
				$.error('勾选框的表单只能是checkbox或者radio，当前传入的是' + type);
			}
		}else{
			$.error('要求传入$label和$input对象为jQuery对象');
		}
		
		/**
		 * 将当前勾选框勾选。如果传入参数,则将勾选状态切换至指定状态。如果不传入，则直接切换当前状态
		 * @param flag 是否勾选
		 * @param withoutTrigger 是否触发input的change事件，只在传入true时不触发
		 */
		this.toggleChecked = function(flag, withoutTrigger){
			var ccheckboxCheckedClass = $CPF.getParam('ccheckboxCheckedClass');
			if(flag === undefined){
				flag = !this.isChecked();
			}
			//执行方法后勾选状态是否会改变的标记
			var flagChanged = this.isChecked() != flag;
			param.$label.toggleClass(ccheckboxCheckedClass, flag);
			param.$input.prop('checked', flag);
			if(withoutTrigger !== true){
				param.$input.trigger('cpf-checkbox-change', [flagChanged]);
			}
		}
		/**
		 * 获得当前勾选框的value
		 */
		this.getValue = function(){
			return param.$input.val();
		}
		/**
		 * 获得当前勾选框的勾选状态
		 */
		this.isChecked = function(){
			return param.$label.is('.' + $CPF.getParam('ccheckboxCheckedClass'));
		}
		/**
		 * 获得显示的文字
		 */
		this.getText = function(){
			return this.getLabel().text();
		};
		/**
		 * 获得显示的对象
		 */
		this.getLabel = function(){
			return param.$label;
		};
		/**
		 * 获得表单
		 */
		this.getInput = function(){
			return param.$input;
		}
		/**
		 * 获得表单的类型
		 */
		this.getType = function(){
			return param.$input.attr('type');
		}
		this.swapDom = function(otherCheckbox){
			if(otherCheckbox instanceof Ccheckbox){
				var labelFirst = true;
				var $thisPrev = this.getLabel().prev();
				if($thisPrev.is(this.getInput())){
					$thisPrev = this.getInput().prev();
					labelFirst = false;
				}
				
				this.getLabel().insertAfter(otherCheckbox.getLabel());
				this.getInput().insertAfter(otherCheckbox.getInput());
				
				if(labelFirst){
					otherCheckbox.getInput().insertAfter($thisPrev);
					otherCheckbox.getLabel().insertAfter($thisPrev);
				}else{
					otherCheckbox.getLabel().insertAfter($thisPrev);
					otherCheckbox.getInput().insertAfter($thisPrev);
				}
			}
		}
	}
	
	var CCK = {
		Checkbox		: Ccheckbox,
		CheckboxGroup	: CcheckboxGroup,
		bind			: function($inputs, defaultValue, whenChanged){
			if(typeof $inputs === 'string'){
				$.error('不能传入string参数');
				//$inputs = $('[name="' + $inputs + '"]');
			}
			if($inputs instanceof $){
				var checkboxs = [];
				$inputs.each(function(){
					var $this = $(this);
					if($this.is(':checkbox') || $this.is(':radio')){
						var $label = null;
						var thisInputId = $this.attr('id');
						if(thisInputId){
							$label = $(this).next('*[for="' + thisInputId + '"]');
						}
						var ccheckboxClass = $CPF.getParam('ccheckboxClass');
						if($label == null || ($label instanceof $ && $label.length == 0)){
							$label = $('<span>')
								.addClass(ccheckboxClass)
								.text($this.attr('data-text')).insertBefore($this);
						}
						var ccheckbox = new Ccheckbox({
							$label	: $label,
							$input	: $this
						});
						$label.on('click', function(){
							if(!ccheckbox.isChecked() || ccheckbox.getType() === 'checkbox'){
								ccheckbox.toggleChecked();
							}
						});
						checkboxs.push(ccheckbox);
					}
				});
				if(typeof defaultValue === 'function'){
					whenChanged = defaultValue;
					defaultValue = null;
				}
				var group = new CcheckboxGroup({
					checkboxs	: checkboxs,
					value		: defaultValue,
					whenChanged	: whenChanged
				});
				if(checkboxs.length > 20){
					group.autoSort();
				}
				return group;
			}
		},
		getGroup		: function($dom){
			return $($dom).data($CPF.getParam('ccheckboxGroupDataKey'));
		},
		getCheckbox		: function($dom){
			return $($dom).data($CPF.getParam('ccheckboxDataKey'));
		}
	}
	
	module.exports = CCK;
});