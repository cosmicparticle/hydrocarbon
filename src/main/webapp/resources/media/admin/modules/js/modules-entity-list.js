/**
 * 
 */
define(function(require, exports, module){
	var Utils = require('utils');
	var $CPF = require('$CPF');
	var EntityQuery = require('modules/js/entity-query.js');
	exports.init = function(_param){
		var defaultParam = {
			$page		: null,
			menuId		: null,
			moduleName	: null,
			queryKey	: null,
			columns		: null,
			stmpl		: null
		}
		var param = $.extend({}, defaultParam, _param);
		
		console.log(param);
		
		var $page = param.$page;
		
		var $tbody = $('tbody', $page);
		
		var $entityRowTmpl = $('#entity-row-tmpl', $page);
		
		var columns = param.stmpl.columns;
		
		function appendEntity(entity, rowNumber){
			var $row = $entityRowTmpl.tmpl({
				entity		,	
				columns		,
				rowNumber	
			});
			$tbody.append($row);
			return $row;
		}
		
		function loadEntities(pageNo, pageSize){
			$CPF.showLoading();
			//初始化页面数据
			EntityQuery.requireEntities(param.queryKey, pageNo).done(function(data){
				console.log(data);
				if(data.entities){
					$tbody.empty();
					$.each(data.entities, function(index){
						var $row = appendEntity(this, index + 1);
						bindSelectEvent($row, param.stmpl.multiple === 1);
					});
					require('modules/js/modules-rel-selection').init({
						$page		: $page,
						uriData		: {
							type		: 'entity',
							menuId		: param.menuId,
							stmplId		: param.stmpl.id
						}
						
					});
					$CPF.closeLoading();
				}
			});
		}
		
		
		//分页加载
		$('.cpf-query-paginator', $page).on('pageInfoChange', function(e, pageInfo){
			console.log(pageInfo.pageSize);
			console.log(pageInfo.pageNo);
			loadEntities(pageInfo.pageNo, pageInfo.pageSize)
		});
		
		loadEntities(1);
		
	};
	
	function bindSelectEvent($row, multiple){
		$('.row-selectable-checkbox', $row).change(function(){
			var $tbody = $(this).closest('tbody');
			var $checked = $tbody.find('.row-selectable-checkbox:checked');
			var isSelf = $checked.is(this);
			if(!multiple && !isSelf){
				//单选并且为点击自身
				$checked.prop('checked', false);
			}
		});
	}
});