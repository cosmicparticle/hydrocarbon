/**
 * 
 */
define(function(require, exports, module){
	$.extend(exports, {
		TMPL	: {
			switchTemplateGroup	: function(tmplType, moduleName, tmplId){
				require('dialog').openDialog('admin/tmpl/' + tmplType + '/choose/' + moduleName + '?except=' + tmplId, 
						'选择模板', 
						'choose_tmpl_' + require('utils').uuid(5, 62), {
					onSubmit	: function(data){
						if(data && data.length == 1){
							require('dialog').confirm('确认将与当前模板关联的模板组合的模板更改为"' + data[0].title + '"？', function(yes){
								if(yes){
									require('ajax').ajax('admin/tmpl/' + tmplType + '/switch_groups/' + tmplId + '/' + data[0].id);
								}
							});
						}
					}
				})
			}
		}
	});
	window.STATICS = exports;
});
