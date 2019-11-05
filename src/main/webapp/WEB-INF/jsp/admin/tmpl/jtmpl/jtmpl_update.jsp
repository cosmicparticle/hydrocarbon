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
<div id="tmpl-group-update-${jtmpl.id }" class="tmpl-group-update">
	<script type="jquery/tmpl" id="tmpl-field">
		<div class="form-group field-item field-id="\${fieldId}" data-id="\${id}">
			<label class="control-label field-title">\${title}</label>
			<div class="field-value">
				<span class="field-view"></span>
			</div>
			<div class="operate-buttons">
				<a class="remove-field" title="删除字段"><i class="fa fa-trash-o"></i></a>
			</div>
		</div>
	</script>
	<script type="jquery/tmpl" id="tmpl-action">
		<tr>
			<td>\${index + 1 }</td>
			<td><input class="action-title" type="text" value="\${title }" /></td>
			{{if multiple}}
				<td>
					<select class="multiple">
						<option value="2">事务型多选</option>
						<option value="1">多选</option>
						<option value="0">单选</option>
					</select>
				</td>
			{{else}}
				<td>
					<label>
                        <input class="outgoing" type="checkbox" class="colored-blue">
                        <span class="text"></span>
                    </label>
				</td>
			{{/if}}
			<td>
				<div class="btn-icon-selector" data-icon="">
					{{if iconClass !== ''}}
						<i class="\${iconClass}"></i>
					{{/if}}
				</div>
			</td>
			<td>
				<a class="btn btn-danger btn-xs delete">
					<i class="fa fa-trash-o"></i>
					删除
				</a>
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
												<label class="col-lg-4 control-label" for="name">URL</label>
												<div class="col-lg-8">
													<input type="text"  class="form-control"
														name="url" value="${jtmpl.url }" />
												</div>
											</div>
									</div>
									</div>
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" for="name">默认编码</label>
												<div class="col-lg-8">
													<input type="text" class="form-control" name="defualtCode"
														value="${jtmpl.defualtCode }" />
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
														crn-choose-dtmpl="title">${jtmpl.detailTemplateId != null? group.detailTemplateTitle: '选择详情模板' }</a>
													<input type="hidden" crn-choose-dtmpl="id"
														name="detailTemplateId" value="${jtmpl.detailTemplateId }" />
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
	seajs.use([ 'tmpl/js/tmpl-group-update', 'utils' ], function(
			TmplGroupUpdate, Utils) {
		var $page = $('#tmpl-group-update-${jtmpl.id }');
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
		TmplGroupUpdate.init($page, '${module.name}', premisesJson, {
			tmplActions : tmplActions,
			atmpls : atmpls
		});
	});
</script>
<div></div>