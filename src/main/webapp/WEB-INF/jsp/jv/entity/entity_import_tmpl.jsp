<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="entity-import-tmpl-${RES_STAMP }" class="module-import-tmpl-dialog">
	<div class="page-header">
		<div class="header-title">
			<h1>导入模板配置</h1>
		</div>
		<div class="header-buttons">
			<a title="切换模板" class="btn-toggle" href="javascript:;" on-click="toggleTemplates">
				<i class="iconfont icon-template"></i>
			</a>
			<a class="export btn-toggle" title="保存导入模板" id="btn-save" href="javascript:;" on-click="saveTmpl">
				<i class="fa fa-save"></i>
			</a>
			<a class="btn-toggle" title="下载导入模板" id="btn-download" href="javascript:;" on-click="downloadTmpl">
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
							<style target="tmpl-field-rows"></style>
						</tbody>
					</table>
				</div>
				<div class="fields-r col-lg-4">
					<h4>可选字段</h4>
					<style target="fields-container"></style>
				</div>
			</div>	
		</form>
	</div>
	<style target="tmpl-list"></style>
</div>
<script>
	seajs.use(['entity/js/entity-import-tmpl.js'], function(EntityImportTmpl){
		var $page = $('#entity-import-tmpl-${RES_STAMP }');
		
		EntityImportTmpl.initPage({
			$page	: $page,
			menuId	: '${menuId}',
			tmplId	: '${tmplId}'
		})
	});
</script>