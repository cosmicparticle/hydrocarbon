<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${jtmpl != null }">修改${module.title }跳转模板-${jtmpl.title }</c:when>
		<c:otherwise>创建跳转模板</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<div id="jtmpl-edit-${RES_STAMP }" class="jtmpl-edit">
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a title="保存" on-click="savejtmpl"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>跳转模板编辑</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler"
				href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="col-lg-offset-1 col-lg-10">
			<form class="bv-form validate-form" on-prepare="form">
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption"> 定义 </span>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">名称</label> <input
									class="form-control" type="text"
									on-prepare="title ; originKs:title" name="title"
									data-bv-notempty="true" data-bv-notempty-message="名称必填" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">路径</label> <input
									class="form-control" type="text"
									on-prepare="path ; originKs:path" name="url"
									data-bv-notempty="true" data-bv-notempty-message="url必填" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">默认唯一编码</label> <input
									class="form-control" type="text"
									on-prepare="path ; originKs:path" name="defaultcode" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">详情模板</label> <select
									class="form-control cpf-select2"
									on-prepare="dtmpl ; originKs,modules:originKs.detailTemplateId"
									on-change="changeDtmpl"></select>
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-12">
								<label class="control-label">描述</label>
								<textarea class="form-control" rows="3"
									on-prepare="description ; originKs:description"></textarea>
							</div>
						</div>
					</div>
				</div>
				<div class="widget requestparam">
					<div class="widget-header">
						<span class="widget-caption"> 请求参数配置 </span>
						<div class="widget-buttons buttons-bordered">
							<input disabled="disabled" type="button"
								class="btn btn-blue btn-xs" on-prepare="btn-add-param"
								on-click="addParam" value="添加" />
						</div>
					</div>
					<div class="widget-body">
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
								<tbody on-prepare="jump-param-rows;">
								</tbody>
							</table>
						</div>
					</div>
				</div>

			</form>
		</div>
	</div>
</div>
<script>
	seajs.use([ 'config/js/jtmpl-edit' ], function(JtmplEdit) {
		var $page = $('#jump-edit-${RES_STAMP}');
		JtempEdit.init({
			$page : $page,
			jtmplId : '${jtmplId}'
		});
	});
</script>