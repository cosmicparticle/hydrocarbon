define(function(require, exports, module){
	exports.initPage = function(_param){
		var defaultParam = {
			$page	: null
		};
		var Utils = require('utils');
		var Ajax = require('ajax');
		var Dialog = require('dialog');
		
		var param = $.extend({}, defaultParam, _param);
		var $page = param.$page;
		
		var context = Utils.createContext({
			tmplMap			: null,
			sysconfig		: null,
			modules			: null,
			customPages		: null,
			blocks			: null,
			tmplMap			: null,
			selectedBlock	: null,
			mode			: 'module',
			hasChanged		: false,
			isCoping		: false
		});
		
		context
			.bind('sysconfig', renderPage)
			.bind('modules', renderModules)
			.bind('customPages', renderCustomPages)
			.bind('mode', switchMode)
			.bind('blocks', renderBlocks)
			.bind('tmplMap', [renderModules, renderBlocks, renderCustomPages, switchMode])
			.bind('selectedBlock', renderSelectedBlock)
			.bind('selectedBlock', renderL1Menus)
			.bind('searchKeyword', renderFilteredSourceItem)
		;
		
		require('event').bindScopeEvent($page, {addBlock, addL1Menu, filterSourceItems, save, refreshPage, bindSaveToggle});
		
		loadTmpl();
		loadSystemConfig();
		loadModules();
		loadCustomPages();
		loadMenuBlocks();
		
		
		function renderBlocks(){
			var tmplMap = context.getStatus('tmplMap'),
				blocks = context.getStatus('blocks');
			if(tmplMap && blocks){
				tmplMap['blocks'].replaceIn($page, context.properties, {
					selectBlock	: function(block){
						context.setStatus('selectedBlock', block);
					},
					bindBlock	: function(block){
						 block.dom = this;
						 $(this).data('block', block);
					},
					removeBlock	: function(block){
						Dialog.confirm('确定删除版块“' + block.title + '”？').done(function(){
							var blocks = context.getStatus('blocks');
							var index = blocks.indexOf(block);
							blocks.splice(index, 1);
							context.setStatus('blocks');
							if(context.getStatus('selectedBlock') == block){
								var newSelectedBlock = null;
								if(index < blocks.length){
									newSelectedBlock = blocks[index];
								}else if(blocks.length > 0){
									newSelectedBlock = blocks[0];
								}
								context.setStatus('selectedBlock', newSelectedBlock);
							}
							context.setStatus('hasChanged', true);
						});
						return false;
					},
					editTitle, selectAuthority
				});
				$('#block-container', $page).sortable({
					update	: function(e, ui){
						var blocks = context.getStatus('blocks');
						var $blocks = $(ui.item).parent().children('li');
						$blocks.each(function(i){
							var block = $(this).data('block');
							block.order = i;
						});
						blocks.sort(function(a, b){return a.order - b.order});
						context.setStatus('hasChanged', true);
					}
				});
				$('#block-container>.block-wrapper', $page).droppable({
					accept		: '.l1-menu-item>div.dd-handle>.drag-handle',
					hoverClass 	: 'drop-hover',
					drop		: function(e, ui){
						var block = $(this).data('block');
						var $l1Menu = $(ui.draggable).closest('.l1-menu-item');
						var l1Menu = $l1Menu.data('l1Menu');
						var copyL1Menu = {}
						copyL1Menu.title = l1Menu.title;
						copyL1Menu.authorities = l1Menu.authorities;
						copyL1Menu.block = block;
						copyL1Menu.l2Menus = [];
						$.each(l1Menu.l2Menus, function(){
							var copyL2Menu = $.extend({}, this);
							copyL2Menu.id = '';
							copyL2Menu.l1Menu = copyL1Menu;
							copyL2Menu.$customPageTitle = null;
							copyL2Menu.sideMenuLevel1Id = '';
							copyL1Menu.l2Menus.push(copyL2Menu);
						});
						var isCoping = context.getStatus('isCoping');
						Dialog.confirm(isCoping? '确定复制版块？': '确定移动版块？').done(function(){
							block.l1Menus.push(copyL1Menu);
							if(!isCoping){
								Utils.removeElement(l1Menu.block.l1Menus, l1Menu);
							}
							context.setStatus('blocks');
							context.setStatus('selectedBlock');
							context.setStatus('hasChanged', true);
						});
						
					}
				});
				$('.block-container li>div', $page).disableSelection();
				if(blocks && blocks.length > 0){
					var selectedBlock = context.getStatus('selectedBlock');
					if(!selectedBlock){
						context.setStatus('selectedBlock', blocks[0]);
					}
				}
			}
		}
		
		function renderSelectedBlock(){
			var selectedBlock = context.getStatus('selectedBlock');
			var blocks = context.getStatus('blocks');
			if(!selectedBlock){
				if(blocks.length > 0){
					context.setStatus('selectedBlock', blocks[0]);
					return false;
				}
			}else{
				if(blocks.indexOf(selectedBlock) >= 0){
					var dom = selectedBlock.dom;
					var $li = $(dom).closest('li');
					$li.siblings('li').removeClass('selected');
					$li.addClass('selected');
				}else{
					context.setStatus('selectedBlock', null);
					return false;
				}
			}
		}
		
		function renderL1Menus(){
			var selectedBlock = context.getStatus('selectedBlock');
			var tmplMap = context.getStatus('tmplMap');
			if(tmplMap){
				tmplMap['menus'].replaceIn($page, context.properties, {
					bindL1Menu	: function(l1Menu){
						$(this).data('l1Menu', l1Menu);
					},
					bindL2Menu, removeL1Menu, removeL2Menu, editTitle, selectAuthority,
					listenToCustomChange
				});
				if(selectedBlock){
					bindMenusDrag();
				}
			}
		}
		
		function renderModules(){
			var tmplMap = context.getStatus('tmplMap'),
				modules = context.getStatus('modules');
			if(tmplMap && modules){
				var $modules = tmplMap['modules'].replaceIn($page, context.properties, {
					bindViewData	: function(viewType, viewData, module){
						$(this).data('view', {viewType, viewData, module});
					}
				});
				//绑定拖动事件
				$('#modules-container .md-group-title', $page).draggable({
					connectToSortable: '#' + $page.attr('id') + ' .menu-container #level1-list>.dd-item>.dd-list',
					helper: 'clone',
					scroll: true
				});
				$('#modules-container li>div', $page).disableSelection();
			}
		}
		
		/**
		 * 渲染自定义页面列表
		 */
		function renderCustomPages(){
			var customPages = context.getStatus('customPages');
			var tmplMap = context.getStatus('tmplMap');
			if(customPages && tmplMap){
				tmplMap['customPages'].replaceIn($page, context.properties, {
					bindViewData	: function(viewType, viewData){
						$(this).data('view', {viewType, viewData});
						if(!viewData.relatedL2Menus){
							viewData.relatedL2Menus = [];
						}
					},
					editCustomPage	: function(customPage){
						dialogEditCustomPage(customPage).done(function(){
							context.setStatus('customPages');
						});
					},
					removeCustomPage: function(customPage){
						var msg = '';
						var relatedL2MenusCount = customPage.relatedL2Menus && customPage.relatedL2Menus.length;
						if(relatedL2MenusCount > 0){
							msg += '（注意：该自定义页面已经被引用在' + relatedL2MenusCount + '个菜单项中，页面被移除后，菜单项也会被移除）';
						}
						Dialog.confirm('确认移除自定义页面“' + customPage.title + '”？' + msg).done(function(){
							if(customPage.id){
								Ajax.ajax('admin/config/menu/custom_page/remove/' + customPage.id).done(function(res){
									if(res.status === 'suc'){
										var customPages = context.getStatus('customPages');
										customPages.splice(customPages.indexOf(customPage), 1);
										context.setStatus('customPages');
										if(relatedL2MenusCount > 0){
											$.each(customPage.relatedL2Menus, function(){
												Utils.removeElement(this.l1Menu.l2Menus, this);
											});
											context.setStatus('selectedBlock');
										}
										Dialog.notice('删除成功', 'success')
									}else{
										Dialog.notice('删除失败', 'error');
									}
								});
							}
						});
					}
				});
				$('#custom-page-container .dd-handle', $page).draggable({
					connectToSortable: '#' + $page.attr('id') + ' .menu-container #level1-list>.dd-item>.dd-list',
					helper: 'clone',
					scroll: true
				});
				$('#custom-page-container li>div', $page).disableSelection();
			}
		}
		
		/**
		 * 渲染模式切换器
		 */
		function switchMode(){
			var tmplMap = context.getStatus('tmplMap');
			if(tmplMap){
				var mode = context.getStatus('mode');
				tmplMap['change-mode'].replaceIn($page, context.properties, {
					changeTo	: function(mode){
						context.setStatus('mode', mode);
					}
				});
				tmplMap['btn-add-custom-page'].replaceIn($page, context.properties, {
					addCustomPage	: function(){
						var customPages = context.getStatus('customPages');
						if(customPages){
							var customPage = {id: '', title: '', path: '', description: ''};
							dialogEditCustomPage(customPage).done(function(){
								customPages.push(customPage);
								context.setStatus('customPages');
							})
						}
						
					}
				});
				if(mode === 'module'){
					$('#custom-page-container', $page).hide();
					$('#modules-container', $page).show();
				}else if(mode === 'custom'){
					$('#modules-container', $page).hide();
					$('#custom-page-container', $page).show();
				}
				context.setStatus('searchKeyword');
			}
		}
		
		function renderPage(){
			
		}
		
		
		
		function addBlock(){
			var blocks = context.getStatus('blocks');
			var newBlock = {
				id			: '',
				title		: '新建版块',
				authorities	: '',
				l1Menus		: []
			};
			blocks.push(newBlock);
			context.setStatus('blocks');
			context.setStatus('selectedBlock', newBlock);
			context.setStatus('hasChanged', true);
		}
		function addL1Menu(){
			var selectedBlock = context.getStatus('selectedBlock');
			var tmplMap = context.getStatus('tmplMap');
			if(selectedBlock && tmplMap){
				var l1Menu = {
						id			: '',
						title		: '新建一级菜单',
						authorities	: '',
						l2Menus		: []
				}
				selectedBlock.l1Menus.push(l1Menu);
				context.setStatus('selectedBlock');
				context.setStatus('hasChanged', true);
			}
		}
		
		function dialogEditCustomPage(customPage){
			var defer = $.Deferred();
			var tmplMap = context.getStatus('tmplMap');
			if(customPage && tmplMap){
				var $dialog = tmplMap['customPageConfig'].tmpl({customPage});
				var $form = $dialog.filter('form');
				var customPageConfigDialog = Dialog.openDialog($dialog, '编辑自定义页面', undefined, {
					width		: 450,
					height		: 420,
					contentType	: 'dom',
					autoClose	: false,
					onSubmit	: function(data, closeDialog){
						var v = $form.bootstrapValidator('validate').data('bootstrapValidator');
						if(v.isValid()){
							var formData = {
								id			: customPage.id,
								title		: $('#custom-page-title', $form).val(),
								path		: $('#custom-page-path', $form).val(),
								description	: $('#custom-page-desc', $form).val()
							}
							
							Ajax.ajax('admin/config/menu//custom_page/save', formData).done(function(res){
								if(res.status === 'suc'){
									customPage.id = res.customPageId;
									var titleChanged = formData.title !== customPage.title;
									Utils.setProperties(formData, customPage, ['title', 'path', 'description']);
									closeDialog();
									defer.resolve(customPage);
									if(titleChanged && customPage.relatedL2Menus){
										$.each(customPage.relatedL2Menus, function(){
											$(this.$customPageTitle).text(formData.title);
										});
									}
								}
							});
						}else{
							console.log('验证失败');
						}
					}
				});
			}
			return defer.promise();
		}
		
		function bindMenusDrag(){
			var newItem;
			$('.menu-container .dd-list', $page)
				.sortable({
					cursor		: 'move',
					update	: function(e, ui){
						var $item = $(ui.item);
						if($item.is('li.l2-menu-item>div,li.l1-menu-item>div')){
							var items = null;
							var dataKey = 'l1Menu';
							if($item.is('.l1-menu-item')){
								//拖动的是级别1
								var selectedBlock = context.getStatus('selectedBlock');
								items = selectedBlock.l1Menus;
							}else{
								dataKey = 'l2Menu';
								var l1Menu = $item.closest('.l1-menu-item').data('l1Menu');
								items = l1Menu.l2Menus;
							}
							$item.parent().children('li').each(function(i){
								var item = $(this).data(dataKey); 
								item.order = i;
							});
							
							items.sort(function(a, b){return a.order - b.order});
						}
						context.setStatus('hasChanged', true);
					},
					beforeStop: function (event, ui) { 
					     newItem = ui.item;
					},
					receive	: function(e, ui){
						var $g = $(ui.sender);
						var view = $g.data('view');
						if(!view) {
							$newItem.remove();
							throw new Error('view没有数据'); 
						}
						
						var l2Menu = {
								id					: '',
								title				: view.viewData.title,
								authorities			: '',
								viewType			: view.viewType
							};
						
						if(view.viewType === 'custom'){
							l2Menu.customPageId = view.viewData.id;
							l2Menu.customPageTitle = view.viewData.title;
							l2Menu.customPage = view.viewData;
							//l2Menu.customPage.relatedL2Menus.push(l2Menu);
						}else{
							l2Menu.templateModuleTitle = view.module.title;
							if(view.viewType === 'normal'){
								l2Menu.templateGroupId = view.viewData.id;
								l2Menu.templateGroupTitle = view.viewData.title;
							}else if(view.viewType === 'stat'){
								l2Menu.statViewId = view.viewData.id;
								l2Menu.statViewTitle =  view.viewData.title;
							}
						}
						
						
						
						//将新添加的二级菜单数据放到一级菜单对象底下
						var $newItem = $(newItem);
						var index = $newItem.index();
						var l1Menu = $newItem.closest('.l1-menu-item').data('l1Menu');
						l1Menu.l2Menus.splice(index, 0, l2Menu);
						l2Menu.l1Menu = l1Menu;
						
						var tmplMap = context.getStatus('tmplMap');
						var $newL2Menu = tmplMap['l2menu'].tmpl({l2Menu:l2Menu, l1Menu:l1Menu}, {
							bindL2Menu, removeL2Menu, editTitle, selectAuthority,
							listenToCustomChange
						});
						
						$newItem.replaceWith($newL2Menu);
						context.setStatus('hasChanged', true);
						
						/*toggleSaveButton(false);
						toggleAddLevel1Button(false);
						$level2.find(':text')
								.on('keydown', enterTrigger)
								.on('enter blur', confirmTitleEdit)
								.select();*/
					}
				})
				.disableSelection();
			//绑定拖动事件
			$('#level1-list>.l1-menu-item>div.dd-handle>.drag-handle', $page).draggable({
				appendTo : '#' + $page.attr('id'),
				helper	: 'clone',
				scroll	: true,
				start	: function(e, ui){
					context.setStatus('isCoping', false);
					if(e.ctrlKey){
						$(ui.helper).addClass('coping-ele');
						context.setStatus('isCoping', true);
					}
				},
				stop	: function(){
					context.setStatus('isCoping', false);
				}
			});
			
		}
		
		function bindL2Menu(l2Menu){
			$(this).data('l2Menu', l2Menu);
		}
		
		function removeL1Menu(l1Menu, selectedBlock){
			var $that = $(this).closest('li.l1-menu-item');
			Dialog.confirm('确认移除一级菜单“' + l1Menu.title + '”？').done(function(){
				Utils.removeElement(selectedBlock.l1Menus, l1Menu);
				$that.remove();
				context.setStatus('hasChanged', true);
			});
		}
		
		function removeL2Menu(l2Menu, l1Menu){
			var $that = $(this).closest('li.l2-menu-item');
			Dialog.confirm('确认移除二级菜单“' + l2Menu.title + '”？').done(function(){
				l1Menu.l2Menus.splice(l1Menu.l2Menus.indexOf(l2Menu), 1);
				if(l2Menu.customPage){
					l2Menu.customPage.relatedL2Menus.splice(l2Menu.customPage.relatedL2Menus.indexOf(l2Menu), 1);
				}
				$that.remove();
				context.setStatus('hasChanged', true);
			});
			
		}
		
		function editTitle(menu){
			var $this = $(this);
			Utils.toEditContent($this).bind('confirmed', function(title){
				menu.title = title;
				context.setStatus('hasChanged', true);
			});
			return false;
		}
		
		function selectAuthority(menu){
			var $item = $(this);
			Dialog.openDialog('admin/config/sidemenu/authority_choose', '选择访问权限', undefined, {
				reqParam	: {
					auths	: menu.authorities
				},
				onSubmit	: function(data){
					var auths = Utils.join(data, ';', function(auth){return auth.code}), 
						descs = Utils.join(data, ';', function(auth){return auth.name});
					menu.authorities = auths;
					$item.attr('title', '权限：(' + descs + ')');
					$item.attr('data-auths', auths);
					context.setStatus('hasChanged', true);
					//toggleSaveButton(true);
				}
			});
			return false;
		}
		
		/**
		 * 监听自定义页面的修改，并同步数据到二级菜单中
		 */
		function listenToCustomChange(l2Menu){
			var $customPageTitle = $(this);
			l2Menu.$customPageTitle = this;
			if(!l2Menu.customPage && l2Menu.customPageId){
				context.selfish('customPages', function(customPages){
					$.each(customPages, function(){
						if(this.id == l2Menu.customPageId){
							l2Menu.customPage = this;
							console.log('============relatedL2Menus', this.relatedL2Menus);
							this.relatedL2Menus.push(l2Menu);
							return false;
						}
					});
				});
			}else if(l2Menu.customPage && l2Menu.customPage.relatedL2Menus.indexOf(l2Menu) < 0){
				l2Menu.customPage.relatedL2Menus.push(l2Menu);
			}
		}
		
		function filterSourceItems(){
			context.setStatus('searchKeyword', $(this).val().trim());
		}
		
		function renderFilteredSourceItem(){
			var keyword = context.getStatus('searchKeyword');
			var mode = context.getStatus('mode');
			var $modulesContainer = null;
			if(mode === 'module'){
				$modulesContainer = $('#modules-container', $page);
			}else if(mode === 'custom'){
				$modulesContainer = $('#custom-page-container', $page);
			}
			$('.searching-matched', $modulesContainer).removeClass('searching-matched');
			$('.searching-matched-part', $modulesContainer).removeClass('searching-matched-part');
			if(keyword){
				$modulesContainer.addClass('searching');
				$modulesContainer.find('>li').each(function(){
					var $moduleWrapper = $(this);
					var moduleName = $('>.dd-handle>.source-title', $moduleWrapper).text();
					if(moduleName.indexOf(keyword) >= 0){
						$moduleWrapper.addClass('searching-matched');
					}else if(mode === 'module'){
						var matchedPart = false;
						$('>ol.dd-list>li', $moduleWrapper).each(function(){
							var $tmplGroup = $(this);
							var tmplGroupTitle = $('.source-title', $tmplGroup).text();
							if(tmplGroupTitle.indexOf(keyword) >= 0){
								$tmplGroup.addClass('searching-matched');
								matchedPart = true;
							}
						});
						if(matchedPart){
							$moduleWrapper.addClass('searching-matched-part');
						}
					}else if(mode === 'custom'){
						var customPagePath = $('>.dd-handle>.custom-page-path', $moduleWrapper).text();
						if(customPagePath.indexOf(keyword) >= 0){
							$moduleWrapper.addClass('searching-matched');
						}
					}
				});
			}else{
				$modulesContainer.removeClass('searching');
			}
		}
		
		function bindSaveToggle(){
			var $saveButton = $(this);
			context.bind('hasChanged', function(triggerParam){
				$saveButton.toggle(triggerParam.after);
			}).setStatus('hasChanged');
		}
		
		/**
		 * 
		 */
		function refreshPage(){
			if(context.getStatus('hasChanged')){
				Dialog.confirm('当前配置已经发生修改，点击“是”进行保存，点击“否”不保存，直接刷新。', function(yes){
					if(yes){
						save();
					}else{
						$page.getLocatePage().refresh();
					}
				});
			}else{
				$page.getLocatePage().refresh();
			}
		}
		
		function save(){
			var defer = $.Deferred();
			Dialog.confirm('确认保存当前菜单配置？').done(function(){
				var blocks = context.getStatus('blocks');
				var saveData = {};
				saveData.blocks = [];
				$.each(blocks, function(){
					var block = {};
					saveData.blocks.push(block);
					Utils.setProperties(this, block, ['id', 'title', 'authorities']);
					block.l1Menus = [];
					
					$.each(this.l1Menus, function(){
						var l1Menu = {};
						block.l1Menus.push(l1Menu);
						Utils.setProperties(this, l1Menu, ['id', 'title', 'authorities']);
						l1Menu.l2Menus = [];
						
						$.each(this.l2Menus, function(){
							var l2Menu = {};
							l1Menu.l2Menus.push(l2Menu);
							Utils.setProperties(this, l2Menu, ['id', 'title', 'authorities', 'templateGroupId', 'statViewId', 'customPageId']);
						});
					});
				});
				
				Ajax.postJson('admin/config/menu/save_blocks', saveData, function(res){
					if(res.status === 'suc'){
						Dialog.confirm('保存成功！是否重新打开系统？', function(yes){
							if(yes){
								location.reload();
							}else{
								context.setStatus('hasChanged', false);
							}
						})
					}else{
						Dialog.notice('保存失败', 'error');
					}
				});
			});
		}
		
		function loadTmpl(){
			require('tmpl').load('media/admin/config/tmpl/menu-config.tmpl').done(function(tmplMap){
				context.setStatus('tmplMap', tmplMap);
			});
		}
		
		function loadSystemConfig(){
			Ajax.ajax('admin/config/menu/sysconfig').done(function(data){
				context.setStatus(data, ['sysconfig']);
			});
		}
		
		function loadModules(){
			Ajax.ajax('admin/config/menu/modules').done(function(data){
				context.setStatus(data, ['modules']);
			});
		}
		
		function loadCustomPages(){
			Ajax.ajax('admin/config/menu/custom_pages').done(function(data){
				context.setStatus(data, ['customPages']);
			});
		}
		
		function loadMenuBlocks(){
			Ajax.ajax('admin/config/menu/blocks').done(function(data){
				$.each(data.blocks, function(){
					var block = this;
					$.each(this.l1Menus, function(){
						this.block = block;
						var l1Menu = this;
						$.each(this.l2Menus, function(){
							if(this.customPageId){
								this.viewType = 'custom';
							}else if(this.templateGroupId){
								this.viewType = 'normal';
							}else if(this.statViewId){
								this.viewType = 'stat';
							}
							this.l1Menu = l1Menu; 
						});
					});
				});
				context.setStatus(data, ['blockAuthDescMap', 'l1AuthDescMap', 'l2AuthDescMap', 'blocks']);
			});
		}
	}
});