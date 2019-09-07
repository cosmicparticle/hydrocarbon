define(function(require, exports, module){
	"use strict";
	var Form = require('form'),
		Ajax = require('ajax'),
		Utils = require('utils'),
		uriGeneratorFactory = function(uriData){
			switch(uriData.type){
				case 'entity': 
					return {
						load_entity	: function(){
							return 'admin/modules/curd/load_entities/' + uriData.menuId + '/' + uriData.stmplId;
						}
					}
				case 'user':
					return {
						load_entity	: function(stmplId){
							return 'admin/config/user/load_entities/' + uriData.stmplId;
						}
					}
				case 'atmpl':
					return {
					load_entity	: function(stmplId){
						return 'admin/tmpl/atmpl/load_entities/' + uriData.stmplId;
					}
				}
			}
		}
	
	exports.init = function($page, moduleName, uriData, 
			pageInfo, multiple){
			
		var uriGenerator = uriGeneratorFactory(uriData);
		var initParam = {};
		Utils.botByDom($page.getLocatePage().getContent(), 'cpf-page-inited', function(){
			var $form = $('form', $page),
				formData = new FormData($form[0]);
			Form.formatFormData($form, formData)
			initParam = Utils.converteFormdata(formData);
			$.extend(initParam, pageInfo);
		});
		
		multiple = multiple == '1';
		
		var $trs = $('.list-area tbody>tr', $page);
		$trs.click(function(){
			if(!multiple){
				$trs.removeClass('selected');
			}
			$(this).closest('tr').toggleClass('selected');
			
		});
		var page = $page.getLocatePage(); 
		page.bind('footer-submit', function(data){
			
			var codes = [];
			$trs.filter('.selected').each(function(){
				var code = $(this).attr('data-code');
				if(code){
					codes.push(code);
				}
			});
			console.log(codes);
			var entitiesLoader = function(fields){
				var deferred = $.Deferred();
				if($.isArray(fields) && fields.length > 0){
					Ajax.ajax(uriGenerator.load_entity(), {
						codes	: codes.join(),
						fields	: fields.join()
					}, function(data){
						if(data.status === 'suc'){
							deferred.resolve(data.entities);
						}else{
							$.error('获取数据错误');
						}
					});
				}
				return deferred.promise();
			};
			entitiesLoader.codes = codes;
			return entitiesLoader;
		});
	}
});