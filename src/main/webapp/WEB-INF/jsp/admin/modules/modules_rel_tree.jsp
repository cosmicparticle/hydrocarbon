<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>${menu.title }-树形视图</title>
<link type="text/css" rel="stylesheet" href="media/admin/modules/css/modules-list-tmpl.css" />
<div id="list-tree-${module.name }-${RES_STAMP}" class="detail entities-tree">
	<style>
		${nodesCSS}
		<c:forEach var="rabcTreeNode" items="${fieldGroup.rabcTreeNodes}">
			#list-tree-${module.name }-${RES_STAMP} #entities-tree-container li[node-id="${rabcTreeNode.nodeTemplateId}"]>a>label{
					display: block;
				}
		</c:forEach>
	</style>
	<script type="jquery/tmpl" id="node-item-tmpl">
		<li class="tree-node-id-\${nodeTmpl.id}" node-id="\${nodeTmpl.id}" entity-code="\${entityCode}" uuid="\${uuid}">
			<a>
				<b></b>
				{{if hasRelations}}
					<i></i>
				{{/if}}
				{{if !uncheckable}}
					<label></label>
				{{/if}}
				<span>\${text }</span>
				<div class="node-operates">
					<div class="node-operate-icons">
						{{if nodeTmpl.templateGroupId}}
							{{if nodeTmpl.hideDetailButton != 1}}
								<i title="打开详情页" class="fa fa-book" action-type="detail"></i>
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
			<h1>${menu.title }-树形</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form class="form-inline"  action="admin/modules/curd/rel_tree/${mainMenu.id }/${fieldGroup.id}">
			<c:forEach var="vCriteriaEntry" items="${query.viewCriteriaMap }">
				<Entity:Criteria viewCriteia="${vCriteriaEntry.value }"/>
			</c:forEach>
			<div class="form-group">
				<button type="submit" class="btn btn-default" title="${hidenCriteriaDesc }">查询</button>
			</div>
		</form>
		<div id="entities-tree-container" class="cpf-tree cpf-tree-id-${ttmpl.id }">
			
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
	seajs.use(['modules/js/modules-list-tree.js'], function(ModulesListTree){
		var $page = $('#list-tree-${module.name }-${RES_STAMP}');
		try{var nodeTmplJson = $.parseJSON('${nodeTmplJson}')}catch(e){}
		ModulesListTree.initPage({
			$page			: $page,
			queryKey		: '${query.key}',
			menuId			: '${mainMenu.id}',
			returnCompositeId	: '${fieldGroup.composite.id}',
			defaultNodeTmpl	: nodeTmplJson
		});
		
	});
</script>