define(function(require, exports, module){
	var Utils = require('utils');
	function EntityFieldPicker(_param){
		var defParam = {
			$page		: null,
			plhTarget	: null
		}
		this.param = $.extend({}, defParam, _param);
		this.uuid = Utils.uuid(10, 62);
		this.selectFieldCallbacks = $.Callbacks();
		this.resetFieldCallbacks = $.Callbacks();
		this.composites = [];
	}
	
	
	EntityFieldPicker.prototype.select = function(fieldId, data){
		if(this.$fieldPicker){
			this.$fieldPicker.find('label[field-id="' + fieldId + '"]').trigger('click', [data]);
		}
	}
	EntityFieldPicker.prototype.reset = function(){
		if(this.$fieldPicker){
			this.$fieldPicker.find('label[field-id].disabled').removeClass('disabled');
			this.resetFieldCallbacks.fireWith(this)
		}
	}
	
	EntityFieldPicker.prototype.bindSelected = function(callback){
		this.selectFieldCallbacks.add(callback);
	}
	EntityFieldPicker.prototype.bindReseted  = function(callback){
		this.resetFieldCallbacks.add(callback);
	}
	
	EntityFieldPicker.prototype.setComposites = function(composites){
		$.each(composites, function(){
			if(this.fields){
				var composite = this;
				$.each(this.fields, function(){this.composite = composite});
			}
		});
		this.composites = composites;
	}
	
	EntityFieldPicker.prototype.render = function(){
		var defer = $.Deferred();
		var that = this;
		require('tmpl').load('media/jv/entity/tmpl/entity-field-picker.tmpl').done(function(tmplMap){
			var $fieldPicker = tmplMap['fields-container'].replaceFor($('style[target="' + that.param.plhTarget + '"]', that.param.$page), {
				composites	: that.composites,
				uuid		: that.uuid
			}, {
				selectField	: function(field, data){
					var $fieldLabel = $(this);
					if(!$fieldLabel.is('.disabled')){
						var toggleDisabled = function(disabled){
							$fieldLabel.toggleClass('disabled', disabled);
						}
						that.selectFieldCallbacks.fireWith(that, [field, this, toggleDisabled, data]);
					}
				}
			});
			that.$fieldPicker = $fieldPicker;
			defer.resolve($fieldPicker);
		});
		
		
		return defer.promise();
	}
	
	module.exports = EntityFieldPicker;
	
})