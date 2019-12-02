<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<link type="text/css" rel="stylesheet" href="media/admin/modules/css/modules-detail-tmpl.css" />
<title>用户详情</title>
<div class="entity-detail-tmpl entity-detail-page" id="user-detail-${entity.code }-${RES_STAMP}">
	<div class="page-header">
		<div class="header-title">
			<h1>用户详情</h1>
			<%-- <c:if test="${entity.errors != null && fn:length(entity.errors) > 0 }">
			    <h1 id="showErrors" class="fa fa-info-circle" style="cursor: pointer;color: #CD5C5C;"></h1>
			</c:if> --%>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a href="page:#tmpl-list.toggle" title="查看模板" class="toggle-template">
				<i class="iconfont icon-template"></i>
			</a>
			<a title="修改用户" href="admin/config/user/update/${dtmpl.id }" >
				<i class="glyphicon glyphicon-edit"></i>
			</a>
			<c:if test="${hasHistory == true }">
				<a href="page:#timeline-area.toggle" title="查看历史" class="toggle-timeline btn-toggle">
					<i class="iconfont icon-historyrecord"></i>
				</a>
			</c:if>
			<a class="export" title="导出" id="btn-export" href="javascript:;">
				<i class="glyphicon glyphicon-export"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="col-lg-offset-1 col-lg-10">
			<form class="form-horizontal group-container">
				<c:forEach var="tmplGroup" items="${dtmpl.groups }">
					<div class="widget field-group">
						<div class="widget-header">
							<span class="widget-caption">
								<span class="group-title">${tmplGroup.title }</span>
							</span>
							<c:if test="${tmplGroup.isArray == 1 && !empty entity.arrayMap[tmplGroup.composite.name]}">
								<div class="widget-buttons keyword-search-container">
									<span class="input-icon">
										<input type="text" class="form-control input-xs" placeholder="关键字">
										<i class="glyphicon glyphicon-search blue"></i>
									</span>
								</div>
							</c:if>
						</div>
						<div class="widget-body field-container">
							<c:choose>
								<c:when test="${tmplGroup.isArray != 1 }">
									<c:forEach var="tmplField" items="${tmplGroup.fields }">
										<div class="form-group field-item ${tmplField.fieldAvailable? '': 'field-unavailable' } ${tmplField.colNum == 2? 'dbcol': '' }"
											title="${tmplField.fieldAvailable? '': '无效字段' }">
											<label class="control-label field-title">${tmplField.title }</label>
											<div class="field-value">
												<span class="field-view" field-type="${tmplField.type }">${tmplField.fieldAvailable? entity.smap[tmplField.fieldName]: '' }</span>
											</div>
										</div>
									</c:forEach>
								</c:when>
								<c:otherwise>
									<div class="table-scrollable field-array-table">
										<table class="table table-striped table-bordered table-hover">
											<thead>
												<tr class="title-row">
													<th>序号</th>
													<c:if test="${tmplGroup.relationSubdomain != null }">
														<th class="sorting">关系</th>
													</c:if>
													<c:forEach var="field" items="${tmplGroup.fields }">
														<th class="${field.fieldAvailable? field.type == 'file'? '': 'sorting': 'field-unavailable'}" 
															title="${field.fieldAvailable? '': '无效字段' }"
															field-type="${field.type }">${field.title }</th>
													</c:forEach>
												</tr>
											</thead>
											<tbody>
												<c:forEach var="entityItem" varStatus="i" items="${entity.arrayMap[tmplGroup.composite.name] }">
													<tr class="value-row" origin-order="${i.index }">
														<td>${i.index + 1 }</td>
														<c:if test="${tmplGroup.relationSubdomain != null }">
															<c:set var="relationName" value="${tmplGroup.composite.name }.$$label$$" />
															<td>${entityItem.smap[relationName] }</td>
														</c:if>
														<c:forEach var="field" items="${tmplGroup.fields }">
															<td class="${field.fieldAvailable? '': 'field-unavailable'}" field-type="${field.type }">${field.fieldAvailable? entityItem.smap[field.fieldName] : ''}</td>
														</c:forEach>
													</tr>
												</c:forEach>
											</tbody>
										</table>
									</div>
								</c:otherwise>
							</c:choose>
						</div>
					</div>
				</c:forEach>
			</form>
		</div>
	</div>
	<div id="timeline-area" class="blur-hidden" style="display: none;">
		<div class="timeline-wrapper">
			<div class="VivaTimeline">
				<dl>
					<dt><a href="#" class="show-more-history">查看更多</a></dt>
				</dl>
			</div>
		</div>
	</div>
	<div id="tmpl-list" style="display: none;">
		<ul class="tmpl-list-wrapper">
			<c:if test="${dtmpl != null }">
				<li data-id="${dtmpl.id }" class="active">
					<span class="tmpl-icon"><i class="fa fa-lightbulb-o"></i></span>
					<span class="tmpl-item-body">
						<span class="tmpl-name">${dtmpl.title }</span>
						<span class="tmpl-date"><fmt:formatDate value="${dtmpl.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </span>
					</span>
				</li>
			</c:if>
			<c:forEach var="dtmplItem" items="${dtmpls }">
				<c:if test="${dtmplItem.id != dtmpl.id }">
					<li data-id="${dtmplItem.id }">
						<span class="tmpl-icon"><i class="fa fa-lightbulb-o"></i></span>
						<span class="tmpl-item-body">
							<span class="tmpl-name">${dtmplItem.title }</span>
							<span class="tmpl-date"><fmt:formatDate value="${dtmplItem.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </span>
						</span>
					</li>
				</c:if>
			</c:forEach>
		</ul>
		<div class="tmpl-operate">
			<a class="tab" title="配置模板" target="user_dtmpl_config" href="admin/tmpl/dtmpl/list/${dtmpl.module }"><i class="icon glyphicon glyphicon-cog"></i></a>
		</div>
	</div>
</div>
<script>
	seajs.use(['modules/js/modules-detail.js'], function(ModulesDetail){
		var $page = $('#user-detail-${entity.code }-${RES_STAMP}');
		ModulesDetail.init(
				$page,
				'${entity.code}',
				{type:'user', dtmplId: '${dtmpl.id}', historyId: '${history.id}'},
				'${historyId}');
		
	});
</script>