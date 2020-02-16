<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<link type="text/css" rel="stylesheet"
	href="media/admin/modules/css/modules-list-tmpl.css" />
<c:set var="module" value="${view.module }" />
<c:set var="ltmpl" value="${view.listTemplate }" />
<div id="${module.name }-list-tmpl-${RES_STAMP}"
	class="detail module-list-tmpl">
	<div class="page-header">
		<div class="header-title">
			<h1>${menu.title }-列表</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler"
				href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
			</a>
			<c:if
				test="${tmplGroup.treeTemplateId != null && tmplGroup.hideTreeToggleButton == null }">
				<a class="tab" id="btn-toggle-tree"
					href="admin/modules/curd/list_tree/${menu.id }"
					target="modules_list_tree_${menu.id }"> <i
					class="iconfont icon-tree"></i>
				</a>
			</c:if>
			<c:if test="${tmplGroup.hideExportButton == null }">
				<a class="export btn-toggle" title="导出" id="btn-export "
					href="page:#export-window.toggle"> <i
					class="glyphicon glyphicon-export"></i>
				</a>
			</c:if>
			<c:if test="${moduleWritable }">
				<c:if test="${tmplGroup.hideImportButton == null }">
					<a class="import tab" href="admin/modules/import/go/${menu.id }"
						title="导入" target="module_${module.name }_import"> <i
						class="glyphicon glyphicon-import"></i>
					</a>
				</c:if>
				<c:if test="${tmplGroup.hideCreateButton == null }">
					<a class="tab" href="admin/modules/curd/add/${menu.id }" title="创建"
						target="module_${module.name }_add"> <i class="fa fa-plus"></i>
					</a>
				</c:if>
			</c:if>
		</div>
	</div>
	<div class="page-body">
		<form class="form-inline" action="admin/modules/curd/list/${menu.id }">
			<input type="hidden" id="tmplId" name="tmplId" value="${ltmpl.id }" />
			<c:forEach var="criteriaItem" items="${ltmpl.criterias }">
				<c:if test="${criteriaItem.queryShow != null }">
					<div
						class="form-group ${criteriaItem.fieldAvailable? '': 'criteria-field-unavailable'}"
						title="${criteriaItem.fieldAvailable? '': '无效字段'}">
						<label class="control-label">${criteriaItem.title }</label>
						<c:if test="${criteriaItem.fieldAvailable }">
							<c:choose>
								<c:when test="${criteriaItem.inputType == 'text' }">
									<input class="form-control" type="text"
										name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}"
										placeholder="${criteriaItem.placeholder }" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'select' }">
									<select class="form-control cpf-select2"
										name="criteria_${criteriaItem.id }"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
										<option value="">--请选择--</option>
										<c:forEach var="option"
											items="${view.criteriaOptionMap[criteriaItem.fieldId]}">
											<option value="${option.value }">${option.title}</option>
										</c:forEach>
									</select>
								</c:when>
								<c:when test="${criteriaItem.inputType == 'multiselect' }">
									<select class="form-control cpf-select2 format-submit-value"
										name="criteria_${criteriaItem.id }" multiple="multiple"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
										<c:forEach var="option"
											items="${view.criteriaOptionMap[criteriaItem.fieldId]}">
											<option value="${option.value }">${option.title}</option>
										</c:forEach>
									</select>
								</c:when>
								
								<c:when test="${criteriaItem.inputType == 'caselect' }">
									<select class="form-control cpf-select2 format-submit-value"
										name="criteria_${criteriaItem.id }" multiple="multiple"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
										<c:forEach var="option"
											items="${view.criteriaOptionMap[criteriaItem.fieldId]}">
											<option value="${option.value }">${option.title}</option>
										</c:forEach>
									</select>
								</c:when>
								
								<c:when test="${criteriaItem.inputType == 'date' }">
									<input class="form-control datepicker" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'label' }">
									<span class="cpf-select2-container"> <select
										class="cpf-select2 format-submit-value"
										name="criteria_${criteriaItem.id }" multiple="multiple"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
											<c:forEach var="label"
												items="${view.criteriaLabelMap[criteriaItem.fieldKey].subdomain}">
												<option value="${label }">${label}</option>
											</c:forEach>
									</select> <c:choose>
											<c:when test="${criteriaItem.comparator == 'l1' }">
												<c:set var="labelSelectClass" value="cpf-select2-sign-or"></c:set>
											</c:when>
											<c:when test="${criteriaItem.comparator == 'l2' }">
												<c:set var="labelSelectClass" value="cpf-select2-sign-and"></c:set>
											</c:when>
										</c:choose> <span class="cpf-select2-sign ${labelSelectClass }"></span>
									</span>
								</c:when>
								<c:when
									test="${criteriaItem.inputType == 'relation_existion' && criteriaItem.composite != null }">
									<span class="cpf-select2-container"> <select
										class="cpf-select2 format-submit-value"
										name="criteria_${criteriaItem.id }" multiple="multiple"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
											<c:forEach var="label"
												items="${criteriaItem.composite.relationSubdomain}">
												<option value="${label }">${label}</option>
											</c:forEach>
									</select>
									</span>
								</c:when>
								<c:when test="${criteriaItem.inputType == 'daterange' }">
									<span class="cpf-daterangepicker format-submit-value"
										data-name="criteria_${criteriaItem.id }"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
									</span>
								</c:when>
								<c:when test="${criteriaItem.inputType == 'range' }">
									<span class="cpf-textrange format-submit-value"
										data-name="criteria_${criteriaItem.id }"
										data-value="${criteria.templateCriteriaMap[criteriaItem.id]}">
									</span>
								</c:when>
								<c:when test="${criteriaItem.inputType == 'datetime' }">
									<input class="form-control datetimepicker" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'time' }">
									<input class="form-control timepicker" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'yearmonth' }">
									<input class="form-control yearmonthpicker" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'ymrange' }">
									<input class="form-control ymrangepicker" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'decimal' }">
									<input class="form-control cpf-field-decimal"
										autocomplete="off" type="text"
										name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:when test="${criteriaItem.inputType == 'int' }">
									<input class="form-control cpf-field-int" autocomplete="off"
										type="text" name="criteria_${criteriaItem.id }"
										value="${criteria.templateCriteriaMap[criteriaItem.id]}" />
								</c:when>
								<c:otherwise>
									<input type="text" disabled="disabled"
										placeholder="没有配置对应的控件${criteriaItem.inputType }" />
								</c:otherwise>
							</c:choose>
						</c:if>
					</div>
				</c:if>
			</c:forEach>
			<div class="form-group">
				<c:if
					test="${not empty ltmpl.criterias and tmplGroup.hideQueryButton != 1}">
					<button type="submit" class="btn btn-default"
						title="${hidenCriteriaDesc }">查询</button>
				</c:if>
				<c:if test="${moduleWritable }">
					<c:if test="${tmplGroup.hideDeleteButton != 1 }">
						<button id="btn-delete" class="btn btn-danger" disabled="disabled">删除选中</button>
					</c:if>
				</c:if>
				<c:forEach items="${tmplGroup.actions }" var="action">
					<c:if test="${action.face == 'list' }">
						<button class="btn btn-azure shiny action-button"
							data-id="${action.id }" data-multiple="${action.multiple }"
							title="${action.title }" disabled="disabled">
							<c:if test="${!empty action.iconClass }">
								<i class="${action.iconClass }"></i>
							</c:if>
							${action.title }
						</button>
					</c:if>
				</c:forEach>
				<c:forEach items="${tmplGroup.jumps }" var="jump">
					<c:if test="${jump.face == 'list' }">
						<button class="btn btn-azure shiny jump-button"
							data-id="${jump.id }" data-multiple="${jump.multiple }"
							title="${jump.title }" disabled="disabled">
							<c:if test="${!empty jump.iconClass }">
								<i class="${jump.iconClass }"></i>
							</c:if>
							${jump.title }
						</button>
					</c:if>
				</c:forEach>
			</div>
		</form>
		<div class="row list-area">
			<table class="table row-selectable">
				<thead>
					<tr>
						<th width="30"><label title="全选"> <input
								type="checkbox" class="colored-blue select-all partly">
								<span class="text"></span>
						</label></th>
						<c:forEach items="${ltmpl.columns }" var="column">
							<th
								class="${column.fieldAvailable? '': 'col-field-unavailable' }"
								title="${column.fieldAvailable? '': '无效字段'}">${column.title }</th>
						</c:forEach>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${view.parsers }" var="parser" varStatus="i">
						<tr data-code="${parser.code }">
							<td><label> <input type="checkbox"
									class="colored-blue row-selectable-checkbox"> <span
									class="text"></span>
							</label></td>
							<c:forEach items="${ltmpl.columns }" var="column" varStatus="j">
								<td
									class="${column.fieldAvailable? '': 'col-field-unavailable' }">
									<c:choose>
										<c:when test="${column.specialField == 'number' }">
											${i.index + 1 }
										</c:when>
										<c:when
											test="${fn:startsWith(column.specialField, 'operate')}">
											<c:if test="${fn:contains(column.specialField, '-d') }">
												<a
													href="admin/modules/curd/detail/${menu.id}/${parser.code}"
													target="module_detail_${menu.id }_${parser.code }"
													title="详情-${parser.title }"
													class="tab btn btn-success btn-xs"> <i
													class="fa fa-book"></i>详情
												</a>
											</c:if>
											<c:if test="${moduleWritable }">
												<c:if test="${fn:contains(column.specialField, '-u') }">
													<a target="module_update_${menu.id }_${parser.code }"
														title="修改-${parser.title }"
														href="admin/modules/curd/update/${menu.id }/${parser.code }"
														class="tab btn btn-info btn-xs edit"> <i
														class="fa fa-edit"></i>修改
													</a>
												</c:if>
											</c:if>
										</c:when>
										<c:otherwise>
											<c:choose>
												<c:when
													test="${column.viewOption == 'relselect' || column.viewOption == 'refselect'}">
																${column.fieldAvailable? parser.smap[column.fieldKey].split('@R@')[1] : '' }
												</c:when>
												<c:otherwise>
														${column.fieldAvailable? parser.smap[column.fieldKey] : '' }
												</c:otherwise>
											</c:choose>
										</c:otherwise>
									</c:choose>
								</td>
							</c:forEach>
						</tr>
					</c:forEach>
				</tbody>
			</table>
			<div class="cpf-paginator" pageNo="${criteria.pageInfo.pageNo }"
				pageSize="${criteria.pageInfo.pageSize }"
				count="${criteria.pageInfo.count }"></div>
		</div>
	</div>
	<div id="export-window" class="detail-toggle-sublist blur-hidden"
		style="display: none;">
		<div class="detail-toggle-sublist-wrapper">
			<div class="export-window-title">
				<h3>导出</h3>
				<label> <input id="with-detail" type="checkbox"
					class="colored-blue"> <span class="text">详情</span>
				</label>
			</div>
			<div class="row external-export-message" style="display: none">
				<p>
					检测到功能模块（<a class="without-refresh" id="export-menu-link"></a>）正在执行导出工作
				</p>
			</div>
			<div class="row range-toggle">
				<label class="col-lg-6"> <input id="export-current-page"
					type="radio" class="colored-blue" checked="checked"> <span
					class="text">导出当前页</span>
				</label> <label class="col-lg-6"> <input id="export-all"
					type="radio" class="colored-blue"> <span class="text">导出所有</span>
				</label>
			</div>
			<div class="row data-range" style="display: none;">
				<label class="col-lg-4">数据范围：</label>
				<div class="col-lg-8">
					<input type="number" title="不填写开始序号时，将从1开始" id="export-range-start"
						placeholder="开始序号" /> - <input type="number"
						title="不填写结束序号时，将到最后结束" id="export-range-end" placeholder="结束序号" />
				</div>
			</div>
			<div class="row export-operate-area">
				<div class="col-lg-offset-2 col-lg-4">
					<input type="button" id="do-export" class="btn btn-xs btn-primary"
						value="开始导出" /> <input type="button" id="do-download"
						class="btn btn-xs btn-primary" value="下载导出文件" disabled="disabled"
						style="display: none" />
				</div>
				<div class="col-lg-2">
					<input type="button" id="do-break" class="btn btn-xs" value="取消导出"
						style="display: none;" />
				</div>
				<div id="export-progress"
					class="active progress progress-striped progress-xxs"
					style="display: none;">
					<div class="progress-bar progress-bar-orange" role="progressbar"
						aria-valuenow="0%" aria-valuemin="0" aria-valuemax="100"
						style="width: 0%"></div>
					<span class="progress-text">0%</span>
				</div>
			</div>
			<div id="export-msg" class="row" style="display: none;">
				<p></p>
			</div>
		</div>
	</div>
</div>
<!-- 用于标题中的文字在js中的 转义 -->
<c:set var="menuTitleInScript">
	${fn:replace(menu.title, '\\', '\\\\')}
</c:set>
<script>
	seajs
			.use(
					[ 'modules/js/modules-list.js' ],
					function(ModulesList) {
						var $page = $('#${module.name }-list-tmpl-${RES_STAMP}');
						ModulesList
								.init(
										$page,
										'${module.name}',
										'${menu.id}',
										'${menuTitleInScript}',
										{
											pageNo : '${criteria.pageInfo.pageNo}',
											pageSize : '${criteria.pageInfo.pageSize}'
										},
										{
											uuid : '${exportStatus.uuid}',
											withDetail : '${exportStatus.dataMap["withDetail"]}',
											scope : '${exportStatus.dataMap["exportPageInfo"].scope}',
											rangeStart : '${exportStatus.dataMap["exportPageInfo"].rangeStart}',
											rangeEnd : '${exportStatus.dataMap["exportPageInfo"].rangeEnd}'
										});
					});
</script>