<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<link type="text/css" rel="stylesheet" href="media/admin/modules/css/modules-selection.css" />
<c:set var="module" value="${view.module }" />
<c:set var="templateGroup" value="${view.module }" />
<c:set var="ltmpl" value="${view.selectionTemplate }" />
<div id="selections-${RES_STAMP}" class="detail modules-selection">
	<div class="page-body">
		<form class="form-inline"  action="admin/config/user/open_selection/${stmpl.id}">
			<input type="hidden" id="tmplId" name="tmplId" value="${stmpl.id }" />
			<c:if test="${not empty stmpl.criterias }">
				<c:forEach var="criteriaItem" items="${stmpl.criterias }">
					<c:if test="${criteriaItem.queryShow != null }">
						<div class="form-group ${criteriaItem.fieldAvailable? '': 'criteria-field-unavailable'}"
							title="${criteriaItem.fieldAvailable? '': '无效字段'}">
							<label class="control-label">${criteriaItem.title }</label>
							<c:if test="${criteriaItem.fieldAvailable }">
								<c:choose>
									<c:when test="${criteriaItem.inputType == 'text' }">
										<input class="form-control" type="text" name="criteria_${criteriaItem.id }" value="${criteria.selectionTemplateCriteria[criteriaItem.id]}" placeholder="${criteriaItem.placeholder }" />
									</c:when>
									<c:when test="${criteriaItem.inputType == 'select' }">
										<select class="form-control" name="criteria_${criteriaItem.id }" data-value="${criteria.selectionTemplateCriteria[criteriaItem.id]}">
											<option value="">--请选择--</option>
											<c:forEach var="option" items="${view.criteriaOptionMap[criteriaItem.fieldId]}">
												<option value="${option.value }">${option.title}</option>
											</c:forEach>								
										</select>
									</c:when>
									<c:when test="${criteriaItem.inputType == 'multiselect' }">
										<select class="form-control cpf-select2 format-submit-value" name="criteria_${criteriaItem.id }" multiple="multiple" data-value="${criteria.selectionTemplateCriteria[criteriaItem.id]}">
											<c:forEach var="option" items="${view.criteriaOptionMap[criteriaItem.fieldId]}">
												<option value="${option.value }">${option.title}</option>
											</c:forEach>								
										</select>
									</c:when>
									<c:when test="${criteriaItem.inputType == 'date' }">
										<input class="form-control datepicker" autocomplete="off" type="text" name="criteria_${criteriaItem.id }" value="${criteria.selectionTemplateCriteria[criteriaItem.id]}"  />
									</c:when>
									<c:when test="${criteriaItem.inputType == 'label' }">
										<span class="cpf-select2-container">
											<select class="cpf-select2 format-submit-value" name="criteria_${criteriaItem.id }" multiple="multiple" data-value="${criteria.selectionTemplateCriteria[criteriaItem.id]}">
												<c:forEach var="label" items="${view.criteriaLabelMap[criteriaItem.fieldKey].subdomain}">
													<option value="${label }">${label}</option>
												</c:forEach>								
											</select>
											<c:choose>
												<c:when test="${criteriaItem.comparator == 'l1' }">
													<c:set var="labelSelectClass" value="cpf-select2-sign-or"></c:set>
												</c:when>
												<c:when test="${criteriaItem.comparator == 'l2' }">
													<c:set var="labelSelectClass" value="cpf-select2-sign-and"></c:set>
												</c:when>
											</c:choose>
											<span class="cpf-select2-sign ${labelSelectClass }"></span>
										</span>
									</c:when>
									<c:when test="${criteriaItem.inputType == 'daterange' }">
										<span class="cpf-daterangepicker format-submit-value" 
											data-name="criteria_${criteriaItem.id }" 
											data-value="${criteria.selectionTemplateCriteria[criteriaItem.id]}">
										</span>
									</c:when>
									<c:otherwise>
										<input type="text" disabled="disabled" placeholder="没有配置对应的控件${criteriaItem.inputType }" />
									</c:otherwise>
								</c:choose>
							</c:if>
						</div>
					</c:if>
				</c:forEach>
				<div class="form-group">
					<button type="submit" class="form-control btn btn-default" title="${hidenCriteriaDesc }">查询</button>
				</div>
			</c:if>
		</form>
		<div class="row list-area">
			<table class="table">
				<thead>
					<tr>
						<c:forEach items="${stmpl.columns }" var="column">
							<th class="${column.fieldAvailable? '': 'col-field-unavailable' }"
								title="${column.fieldAvailable? '': '无效字段'}">${column.title }</th>
						</c:forEach>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${view.parsers }" var="parser" varStatus="i">
						<tr data-code="${parser.code }">
							<c:forEach items="${ltmpl.columns }" var="column" varStatus="j" >
								<td class="${column.fieldAvailable? '': 'col-field-unavailable' }">
									<c:choose >
										<c:when test="${column.specialField == 'number' }">
											${i.index + 1 }
										</c:when>
										<c:otherwise>
											${column.fieldAvailable? parser.smap[column.fieldKey] : '' }
										</c:otherwise>
									</c:choose>
								</td>
							</c:forEach>
						</tr>
					</c:forEach>
				</tbody>
			</table>
			<div class="cpf-paginator" pageNo="${criteria.pageInfo.pageNo }" pageSize="${criteria.pageInfo.pageSize }" count="${criteria.pageInfo.count }"></div>
		</div>
	</div>
</div>
<div class="modal-footer">
	<div class="row">
		<div class="col-lg-3 col-lg-offset-4">
			<input id="submit" class="btn btn-primary btn-block submit" type="button" value="确定" /> 
		</div>
	</div>
</div>
<script>
	seajs.use(['modules/js/modules-selection.js'], function(ModulesSelection){
		var $page = $('#selections-${RES_STAMP}');
		ModulesSelection.init($page, '${module.name}', 
			{type: 'atmpl', stmplId: '${stmpl.id}'}, {
				pageNo	: '${criteria.pageInfo.pageNo}',
				pageSize: '${criteria.pageInfo.pageSize}'
			}, 1
		);
	});
</script>