define(function(require, exports, module){
	"use strict";
	
	/**
	 * pageInfo包含以下字段
	 * 		pageSize
	 *		pageNo
	 *		virtualEndPageNo
	 *		 	
	 */
	function Paginator(_param){
		var defParam = {
			$plh		: null,
			goPage		: $.noop
		}
		var param = $.extend({}, defParam, _param);
		this.totalCount = null;
		this.pageSize = 10;
		this.pageNo = 1;
		this.endPageNo = param.endPageNo;
		this.queryKey = null;
		
		var that = this;
		
		
		function queryPage(pageNo, pageSize){
			if(pageNo) that.pageNo = pageNo;
			if(pageSize) that.pageSize = pageSize;
			that.render();
			param.goPage(that.pageNo, that.pageSize);
		}
		this.render = function(){
			if(this.totalCount != null){
				this.endPageNo = Math.ceil(this.totalCount / this.pageSize);
			}
			var pageNos = generatePageNos(this.pageNo, this.endPageNo);
			require('tmpl').load('media/jv/entity/tmpl/entity-paginator.tmpl').done(function(tmplMap){
				tmplMap['paginator'].replaceFor(param.$plh, {
					pageNo		: that.pageNo,
					pageNos		: pageNos,
					totalCount	: that.totalCount
				}, {
					goPage		: function(pageNo){
						queryPage(pageNo);
					},
					changePageSize	: function(){
						var pageSize = $(this).val();
						queryPage(1, pageSize);
					},
					viewCount		: function(){
						var $this = $(this);
						if(!$this.is('.counted')){
							require('ajax').ajax('api2/entity/curd/get_entities_count/' + that.queryKey, function(data){
								if(data.status === 'suc'){
									that.totalCount = data.count;
									that.render();
								}
							});
						}
					},
					goPageTo		: function(){
						var $paginator = $(this).closest('cpf-paginator');
						var pageNo = $('.cpf-paginator-jump-text', $paginator).val();
						if(require('utils').isInteger(pageNo)){
							queryPage(pageNo);
						}
					}
				}, function($paginator){
					$('.page-size-select', $paginator).val(that.pageSize);
				});
			})
			
		}
	}
	
	
	var maxPageCount = 5;
	var lastPageCount = 1;
	
	function generatePageNos(pageNo, pageCount){
		var frontShowBegin = 1, frontShowEnd = pageCount, endShowBegin = undefined;
		if(pageCount > maxPageCount){
			//超过最大显示页数时，只显示部分页数
			//前面显示的页数必须是奇数，如果不是奇数，将会自动减1
			var frontPageCount = maxPageCount - lastPageCount - 1;
			if(frontPageCount%2 == 0){
				frontPageCount--;
			}
			//扣除最后页数和省略符号，剩余的是当前页号旁边显示的页号
			var halfFrontShowCount = (frontPageCount + 1) / 2;
			if(pageNo <= halfFrontShowCount){
				//在前半段，能直接显示第1个页号
				frontShowEnd = frontPageCount;
			}else if(pageNo >= pageCount - halfFrontShowCount){
				//在后半段，能直接显示到最后一个页号
				frontShowBegin = pageCount - maxPageCount + 1;
				frontShowEnd = pageCount;
			}else{
				//在中间，只显示当前页号旁边的几个页号和最后几个页号
				frontShowBegin = pageNo - halfFrontShowCount + 1;
				frontShowEnd = pageNo + halfFrontShowCount - 1;
			}
			if(frontShowEnd < pageCount - lastPageCount){
				endShowBegin = pageCount - lastPageCount + 1;
			}
		}
		var frontPageNos = [], endPageNos = undefined;
		for(var i= frontShowBegin; i <= frontShowEnd; i++){
			frontPageNos.push(i);
		}
		if(endShowBegin){
			endPageNos = [];
			for(var i = endShowBegin; i <= pageCount; i++){
				endPageNos.push(i);
			}
		}
		return {frontPageNos, endPageNos};
	}
	
	module.exports = Paginator;
});