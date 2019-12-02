<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="list-tmpl-${RES_STAMP}" class="detail module-list-tmpl statview-list">
	<div class="page-header">
		<div class="header-title">
			<h1>${menu.title }-列表</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form id="criteria-form" class="form-inline" >
			<div class="form-group" id="form-buttons">
			</div>
		</form>
		<div class="row list-area">
			<table class="table row-selectable">
				<thead>
					<tr></tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>
	</div>
	<div id="export-window" class="detail-toggle-sublist blur-hidden" style="display: none;">
		<div class="detail-toggle-sublist-wrapper">
			<div class="export-window-title">
				<h3>导出</h3>
				<label>
					<input id="with-detail" type="checkbox" class="colored-blue">
					<span class="text">详情</span>
				</label>
			</div>
			<div class="row external-export-message" style="display: none">
				<p>检测到功能模块（<a class="without-refresh" id="export-menu-link"></a>）正在执行导出工作</p>
			</div>
			<div class="row range-toggle">
				<label class="col-lg-6">
					<input id="export-current-page" type="radio" class="colored-blue" checked="checked">
					<span class="text">导出当前页</span>
				</label>
				<label class="col-lg-6">
					<input id="export-all" type="radio" class="colored-blue">
					<span class="text">导出所有</span>
				</label>
			</div>
			<div class="row data-range" style="display: none;">
				<label class="col-lg-4">数据范围：</label>
				<div class="col-lg-8">
					<input type="number" title="不填写开始序号时，将从1开始" id="export-range-start" placeholder="开始序号" />
					-
					<input type="number" title="不填写结束序号时，将到最后结束" id="export-range-end" placeholder="结束序号" />
				</div>
			</div>
			<div class="row export-operate-area">
				<div class="col-lg-offset-2 col-lg-4">
					<input type="button" id="do-export" class="btn btn-xs btn-primary" value="开始导出" />
					<input type="button" id="do-download" class="btn btn-xs btn-primary" 
						value="下载导出文件" disabled="disabled" style="display: none" />
				</div>
				<div class="col-lg-2">
					<input type="button" id="do-break" class="btn btn-xs" value="取消导出" style="display: none;" />
				</div>
				<div id="export-progress" class="active progress progress-striped progress-xxs" style="display: none;">
					<div class="progress-bar progress-bar-orange" role="progressbar" aria-valuenow="0%" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
					</div>
					<span class="progress-text">0%</span>
				</div>
			</div>
			<div id="export-msg" class="row" style="display: none;">
				<p></p>
			</div>
		</div>
	</div>
	<style target="viewcols-window"></style>
</div>
<script>
	seajs.use(['entity/js/entity-list.js'], function(EntityList){
		var $page = $('#list-tmpl-${RES_STAMP}');
		
		EntityList.init({
			$page	: $page,
			menuId	: '${menuId}'
		});
		
	});
</script>