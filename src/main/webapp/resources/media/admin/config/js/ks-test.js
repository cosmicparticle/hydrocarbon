define(function(require, exports, module){
	"user strict"
	console.log('asas');

	var Utils = require('utils');
	var Ajax = require('ajax');
	var Dialog = require('dialog');
	
	var globalUserTokenCached = null;
	/**
	 * 
	 */
	exports.init = function(_param){
		var defaultParam = {
			$page 	: null,
			ksId	: null
		}
		
		var param = $.extend({}, defaultParam, _param);
		
		var $page = param.$page;
		
		var context = Utils.createContext({params:{}, pathVar:{}, paramVar:{}});
		
		require('event').prepareToContext($page, context);
		require('event').bindScopeEvent($page, getCallbacks());
		
		context.bind('token', function(val){
			//绑定token设置的事件
			if(val.after){
				context.getDom('btn-sign-in').attr('disabled', 'disabled');
			}else{
				context.getDom('btn-sign-in').removeAttr('disabled');
			}
		}).bind(['ks', 'pathVar'], function(val){
			//绑定修改路径参数事件
			var ks = context.getStatus('ks');
			var pathVarMap = context.getStatus('pathVar');
			var path = ks.path;
			for(var name in pathVarMap){
				path = path.replace(new RegExp('\\{\\s*' + name + '\\s*\\}'), pathVarMap[name]);
			}
			context.setStatus('path', path);
		}).bind(['ks', 'paramVar'], function(val){
			var paramVar = context.getStatus('paramVar');
			var view = '';
			for(name in paramVar){
				var value = paramVar[name];
				if(value !== undefined){
					view += name + ' = ' + value + '\r\n';
				}
			}
			context.getStatus('paramsEditor').setValue(view);
		}).bind(['path', 'token'], function(){
			var path = context.getStatus('path');
			if(path && context.getStatus('token')){
				context.getDom('path').val(path);
				context.getDom('btn-submit').removeAttr('disabled');
			}else{
				context.getDom('btn-submit').attr('disabled', 'disabled');
			}
		}).bind(['tmplMap', 'ks'], function(){
			var ks = context.getStatus('ks');
			var tmplMap  = context.getStatus('tmplMap');
			if(ks){
				if(ks.type === 'multi-query'){
					context.getDom('page-widge').show();
				}
				if(tmplMap){
					tmplMap['ks-criterias'].replaceIn($page, {ks}, {
						//修改参数表单时的回调
						triggerCriteriaChange	: function(criteria){
							var value = $(this).val();
							if(criteria.source === 'path-var'){
								context.getStatus('pathVar')[criteria.name] = value;
								context.setStatus('pathVar');
							}else if(criteria.source === 'param'){
								context.getStatus('paramVar')[criteria.name] = value;
								context.setStatus('paramVar');
							}
						},
						//修改参数表单的可用状态的回调
						toggleCriteriaEnabled	: function(criteria){
							var enabled = $(this).prop('checked');
							var $criteriaValue = $(this).closest('.row').find('.criteria-value');
							if(enabled){
								$criteriaValue.removeAttr('readonly');
								$criteriaValue.trigger('change');
							}else{
								$criteriaValue.attr('readonly', 'readonly');
								context.getStatus('paramVar')[criteria.name] = undefined;
								context.setStatus('paramVar');
							}
						}
					})
				}
			}
		});
		
		initInput();
		loadKs();
		loadTmpl();
		testUserTokenCached(globalUserTokenCached);
		
		function loadKs(){
			Ajax.ajax('admin/config/ks/load_ks/' + param.ksId).done(function(data){
				if(data.ks){
					context.setStatus('ks', data.ks);
				}
			});
		}
		
		function loadTmpl(){
			require('tmpl').load('media/admin/config/tmpl/ks-test.tmpl').done(function(tmplMap){
				context.setStatus('tmplMap', tmplMap);
			});
		}
		
		function initInput(){
			(function(inputs){
				for(var i in inputs){
					var input = inputs[i];
					var editor = ace.edit(context.getDom(input.id)[0], {
			            theme: "ace/theme/monokai",
			            mode: "ace/mode/" + input.mode,
			            wrap: true,
			            autoScrollEditorIntoView: true,
			            enableBasicAutocompletion: true,
			            enableSnippets: true,
			            enableLiveAutocompletion: true,
			        });
					editor.setReadOnly(true);
					context.setStatus(input.id, editor);
				}
			})([{id:'paramsEditor', mode:'properties'}, 
				{id:'resEditor', mode: 'json'}]);
			
			(function(inputs){
				for(var i in inputs){
					var input = inputs[i];
					var editor = ace.edit(context.getDom(input.id)[0], {
			            theme: "ace/theme/monokai",
			            mode: "ace/mode/" + input.mode,
			            wrap: true,
			            autoScrollEditorIntoView: true,
			            enableBasicAutocompletion: true,
			            enableSnippets: true,
			            enableLiveAutocompletion: true,
			        });
					editor.setReadOnly(false);
					context.setStatus(input.id, editor);
				}
			})([ {id:'postEditor', mode: 'json'}]);
		}
		
		function testUserTokenCached(userTokenCached){
			if(userTokenCached){
				
				Ajax.ajax('api2/auth/test', undefined, {headersHandler:tokenHeaderSetter(userTokenCached.token)})
					.done(function(){
						context.getDom('username').val(userTokenCached.username);
						context.getDom('password').val('*******');
						context.setStatus('token', userTokenCached.token);
					}).error(function(){
						globalUserTokenCached = null;
					});
			}
		}
		
		function validatePageParam(){
			var pageNo = context.getDom('pageNo').val();
			if(!/\d+/.test(pageNo) || pageNo <= 0){
				context.getDom('pageNo').val(1);
			}
			var pageSize = context.getDom('pageSize').val();
			if(!/\d+/.test(pageSize) || pageNo <= 0){
				context.getDom('pageSize').val(10);
			}
		}
		
		function tokenHeaderSetter(token){
			return function(headers){
				headers['hydrocarbon-token'] = token;
			}
		}
		
		
		function getCallbacks(){
			return {
				//登录
				signIn	: function(){
					var username = context.getDom('username').val();
					var password = context.getDom('password').val();
					Ajax.ajax('api2/auth/token', {username, password}).done(function(data){
						if(data.status === 'suc' && data.token){
							Dialog.notice('登录成功', 'success');
							context.setStatus('token', data.token);
							globalUserTokenCached = {username:username, token:data.token};
						}else{
							Dialog.notice('登录失败', 'error');
						}
					});
				},
				userChanged	: function(){
					if(context.getDom('btn-sign-in').prop('disabled') && context.getStatus('token')){
						context.getDom('btn-sign-in').removeAttr('disabled');
					}
				},
				
				submit		: function(){
					var path = context.getStatus('path');
					var pathVar = context.getStatus('pathVar');
					for(var name in pathVar){
						if(pathVar[name] !== undefined){
							path = path+"/"+ pathVar[name];
						}
					}
					
					var ks = context.getStatus('ks');
					var isMultiQuery = ks.type === 'multi-query'
					var API_PREFIX = 'api2/ks/c/';
					if(path){
						var params = {};
						if(ks.type === 'multi-query' || ks.type === 'single-query'){
							var paramVar = context.getStatus('paramVar');
							for(var name in paramVar){
								if(paramVar[name] !== undefined){
									params[name] = paramVar[name];
								}
							}
							if(isMultiQuery){
								validatePageParam();
							}
						}else{
							params['JSONENTITY']=context.getStatus('postEditor').getValue();
						}
						
						Ajax.ajax(API_PREFIX + path, params, undefined, {headersHandler:tokenHeaderSetter(context.getStatus('token'))}).done(function(data){
							var resEditor = context.getStatus('resEditor');
							if(data.result){
								if(isMultiQuery && data.result.queryKey){
									//multiQuery的结果，需要再度发起一个分页查询请求
									var pageNo = context.getDom('pageNo').val(),
										pageSize = context.getDom('pageSize').val();
									Ajax.ajax('api2/ks/query/' + data.result.queryKey + '/' + pageNo, {pageSize}, undefined, {headersHandler:tokenHeaderSetter(context.getStatus('token'))}).done(function(pagedData){
										if(pagedData.result){
											Dialog.notice('请求成功', 'success');
											resEditor.setValue(JSON.stringify(pagedData.result, null, '\t'));
										}else{
											Dialog.notice('没有返回数据', 'warning');
											resEditor.setValue('');
										}
									})
								}else{
									Dialog.notice('请求成功', 'success');
									resEditor.setValue(JSON.stringify(data.result, null, '\t'));
								}
							}else{
								Dialog.notice('没有返回数据', 'warning');
								resEditor.setValue('');
							}
						});
					}
				}
			};
		}
	}
});