define(function(require, exports, module){
	var $CPF = require('$CPF');
	var utils = require('utils');
	$CPF.addDefaultParam({
		//构建树的class
		treeClass	: 'cpf-tree',
		treeDataKey	: 'CPF-TREE-DATA',
		treeNodeDataKey	: 'CPF-TREE-NODE-DATA',
		treeDefaultNodeText	: '节点',
		treeNodeFolderOpendIconClass	: 'fa-folder-open',
		treeNodeFolderClosedIconClass	: 'fa-folder',
		treeNodeItemIconClass	: 'fa-inbox',
		//树节点id的前缀
		treeNodeIdPrefix	: 'cpf-tree-node-',
		//树节点事件名的前缀
		treeEventNamePrefix	: 'treeEvent-',
		//树节点都有的class
		treeNodeClass		: 'cpf-tree-node',
		//节点的id生成函数
		treeNodeIdGenerator	: function(node){
			return utils.uuid(5, 62);
		}
	});
	
	var
		CLASS_FOLDER = 'tree-folder',
		CLASS_ITEM = 'tree-item',
		CLASS_FOLDER_HEADER = 'tree-folder-header',
		CLASS_FOLDER_ICON = 'tree-folder-icon',
		CLASS_FOLDER_CONTENT = 'tree-folder-content',
		CLASS_FOLDER_LOADER = 'tree-loader',
		CLASS_FOLDER_NAME = 'tree-folder-name',
		CLASS_NODE_TEXT = 'tree-node-name',
		CLASS_PREFIX_NODE_ACTION = 'tree-node-action-',
		CLASS_TREE_ACTIONS = 'tree-actions'
		;
	//根节点的标识，用于工厂方法创建根节点
	var ROOT_IDENTIFICATION = {};
	
	
	$.fn.extend({
		/**
		 * 获得当前节点所在的树节点的TreeNode对象
		 */
		getLocateTreeNode	: function(){
			
		}
	});
	
	
	/**
	 * 树节点类
	 */
	function TreeNode(_param){
		//创建普通节点
		var defaultParam = {
			id				: undefined,
			text			: $CPF.getParam('treeDefaultNodeText'),
			parent			: null,
			dealNode		: $.noop,
			data			: {}
		};
		var param = {};
		var id = utils.uuid(5, 62),
			$dom = null,
			parent = null,
			domObj = {},
			children = [],
			_this = this,
			isParent = false,
			config = null
			;
		if(_param == ROOT_IDENTIFICATION){
			//创建根节点，仅能通过Tree.createRoot()方法构造
			isParent = true;
			$dom = $('<div>').addClass('tree');
			domObj = {
				content			: $dom,
				insertNode		: function(treeNode, index){
					if(typeof index === 'number'){
						if(index < 0){
							$content.prepend(treeNode.getDom());
						}else{
							var $children = $dom.children('.' + $CPF.getParam('treeNodeClass'));
							if(index >= $children.length){
								$content.append(treeNode.getDom());
							}else{
								$children.eq(index).before(treeNode.getDom());
							}
						}
					}else{
						$dom.append(treeNode.getDom());
					}
				},
			};
		}else{
			$.extend(param, defaultParam, _param);
			id = param.id || id;
			$dom = buildTreeNodeDom(id);
		}
		/**
		 * 获得当前节点的id
		 */
		this.getId = function(){
			return id;
		};
		/**
		 * 修改节点的id。根节点不能修改id
		 */
		this.setId = function(_id){
			if(!this.isRoot() && typeof _id === 'string' && _id !== ''){
				id = _id;
				this.getDom().attr('id', $CPF.getParam('treeNodeIdPrefix') + _id);
			}
		};
		/**
		 * 获得当前节点的显示文本
		 */
		this.getText = function(){
			return param.text;
		};
		/**
		 * 设置当前节点的显示文本
		 * @param nodeText 节点的显示文本
		 */
		this.setText = function(nodeText){
			param.text = nodeText;
			if(domObj.textDom){
				domObj.textDom.text(nodeText);
			}
			return this;
		};
		/**
		 * 获得节点的dom对象
		 */
		this.getDom = function(){
			return $dom;
		}
		/**
		 * 获得父节点对象
		 * @return {TreeNode} 根节点或者为游离节点时，返回null 
		 */
		this.getParent = function(){
			return parent;
		};
		/**
		 * 设置父节点。这个操作没有操作父节点的children属性
		 * @param parentTreeNode {TreeNode} 父节点
		 */
		this.setParent = function(parentTreeNode){
			parent = parentTreeNode;
		}
		/**
		 * 获得所有子节点
		 * @return {Array<TreeNode>} 子节点数组
		 */
		this.getChildren = function(){
			return children;
		};
		/**
		 * 移除所有子节点
		 */
		this.removeAllChildren = function(){
			children = [];
			if(domObj && domObj.content){
				domObj.content.empty();
			}
		};
		/**
		 * 获得当前树节点所在的树对象
		 * 如果当前节点对象是游离节点，那么返回null
		 * @return {Tree} 所在树对象
		 */
		this.getTree = function(){
			var root = this.getRoot();
			if(root){
				return root.getTree();
			}
		};
		/**
		 * 获得当前节点的根节点对象
		 * 如果当前对象是游离节点，获得所在节点堆是游离的，那么返回null
		 * @return {TreeNode} 根节点对象
		 */
		this.getRoot = function(){
			var cNode = this;
			do{
				if(cNode.isRoot()){
					return cNode;
				}
				cNode = cNode.getParent();
			}while(cNode != null);
			return null;
		};
		/**
		 * 当前节点是否是根节点
		 * @return {Boolean}
		 */
		this.isRoot = function(){
			return _param == ROOT_IDENTIFICATION;
		};
		/**
		 * 获得当前节点相对于根节点的级数
		 * 如果当前节点是游离节点，或者处于游离的节点堆时（即不是在ROOT之下的节点），返回NaN
		 * 如果当前节点是ROOT时，返回0
		 * @return {Integer} 
		 */
		this.getLevel = function(){
			var cNode = this,
				level = 0
				;
			do{
				if(cNode.isRoot()){
					return level;
				}
				cNode = cNode.getParent();
				level ++;
			}while(cNode != null);
			return NaN;
		};
		/**
		 * 获得构造时传入的data数据
		 * @param key {String} 数据的键
		 * @return any 数据的值
		 */
		this.data = function(key){
			return param.data[key];
		};
		/**
		 * 先序遍历所有子节点
		 * @param func {Function(TreeNode)}遍历子节点时的函数，有一个参数node
		 */
		this.iterateNode = function(func){
			if(typeof func === 'function'){
				$.each(this.getChildren(), function(){
					utils.iterateTree(this, function(node){
						return node.getChildren();
					}, function(node){
						return func.apply(_this, [node]);
					});
				});
			}
			return this;
		};
		/**
		 * 将当前节点在有节点和无子节点之间转换
		 * 如果有子节点的情况下设置为无子节点，那么会去除所有子节点
		 */
		this.setAsParent = function(_isParent){
			if(typeof _isParent === 'boolean'){
				var text = this.getText();
				if(_isParent){
					//改为父节点，直接修改dom
					//构造节点内容
					domObj = buildParentNodeDomObj(text);
					$dom
						.empty()
						.removeClass('tree-item')
						.addClass('tree-folder')
						.append(domObj.header)
						.append(domObj.content)
						.append(domObj.loader)
						;
				}else{
					//改为叶子节点，修改dom并去除所有子节点
					//构造节点内容
					domObj = buildLeafNodeDomObj(text);
					$dom.empty()
						.removeClass('tree-folder')
						.addClass('tree-item')
						.append(domObj.itemName)
						;
				}
				children = [];
				isParent = _isParent;
			}
		};
		this.toggleExpand = function(_toExpand){
			if(!this.isRoot() && domObj.content){
				var toExpand = !domObj.content.is(':visible');
				if(_toExpand !== undefined){
					toExpand = _toExpand;
				}
				domObj.content.toggle(toExpand);
				utils.switchClass(domObj.folderIcon, $CPF.getParam('treeNodeFolderOpendIconClass'), $CPF.getParam('treeNodeFolderClosedIconClass'), toExpand);
			}
		}
		/**
		 * 展开当前节点的所有子节点
		 * @param expandParent {Boolean} 是否展开父节点，仅传入false时不展开
		 */
		this.expand = function(expandParent){
			this.toggleExpand(true);
			return this;
		};
		/**
		 * 折叠当前节点的所有子节点（仅在当前节点为父节点时有效）
		 */
		this.fold = function(){
			this.toggleExpand(false);
			return this;
		}
		/**
		 * 将节点数组作为子节点加载进来
		 * @param treeNodes {Array<TreeNode>} 加载的子节点数组。原来的子节点数组全部删除
		 */
		this.loadChildren = function(treeNodes){
			children = [];
			$.each(treeNodes, function(){
				this.insertChild(this);
			});
			return this;
		},
		/**
		 * 插入一个子节点
		 * @param treeNode {TreeNode} 要插入的子节点对象
		 * @param index 插入后的索引。
		 * 		如果这个索引已经有节点存在，则将原来的节点往后推。
		 * 		如果索引大于当前子节点的个数或者不传入index，那么插入到最后一个
		 */
		this.insertChild = function(treeNode, index){
			if(typeof domObj.insertNode === 'function'){
				domObj.insertNode(treeNode, index);
				treeNode.setParent(this);
				children.splice(index, 0, treeNode);
			}
			return this;
		},
		/**
		 * 异步加载子节点
		 * @param url {String} 要加载子节点的地址。通过ajax请求返回json数据
		 * @param callbacks {{Function}} 几个回调函数:
		 * 				afterResponse(responseJson);异步请求成功返回之后调用，参数为解析成功的json对象
		 * 				afterAppend(TreeNode); 子节点加载到页面之后调用，参数为当前节点
		 * 				whenError(jqXHR);请求返回错误时调用
		 */
		this.refreshFromUrl = function(url, callbacks){
			
			
			return this;
		};
		/**
		 * 根据数据刷新节点
		 * @param nData {Object} 节点数据，如果不传入，则用最新加载的参数来刷新
		 */
		this.refresh = function(nData, rConfig){
			nData = nData || param;
			rConfig = rConfig || config;
			//修改当前节点的信息
			if(nData.id){
				this.setId(nData.id);
			}
			if(nData.text){
				this.setText(nData.text);
			}
			//通过配置对象来处理节点
			if(rConfig && !this.isRoot()){
				if(rConfig.isParent){
					this.setAsParent(rConfig.isParent(this));
				}
				var actions = rConfig.getActions(this);
				if(actions && domObj.appendActions){
					//将action放到dom中
					domObj.appendActions(actions);
				}
			}
			//加载子节点的信息
			if($.isArray(nData.nodes)){
				//清除所有子节点
				this.removeAllChildren();
				//遍历数据节点，插入新的子节点
				$.each(nData.nodes, function(){
					var childNode = new TreeNode(this);
					//必须先把绑定节点的父子关系
					_this.insertChild(childNode);
					childNode.refresh(undefined, rConfig);
				});
			}
			config = rConfig;
			return this;
		};
		var actionMap = {};
		/**
		 * 绑定树节点的动作回调
		 * @param actionName {String}动作的名称
		 * @param callback {Function(TreeNode)}动作回调
		 */
		this.bindAction = function(actionName, callback){
			actionMap[actionName] = callback;
			/*$dom.on($CPF.getParam('treeEventNamePrefix') + actionName, function(e){
				e.stopPropagation();
				return callback.apply(this, arguments);
			});*/
			return this;
		},
		/**
		 * 触发树节点的动作
		 * @param actionName {String}动作的名称
		 * @param parameters {Array}触发回调函数时会带入的参数
		 */
		this.triggerAction = function(actionName, e, parameters){
			var args = $.merge([e, _this], parameters);
			var func = actionMap[actionName];
			if(typeof func === 'function'){
				func.apply(e.target, args);
			}
			//$dom.trigger($CPF.getParam('treeEventNamePrefix') + actionName, args);
			return this;
		}
		
		/**
		 * 构造树节点的基础dom对象
		 */
		function buildTreeNodeDom(id){
			var $node = $('<div>').addClass($CPF.getParam('treeNodeClass'));
			if(id){
				$node.attr('id', $CPF.getParam('treeNodeIdPrefix') + id);
			}
			return $node;
		}
		/**
		 * 构造
		 */
		function buildParentNodeDomObj(nodeText){
			var $header = $('<div>').addClass(CLASS_FOLDER_HEADER),
				$content = $('<div>').addClass(CLASS_FOLDER_CONTENT).hide(),
				$loader = $('<div>').addClass(CLASS_FOLDER_LOADER)
				;
			
			var $folderName = $('<div>').addClass(CLASS_FOLDER_NAME);
			$folderName.append('<span class="' + CLASS_NODE_TEXT + '">' + nodeText + '</span>');
			var $folderIcon = $('<i class="fa ' + CLASS_FOLDER_ICON + ' ' + $CPF.getParam('treeNodeFolderClosedIconClass') + '">');
			$header
					.append($folderIcon)
					.append($folderName)
					;
			
			$loader
				.hide()
				.append('<div class="tree-loading"><i class="fa fa-rotate-right fa-spin"></i></div>')
			;
			
			/**
			 * 父节点点击事件
			 */
			$header.click(function(e){
				if($(e.target).closest('.' + CLASS_TREE_ACTIONS).length > 0){
					return;
				}
				_this.toggleExpand();
				return false;
			});
			
			return {
				header			: $header,
				content			: $content,
				loader			: $loader,
				textDom			: $('.' + CLASS_NODE_TEXT, $folderName),
				folderIcon		: $folderIcon,
				insertNode		: function(treeNode, index){
					if(typeof index === 'number'){
						if(index < 0){
							$content.prepend(treeNode.getDom());
						}else{
							var $children = $content.children('.' + $CPF.getParam('treeNodeClass'));
							if(index >= $children.length){
								$content.append(treeNode.getDom());
							}else{
								$children.eq(index).before(treeNode.getDom());
							}
						}
					}else{
						$content.append(treeNode.getDom());
					}
					
					$content.append(treeNode.getDom());
				},
				appendActions	: function(actions){
					var $actions = buildActionsDom.call(_this, actions);
					if($actions){
						$folderName.append($actions);
					}
					return $actions;
				}
			};
		}
		
		function buildLeafNodeDomObj(nodeText){
			var $itemName = $('<div class="tree-item-name">');
			$itemName
				.append('<i class="fa ' + $CPF.getParam('treeNodeItemIconClass') + '"></i>')
				.append('<span class="' + CLASS_NODE_TEXT + '">' + nodeText + '</span>');
			
			return {
				itemName		: $itemName,
				textDom			: $('.' + CLASS_NODE_TEXT, $itemName),
				appendActions	: function(actions){
					var $actions = buildActionsDom.call(_this, actions);
					if($actions){
						$itemName.append($actions);
					}
					return $actions;
				}
			};
			
		}
		
		/**
		 * 构造actions的jQuery对象
		 * @param actions 对象数组，每个对象至少包括两个字段，分别是name和styleClass
		 * 					其中name可以用来标识action，styleClass指定一个或者多个action的样式
		 */
		function buildActionsDom(actions){
			if(actions && actions.length > 0){
				var $actions = $('<div>').addClass(CLASS_TREE_ACTIONS);
				for(var i in actions){
					var action = actions[i];
					if(action){
						var actionName = utils.applyValue(action.name, [_this]),
							actionClass = utils.applyValue(action.styleClass, [_this]) || '',
							$action = $('<i class="fa">').addClass(actionClass);
						if(actionName){
							$action.addClass(CLASS_PREFIX_NODE_ACTION + actionName);
							$action.attr('title', utils.applyValue(action.title, [_this])).data('actionName', actionName);
							_this.bindAction(actionName, action.callback);
							$actions.append($action);
							$action.click(function(e){
								var $this = $(this);
								_this.triggerAction($this.data('actionName'), e, [$this, $actions]);
							});
						}
					}
				}
				return $actions;
			}
		}
		
	}
	
	/**
	 * 树容器，包含一个根节点对象，根节点对象固定不可变，也没有对应的dom对象
	 * @param 该树的全局参数
	 */
	function Tree(_param){
		var defaultParam = {
			//树结构的配置对象
			config	: new TreeConfig(),
			//节点数据数组
			nodes	: []
		};
		
		var param = $.extend({}, defaultParam, _param);
		//构造树的根节点
		var root = new TreeNode(ROOT_IDENTIFICATION);
		
		/**
		 * 
		 */
		this.getRoot = function(){
			return root;
		};
		/**
		 * 
		 */
		this.getConfig = function(){
			return param.config;
		};
		/**
		 * 
		 */
		this.refresh = function(nData, rConfig){
			root.refresh(nData || param, rConfig || param.config);
			return this;
		};
		/**
		 * 
		 */
		this.getDom = function(){
			return root.getDom();
		}
	}
	/**
	 * 树结构的配置类
	 */
	function TreeConfig(_param){
		var defaultParam = {
			//树结构的最多层次
			maxLevel: 4,
			//树结构的动作，可以是一个数组，也可以是一个返回数组的函数
			actions	: function(treeNode){
				return [
			        {
			        	name		: '',
			        	styleClass	: '',
			        	title		: '',
			        	callback	: function(){}
			        }
				 ];
			},
			icon	: function(treeNode){
				return 
			}
		};
		var param = $.extend({}, defaultParam, _param);
		
		/**
		 * 根据树节点对象获得对应的动作数组
		 * @param treeNode {TreeNode} 处理的动作对象
		 */
		this.getActions = function(treeNode){
			return utils.applyValue(param.actions, [treeNode], function(value){
				return $.isArray(value);
			});
		};
		/**
		 * 根据配置判断节点是否是父节点
		 */
		this.isParent = function(treeNode){
			var level = treeNode.getLevel();
			return level < param.maxLevel;
		}
		
	}
	
	
	$.extend(Tree, {
		Config	: TreeConfig
	});
	
	module.exports = Tree;
});