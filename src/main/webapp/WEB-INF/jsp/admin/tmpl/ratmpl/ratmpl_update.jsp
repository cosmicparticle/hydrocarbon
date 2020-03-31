<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${ratmpl != null }">修改${module.title }跳转模板-${ratmpl.title }</c:when>
		<c:otherwise>创建跳转模板</c:otherwise>
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
														data-bv-notempty-message="跳转模板名称必填" class="form-control"
														name="title" value="${ratmpl.title }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-10">
											<div class="form-group">
												<label class="col-lg-2 control-label" for="name">路径</label>
												<div class="col-lg-10">
													<input type="text" class="form-control" name="path"
														value="${ratmpl.path }" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="widget ">
								<div class="widget-header">
									<span class="widget-caption"> 跳转参数配置 </span>

									<div class="widget-buttons">
										<div class="input-icon field-search">
											<span class="search-input-wrapper"> <input type="text"
												class="search-text-input form-control input-xs glyphicon-search-input"
												autocomplete="off" placeholder="输入添加的字段名">
											</span> <i class="glyphicon glyphicon-search blue"></i> <i
												title="选择字段"
												class="glyphicon glyphicon-th blue field-picker-button"></i>
										</div>
									</div>
								</div>
								<div class="widget-body form-group">
									<div class="">
										<table class="table table-hover table-bordered">
											<thead>
												<tr>
													<th>参数类型</th>
													<th>参数名</th>
													<th>对应字段</th>
													<th>操作</th>
												</tr>
											</thead>
											<tbody id="ratmpl-param-rows" on-prepare="ratmpl-param-rows;">
											</tbody>
										</table>
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
				var params = [];
				try {
					params = Utils.parseJSON('${params}') || [];
				} catch (e) {
					console.log(e)
				}
				ratmplUpdate.init($page, '${module.name}', {
					params : params
				});
			});
</script>
<div></div>