<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${ratmpl != null }">修改${module.title }关系操作模板-${ratmpl.title }</c:when>
		<c:otherwise>创建关系操作模板</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<link type="text/css" rel="stylesheet"
	href="media/admin/tmpl/css/tmpl-group-update.css" />
<div id="ratmpl-update-${ratmpl.id }" class="ratmpl-update">


	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" class="btn-save" title="保存"><i
			class="fa fa-check-square"></i></a>
	</div>
	<div class="detail">
		<div class="page-header">
			<div class="header-title">
				<h1>${title }</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler"
					href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="row">
				<div class="row">
					<div
						class="col-lg-offset-1 col-sm-offset-1 col-xs-offset-1 col-lg-10 col-sm-10 col-xs-10"
						id="group-container">
						<form class="bv-form form-horizontal validate-form"
							action="admin/tmpl/ratmpl/save">
							<div class="widget field-group">
								<div class="widget-header">
									<span class="widget-caption"> <span class="group-title">基本信息</span>
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="id" value="${ratmpl.id }" /> <input
										type="hidden" name="module" value="${module.name }" />
									<div class="row">
										<div class="col-lg-10">
											<div class="form-group">
												<label class="col-lg-2 control-label" for="name">名称</label>
												<div class="col-lg-6">
													<input type="text" data-bv-notempty="true"
														data-bv-notempty-message="名称必填" class="form-control"
														name="title" value="${ratmpl.title }" />
												</div>
											</div>
										</div>
										<div class="col-lg-10">
											<div class="form-group">
												<label class="col-lg-2 control-label" for="name">关系类型</label>
												<div class="col-lg-6">
													<input type="text" data-bv-notempty="true"
														data-bv-notempty-message="关系类型必填" class="form-control"
														name="relationName" value="${ratmpl.relationName }" />
												</div>
											</div>
										</div>
										<div class="col-lg-10">
											<div class="form-group">
												<label class="col-lg-2 control-label" for="name">模板组合</label>
												<div class="col-lg-6">
													<input type="text" data-bv-notempty="true"
														data-bv-notempty-message="模板组合必填" class="form-control"
														name="groupId" value="${ratmpl.groupId }" />
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
</div>
<script>
	seajs.use([ 'tmpl/js/ratmpl-update', 'utils' ],
			function(ratmplUpdate, Utils) {
				var $page = $('#ratmpl-update-${ratmpl.id }');
				console.log($page);
				
				try {
					
				} catch (e) {
					console.log(e)
				}
				ratmplUpdate.init($page, '${module.name}', {	
				});
			});
</script>
<div></div>