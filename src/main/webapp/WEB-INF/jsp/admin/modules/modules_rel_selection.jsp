<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<link type="text/css" rel="stylesheet" href="media/admin/modules/css/modules-selection.css" />
<c:set var="moduleName" value="${query.moduleName }" />
<div id="selections-${RES_STAMP}" class="detail modules-selection">
	<div class="page-body">
		<form class="form-inline"  action="admin/modules/curd/rel_selection/${menu.id }/${stmpl.id}">
			<c:forEach var="vCriteriaEntry" items="${query.viewCriteriaMap }">
				<Entity:Criteria viewCriteia="${vCriteriaEntry.value }"/>
			</c:forEach>
			<div class="form-group">
				<button type="submit" class="form-control btn btn-default" title="${hidenCriteriaDesc }">查询</button>
			</div>
		</form>
		<div class="row list-area">
			<table class="table row-selectable">
				<thead>
					<tr>
						<th width="30">
							<label title="全选">
								<input type="checkbox" class="colored-blue select-all partly">
			                    <span class="text"></span>
			                </label>
			            </th>
						<c:forEach items="${stmpl.columns }" var="column">
							<th class="${column.fieldAvailable? '': 'col-field-unavailable' }"
								title="${column.fieldAvailable? '': '无效字段'}">${column.title }</th>
						</c:forEach>
					</tr>
				</thead>
				<tbody>
				</tbody>
			</table>
			<div class="cpf-paginator cpf-query-paginator" query-key="${query.key }" pageNo="${pageInfo.pageNo }" pageSize="${pageInfo.pageSize }" count="${pageInfo.count }"></div>
		</div>
	</div>
	<script type="jquery/tmpl" id="entity-row-tmpl">
		<tr data-code="\${entity.code }">
			<td>
				<label>
					<input type="checkbox" class="colored-blue row-selectable-checkbox">
		            <span class="text"></span>
		        </label>
			</td>
			{{each(i, column) columns}}
				<td class="\${column.fieldAvailable? '': 'col-field-unavailable' }">
					{{if column.specialField === 'number'}}
						\${rowNumber }
					{{else}}
						\${entity.cellMap[column.id] || ''}
					{{/if}}
				</td>
			{{/each}}
		</tr>
	</script>
	<script type="text/json" id="stmpl-json">${stmplJson}</script>
</div>
<div class="modal-footer">
	<div class="row">
		<div class="col-lg-3 col-lg-offset-4">
			<input id="submit" class="btn btn-primary btn-block submit" type="button" value="确定" /> 
		</div>
	</div>
</div>
<script>
	seajs.use(['modules/js/modules-entity-list.js'], function(ModulesEntityList){
		var $page = $('#selections-${RES_STAMP}');
		var stmpl = $.parseJSON($('#stmpl-json', $page).html());
		ModulesEntityList.init({
			$page		: $page,
			menuId		: '${menu.id}',
			moduleName	: '${moduleName}',
			queryKey	: '${query.key}',
			stmpl		: stmpl
		});
	});
</script>