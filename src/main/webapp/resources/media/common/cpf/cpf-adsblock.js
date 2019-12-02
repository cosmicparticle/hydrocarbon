define(function(require, exports, module){
	function AdsBlock(_param){
		var defaultParam = {
			interval	: 1000,
			filter		: function(){
				return [];
			}
		};
		var param = $.extend({}, defaultParam, _param);
		
		var timer = null;
		
		this.start = function(){
			if(timer == null){
				console.log('启动广告拦截器');
				timer = setInterval(function(){
					$.each(param.filter(), function(i, e){
						console.log(e);
						console.log('检测到广告，将拦截');
						$(e).remove();
					});
				}, param.interval);
			}
		};
		
		this.stop = function(){
			if(timer != null){
				console.log('关闭广告拦截器');
				clearInterval(timer);
				timer = null;
			}
		};
		
	}
	
	module.exports = AdsBlock;
	
});