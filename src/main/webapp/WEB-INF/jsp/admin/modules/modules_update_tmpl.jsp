<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>

<c:set var="title">
	<c:choose>
		<c:when test="${entity != null }">${menu.title}-修改-${entity.title }</c:when>
		<c:otherwise>${menu.title }-创建</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<div class="entity-detail-tmpl entity-update-page"
	id="${module.name }-update-tmpl-${entity.code }-${RES_STAMP}">
	<div class="float-operate-area entity-actions">
		<div class="operate-area-cover"></div>
		<c:if test="${!empty normalGroupActions }">
			<a id="actions" title="操作"><i class="fa fa-toggle-left"></i></a>
			<div id="actions-container" class="init">
				<div id="action-list">
					<c:forEach var="action" items="${normalGroupActions }">
						<a class="btn btn-azure shiny" href="javascript:;"
							title="${action.title }" data-id="${action.id }"> <c:if
								test="${!empty action.iconClass }">
								<i class="${action.iconClass }"></i>
							</c:if> ${action.title }
						</a>
					</c:forEach>
				</div>
			</div>
		</c:if>
		<c:forEach var="action" items="${outgoingGroupActions }">
			<a class="btn-action-outgoing" data-id="${action.id }"
				href="javascript:;" title="${action.title }"><i
				class="${action.iconClass }"></i></a>
		</c:forEach>
		<c:if test="${tmplGroup.hideSaveButton == null }">
			<a id="save" title="保存"><i class="fa fa-check-square"></i></a>
		</c:if>
	</div>
	<div class="detail field-input-container">
		<div class="page-header">
			<div class="header-title">
				<h1>${title }</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler"
					href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
				</a> <a class="fusion-mode" title="融合模式：关" id="fusion-toggler"
					href="javascript:;"> <i class="fa fa-lightbulb-o"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="col-lg-offset-1 col-lg-10">
				<c:set var="saveURI">
					<c:choose>
						<c:when test="${rabcTemplateGroup != null }">admin/modules/curd/rabc_save/${mainMenu.id }/${rabcTemplateGroup.id }</c:when>
						<c:when test="${nodeTemplate != null }">admin/modules/curd/node_save/${menu.id }/${nodeTemplate.id }</c:when>
						<c:otherwise>admin/modules/curd/save/${menu.id }</c:otherwise>
					</c:choose>
				</c:set>
				<form class="form-horizontal group-container" action="${saveURI }">
					<input type="hidden" name="${config.codeAttributeName }"
						value="${entity.code }" />
					<c:if test="${!empty groupPremises }">
						<div class="widget field-group">
							<div class="widget-header">
								<span class="widget-caption"> <span class="group-title">默认字段（不可修改）</span>
								</span>
							</div>
							<div class="widget-body field-container premises-container">
								<c:forEach var="premise" items="${groupPremises }">
									<c:if test="${premise.fieldName != null }">
										<div class="form-group field-item">
											<label class="control-label field-title">${premise.fieldTitle }</label>
											<div class="field-value"
												value-field-name="${premise.fieldName }">
												${entity== null? premise.fieldValue: entity.smap[premise.fieldName] }
												<input type="hidden" name="${premise.fieldName }"
													value="${entity== null? premise.fieldValue: entity.smap[premise.fieldName] }" />
											</div>
										</div>
									</c:if>
								</c:forEach>
							</div>
						</div>
					</c:if>

					<c:forEach var="fieldGroup" items="${dtmpl.groups }">
						<div class="widget field-group" field-group-id="${fieldGroup.id }"
							rabc-unupdatable="${fieldGroup.rabcUnupdatable == 1 }">
							<div class="widget-header">
								<span class="widget-caption"> <span class="group-title">${fieldGroup.title }</span>
								</span>
							</div>
							<div class="widget-body field-container">
								<c:choose>
									<c:when test="${fieldGroup.isArray != 1 }">
										<c:forEach var="tmplField" items="${fieldGroup.fields }">
											<c:set var="premise"
												value="${groupPremisesMap[tmplField.fieldName] }" />
											<div
												class="form-group field-item ${tmplField.fieldAvailable? '': 'field-unavailable' } ${tmplField.colNum == 2? 'dbcol': '' }"
												title="${tmplField.fieldAvailable? '': '无效字段' }">
												<div class="dtmpl-field-validates">
													<c:if
														test="${fn:contains(tmplField.validators, 'required')}">
														<i validate-name="required"></i>
													</c:if>
												</div>
												<label class="control-label field-title">${tmplField.title }</label>
												<div class="field-value"
													value-field-name="${tmplField.fieldName }">
													<c:set var="fieldValue"
														value="${entity != null? entity.smap[tmplField.fieldName] : premise != null? premise.fieldValue: '' }" />
													<c:set var="fieldReadonly"
														value="${tmplField.fieldAccess == '读'? 'true'
																	: tmplField.fieldAccess == '补'&& !empty fieldValue? 'true'
																		: ''  }" />
													<span class="field-input" fInp-type="${tmplField.type }"
														fInp-name="${tmplField.fieldName }"
														fInp-refgroupid="${tmplField.refGroupId }"
														fInp-refgroupdtmplid="${tmplField.refGroupDtmplid }"
														fInp-refgroupltmplid="${tmplField.refGroupLtmplid }"
														fInp-mainmenuid="${mainMenu.id }"
														fInp-menuid="${menu.id }"
														fInp-value="${entity != null? fieldValue: tmplField.viewValue }"
														fInp-optkey="${tmplField.optionGroupKey }"
														fInp-fieldkey="${module.name }@${tmplField.fieldName }"
														fInp-readonly="${fieldReadonly}"
														fInp-refCognitionTitle="${tmplField.refCognitionTitle }"
														fInp-refShowTitle="${tmplField.refShowTitle }">
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
															fname-format="${fieldGroup.composite.name }[ARRAY_INDEX_REPLACEMENT].唯一编码">
															序号 <c:if test="${!empty fieldGroup.composite.name }">
																<input type="hidden"
																	name="${fieldGroup.composite.name }.$$flag$$"
																	value="true" />
															</c:if>
														</th>
														<c:if test="${fieldGroup.relationSubdomain != null }">
															<c:set var="relationDefaultLabel" value="" />
															<c:if
																test="${fn:length(fieldGroup.relationSubdomain) == 1}">
																<c:forEach var="relationLabel"
																	items="${fieldGroup.relationSubdomain }">
																	<c:set var="relationDefaultLabel"
																		value='fInp-value="${relationLabel }"' />
																</c:forEach>
															</c:if>
															<th class="th-field-title relation-label"
																fname-format="${fieldGroup.composite.name }[ARRAY_INDEX_REPLACEMENT].$$label$$"
																fInp-type="select-without-empty"
																fInp-optset="${fieldGroup.relationSubdomain }"
																fInp-access="${fieldGroup.additionRelationLabelAccess }"
																${relationDefaultLabel }>关系</th>
														</c:if>
														<c:forEach var="field" items="${fieldGroup.fields }">
															<th
																class="th-field-title ${field.fieldAvailable? '': 'field-unavailable'}"
																title="${field.fieldAvailable? '': '无效字段' }"
																fname-format="${fieldDescMap[field.fieldId].arrayFieldNameFormat }"
																fname-full="${fieldDescMap[field.fieldId].fullKey }"
																fInp-type="${field.type }"
																fInp-optkey="${field.optionGroupKey }"
																fInp-fieldkey="${module.name }@${field.fieldName }"
																fInp-access="${field.additionAccess}">${field.title }</th>
														</c:forEach>
														<th width="20px"><c:if
																test="${!(fieldGroup.composite.access == '读' || fieldGroup.composite.access == '补' && fn:length(entity.arrayMap[fieldGroup.composite.name]) > 0 ) }">
																<c:choose>
																	<c:when
																		test="${fieldGroup.dialogSelectType == 'stmpl' && fieldGroup.selectionTemplateId != null }">
																		<a title="选择"
																			stmpl-id="${fieldGroup.selectionTemplateId }"
																			href="javascript:;"
																			class="open-select-dialog fa fa-link"></a>
																	</c:when>
																	<c:when
																		test="${fieldGroup.dialogSelectType == 'ttmpl' && fieldGroup.rabcTreeTemplateId != null }">
																		<a title="选择"
																			ttmpl-id="${fieldGroup.rabcTreeTemplateId }"
																			href="javascript:;"
																			class="open-select-dialog fa fa-link"></a>
																	</c:when>
																	<c:when
																		test="${fieldGroup.dialogSelectType == 'ltmpl' && fieldGroup.rabcTemplateGroupId != null }">
																		<a title="选择"
																			tmplgroup-id="${fieldGroup.rabcTemplateGroupId }"
																			href="javascript:;"
																			class="open-select-dialog fa fa-link"></a>
																	</c:when>
																</c:choose>

																<c:if test="${fieldGroup.unallowedCreate != 1 }">
																	<span class="array-item-add" title="添加一行">+</span>
																</c:if>
																<c:if
																	test="${fieldGroup.rabcUncreatable != 1 && mainMenu == null && fieldGroup.rabcTemplateGroupId != null }">
																	<span class="iconfont icon-add-3 rabd-add"></span>
																</c:if>
															</c:if></th>
													</tr>
												</thead>
												<tbody>
													<c:forEach var="entityItem" varStatus="i"
														items="${entity.arrayMap[fieldGroup.composite.name] }">
														<tr class="value-row">
															<td><span>${i.index + 1 }</span> <input
																class="entity-code" type="hidden"
																name="${entityItem.codeName }"
																value="${entityItem.code }" /></td>
															<c:if test="${fieldGroup.relationSubdomain != null }">
																<c:set var="relationName"
																	value="${fieldGroup.composite.name }[${i.index }].$$label$$" />
																<td><span class="field-value"> <span
																		class="field-input" fInp-type="select-without-empty"
																		fInp-name="${relationName }"
																		fInp-value="${entityItem.smap[relationName] }"
																		fInp-optset="${fieldGroup.relationSubdomain }"
																		fInp-readonly="${fieldGroup.relationLabelAccess == '读' }">
																			<span class="dtmpl-field-validates"> <i
																				validate-name="required"></i>
																		</span>
																	</span>
																</span></td>
															</c:if>
															<c:forEach var="tmplField" items="${fieldGroup.fields }">
																<c:set var="fieldValue"
																	value="${entityItem.smap[tmplField.fieldName] }" />
																<c:set var="fieldReadonly"
																	value="${tmplField.fieldAccess == '读'? 'true'
																				: tmplField.fieldAccess == '补'&& !empty fieldValue? 'true'
																					: ''  }" />
																<td
																	class="${tmplField.fieldAvailable? '': 'field-unavailable'}">
																	<span class="field-value"> <span
																		class="field-input" fInp-type="${tmplField.type }"
																		fname-full="${fieldDescMap[tmplField.fieldId].fullKey }"
																		fInp-name="${fieldDescMap[tmplField.fieldId].arrayFieldNameMap[i.index] }"
																		fInp-value="${fieldValue }"
																		fInp-optkey="${tmplField.optionGroupKey }"
																		fInp-fieldkey="${module.name }@${tmplField.fieldName }"
																		fInp-readonly="${fieldReadonly }">
																			<span class="dtmpl-field-validates"> <c:if
																					test="${fn:contains(tmplField.validators, 'required')}">
																					<i validate-name="required"></i>
																				</c:if>
																		</span>
																	</span>
																</span>
																</td>
															</c:forEach>
																<td>
																<c:if test="${fieldGroup.rabcTemplateGroupId != null && fieldGroup.rabcUndetailable != 1 }">
																	<span class="array-item-detail fa fa-book" title="查看详情"></span>
																</c:if> 
																<c:if test="${fieldGroup.composite.access == '写' }">
																	<c:if
																		test="${fieldGroup.rabcTemplateGroupId != null && fieldGroup.rabcUnupdatable != 1 }">
																		<span class="array-item-update fa fa-edit"
																			title="编辑当前行"></span>
																	</c:if>
																	<span class="array-item-remove" title="移除当前行">×</span>
																</c:if></td>
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
</div>
<script>
	seajs.use(['modules/js/modules-update'], function(ModulesUpdate){
		var $page = $('#${module.name }-update-tmpl-${entity.code }-${RES_STAMP}');
		var nodeId = '${nodeTemplate.id}';
		var type = nodeId? 'node': 'entity';
		ModulesUpdate.init(
				$page, 
				'${entity.code}',
				{type, menuId: '${menu.id }'
					, rabcTmplGroupId		: '${rabcTemplateGroup.id}'
					, relationCompositeId	: '${relationCompositeId}'
					, mainMenuId	: '${mainMenu.id}', nodeId} 
				);
	});
</script>