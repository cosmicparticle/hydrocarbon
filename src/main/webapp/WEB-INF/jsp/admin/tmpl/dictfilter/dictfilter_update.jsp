<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${filter != null }">修改${module.title }字段过滤器-${filter.title }</c:when>
		<c:otherwise>创建${module.title }字段过滤器</c:otherwise>
	</c:choose>
</c:set>


<title>${title }</title>
<div id="dictfilter-update-${module.name}-${filter.id }" class="dtmpl-update">
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" class="btn-save" title="保存"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="detail">
		<div class="page-header">
			<div class="header-title">
				<h1>${title }</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
					<i class="glyphicon glyphicon-refresh"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="row">
				<div class="col-lg-offset-1 col-sm-offset-1 col-xs-offset-1 col-lg-10 col-sm-10 col-xs-10" id="group-container">
					<form class="bv-form form-horizontal validate-form" action="admin/tmpl/dictfilter/save">
						<div class="widget field-group">
							<div class="widget-header">
								<span class="widget-caption"> <span class="group-title">过滤器</span>
								</span>
							</div>
							<div class="widget-body">
								<input type="hidden" name="id" value="${filter.id }" />
								<input type="hidden" name="module" value="${module.name }" />
								<div class="row">
									<div class="col-lg-12">
										<div class="form-group"> 
											<label class="col-lg-2 control-label" for="name">名称</label>
											<div class="col-lg-6">
												<input type="text"
												data-bv-notempty="true"
												data-bv-notempty-message="字段过滤器名称必填"
												class="form-control" name="title" value="${filter.title }" />
											</div>
										</div>
										<div class="form-group"> 
											<label class="col-lg-2 control-label" for="name">表达式</label>
											<div class="col-lg-6">
												<textarea name="express" class="form-control" spellcheck ="false" rows="10" style="font-family: consolas;resize:none;">${filter.express }</textarea>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	console.log(1);
	seajs.use(['tmpl/js/dictfilter-update.js'], function(DictFilter){
		var $page = $('#dictfilter-update-${module.name}-${filter.id }');
		console.log($page);
		DictFilter.initPage($page);
	});
</script>
<div></div>