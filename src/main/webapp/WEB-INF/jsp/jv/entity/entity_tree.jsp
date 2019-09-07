<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="list-tree-${RES_STAMP}" class="detail entities-tree module-list-tmpl">
	<div class="page-header">
		<div class="header-title">
			<h1>${menu.title }-树形视图</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab" id="btn-toggle-tree" title="返回列表" target="entity_list_${menuId }" href="jv/entity/curd/list/${menuId }" >
				<i class="fa fa-th-list"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form id="criteria-form" class="form-inline">
			<div class="form-group" id="form-buttons">
			</div>
		</form>
		<div id="entities-tree-container" class="cpf-tree">
			
		</div>
	</div>
</div>
<script>
	seajs.use(['entity/js/entity-tree.js'], function(EntityTree){
		var $page = $('#list-tree-${RES_STAMP}');
		EntityTree.init({
			$page	: $page,
			menuId	: '${menuId}'
		});
	});
</script>