define(function(require, exports, module){
	
	function Print(){
		
	}
	
	var iframeNameNo = 0;
	Print.print = function(_param){
		var defaultParam = {
			$content	: null,
			base		: '',
			css			: []
		};
		
		var param = $.extend({}, defaultParam, _param);
		
		var $iframe = $('<iframe>');
		$iframe
			.attr('name', 'cpf_print_' + iframeNameNo++)
			.css({
				display	: 'none'
			})
			;
		$iframe.appendTo(document.body)
		var fw = $iframe.get(0).contentWindow,
			$head = $(fw.document.head),
			$body = $(fw.document.body);
		$body.append(param.$content);
		if(param.base){
			$head.append('<base href="' + param.base + '" />');
		}else{
			param.base = '';
		}
		$head.append('<meta charset="utf-8" />,<meta http-equiv="X-UA-Compatible" content="chrome=1"/>');
		for(var i in param.css){
			var $css = $('<link type="text/css" rel="stylesheet" href="' + param.base + param.css[i] + '" />');
			$(fw.document.head).append($css);
		}
		$(fw.document).ready(function(){
			fw.print();
		});
	}
	
	
	
	module.exports = Print;
});