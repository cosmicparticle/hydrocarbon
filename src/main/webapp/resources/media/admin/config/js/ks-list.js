define(function(require, exports, module){
	
	var Utils = require('utils');
	var $CPF = require('$CPF');
	var Ajax = require("ajax");
	var Dialog = require('dialog');
	exports.init = function(_param){
		var param = $.extend({
			$page	: null
		}, _param);
		$CPF.showLoading();
		
		var $page = param.$page;
		var pageEvents = getPageEvents();
		
		var context = Utils.createContext({
			ksList	: [],
			KS_TYPE_MAP	: require('config/js/ks-edit').KS_TYPE_MAP
		});
		require('event').bindScopeEvent($page, pageEvents);
		require('event').prepareToContext($page, context);
		
		context.bind('ksList', renderList)
			;
		
		require('tmpl').load('media/admin/config/tmpl/ks-list.tmpl').done(function(tmplMap){
			context.setStatus('tmplMap', tmplMap);
		});
		
		loadList();
		
		
		function renderList(){
			var tmplMap = context.getStatus('tmplMap');
			if(tmplMap){
				tmplMap['ks-list'].replaceIn($page, context.properties, {
					testKs
				});
				$CPF.closeLoading();
			}
		}
		
		function loadList(){
			var formData = new FormData(context.getDom('form')[0]);
			Ajax.ajax('admin/config/ks/load_all_ks', formData).done(function(data){
				if(data.status === 'suc' && data.ksList){
					context.setStatus('ksList', data.ksList); 
				}
			});
		}
		
		function confirmToMultiOperate(confirmMsg, url){
			var def = $.Deferred();
			var ksIds = [], ksTitles = [];
			var checkedRowGetter = context.getDom('table').data('checkedRowGetter');
			if(checkedRowGetter){
				var $rows = checkedRowGetter();
				$rows.each(function(){
					ksIds.push(this.getAttribute('data-id'));
					ksTitles.push(this.getAttribute('data-title'));
				});
			}
			if(ksIds.length > 0){
				Dialog.confirm(confirmMsg + ' 操作的轻服务包括[' + ksTitles.join() + ']').done(function(){
					Ajax.ajax(url, {ksIds: ksIds.join()}).done(function(data){
						if(data.status === 'suc'){
							Dialog.notice('操作成功', 'success');
							def.resolve($rows);
						}else{
							Dialog.notice('操作失败', 'error');
						}
					});
				});
			}
			return def.promise();
		}
		
		function testKs(ksId, ksTitle){
			if(ksId){
				Ajax.ajax('admin/config/ks/load_ks/' + ksId).done(function(data){
					if(data.ks){
						console.log(data.ks);
						var ksTestContext = Utils.createContext({params:{}, pathVar:{}});
						ksTestContext.bind('token', function(val){
							//绑定token设置的事件
							if(val.after){
								ksTestContext.getDom('btn-sign-in').attr('disabled', 'disabled');
							}else{
								ksTestContext.getDom('btn-sign-in').removeAttr('disabled');
							}
						}).bind('pathVar', function(val){
							//绑定修改路径参数事件
							var pathVarMap = val.after;
							var path = data.ks.path;
							for(var name in pathVarMap){
								path = path.replace(new RegExp('\\{\\s*' + name + '\\s*\\}'), pathVarMap[name]);
							}
							ksTestContext.setStatus('path', path);
						}).bind(['path', 'token'], function(){
							var path = ksTestContext.getStatus('path');
							if(path && ksTestContext.getStatus('token')){
								ksTestContext.getDom('path').val(path);
								ksTestContext.getDom('btn-submit').removeAttr('disabled');
							}else{
								ksTestContext.getDom('btn-submit').attr('disabled', 'disabled');
							}
						});
						var $ksTestPage = context.getStatus('tmplMap')['ks-test-page'].tmpl({
							ks: data.ks
						}, {
							//登录
							signIn	: function(){
								var username = ksTestContext.getDom('username').val();
								var password = ksTestContext.getDom('password').val();
								Ajax.ajax('api2/auth/token', {username, password}).done(function(data){
									if(data.status === 'suc' && data.token){
										Dialog.notice('登录成功', 'success');
										ksTestContext.setStatus('token', data.token);
									}else{
										Dialog.notice('登录失败', 'error');
									}
								});
							},
							userChanged	: function(){
								if(ksTestContext.getDom('btn-sign-in').prop('disabled') && ksTestContext.getStatus('token')){
									ksTestContext.getDom('btn-sign-in').removeAttr('disabled');
								}
							},
							triggerCriteriaChange	: function(criteria){
								var value = $(this).val();
								if(criteria.source === 'path-var'){
									ksTestContext.getStatus('pathVar')[criteria.name] = value;
									ksTestContext.setStatus('pathVar');
								}
							},
							submit		: function(){
								var path = ksTestContext.getStatus('path');
								var params = ksTestContext.getStatus('params');
								var API_PREFIX = 'api2/ks/c/';
								if(path){
									Ajax.ajax(API_PREFIX + path, params, undefined, {
										headersHandler	: function(headers){headers['hydrocarbon-token'] = ksTestContext.getStatus('token')}
									}).done(function(data){
										if(data.result){
											Dialog.notice('请求成功', 'success');
											ksTestContext.getDom('resData').val(JSON.stringify(data.result, null, '\t'))
										}else{
											Dialog.notice('没有返回数据', 'warning');
										}
									});
								}
							}
						});
						require('event').prepareToContext($ksTestPage, ksTestContext);
						Dialog.openDialog($ksTestPage, '测试轻服务（' + data.ks.title + '）', 'ks-test', {
							contentType	: 'dom',
							width		: 1000,
							height		: 500
						})
					}
				});
				
			}
		}
		
		function getPageEvents(){
			var pageEvents = {
				bindTable	: function(){
					$(this).on('row-selected-change', function(e, $checkedRows){
						var $btnEnable = context.getDom('btn-enable'),
							$btnDisable =  context.getDom('btn-disable'),
							$btnRemove =  context.getDom('btn-remove');
							
						if($checkedRows.length > 0){
							$btnRemove.removeAttr('disabled');
							var disabledCheckCount =  disabledCheckedCount = $checkedRows.filter('.ks-disabled').length
								enabledCheckedCount = $checkedRows.length - disabledCheckedCount;
							if(disabledCheckedCount > 0) $btnEnable.removeAttr('disabled');
							else $btnEnable.attr('disabled', 'disabled');
							if(enabledCheckedCount > 0) $btnDisable.removeAttr('disabled');
							else $btnDisable.attr('disabled', 'disabled');
						}else{
							$btnEnable
								.add($btnDisable)
								.add($btnRemove)
								.attr('disabled', 'disabled');
						}
						
					});
				},
				filterKsList	: function(){
					var keyword = $(this).val();
					console.log(keyword);
				},
				remove		: function(){
					confirmToMultiOperate('确认删除轻服务？', 'admin/config/ks/remove').done(function($rows){
						$rows.remove();
					});
				},
				toggleEnable: function(){
					confirmToMultiOperate('确认启用轻服务？', 'admin/config/ks/enable').done(function($rows){
						$rows.removeClass('ks-disabled');
					});
				},
				toggleDisable: function(){
					confirmToMultiOperate('确认禁用轻服务？', 'admin/config/ks/disable').done(function($rows){
						$rows.addClass('ks-disabled');
					});
				}
			};
			return pageEvents;
		}
		
	};
});