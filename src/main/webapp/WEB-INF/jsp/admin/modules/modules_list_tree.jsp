<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>${menu.title }-树形视图</title>
<link type="text/css" rel="stylesheet" href="media/admin/modules/css/modules-list-tmpl.css" />
<div id="${module.name }-list-tree-${RES_STAMP}" class="detail entities-tree">
	<style>${nodesCSS}</style>
	<script type="jquery/tmpl" id="node-item-tmpl">
		<li class="tree-node-id-\${nodeTmpl.id}" node-id="\${nodeTmpl.id}" entity-code="\${entityCode}" uuid="\${uuid}">
			<a>
				<b></b>
				{{if hasRelations}}
					<i></i>
				{{/if}}
				<label></label>
				<span>\${text }</span>
				<div class="node-operates">
					<div class="node-operate-icons">
						{{if nodeTmpl.templateGroupId}}
							{{if nodeTmpl.hideDetailButton != 1}}
								<i title="打开详情页" class="fa fa-book" action-type="detail"></i>
							{{/if}}
							{{if nodeTmpl.hideUpdateButton != 1}}
								<i title="打开修改页" class="fa fa-edit" action-type="update"></i>
							{{/if}}
						{{/if}}
					</div>
				</div>
			</a>
		</li>
	</script>
	<script type="jquery/tmpl" id="load-more-tmpl">
		<li class="next-page">
			<a><span>加载更多</span></a>
		</li>
	</script>
	<script type="jquery/tmpl" id="rels-tmpl">
		<ul class="tree-rels">
			{{each(i, rel) rels}}
				<li rel-id="\${rel.id }">
					<a>
						<i></i>
						<label></label>
						<span>\${rel.title }</span>
					</a>
				</li>
			{{/each}}
		</ul>
	</script>
	<div class="page-header">
		<div class="header-title">
			<h1>${menu.title }-树形视图</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab" id="btn-toggle-tree" target="entity_list_${menu.id }" href="admin/modules/curd/list/${menu.id }" >
				<i class="fa fa-th-list"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form class="form-inline"  action="admin/modules/curd/list_tree/${menu.id }">
			<input type="hidden" id="tmplId" name="tmplId" value="${ltmpl.id }" />
			
			<c:forEach var="vCriteriaEntry" items="${query.viewCriteriaMap }">
				<Entity:Criteria viewCriteia="${vCriteriaEntry.value }"/>
			</c:forEach>
			<div class="form-group">
				<c:if test="${not empty ltmpl.criterias and tmplGroup.hideQueryButton != 1}">
					<button type="submit" class="btn btn-default" title="${hidenCriteriaDesc }">查询</button>
				</c:if>
				<c:if test="${tmplGroup.hideDeleteButton != 1 }">
					<button id="btn-delete" class="btn btn-danger" disabled="disabled">删除选中</button>
				</c:if>
				<c:forEach items="${tmplGroup.actions }" var="action">
					<c:if test="${action.face == 'list' }">
						<button class="btn btn-azure shiny action-button" 
						data-id="${action.id }" data-multiple="${action.multiple }"
						title="${action.title }"
						disabled="disabled">
							<c:if test="${!empty action.iconClass }">
								<i class="${action.iconClass }"></i>
							</c:if>
							${action.title }
						</button>
					</c:if>
				</c:forEach>
			</div>
		</form>
		<div id="entities-tree-container" class="cpf-tree cpf-tree-id-${tmplGroup.treeTemplateId }">
			
		</div>
	</div>
</div>
<script>
	seajs.use(['modules/js/modules-list-tree.js'], function(ModulesListTree){
		var $page = $('#${module.name }-list-tree-${RES_STAMP}');
		try{var nodeTmplJson = $.parseJSON('${nodeTmplJson}')}catch(e){}
		ModulesListTree.initPage({
			$page			: $page,
			queryKey		: '${query.key}',
			menuId			: '${menu.id}',
			defaultNodeTmpl	: nodeTmplJson
		});
		
	});
</script>