define(function(require, exports, module){
	
	function Chooser(_param){
		var defParam = {
			container		: null,
			list			: [],
			onSelected		: null,
			closeOnSelected	: true
		}
		var param = $.extend({}, defParam, _param);
		
		var list = [];
		for(var i in param.list){
			list.push($.extend({}, param.list[i]));
		}
		param.list = list;
		
		var $chooser = null;
		
		this.getDom = function(){
			if(!$chooser){
				$chooser = createDom();
			}
			return $chooser;
		}
		
		var methods = {
			select	: function(test, afterSelect, data){
				if(typeof test === 'function'){
					for(var i in param.list){
						var item = param.list[i];
						if(test(item) === true){
							try{
								select(item, data);
								if(typeof afterSelect === 'function'){
									afterSelect.apply(this, [item]);
								}
							}catch(e){console.error(e)}
						}
					}
				}
			}
		}
		function select(item, data){
			var $li = $(item.li);
			param.onSelected.apply(this, [{
				data	: item,
				show	: function(){$li.show(); item.cache = {}},
				hide	: function(){$li.hide(); item.cache = {}}
			}, data]);
			
		}
		
		
		this.invoke = function(methodName, args){
			var method = methods[methodName];
			if(method){
				method.apply(this, args);
			}
		}
		
		function createDom(){
			var $chooser = $('<div class="chooser">')
			var $btn = $('<span><i class="iconfont icon-action"</i></span>');
			var $ul = $('<ul>');
			$btn.bind('click', toggleSelects);
			$(document).on('click', bindHideEvent($chooser));
			$chooser.append($btn).append($ul);
			
			$.each(param.list, function(i, item){
				var $li = $('<li>').text(item.title);
				item.li = $li[0];
				$li.click(function(){
					try{
						select(item);
					}catch(e){console.error(e)}
					if(param.closeOnSelected){
						$chooser.removeClass('open');
					}
				});
				$ul.append($li);
			});
			return $chooser;
		}
		
		
	}
	
	function toggleSelects(e){
		e.preventDefault();
		e.stopPropagation();
		var $chooser = $(this).closest('.chooser');
		$chooser.toggleClass('open');
	}
	
	function bindHideEvent($chooser){
		return function(e){
			if($(e.target).closest($chooser).length == 0){
				$chooser.removeClass('open');
			}
		}
	}
	
	function C(){
		var $c = $.apply(window, arguments);
		$c.chooser = function(_param, args){
			if(typeof _param === 'object'){
				var chooser = new Chooser(_param);
				$c.replaceWith(chooser.getDom());
				$c.data('chooser', chooser)
			}else if(typeof _param === 'string'){
				var chooser = $c.data('chooser');
				if(chooser){
					if(!$.isArray(args)){
						args = [args];
					}
					chooser.invoke(_param, args);
				}
			}
			return $c;
		}
		return $c;
	}
	
	module.exports = C;
});