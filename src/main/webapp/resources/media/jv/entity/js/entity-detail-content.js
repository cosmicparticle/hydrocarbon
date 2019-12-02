define(function(require, exports, module){
	"use strict";
	function DetailContent(){
		this.normalInputs = [];
		this.arrayComposites = {};
	}
	
	$.extend(DetailContent.prototype, {
		addNormalInput	: function(input){
			if(input){
				this.normalInputs.push(input);
			}
		},
		addArrayComposite	: function(compositeName){
			if(compositeName){
				if(!this.arrayComposites[compositeName]){
					var composite = new ArrayComposite(compositeName);
					this.arrayComposites[compositeName] = composite;
					return composite;
				}else{
					throw new Error('不能添加重复的compositeName[' + compositeName + ']');
				}
			}
			
		},
		getArrayComposite	: function(compositeName){
			return this.arrayComposites[compositeName];
		},
		forEachArrayComposites	: function(callback){
			var index = 0;
			for(var compositeName in this.arrayComposites){
				callback.apply(this.arrayComposites[compositeName], [compositeName, index++]);
			}
		}
	});
	
	function ArrayComposite(compositeName){
		if(!compositeName){
			throw new Error('compositeName不能为空');
		}
		this.rows = [];
		this.compositeName = compositeName;
	}
	
	ArrayComposite.prototype.addRow = function(){
		var row = new Row(this);
		this.rows.push(row);
		return row;
	}
	ArrayComposite.prototype.removeRow = function(row){
		var index = -1;
		if(typeof row === 'number'){
			index = row;
		}else{
			index = this.rows.indexOf(row);
		}
		if(index >= 0){
			return this.rows.splice(index, 1);
		}
	}
	
	function Row(arrayComposite){
		this.parent = arrayComposite;
		this.entityCode = null;
		this.inputs = [];
		this.relationLabelSelect = null;
	}
	Row.prototype.getRelationLabel = function(){
		if(this.relationLabelSelect){
			return this.relationLabelSelect.val();
		}else{
			throw new Error('没有设置关系名的select控件');
		}
	}
	Row.prototype.setRelationLabelSelect = function(relationLabelSelect){
		this.relationLabelSelect = relationLabelSelect;
	}
	Row.prototype.setEntityCode = function(entityCode){
		this.entityCode = entityCode;
	}
	Row.prototype.addInput = function(input){
		if(input){
			this.inputs.push(input)
		}
	}
	
	Row.prototype.remove = function(){
		this.parent.removeRow(this);
	}
	
	
	module.exports = DetailContent;
});