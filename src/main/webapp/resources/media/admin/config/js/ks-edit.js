/**
 * 
 */
define(function(require, exports, module){
	var Utils = require('utils');
	var Ajax = require('ajax');
	var Dialog = require('dialog');
	var KS_TYPE_MAP = exports.KS_TYPE_MAP = {
		'single-query'	: '单一实体查询',
		'multi-query'	: '批量实体查询',
		'single-update'	: '单一实体更新',
		'multi-update'	: '批量实体更新'
	};
	var KS_TYPE_OPTIONS = Object.keys(KS_TYPE_MAP).map((k)=>0||{id:k,text:KS_TYPE_MAP[k]});
	
	exports.init = function(_param){
		var param = $.extend({
			$page	: null,
			ksId	: ''
		}, _param);
		
		var $page = param.$page;
		var context = Utils.createContext({
			originKs		: null,
			modules			: null,
			selectedModule	: null,
			selectedLtmpl	: null,
			selectedAtmpl	: null,
			selectedDtmpl	: null,
			initDtmplSetted	: false,
			originKs		: null,
			tmplMap			: null,
			criterias		: [],
			ksType:null,
			//返回数据视图的类型
			resViewType		: 'treeview',
			//返回数据的元数据对象
			resSource		: {fields:[]},
			postViewType		: 'treeview',
			postSource		: {fields:[]}
		});
		
		context
			.bind('modules', [renderModules, renderOriginKs])
			.bind('selectedModule', [renderLtmpls, renderAtmpls, renderDtmpls])
			.bind('selectedLtmpl', afterSelectLtmpl)
			.bind('selectedAtmpl', afterSelectAtmpl)
			.bind('selectedDtmpl', afterSelectDtmpl)
			.bind('originKs', [renderOriginKs])
			.bind('tmplMap', [renderOriginKs])
			.bind('initLtmplSetted', [renderOriginKs])
			.bind('resSource', [setResponseSource])
			.bind('resViewType', [setResponseSource])
			.bind('postSource', [setRequestPostSource])
			.bind('postViewType', [setRequestPostSource])
			.bind('ksType',setKsType);
			;
		
		var pageEvents = getPageEvents();
		require('event').bindScopeEvent($page, pageEvents);
		require('event').prepareToContext($page, context);
		
		renderFrameData('res');
		renderFrameData('post');
		
		context.setStatus('ksType','single-query')
		
		loadTmplMap();
		loadModules();
		loadKaruiService();
		
		
		function loadTmplMap(){
			require('tmpl').load('media/admin/config/tmpl/ks-edit.tmpl').done(function(tmplMap){
				context.setStatus('tmplMap', tmplMap)
			});
		}
		
		/**
		 * 从后台加载模块数据
		 */
		function loadModules(){
			Ajax.ajax('admin/config/ks/modules').done(function(data){
				context.setStatus(data, ['modules']);
			});
		}
		
		function loadKaruiService(){
			if(param.ksId){
				Ajax.ajax('admin/config/ks/load_ks/' + param.ksId).done(function(data){
					if(data.ks){
						context.setStatus('originKs', data.ks);
					}
				});
			}
		}
		
		function renderFrameData(prefix){
			initSelect2(context.getDom('type'), KS_TYPE_OPTIONS);
			var editor = ace.edit(context.getDom(prefix+'-editor')[0], {
	            theme: "ace/theme/monokai",
	            mode: "ace/mode/json",
	            wrap: true,
	            autoScrollEditorIntoView: true,
	            enableBasicAutocompletion: true,
	            enableSnippets: true,
	            enableLiveAutocompletion: true
	        });
			var treeView = require('config/js/json-tree-view').initTree(context.getDom(prefix+'-tree-view'));
			context.setStatus(prefix+'Editor',editor);
			context.setStatus(prefix+'TreeView',treeView);
		}
		
		/**
		 * 根据后台数据显示模块选项
		 */
		function renderModules(){
			var modules = context.getStatus('modules');
			if(modules){
				//转换成选项
				var options = convertNormalOptions(modules);
				//获得当前已经选中的模块
				var selectedModule = context.getStatus('selectedModule') || {};
				//重新初始化
				initSelect2(context.getDom('module'), options, selectedModule.id || '');
				context.setStatus('modulesSelect2Init', true);
			}
		}
		
		/**
		 * 根据已经选择的模块渲染列表模板选项
		 */
		function renderLtmpls(){
			var selectedModule = context.getStatus('selectedModule');
			if(selectedModule){
				var ltmpls = selectedModule.ltmpls;
				var selectedLtmpl = context.getStatus('selectedLtmpl') || {};
				var $ltmpl = context.getDom('ltmpl'); 
				initSelect2($ltmpl, convertNormalOptions(ltmpls || []), selectedLtmpl.id || '');
			}
		}
		
		/**
		 * 根据已经选择的模块渲染操作模板选项
		 */
		function renderAtmpls(){
			var selectedModule = context.getStatus('selectedModule');
			if(selectedModule){
				var atmpls = selectedModule.atmpls;
				var selectedAtmpl = context.getStatus('selectedAtmpl') || {};
				var $atmpl = context.getDom('atmpl'); 
				initSelect2($atmpl, convertNormalOptions(atmpls || []), selectedAtmpl.id || '');
			}
		}
		
		/**
		 * 根据已经选择的模块渲染详情模板选项
		 */
		function renderDtmpls(){
			var selectedModule = context.getStatus('selectedModule');
			if(selectedModule){
				var dtmpls = selectedModule.dtmpls;
				var selectedDtmpl = context.getStatus('selectedDtmpl') || {};
				initSelect2(context.getDom('dtmpl'), convertNormalOptions(dtmpls || []), selectedDtmpl.id || '');
			}
		}
		
		function afterSelectLtmpl(){
			var selectedLtmpl = context.getStatus('selectedLtmpl');
			var $btnAddCriteria = context.getDom('btn-add-criteria');
			if(selectedLtmpl){
				$btnAddCriteria.removeAttr('disabled');
			}else{
				$btnAddCriteria.attr('disabled', 'disabled');
			}
		}
		
		function afterSelectAtmpl(){
			
		}
		
		function afterSelectDtmpl(){
			 afterSelectDtmpl_r('res');
			var type= context.getStatus('ksType');
			 if(type === 'multi-query' || type === 'single-query'){
				 
			 }else{
				 afterSelectDtmpl_r('post'); 
			 }
			 
		}
		
		function afterSelectDtmpl_r(prefix){
			var selectedDtmpl = context.getStatus('selectedDtmpl');
			if(selectedDtmpl){
				//设置树形视图的原始详情模板数据源
				var treeView = context.getStatus(prefix+'TreeView');
				treeView.setDetailFieldSource(selectedDtmpl.fieldGroups);
				var confirmStr;
				if('res'==prefix){
					 confirmStr="是否生成该详情模板的返回数据配置？";
				}else{
					 confirmStr="是否生成该详情模板的提交数据配置？";
				}
				
				
				//除了修改页面的第一次加载时，其他时候都要询问是否要自动生成元数据
				if(!context.getStatus('originKs') || context.getStatus('initDtmplSetted')){
					Dialog.confirm(confirmStr).done(function(){
						var source = treeView.buildSource();
						context.setStatus(prefix+'Source',source);
					});
				}
			}
		}
		
		function setResponseSource(){
			var resSource = context.getStatus('resSource');
			if(resSource){
				switch(context.getStatus('resViewType')){
				case 'treeview':
					context.getStatus('resTreeView').render({source: resSource});
					context.getDom('res-code-view').hide();
					context.getDom('res-tree-view').show();
					break;
				case 'code':
					context.getStatus('resEditor').setValue(JSON.stringify(resSource, null, '\t'));
					context.getDom('res-tree-view').hide();
					context.getDom('res-code-view').show();
					break;
				} 
			}
		}
		
		function setRequestPostSource(){
			var postSource = context.getStatus('postSource');
			if(postSource){
				switch(context.getStatus('postViewType')){
				case 'treeview':
					context.getStatus('postTreeView').render({source: postSource});
					context.getDom('post-code-view').hide();
					context.getDom('post-tree-view').show();
					break;
				case 'code':
					context.getStatus('postEditor').setValue(JSON.stringify(postSource, null, '\t'));
					context.getDom('post-tree-view').hide();
					context.getDom('post-code-view').show();
					break;
				} 
			}
		}
		
		function renderOriginKs(){
			var originKs = context.getStatus('originKs');
			var modules = context.getStatus('modules');
			var tmplMap = context.getStatus('tmplMap');
			if(originKs && modules){
				if(originKs.authority){
					context.getDom('auths').text('点击后查看权限');
				}
				context.setStatus('resSource', JSON.parse(originKs.responseMeta));
				context.setStatus('postSource', JSON.parse(originKs.requestPostMeta));
				if(modules){
					if(context.getStatus('initLtmplSetted') && originKs.criterias){
						var selectedLtmpl = context.getStatus('selectedLtmpl');
						//只有当前选择的列表模板和初始化的轻服务关联的列表模板相同的时候才执行
						if(selectedLtmpl && selectedLtmpl.id == originKs.listTemplateId){
							//初始化参数列表
							var criterias = context.getStatus('criterias');
							var ltmplCriteraFields = getLtmplCriteriaFields();
							for(var i in originKs.criterias){
								var criteria = originKs.criterias[i];
								criteria.uuid = Utils.uuid(5, 62);
								criterias.push(criteria);
								tmplMap['ks-criteria-row']
								.tmpl({criteria, ltmplCriteraFields}, {setCriteria, removeCriteria, initCriteriaValue})
								.appendTo(context.getDom('ks-criteria-rows'));
								context.getDom('form').bootstrapValidator("addField", criteria.uuid,{
									validators: {notEmpty: {message: '参数名不能为空'}, group:'td'}
								});
							}
						}
					}
				}
			}
		}
		
		/**
		 * 生成保存数据
		 */
		function getSaveData(){
			var v = context.getDom('form').bootstrapValidator('validate').data('bootstrapValidator');
			if(v.isValid()){
				var originKs = context.getStatus('originKs');
				var saveData = {
					id				: originKs && originKs.id,
					title			: context.getDom('title').val(),
					path			: context.getDom('path').val(),
					description		: context.getDom('description').val(),
					type			: context.getDom('type').val(),
					module			: context.getDom('module').val(),
					detailTemplateId: context.getDom('dtmpl').val(),
					actionTemplateId: context.getDom('atmpl').val(),
					listTemplateId	: context.getDom('ltmpl').val(),
					responseMeta	: JSON.stringify(context.getStatus('resSource')),
					requestPostMeta	: JSON.stringify(context.getStatus('postSource')),
					authority		: context.getDom('auths').attr('auths'),
					criterias		: context.getStatus('criterias')
				};
				return saveData;
			}
		}
		
		/**
		 * 初始化select2控件
		 */
		function initSelect2($select, options, initValue){
			$select.empty().select2({
				theme			: "bootstrap",
				width			: null,
				data			: options
			})//.val(initValue);
		}
		
		/**
		 * 将后台生成的数据转换成选项数据
		 */
		function convertNormalOptions(modules){
			return [{id:'', title: '---请选择---', data: null}].concat(modules.map(function(m){
				return {id: m.id || m.name, text: m.title, data: m}; 
			}));
		}
		function setCriteria(fieldName, criteria){
			criteria[fieldName] = $(this).val();
			console.log(context.getStatus('criterias'));
		}
		function removeCriteria(criteria){
			if(criteria){
				var criterias = context.getStatus('criterias');
				if(criterias){
					Utils.removeElement(criterias, criteria);
					$(this).closest('tr').remove();
					context.getDom('form').bootstrapValidator("removeField", criteria.uuid);
				}
			}
		}
		function initCriteriaValue(field, value, criteria){
			if(field){
				if(value){
					$(this).val(value);
				}else{
					value = $(this).val();
				}
			}
			$(this).trigger('change');
		}
		
		function getLtmplCriteriaFields(){
			var selectedLtmpl = context.getStatus('selectedLtmpl');
			return selectedLtmpl && selectedLtmpl.criterias || [];
		}
		
		function setKsType(){
			var $this=$(this);
			var type = context.getStatus('ksType');
			
			if(type === 'multi-query' || type === 'single-query'){
				$this["0"].domMap["post-tree-view"].closest(".requestpost").addClass("hidden");
				$this["0"].domMap["post-tree-view"].closest(".requestpost").prev(".requestparam").removeClass("hidden");
				$this["0"].domMap["atmpl"].closest(".atmpl").addClass("hidden");
				$this["0"].domMap["ltmpl"].closest(".ltmpl").removeClass("hidden");
			}else{
				$this["0"].domMap["post-tree-view"].closest(".requestpost").removeClass("hidden");
				$this["0"].domMap["post-tree-view"].closest(".requestpost").prev(".requestparam").addClass("hidden");
				$this["0"].domMap["atmpl"].closest(".atmpl").removeClass("hidden");
				$this["0"].domMap["ltmpl"].closest(".ltmpl").addClass("hidden");
			}
		}
		
		
		/**
		 * 页面中的事件
		 */
		function getPageEvents(){
			return {
				changeType	: function(){
					context.setStatus('ksType', this.value);
				},
				changeModule: function(){
					var $this = $(this);
					context.selfish('modulesSelect2Init', function(){
						var option = $this.select2('data')[0];
						if(option && option.data){
							context.setStatus('selectedModule', option.data);
						}else{
							context.setStatus('selectedModule', null);
						}
					});
				},
				changeLtmpl	: function(){
					var option = $(this).select2('data')[0];
					if(option && option.data){
						context.setStatus('selectedLtmpl', option.data);
					}else{
						context.setStatus('selectedLtmpl', null);
					}
					if(!context.getStatus('initLtmplSetted')){
						var originKs = context.getStatus('originKs');
						if(originKs && originKs.listTemplateId == this.value){
							context.setStatus('initLtmplSetted', true);
						}
					}
				},
				changeAtmpl	: function(){
					var option = $(this).select2('data')[0];
					if(option && option.data){
						context.setStatus('selectedAtmpl', option.data);
					}else{
						context.setStatus('selectedAtmpl', null);
					}
					if(!context.getStatus('initAtmplSetted')){
						var originKs = context.getStatus('originKs');
						if(originKs && originKs.actionTemplateId == this.value){
							context.setStatus('initAtmplSetted', true);
						}
					}
				},
				changeDtmpl	: function(){
					var option = $(this).select2('data')[0];
					if(option && option.data){
						context.setStatus('selectedDtmpl', option.data);
					}else{
						context.setStatus('selectedDtmpl', null);
					}
					if(!context.getStatus('initDtmplSetted')){
						var originKs = context.getStatus('originKs');
						if(originKs && originKs.detailTemplateId == this.value){
							context.setStatus('initDtmplSetted', true);
						}
					}
				},
				addParam	: function(){
					var tmplMap = context.getStatus('tmplMap');
					if(tmplMap){
						var ltmplCriteraFields = getLtmplCriteriaFields();
						var criteria = {};
						criteria.uuid = Utils.uuid(5, 62);
						context.getStatus('criterias').push(criteria);
						tmplMap['ks-criteria-row']
							.tmpl({criteria, ltmplCriteraFields}, {setCriteria, removeCriteria, initCriteriaValue})
							.appendTo(context.getDom('ks-criteria-rows'));
						context.getDom('form').bootstrapValidator("addField", criteria.uuid,{
				            validators: {notEmpty: {message: '参数名不能为空'}, group:'td'}
				        });
					}
				},
				saveKs		: function(){
					var saveData = getSaveData();
					if(saveData){
						Dialog.confirm('确认保存？').done(function(){
							Ajax.postJson('admin/config/ks/save', saveData, function(data){
								if(data.status === 'suc'){
									Dialog.notice('保存成功', 'success');
									$page.getLocatePage().loadContent('admin/config/ks/edit/' + data.ksId);
								}else{
									Dialog.notice('保存失败', 'error');
								}
							});
						});
					}
				},
				dialogShowAuth: function(){
					var $this = $(this);
					var auths = $this.attr('auths');
					require('dialog').openDialog('admin/config/sidemenu/authority_choose', '选择权限', 'ks_choose_auths', {
						reqParam	: {auths},
						onSubmit	: function(data){
							var authNames = [], authCodes = [];
							for(var i in data){
								var auth = data[i];
								authNames.push(auth.name);
								authCodes.push(auth.code);
							}
							$this.text(authNames.join(';') || '选择权限');
							$this.attr('auths', authCodes.join(';'));
						}
					})
				},
				//切换返回数据视图
				switchResEditorView	: function(){
					
					var $this = $(this);
					var prefix=$this.attr('prefix');
					var doSwitch = function(){
						Utils.switchClass($this.children('i'), 'icon-view', 'icon-code', function(showTreeView){
							context.setStatus(prefix+'ViewType', showTreeView? 'treeview': 'code');
						});
					}
					var $icon = $this.children('i');
					if($icon.is('.icon-code')){
						try{
							var resSource = JSON.parse(context.getStatus(prefix+'Editor').getValue());
							context.properties.resSource = resSource;
							doSwitch();
						}catch(e){
							Dialog.notice('转换JSON时发生错误', 'error');
							return;
						}
					}else{
						context.getStatus(prefix+'TreeView').permitLeave().done(function(){
							doSwitch();
						});
					}
				},
				//放大缩小返回数据视图
				toggleExpand: function(){
					var $this = $(this);
					var prefix=$this.attr('prefix');
					var $widget = $(this).closest('.widget');
					var expanded = $widget.is('.expanded');
					var resEditor = context.getStatus(prefix+'Editor');
					if(expanded){
						$widget.removeClass('expanded');
						context.getDom(prefix+'-editor').css('height', '300px').removeClass('fixed-full');
					}else{
						$widget.addClass('expanded');
						context.getDom(prefix+'-editor').css('height', 'auto').addClass('fixed-full');
					}
					resEditor.resize();
					Utils.switchClass($this.children('i'), 'fa-compress', 'fa-expand', function(compressed){
						if(!compressed){
							$page.scrollParent().scrollTop(100000);
						}
					});
				}
			};
		}
	}
});