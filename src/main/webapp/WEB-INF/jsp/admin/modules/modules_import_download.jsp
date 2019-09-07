<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="module-import-tmpl-dialog-${RES_STAMP }" class="module-import-tmpl-dialog">
	<div class="page-header">
		<div class="header-title">
			<h1>导入模板配置</h1>
		</div>
		<div class="header-buttons">
			<a title="切换模板" class="btn-toggle" href="page:#tmpl-list.toggle">
				<i class="iconfont icon-template"></i>
			</a>
			<a class="export btn-toggle" title="保存导入模板" id="btn-save" href="javascript:;">
				<i class="fa fa-save"></i>
			</a>
			<a class="btn-toggle" title="下载导入模板" id="btn-download" href="javascript:;">
				<i class="fa fa-download"></i>
			</a>
			<a class="btn-toggle" title="新建模板" id="btn-new" href="javascript:;">
				<i class="fa fa-file"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form class="form-horizontal"  action="">
			<div class="form-group">
				<label class="control-label col-sm-2 col-xs-2 col-lg-1 col-md-2">模板名</label>
				<div class="col-sm-6 col-xs-6 col-lg-6 col-md-6">
					<input class="form-control" id="tmpl-title" type="text" name="title" value="${tmpl.title }" placeholder="输入导入模板名称" />
				</div>
			</div>
			<div class="row">
				<div class="fields-l col-lg-8">
					<h4>已选字段</h4>
					<table id="" class="table table-hover table-striped table-bordered">
						<thead>
							<tr>
								<th>表头</th>
								<th>字段</th>
								<th width="10%"></th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
				<div class="fields-r col-lg-4">
					<h4>可选字段</h4>
					<div class="input-icon field-search" style="width: 100%">
						<span class="search-input-wrapper">
							<input type="text" class="search-text-input form-control input-xs glyphicon-search-input" autocomplete="off" placeholder="输入添加的字段名">
						</span>
						<i class="glyphicon glyphicon-search blue"></i>
						<i title="选择字段" class="glyphicon glyphicon-th blue field-picker-button"></i>
					</div>
				</div>
			</div>	
		</form>
	</div>
	<div id="tmpl-list" class="detail-toggle-sublist blur-hidden" style="display: none;">
		<div class="detail-toggle-sublist-wrapper">
			<c:forEach items="${tmpls }" var="tmplItem">
				<a href="admin/modules/import/tmpl/show/${menu.id }/${tmplItem.id}" data-id="${tmplItem.id }" class="${tmplItem.id == tmpl.id? 'active': '' }">
					<span class="detail-toggle-sublist-icon"><i class="fa fa-lightbulb-o"></i></span>
					<span class="detail-toggle-sublist-item-body">
						<span class="detail-toggle-sublist-item-name">${tmplItem.title }</span>
						<span class="detail-toggle-sublist-item-date"><fmt:formatDate value="${tmplItem.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </span>
					</span>
				</a>
			</c:forEach>
		</div>
	</div>
	<script type="jquery/tmpl" id="tmpl-col-row-tmpl">
		<tr field-index="\${fieldIndex}" 
			data-id="\${tmplFieldId}" 
			field-id="\${fieldId}"
			composite-id="\${compositeId}">
			<td>
				<span class="field-title">\${title}</span>
			</td>
			<td class="field-name">\${fieldName}</td>
			<td>
				{{if removable != false }}
					<a class="btn btn-xs remove-col">
						<i class="fa fa-trash-o"></i>
					</a>
				{{/if}}
			</td>
		</tr>
	</script>
</div>
<script>
	seajs.use(['modules/js/modules-import-download.js'], function(ModulesImportDownload){
		var $page = $('#module-import-tmpl-dialog-${RES_STAMP }');
		var tmplFieldsJson = {};
		try{
			tmplFieldsJson = $.parseJSON('${tmplFieldsJson}');
		}catch(e){}
		
		ModulesImportDownload.initPage($page, {
			relationLabelKey	: '${relationLabelKey}',
			tmplFieldsJson		: tmplFieldsJson,
			tmplId				: '${tmpl.id}',
			moduleName			: '${module.name}',
			menuId				: '${menu.id}'
		});
	});
</script>