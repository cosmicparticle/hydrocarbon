/**
 * 
 */
function EntityTreeTemplate(_param){
		Utils.assert($.fn.treeview, '没有加载Bootstrap Treeview');
		var defParam = {
			container	: null,
			treeData	: null
		};
		var param = $.extend({}, defParam, _param);
		
		this.render = function(treeData){
			if(treeData){
				param.treeData = treeData;
				return this.render();
			}
			this.getContainer().treeview({
				showCheckbox: true,
				data		: param.treeData
			});
		}
		
		this.getContainer = function(){
			return $(param.container);
		}
		
	}
var treeData = [{
			text				: '1',
			selectable			: false,
			hierarchicalCheck	: true,
			nodes	: [
				{
					text	: '1-1',
					selectable	: false,
				},
				{
					text	: '1-2',
					selectable	: false,
				}
			]
		},
		{
			text	: '2',
			selectable	: false,
			nodes	: [
				{
					text	: '2-1',
					selectable	: false,
				},
				{
					text	: '2-2',
					selectable	: false,
				}
			]
		}];
		
		var ttmpl = new EntityTreeTemplate({
			container	: $('#entity-tree-tmpl', param.$page),
			treeData	: treeData
		});
		
		//ttmpl.render();
		
		
		$('.cpf-tree li>a>label', $page).click(function(){
			$(this).closest('a').toggleClass('node-checked');
		});
		$('.cpf-tree li>a>i', $page).click(function(){
			$(this).closest('li').toggleClass('node-expanded');
		});