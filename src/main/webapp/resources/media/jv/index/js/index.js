define(function(require, exports, module){
	exports.init = function(_param){
		var Ajax = require('ajax');
		var $CPF = require('$CPF');
		var Utils = require('utils');
		var defParam = {
			$page	: null,
			blockId	: null,
			menuId	: null
		};
		var param = $.extend({}, defParam, _param);
		var $page = param.$page;
		//调用api获得用户信息
		$CPF.showLoading();
		var anotherOver = false;
		function closeLoading(){
			if(anotherOver){
				$CPF.initPage($page);
				$CPF.closeLoading();
			}else{
				anotherOver = true;
			}
		}
		Ajax.ajax('api2/meta/user/current_user', function(data){
			if(data.user){
				console.log('用户信息');
				console.log(data);
				var $accountArea = $('#account-area', $page);
				$('.account-username', $accountArea).text(data.user.nickname);
				closeLoading();
			}
		});
		
		//调用api获得菜单信息
		
		/*Ajax.ajax('api2/meta/menu/get_menu', function(data){
			//获得菜单项模板显示
			if(data.menus){
				require('tmpl').load('media/jv/index/tmpl/menu_item.tmpl').done(function($menuItemTmpl){
					var $menu = $menuItemTmpl.tmpl(data);
					$('#sidebar>ul').append($menu);
					closeLoading();
				})
			}
		});*/
		
		var context = Utils.createContext({
			blocks		: null,
			sysConfig	: {}
		});
		
		context
			.bind('blocks', renderBlocks)
			.bind('tmplMap', renderBlocks)
			;
		
		
		
		function renderBlocks(){
			var blocks = context.getStatus('blocks'),
				tmplMap = context.getStatus('tmplMap'),
				currentBlockId = context.getStatus('currentBlockId');
			if(blocks && tmplMap){
				var currentBlock = null;
				$.each(blocks, function(){
					if(this.id == currentBlockId){
						currentBlock = this;
						return false;
					}
				});
				tmplMap['blocks'].replaceFor($('#blocks-area-nav>style').eq(0), context.properties);
				tmplMap['menus'].replaceFor($('#sidebar>ul>style').eq(0), {currentBlock});
				closeLoading();
			}
		}
		
		require('tmpl').load('media/jv/index/tmpl/index.tmpl').done(function(tmplMap){
			context.setStatus('tmplMap', tmplMap);
		});
		
		Ajax.ajax('api2/meta/menu/get_blocks', Utils.setProperties(param, ['blockId', 'menuId']), function(data){
			if(data.status === 'suc'){
				context.setStatus(data, ['sysConfig', 'currentBlockId', 'blocks']);
				if(param.menuId){
					var $link = $('#sidebar a[l2-menu-id="' + param.menuId +  '"]');
					$link.closest('[l1-menu-id]').find('.menu-dropdown').trigger('click');
					$link.trigger('click');
				}
			}
		});
		
		
		$('#logout').click(function(){
			require('dialog').confirm('确认退出登录？').done(function(){
				localStorage.removeItem(Ajax.AJAX_LOCAL_STORAGE_TOKEN_KEY);
				location.href = 'jv/main/login';
			});
		});
		
	}
});