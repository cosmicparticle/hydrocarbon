define(function(require, exports, module){
	var Utils = require('utils');
	var Form = require('form');
	var Dialog = require('dialog');
	
	
	function Field(name, source = {}, parentComposite = null){
		this.source = source;
		this.parentComposite = parentComposite;
		this.name = name;
		this.removedFlag = false;
		this.renamedFlag = false;
	}
	Field.prototype.getTreeNode = function(){
		return {text:this.name, field: this};
	}
	Field.prototype.getParentFields = function(){
		if(this.parentComposite instanceof Composite){
			return this.parentComposite.source.fields;
		}
	}
	/**
	 * 设置字段的name值，同时修改原始对象所在对象的内容
	 */
	Field.prototype.setName = function(newName){
		if(!this.checkSiblingsNameExist(newName)){
			try{
				this.getParentFields()[this.name] = undefined;
				delete this.getParentFields()[this.name];
			}catch(e){}
			this.getParentFields()[newName] = this.source;
			this.name = newName;
			this.renamedFlag = true;
		}
	}
	/**
	 * 检查字段的兄弟字段是否存在name字段
	 */
	Field.prototype.checkSiblingsNameExist = function(name){
		for(var fieldName in this.getParentFields()){
			if(this.getParentFields()[fieldName] !== this.source && fieldName === name){
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 从父对象中移除当前字段
	 */
	Field.prototype.remove = function(){
		this.getParentFields()[this.name] = undefined;
		try{
			delete this.getParentFields()[this.name];
			this.removedFlag = true;
		}catch(e){}
	}
	
	/**
	 * 临时字段，用于从树形节点添加字段时候的过度对象
	 */
	function EmptyField(name, source, parentComposite){
		Field.apply(this, arguments);
		this.spec = null;
	}
	Utils.extendClass(EmptyField, Field);
	EmptyField.prototype.getTreeNode = function(){
		var node = EmptyField.__superPrototype.getTreeNode.apply(this, arguments);
		node.icon = 'fa fa-question';
		return node;
	}
	
	EmptyField.prototype.isReadyToEvolve = function(){
		return this.name && 
				!this.checkSiblingsNameExist(this.name) && 
				(this.source.type === 'normal' || this.spec === 'label' || this.source.dtmplFieldId || this.source.dtmplCompositeId);
	}
	
	/**
	 * 临时字段进化成正式字段
	 */
	EmptyField.prototype.evolve = function(){
		Utils.assert(this.name, '进化时name不能为空');
		if(this.checkSiblingsNameExist(this.name)){
			$.error('字段名已存在');
		}
		var field = null;
		if(this.source.type === 'normal' || this.source.dtmplCompositeId){
			this.source.fields = {};
			field = new Composite(this.name, this.source, this.parentComposite);
		}else if(this.spec === 'label'){
			field = new Label(this.name, this.source, this.parentComposite);
		}else if(this.source.dtmplFieldId){
			field = new Property(this.name, this.source, this.parentComposite);
		}else{
			$.error('进化时dtmplField和dtmplCompositeId不能同时为空');
		}
		this.getParentFields()[this.name] = field.source;
		//重置父节点Composite的fields，使其重新加载
		this.parentComposite.fields = null;
		return field;
	}
	
	function Label(name, source, parentRelationComposite){
		Field.apply(this, arguments);
		Utils.assert(parentRelationComposite instanceof Composite && parentRelationComposite.source.type === 'array', 'Label的父节点必须是array');
	}
	
	Utils.extendClass(Label, Field);
	Label.prototype.getTreeNode = function(){
		var node = Property.__superPrototype.getTreeNode.apply(this, arguments);
		node.icon = 'fa fa-flag';
		return node;
	}
	Label.LABEL_KEY = '$$label$$';
	
	
	function Property(name, source, parentComposite){
		Field.apply(this, arguments);
	}
	Utils.extendClass(Property, Field);
	
	Property.prototype.getTreeNode = function(){
		var node = Property.__superPrototype.getTreeNode.apply(this, arguments);
		node.icon = 'fa fa-star yellow';
		return node;
	}
	
	function Composite(name, source, parentComposite){
		Field.apply(this, arguments);
		this.fields = null;
		this.nameIndex = 1;
	}
	
	Utils.extendClass(Composite, Field);
	
	Composite.prototype.getFields = function(){
		if(!this.fields){
			this.fields = resolveFields(this); 
		}
		return this.fields;
	}
	Composite.prototype.getTreeNode = function(){
		var node = Composite.__superPrototype.getTreeNode.apply(this, arguments);
		node.nodes = this.getTreeNodes();
		if(this.source.type === 'array'){
			node.icon = 'fa fa-list-ol';
		}else{
			node.icon = 'fa fa-folder';
		}
		node.state = {expanded:false};
		return node;
	}
	Composite.prototype.getTreeNodes = function(){
		return this.getFields().map(field=>field.getTreeNode());
	}
	
	Composite.prototype.newName = function(){
		return '新建节点' + this.nameIndex++;
	}
	
	
	function resolveFields(composite){
		var fields = [];
		if(composite instanceof Composite && composite.source.fields){
			for(var fieldName in composite.source.fields){
				var sourceField = composite.source.fields[fieldName];
				var field = null;
				switch(sourceField.type){
					case 'normal':
					case 'array':
						field = new Composite(fieldName, sourceField, composite);
						break;
					default:
						if(sourceField.label === true){
							field = new Label(fieldName, sourceField, composite);
						}else{
							field = new Property(fieldName, sourceField, composite);
						}
				}
				fields.push(field);
			}
		}
		return fields;
	}
	
	exports.initTree = function($container, _param){
		var param = $.extend({
			source	: null
		},_param);
		var context = Utils.createContext({
			sourceComposite	: null,
			//当前选中的节点
			currentNode	: null,
			nodeType	: 'field',
			//当前节点类型的只读状态
			nodeTypeReadonly	: false,
			//当前节点字段的选项数据来源
			fieldSelectSource	: [],
			//当前编辑器有错误，在选择节点时会检测该状态，如果为true就不允许切换节点选择
			errorEditorForm	: false
		});
		//加载模板
		context.loadTmplMap('media/admin/config/tmpl/json-tree-view.tmpl').done(renderView);
		//绑定事件
		context
			.bind('sourceComposite', [renderTree])
			.bind('currentNode', [setNodeEditorFormData, whenCreateTempNode, whenSelectArrayParentNode])
			.bind('fieldSelectSource', renderFieldSelect)
			.bind('nodeType', afterSetNodeType)
			.bind('nodeTypeReadonly', setNodeTypeReadonly)
				
		function renderView(){
			var tmplMap = context.getStatus('tmplMap');
			var $resTreeView = tmplMap['res-tree-view'].tmpl({}, getEvents());
			$container.empty().append($resTreeView);
			require('event').prepareToContext($container, context);
		}
		
		function renderTree(){
			context.getDom('tree-view').treeview({
				data			: context.getStatus('sourceComposite').getTreeNodes(),
				levels			: 1,
				//禁止取消选择
				preventUnselect	: true,
				onNodeSelected, onNodeUnselected
			});
			context.setStatus('currentNode', null);
			
		}
		
		function renderFieldSelect(){
			var $fieldSelect = context.getDom('field-select').empty().select2({
				theme			: "bootstrap",
				width			: null,
				data			: context.getStatus('fieldSelectSource')
			});
			var currentField = getCurrentField();
			if(currentField){
				//$fieldSelect.removeAttr('disabled');
				if(currentField instanceof Property || currentField instanceof EmptyField && currentField.source.dtmplFieldId){
					$fieldSelect.val(currentField.source.dtmplFieldId).trigger('change', [true]);
				}else if(currentField instanceof Label || currentField instanceof EmptyField && currentField.spec === 'label'){
					$fieldSelect.val(Label.LABEL_KEY).trigger('change', [true]);
				}else if(currentField instanceof Composite || currentField instanceof EmptyField && currentField.source.dtmplCompositeId){
					$fieldSelect.val(currentField.source.dtmplCompositeId).trigger('change', [true]);
				}
			}
		}
		
		/**
		 * 设置节点类型之后的回调
		 */
		function afterSetNodeType(){
			var currentField = getCurrentField();
			var nodeType = context.getStatus('nodeType');
			currentField.field instanceof EmptyField? context.getDom('btn-add-child').attr('disabled'): null;
			var $fieldSelectGroup = context.getDom('field-select').closest('.form-group');
			currentField.source.type = nodeType;
			switch(nodeType){
				case 'field':
					$fieldSelectGroup.show();
					context.setStatus('fieldSelectSource', context.getStatus('fieldOptions'));
					break;
				case 'normal':
					$fieldSelectGroup.hide();
					break;
				case 'array':
					$fieldSelectGroup.show();
					context.setStatus('fieldSelectSource', context.getStatus('arrayCompositeOptions'));
					break;
			}
		}
		
		function setNodeTypeReadonly(){
			if(context.getStatus('nodeTypeReadonly')){
				context.getDom('nodeType').attr('disabled', 'disabled');
			}else{
				context.getDom('nodeType').removeAttr('disabled');
			}
		}
		
		/**
		 * 根据当前选择的节点，设置编辑器的表单
		 */
		function setNodeEditorFormData(){
			var currentField = getCurrentField();
			var $nodeEditor = context.getDom('node-editor');
			if(currentField){
				var fieldSource = currentField.source;
				context.setStatus('nodeTypeReadonly', !!(fieldSource.type === 'normal' || fieldSource.dtmplFieldId || fieldSource.dtmplCompositeId));
				//清除已存在的错误
				Form.clearAllError($nodeEditor);
				//当前有选择节点时，设置编辑器表单数据
				context.getDom('nodeType').val(fieldSource.type || 'field').trigger('change');
				if(fieldSource.dtmplCompositeId || currentField instanceof Composite){
					var currentNode = context.getStatus('currentNode');
					context.getDom('btn-add-child').removeAttr('disabled');
					//如果已经选定了dtmplCompositeId并且孩子节点不为空，那么禁止修改dtmplCompositeId
					if(fieldSource.dtmplCompositeId && currentNode.nodes && currentNode.nodes.length > 0){
						context.getDom('field-select').attr('disabled', 'disabled');
					}
				}else if(currentField instanceof Label){
					//如果字段是lable的话，那么禁止修改字段
					context.getDom('field-select').attr('disabled', 'disabled');
				}else if(fieldSource.dtmplFieldId || currentField instanceof Property){
					//字段类型是field
					context.getDom('btn-add-child').attr('disabled', 'disabled');
				}


				context.getDom('fieldName').val(currentField.name);
				context.getDom('desc').val(fieldSource.desc);
				context.getDom('btn-add-sibling').removeAttr('disabled');
				context.getDom('btn-save-temp').hide();
				$nodeEditor.show();
			}else{
				//当前没有选节点，隐藏编辑器区域
				$nodeEditor.hide();
			}
		}
		
		/**
		 * 根据dtmplCompositeId获得数组字段的选项数组
		 * withLabelOption为布尔型参数，表示是否在选项中添加关系名称
		 */
		function getArrayFieldSource(dtmplCompositeId, withLabelOption){
			var arrayFieldsMap = context.getStatus('arrayFieldsMap');
			var composite = arrayFieldsMap[dtmplCompositeId];
			var options = [];
			if(composite){
				var group = composite.group;
				options[0] = $.extend(true, {}, composite.group);
				if(withLabelOption && composite.compositeType === 'relation'){
					options[0].children.push({id: Label.LABEL_KEY, text: '(特殊)关系名称', data:{}});
				}
			}
			return options;
		}
		
		/**
		 * 当前创建一个节点时进行的回调
		 */
		function whenCreateTempNode(){
			var currentField = getCurrentField();
			if(currentField){
				if(currentField instanceof EmptyField){
					var $nodeEditor = context.getDom('node-editor');
					//创建了一个临时节点
					//编辑器显示
					context.setStatus('nodeTypeReadonly', false);
					context.getDom('btn-add-child').attr('disabled', 'disabled');
					context.getDom('btn-add-sibling').attr('disabled', 'disabled');
					context.getDom('field-select').removeAttr('disabled');
					context.getDom('btn-save-temp').show();
					
				}
			}
		}
		
		/**
		 * 当点击一个父节点是数组字段时候的回调
		 */
		function whenSelectArrayParentNode(){
			var currentField = getCurrentField();
			if(currentField){
				//如果父节点是数组字段composite，那么限定只能选择该composite下的字段
				var parentComposite = currentField.parentComposite;
				if(parentComposite.source.type === 'array'){
					context.setStatus('nodeTypeReadonly', true);
					var arrayFieldSource = getArrayFieldSource(parentComposite.source.dtmplCompositeId, currentField instanceof EmptyField || currentField instanceof Label);
					//var arrayFieldSource = context.getStatus('arrayFieldsMap')[parentComposite.source.dtmplCompositeId] || [];
					context.setStatus('fieldSelectSource', arrayFieldSource);
				}
			}
		}
		
		/**
		 * 选择节点时的回调
		 */
		function onNodeSelected(event, data){
			var currentNode = context.getStatus('currentNode');
			var $treeView = $(this);
			if(currentNode && currentNode.field instanceof EmptyField && currentNode.nodeId !== data.nodeId){
				//不是修改临时节点的情况
				//当前临时节点还没有编辑完成，不能点击其他节点
				var emptyField = currentNode.field;
				var reselectSelf = function(msg){
					//重新激活临时节点，并提示
					$treeView.treeview('selectNode', [currentNode, {silent: true}]);
					Dialog.notice(msg, 'error');
					context.getDom('node-editor').show();
				}
				if(context.getStatus('errorEditorForm')){
					return reselectSelf('请正确保存后切换');
				}
				if(emptyField.isReadyToEvolve()){
					//临时节点信息完整，可以转换为正式节点
					//临时字段根据当前已经存在的字段进化成正式字段类型对象
					try {
						currentNode.field = emptyField.evolve();
						var newNode = currentNode.field.getTreeNode();
						$treeView.treeview('updateNode', [currentNode, newNode]);
					} catch (e) {
						console.error(e);
						return reselectSelf('字段名不能重复');
					}
				}else{
					return reselectSelf('至少选择节点类型和填写字段名');
				}
			}
			var selectedNode = $treeView.treeview('findNodes', ['^' + data.nodeId + '$', 'nodeId'])[0]
			context.setStatus({currentNode: selectedNode});
		}
		
		/**
		 * 保存临时节点
		 */
		function saveTemp(){
			var currentNode = context.getStatus('currentNode');
			var $treeView = context.getDom('tree-view');
			if(currentNode && currentNode.field instanceof EmptyField){
				//不是修改临时节点的情况
				//当前临时节点还没有编辑完成，不能点击其他节点
				var emptyField = currentNode.field;
				if(emptyField.isReadyToEvolve()){
					//临时节点信息完整，可以转换为正式节点
					//临时字段根据当前已经存在的字段进化成正式字段类型对象
					currentNode.field = emptyField.evolve();
					var newNode = currentNode.field.getTreeNode();
					$treeView
						.treeview('updateNode', [currentNode, newNode])
						.treeview('selectNode', [newNode]);
				}
			}
		}
		
		/**
		 * 取消选择节点时的回调
		 */
		function onNodeUnselected(event, data){
			var currentField = getCurrentField(); 
			if(currentField && currentField.removedFlag){
				context.setStatus('currentNode', null);
			}
		}
		
		function getCurrentField(){
			return (context.getStatus('currentNode') || {}).field;
		}
		
		/**
		 * 验证字段名的方法
		 */
		function validateFieldName(fieldName, currentField){
			if(!fieldName || !fieldName.trim()){
				return 'isempty';
			}else{
				if(currentField.checkSiblingsNameExist(fieldName)){
					return 'isrepeat';
				}
			}
		}
		
		
		/**
		 * 
		 */
		function changeSaveTempDisabled(){
			var currentField = getCurrentField();
			if(currentField instanceof EmptyField && currentField.isReadyToEvolve()){
				context.getDom('btn-save-temp').removeAttr('disabled');
			}else{
				context.getDom('btn-save-temp').attr('disabled', 'disabled');
			}
		}
		
		/**
		 * 初始化组件时的事件方法
		 */
		function getEvents(){
			var events = {
				changeNodeType	: function(){
					context.setStatus('nodeType', $(this).val());
					changeSaveTempDisabled();
				},
				changeField		: function(e, fromTrigger){
					var nodeType = context.getStatus('nodeType');
					if(nodeType === 'field' || nodeType === 'array'){
						var option = $(this).select2('data')[0];
						var currentField = getCurrentField();
						if(option && option.data){
							if(option.id === Label.LABEL_KEY && currentField instanceof EmptyField){
								currentField.spec = 'label';
							}else{
								currentField.spec = null;
								if(nodeType === 'field'){
									currentField.source.dtmplFieldId = option.id;
								}else if(nodeType === 'array'){
									currentField.source.dtmplCompositeId = option.id;
								}
							}
							if(!fromTrigger && currentField instanceof EmptyField && !currentField.renamedFlag){
								//如果当前字段还没有修改过字段名，那可以根据取为选择的字段名
								context.getDom('fieldName').val(option.text).trigger('change');
								return;
							}
							changeSaveTempDisabled();
						}
					}
				},
				changeFieldName	: function(){
					var currentField = getCurrentField();
					if(currentField){
						var newFieldName = $(this).val();
						switch(validateFieldName(newFieldName, currentField)){
							case 'isempty':
								Form.toggleError(this, '字段名不能为空');
								break;
							case 'isrepeat':
								Form.toggleError(this, '字段名不能重复');
								break;
							default:
								Form.toggleError(this);
								var currentNode = context.getStatus('currentNode');
								//修改节点的原始数据对象，对其父对象进行操作，移动name
								currentNode.field.setName(newFieldName);
								//根据field构建新的节点对象
								var newNode = currentNode.field.getTreeNode();
								//根据新的节点对象覆盖原来的节点并渲染选中
								context.getDom('tree-view')
										.treeview('updateNode', [currentNode, newNode])
										.treeview('selectNode', [newNode])
										;
								if(currentNode.state.expanded){
									context.getDom('tree-view').treeview('expandNode', [newNode,  { levels: 2, silent: true }])
								}
								console.log(context.getStatus('sourceComposite').source);
								changeSaveTempDisabled();
								context.setStatus('errorEditorForm', false);
								return;
						}
						context.setStatus('errorEditorForm', true);
					}
				},
				changeDesc	: function(){
					var currentField = getCurrentField();
					if(currentField){
						currentField.source.desc = $(this).val();
					}
				},
				//在当前composite节点下添加子节点
				addChildNode: function(){
					var parentNode = context.getStatus('currentNode');
					var $treeView = context.getDom('tree-view'); 
					var parentComposite = parentNode.field;
					if(parentComposite instanceof Composite){
						//创建一个临时节点
						var emptyField = new EmptyField(parentComposite.newName(), {}, parentComposite);
						var tempNode = emptyField.getTreeNode();
						$treeView.treeview('addNode', [ tempNode, parentNode, null, { silent: true }]);
						$treeView.treeview('selectNode', [tempNode]);;
						
						/*context
							.setStatus({
								currentNode	: null,
								tempNode	: tempNode
							});*/
					}
				},
				addSiblingNode	: function(){
					var currentNode = context.getStatus('currentNode');
					if(currentNode){
						var parentComposite = currentNode.field.parentComposite;
						//创建一个临时节点
						var $treeView = context.getDom('tree-view'); 
						var emptyField = new EmptyField(parentComposite.newName(), {}, parentComposite);
						var tempNode = emptyField.getTreeNode();
						$treeView.treeview('addNodeAfter', [ tempNode, currentNode, null, { silent: true }]);
						$treeView.treeview('selectNode', [tempNode]);;
					}
				},
				//移除当前节点
				removeNode	: function(){
					var currentNode = context.getStatus('currentNode');
					if(currentNode){
						var field = currentNode.field;
						if(field){
							console.log(currentNode);
							var msg = '确认删除当前节点？';
							if(field instanceof Composite){
								msg += '注意：删除后同时删除其子节点。';
							}
							Dialog.confirm(msg).done(function(){
								field.remove();
								context.getDom('tree-view')
											.treeview('removeNode', [currentNode])
											.trigger('nodeUnselected');
								Dialog.notice('删除成功', 'success');
							});
							
						}
					}
				},
				saveTemp	
				
			}
			return events;
		}
		
		return {
			setDetailFieldSource	: function(fieldGroups){
				var fieldOptions = [];
				var arrayCompositeOptions = [];
				var arrayFieldsMap = {};
				for(var i in fieldGroups){
					var fieldGroup = fieldGroups[i];
					if(fieldGroup.composite && fieldGroup.composite.isArray === 1){
						//数组字段
						arrayCompositeOptions.push({id:fieldGroup.id, text:fieldGroup.title, data:fieldGroup});
						var group = {text: fieldGroup.title, children: []};
						for(var j in fieldGroup.fields){
							var field = fieldGroup.fields[j];
							group.children.push({id:field.id, text: field.title, data:field});
						}
						/*if(fieldGroup.composite.compositeType === 'relation'){
							//判断是关系字段组的时候，添加一个关系名称的字段
							group.children.push({id: Label.LABEL_KEY, text: '(特殊)关系名称', data:{}});
						}*/
						arrayFieldsMap[fieldGroup.id] = {group, compositeType: fieldGroup.composite.compositeType};
					}else{
						//普通字段
						var group = {text: fieldGroup.title, children: []};
						fieldOptions.push(group);
						for(var j in fieldGroup.fields){
							var field = fieldGroup.fields[j];
							group.children.push({id:field.id, text: field.title, data:field});
						}
					}
					
				}
				context.setStatus({fieldGroups, fieldOptions, arrayCompositeOptions, arrayFieldsMap});
			},
			render	: function(_param){
				context.setStatus({sourceComposite	: new Composite('', _param.source)});
			},
			permitLeave	: function(){
				var defer = $.Deferred();
				var currentField = getCurrentField();
				if(currentField instanceof EmptyField){
					if(currentField.isReadyToEvolve()){
						Dialog.confirm('是否保存当前节点？').done(function(){
							saveTemp();
							defer.resolve();
						});
					}else{
						Dialog.notice('请填写完整当前节点的信息', 'error');
					}
				}else{
					defer.resolve();
				}
				return defer.promise();
			},
			/**
			 * 从详情模板生成默认的元数据对象
			 */
			buildSource	: function(){
				function getFieldName(parent, dtmplField){
					var fieldName = dtmplField.title;
					for(i = 1; parent[fieldName]; fieldName = dtmplField.title + '_' + i++);
					return fieldName;
				}
				function putProperty(parent, dtmplField){
					var fieldName = getFieldName(parent, dtmplField);
					parent[fieldName] = {dtmplFieldId:dtmplField.id, desc:dtmplField.title};
				}
				function putComposite(parent, dtmplFieldGroup){
					var fieldName = getFieldName(parent, dtmplFieldGroup);
					var compositeSource = {type: 'normal', desc: dtmplFieldGroup.title, fields:{}};
					if(dtmplFieldGroup.isArray == 1){
						compositeSource.dtmplCompositeId = dtmplFieldGroup.id;
						compositeSource.type = 'array';
						if(dtmplFieldGroup.composite.compositeType === 'relation' ){
							putProperty(compositeSource.fields, {id:Label.LABEL_KEY,title:'关系名称',desc:'关系名称'});
						}
					}
					for(var i in dtmplFieldGroup.fields){
						putProperty(compositeSource.fields, dtmplFieldGroup.fields[i]);
					}
					
					parent[fieldName] = compositeSource;
				}
				
				var
					fieldGroups = context.getStatus('fieldGroups');
				var source = {fields: {}};
				for(var i in fieldGroups){
					putComposite(source.fields, fieldGroups[i]);
				}
				return source;
			}
		}
	}
	
});