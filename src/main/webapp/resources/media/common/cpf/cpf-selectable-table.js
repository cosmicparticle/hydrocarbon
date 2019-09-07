define(function(require, exports, module){
	exports.bind = function($tables){
		$tables.filter('table').each(function(){
			var $table = $(this);
			$table.data('checkedRowGetter', function(){
				var $rows = $('>tbody>tr', $table);
				return $rows.filter(function(){
					return $(this).find('.row-selectable-checkbox').prop('checked');
				});
			});
			$table.on('change', '.row-selectable-checkbox', function(){
				var $checkedRows = $table.data('checkedRowGetter')();
				var $rows = $('>tbody>tr', $table);
				var $selectAll = $table.find(':checkbox.select-all');
				if($checkedRows.length === 0){
					$selectAll.prop('checked', false);
				}else if($checkedRows.length === $rows.length){
					$selectAll.removeClass('partly').prop('checked', true);
				}else{
					$selectAll.addClass('partly').prop('checked', true);
				}
				$table.trigger('row-selected-change', [$checkedRows]);
			});
			
			$table.on('change', ':checkbox.select-all', function(){
				var $selectAll = $(this);
				$selectAll.removeClass('partly');
				var checkAll = $selectAll.prop('checked');
				$table.children('tbody').find('.row-selectable-checkbox').prop('checked', checkAll);
				$table.trigger('row-selected-change', [checkAll? $('>tbody>tr', $table): $()]);
			});
		});
	}
});