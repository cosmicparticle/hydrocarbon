/**
 * 
 */
define(function(require, exports, modules){
	var Utils = require('utils'),
		Ajax = require('ajax'),
		$CPF = require('$CPF'),
		Dialog = require('dialog'),
		FieldSearch = require('field/js/field-search.js');
	exports.initPage = function($page, param){
		var $colTmpl = $('#tmpl-col-row-tmpl', $page);
		var $tbody = $('.fields-l tbody', $page);
		$tbody.sortable({
			helper 		: "clone",
			cursor 		: "move",// 移动时候鼠标样式
			opacity		: 0.5, // 拖拽过程中透明度
			tolerance 	: 'pointer'
		});
		var $fieldSearch = $('.field-search', $page);
		var fieldSearch = FieldSearch.bind($fieldSearch, {
			single			: true,
			textPicked		: true,
			module			: param.moduleName,
			fieldFilters	: ['file'], 
			afterChoose		: function(field, tmplField){
				var fieldName = field.name;
				var pattern = field.fieldPattern;
				var fieldId = field.id;
				var $row = null;
				if(field.composite.isArray){
					fieldSearch.enableField(field.id);
					
					var $rows = field.data['fieldRows'];
					if(!$rows){
						field.data['fieldRows'] = $rows =[];
					}
					var fieldIndex = $rows.length;
					var relationKey = field.composite.relationKey;
					if(relationKey){
						//添加的字段是关系字段，必须自动添加关系label字段
						var hasLabelRow = false;
						relationKey += '[' + fieldIndex + '].' + param.relationLabelKey;
						$tbody.children('tr').each(function(){
							var fieldName = $('.field-name', this).text();
							if(fieldName === relationKey){
								hasLabelRow = true;
								return false;
							}
						});
						if(!hasLabelRow){
							$colTmpl.tmpl({
								title		: relationKey,
								fieldName	: relationKey,
								fieldIndex	: fieldIndex,
								compositeId	: field.composite.c_id,
								removable	: false
							}).addClass('relation-label').appendTo($tbody);
						}
					}
					fieldName = pattern.replace('%INDEX%' , fieldIndex);
					$row = $colTmpl.tmpl({
						title		: fieldName,
						fieldName	: fieldName,
						fieldIndex	: fieldIndex,
						fieldId		: fieldId,
						tmplFieldId	: tmplField && tmplField.id,
						removable	: true
					}).appendTo($tbody);
					$rows.push($row);
					
				}else{
					$row = $colTmpl.tmpl({
						title		: fieldName,
						fieldName	: fieldName,
						fieldId		: fieldId,
						tmplFieldId	: tmplField && tmplField.id,
						removable	: true
					}).appendTo($tbody);
				}
				$row.data('originField', field);
			}
		});
		
		
		//初始化模板数据
		+function(){
			try{
				var tmplFieldsJson = param.tmplFieldsJson;
				console.log(tmplFieldsJson);
				var $lis = $('.fields-r ul li', $page);
				for(var i in tmplFieldsJson){
					var field = tmplFieldsJson[i];
					if(field.fieldId){
						fieldSearch.select(field.fieldId, field);
					}else if(field.title && field.fieldIndex){
						$colTmpl.tmpl({
							tmplFieldId	: field.id,
							title		: field.title,
							fieldName	: field.title,
							fieldIndex	: field.fieldIndex,
							compositeId	: field.compositeId,
							removable	: false
						}).addClass('relation-label').appendTo($tbody);
					}
					/*var $li = $lis.filter('li[pattern="' + field.fieldPattern + '"]');
					if($li.length == 1){
						$li.trigger('dblclick', [field]);
					}*/
				}
			}catch(e){}
		}();
		
		$('.fields-l', $page).on('click', '.remove-col', function(){
			var $row = $(this).closest('tr');
			var originField = $row.data('originField');
			if(originField){
				var $rows = originField.data['fieldRows'];
				if($rows && $.isArray($rows)){
					var pattern = originField.fieldPattern;
					var index = 0;
					while(!$row.is($rows[index])) index++;
					if(index < $rows.length){
						$rows.splice(index, 1);
						for(var i = index; i < $rows.length; i++){
							$rows[i]
								.attr('field-index', i)
								.find('.field-name').text(pattern.replace('%INDEX%', i));
						}
					}
				}
				fieldSearch.enableField(originField.id);
			}
			$row.remove();
			$('tr.relation-label[field-index]', $tbody).each(function(){
				var relationLabelKey = $(this).find('.field-name').text();
				var fieldIndex = $(this).attr('field-index');
				var hasRelationField = false;
				$('tr[field-index]', $tbody).not('.relation-label').each(function(){
					var $originLi = $(this).data('originLi');
					var relationKey = originField.composite.relationKey;
					if(relationKey){
						var thisFieldIndex = $(this).attr('field-index');
						if(relationKey + '[' + thisFieldIndex + '].' + param.relationLabelKey == relationLabelKey){
							hasRelationField = true;
							return false;
						}
					}
				});
				if(!hasRelationField){
					$(this).remove();
				}
			});
		});
		
		function checkSubmitData(operate){
			var def = $.Deferred();
			var title = $('#tmpl-title', $page).val();
			if(!title){
				Dialog.notice('请填写模板名称后保存', 'error');
			}else{
				var $rows = $tbody.children('tr');
				if($rows.length == 0){
					Dialog.notice('模板内没有选择字段', 'error');
				}else{
					Dialog.confirm('确认' + operate + '当前模板[' + title + ']，模板内共有' + $rows.length + '个字段', function(yes){
						if(yes){
							var fields = [];
							$rows.each(function(){
								var $row = $(this);
								fields.push({
									id			: $row.attr('data-id'),
									title		: $row.find('.field-title').text(),
									fieldIndex	: $row.attr('field-index'),
									fieldId		: $row.attr('field-id'),
									compositeId	: $row.attr('composite-id')
								});
							});
							def.resolve({
								tmplId		: param.tmplId,
								fields		: fields,
								title		: title,
								module		: param.moduleName
							});
						}
					});
				}
			}
			return def.promise();
		}
		
		$('#btn-download', $page).click(function(){
			checkSubmitData('下载').done(function(sData){
				$CPF.showLoading();
				Ajax.postJson('admin/modules/import/submit_field_names/' + param.menuId, sData, function(data){
					if(data.uuid){
						Ajax.download('admin/modules/import/download_tmpl/' + data.uuid);
					}
					$CPF.closeLoading();
				});
			});
		});
		
		$('#btn-save', $page).click(function(){
			checkSubmitData('保存').done(function(sData){
				Ajax.postJson('admin/modules/import/save_tmpl/' + param.menuId, sData, function(data){
					if(data.status === 'suc'){
						Dialog.notice('保存成功', 'success');
						$page.getLocatePage().loadContent('admin/modules/import/tmpl/show/' + param.menuId + '/' + data.tmplId);
					}else{
						Dialog.notice('保存失败', 'error');
					}
				});
			})
		});
		$('#btn-new', $page).click(function(){
			Dialog.confirm('是否创建新的模板？当前模板若已修改，将不会被保存。', function(yes){
				if(yes){
					$page.getLocatePage().loadContent('admin/modules/import/tmpl/' + param.menuId);
				}
			});
		});
	}
});