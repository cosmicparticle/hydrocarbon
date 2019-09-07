<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>

<title>修改用户</title>
<div class="entity-detail-tmpl entity-update-page" id="user-update-${entity.code }-${RES_STAMP}">
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" title="保存"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="detail field-input-container">
		<div class="page-header">
			<div class="header-title">
				<h1>修改用户</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
					<i class="glyphicon glyphicon-refresh"></i>
				</a>
				<a href="page:#tmpl-list.toggle" title="查看模板" class="toggle-template">
					<i class="iconfont icon-template"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="col-lg-offset-1 col-lg-10">
				<form class="form-horizontal group-container" action="admin/config/user/save">
					<input type="hidden" name="${config.codeAttributeName }" value="${entity.code }" />
					
					<c:forEach var="tmplGroup" items="${dtmpl.groups }">
						<div class="widget field-group">
							<div class="widget-header">
								<span class="widget-caption">
									<span class="group-title">${tmplGroup.title }</span>
								</span>
							</div>
							<div class="widget-body field-container">
								<c:choose>
									<c:when test="${tmplGroup.isArray != 1 }">
										<c:forEach var="tmplField" items="${tmplGroup.fields }">
											<c:set var="premise" value="${groupPremisesMap[tmplField.fieldName] }" />
											<div class="form-group field-item ${tmplField.fieldAvailable? '': 'field-unavailable' } ${tmplField.colNum == 2? 'dbcol': '' }"
												title="${tmplField.fieldAvailable? '': '无效字段' }"
											>
												<div class="dtmpl-field-validates">
													<c:if test="${fn:contains(tmplField.validators, 'required')}">
														<i validate-name="required"></i>
													</c:if>
												</div>
												<label class="control-label field-title">${tmplField.title }</label>
												<div class="field-value"  value-field-name="${tmplField.fieldName }">
													<c:set var="fieldValue" value="${entity != null? entity.smap[tmplField.fieldName] : premise != null? premise.fieldValue: '' }" />
													<c:set var="fieldReadonly" 
															value="${tmplField.fieldAccess == '读'? 'true'
																	: tmplField.fieldAccess == '补'&& !empty fieldValue? 'true'
																		: ''  }" />
													<span class="field-input" 
														fInp-type="${tmplField.type }"
														fInp-name="${tmplField.fieldName }"
														fInp-value="${fieldValue }"
														fInp-optkey="${tmplField.optionGroupKey }"
														fInp-fieldkey="${module.name }@${tmplField.fieldName }"
														fInp-readonly="${fieldReadonly}"
													>
													</span>
												</div>
											</div>
										</c:forEach>
									</c:when>
									<c:otherwise>
										<div class="table-scrollable field-array-table">
											<table class="table table-striped table-bordered table-hover">
												<thead>
													<tr class="title-row">
														<th
															fname-format="${tmplGroup.composite.name }[ARRAY_INDEX_REPLACEMENT].唯一编码"
														>
															#
															<input type="hidden" name="${tmplGroup.composite.name }.$$flag$$" value="true" />
														</th>
														<c:if test="${tmplGroup.relationSubdomain != null }">
															<th
																class="th-field-title relation-label"
																fname-format="${tmplGroup.composite.name }[ARRAY_INDEX_REPLACEMENT].$$label$$"
																fInp-type="select-without-empty"
																fInp-optset="${tmplGroup.relationSubdomain }"
																fInp-access="${tmplGroup.additionRelationLabelAccess }"
																>关系</th>
														</c:if>
														<c:forEach var="field" items="${tmplGroup.fields }">
															<th 
																class="th-field-title ${field.fieldAvailable? '': 'field-unavailable'}"
																title="${field.fieldAvailable? '': '无效字段' }"
																fname-format="${fieldDescMap[field.fieldId].arrayFieldNameFormat }"
																fname-full="${fieldDescMap[field.fieldId].fullKey }"
																fInp-type="${field.type }"
																fInp-optkey="${field.optionGroupKey }"
																fInp-fieldkey="${module.name }@${field.fieldName }"
																fInp-access="${field.additionAccess}"
																>${field.title }</th>
														</c:forEach>
														<th width="20px">
															<c:if test="${!(tmplGroup.composite.access == '读' || tmplGroup.composite.access == '补' && fn:length(entity.arrayMap[tmplGroup.composite.name]) > 0 ) }">
																<c:if test="${tmplGroup.selectionTemplateId != null}">
																	<a title="选择" stmpl-id="${tmplGroup.selectionTemplateId }" href="javascript:;" class="open-select-dialog fa fa-link"></a>
																</c:if>
																<c:if test="${tmplGroup.unallowedCreate != 1 }">
																	<span class="array-item-add" title="添加一行">+</span>
																</c:if>
															</c:if>
														</th>
													</tr>
												</thead>
												<tbody>
													<c:forEach var="entityItem" varStatus="i" items="${entity.arrayMap[tmplGroup.composite.name] }">
														<tr class="value-row">
															<td>
																<span>${i.index + 1 }</span>
																<input class="entity-code" type="hidden" name="${entityItem.codeName }" value="${entityItem.code }" />
															</td>
															<c:if test="${tmplGroup.relationSubdomain != null }">
																<c:set var="relationName" value="${tmplGroup.composite.name }[${i.index }].$$label$$" />
																<td>
																	<span class="field-value">
																		<span class="field-input" 
																			fInp-type="select-without-empty"
																			fInp-name="${relationName }"
																			fInp-value="${entityItem.smap[relationName] }"
																			fInp-optset="${tmplGroup.relationSubdomain }"
																			fInp-readonly="${tmplGroup.relationLabelAccess == '读' }"
																		>
																			<span class="dtmpl-field-validates">
																				<i validate-name="required"></i>
																			</span>
																		</span>
																	</span>
																</td>
															</c:if>
															<c:forEach var="tmplField" items="${tmplGroup.fields }">
																<c:set var="fieldValue" value="${entityItem.smap[tmplField.fieldName] }" />
																<c:set var="fieldReadonly" 
																		value="${tmplField.fieldAccess == '读'? 'true'
																				: tmplField.fieldAccess == '补'&& !empty fieldValue? 'true'
																					: ''  }" />
																<td class="${tmplField.fieldAvailable? '': 'field-unavailable'}">
																	<span class="field-value">
																		<span class="field-input" 
																			fInp-type="${tmplField.type }"
																			fname-full="${fieldDescMap[tmplField.fieldId].fullKey }"
																			fInp-name="${fieldDescMap[tmplField.fieldId].arrayFieldNameMap[i.index] }"
																			fInp-value="${fieldValue }"
																			fInp-optkey="${tmplField.optionGroupKey }"
																			fInp-fieldkey="${module.name }@${tmplField.fieldName }"
																			fInp-readonly="${fieldReadonly }"
																		>
																			<span class="dtmpl-field-validates">
																				<c:if test="${fn:contains(tmplField.validators, 'required')}">
																					<i validate-name="required"></i>
																				</c:if>
																			</span>
																		</span>
																	</span>
																</td>
															</c:forEach>
															<td>
																<c:if test="${tmplGroup.composite.access == '写' }">
																	<span class="array-item-remove" title="移除当前行">×</span>
																</c:if>
															</td>
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
	seajs.use(['modules/js/modules-update'], function(ModulesUpdate){
		var $page = $('#user-update-${entity.code }-${RES_STAMP}');
		ModulesUpdate.init(
				$page, 
				'${entity.code}',
				{type: 'user'}
				);
	});
</script>