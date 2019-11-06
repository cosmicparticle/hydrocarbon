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
<link type="text/css" rel="stylesheet"
	href="media/admin/tmpl/css/tmpl-group-update.css" />
<div id="jtmpl-update-${jtmpl.id }" class="jtmpl-update">
	<script type="jquery/tmpl" id="ks-criteria-row">
	<tr on-render="">
		<td>
			<select on-change="do:setCriteria('source', criteria)" on-render="do:initCriteriaValue('source', criteria.source, criteria)">
				<!-- <option value="path-var">路径参数</option> -->
				<option value="param">请求参数</option>
			</select>
		</td>
		<td class="form-group">
				<input class="form-control" type="text" on-change="do:setCriteria('name', criteria)" value="${criteria.name || ''}" 
				name="${criteria.uuid}"  />
		</td>
		<td>
			<select class="form-control" on-change="do:setCriteria('ltmplFieldId', criteria)" on-render="do:initCriteriaValue('ltmplFieldId', criteria.ltmplFieldId, criteria)">
				{{each(i, field) ltmplCriteraFields}}
					<option value="${field.id}">${field.title}</option>
				{{/each}}
			</select>
		</td>
		<td>
			<a class="btn btn-danger btn-xs" on-click="do:removeCriteria(criteria)">移除</a>
		</td>
	</tr>
</script>
	
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
							action="admin/tmpl/jtmpl/save">
							<div class="widget field-group">
								<div class="widget-header">
									<span class="widget-caption"> <span class="group-title">基本信息</span>
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="id" value="${jtmpl.id }" /> <input
										type="hidden" name="module" value="${module.name }" />
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" for="name">名称</label>
												<div class="col-lg-8">
													<input type="text" data-bv-notempty="true"
														data-bv-notempty-message="跳转模板名称必填" class="form-control"
														name="title" value="${jtmpl.title }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" for="name">路径</label>
												<div class="col-lg-8">
													<input type="text" class="form-control" name="url"
														value="${jtmpl.url }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" for="name">详情模板</label>
												<div class="col-lg-8">
													<a class="form-control"
														href="admin/tmpl/dtmpl/choose/${module.name }"
														title="选择详情模板" choose-key="choose-dtmpl"
														crn-choose-dtmpl="title">${jtmpl.detailTemplateId != null? jtmpl.detailTemplateTitle: '选择详情模板' }</a>
													<input type="hidden" crn-choose-dtmpl="id"
														name="detailTemplateId" value="${jtmpl.detailTemplateId }" />
												</div>
											</div>
										</div>
									</div>

									<div class="widget requestparam">
										<div class="widget-header">
											<span class="widget-caption"> 跳转参数配置 </span>
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
	seajs.use([ 'tmpl/js/jtmpl-update', 'utils' ], function(JtmplUpdate,
			Utils) {
		var $page = $('#jtmpl-update-${jtmpl.id }');
		console.log($page);
		var premisesJson = [];
		var actions = [];
		var tmplActions = [];
		var atmpls = [];
		try {
			premisesJson = Utils.parseJSON('${premisesJson}') || [];
			tmplActions = Utils.parseJSON('${tmplActions}') || [];
			atmpls = Utils.parseJSON('${atmpls}') || [];
		} catch (e) {
			console.log(e)
		}
		JtmplUpdate.init($page, '${module.name}', premisesJson, {
			tmplActions : tmplActions,
			atmpls : atmpls
		});
	});
</script>
<div></div>