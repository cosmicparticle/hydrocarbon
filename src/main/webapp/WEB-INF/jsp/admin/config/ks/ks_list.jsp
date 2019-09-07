<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="ks-list-${RES_STAMP }" class="ks-list detail">
	<div class="page-header">
		<div class="header-title">
			<h1>轻服务列表</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab" title="创建轻服务" href="admin/config/ks/edit">
				<i class="fa fa-plus"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<form id="criteria-form" class="form-inline" on-prepare="form">
			<div class="form-group">
				<label class="control-label">关键字</label>
				<input type="text" class="form-control" on-input="filterKsList" />
			</div>
			<div class="form-group">
				<button on-click="toggleEnable" class="btn btn-success" on-prepare="btn-enable" disabled="disabled">启用选中</button>
				<button on-click="toggleDisable" class="btn btn-warning" on-prepare="btn-disable" disabled="disabled">禁用选中</button>
				<button on-click="remove" class="btn btn-danger" on-prepare="btn-remove" disabled="disabled">删除选中</button>
			</div>
		</form>
		<div class="row list-area">
			<table class="table row-selectable" on-render="bindTable" on-prepare="table">
				<thead>
					<tr>
						<th width="30">
							<label title="全选">
								<input type="checkbox" class="colored-blue select-all partly">
					            <span class="text"></span>
					        </label>
					    </th>
						<th>序号</th>
						<th>名称</th>
						<th>路径</th>
						<th>类型</th>
						<th>备注</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<style target="ks-list"></style>
				</tbody>
			</table>
		</div>
	</div>
</div>
<script>
	seajs.use(['config/js/ks-list'], function(KsList){
		var $page = $('#ks-list-${RES_STAMP}');
		KsList.init({
			$page: $page
		});
	});
</script>