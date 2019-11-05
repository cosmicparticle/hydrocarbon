<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="jtmpl-edit-${RES_STAMP }" class="jtmpl-edit">
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a title="保存" on-click="savejtmpl"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>跳转模板编辑</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler"
				href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="col-lg-offset-1 col-lg-10">
			<form class="bv-form validate-form" on-prepare="form">
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption"> 定义 </span>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">名称</label> <input
									class="form-control" type="text"
									on-prepare="title ; originKs:title" name="title"
									data-bv-notempty="true" data-bv-notempty-message="名称必填" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">url</label> <input
									class="form-control" type="text"
									on-prepare="path ; originKs:path" name="url"
									data-bv-notempty="true" data-bv-notempty-message="url必填" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">默认唯一编码</label> <input
									class="form-control" type="text"
									on-prepare="path ; originKs:path" name="defaultcode" />
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-6">
								<label class="control-label">详情模板</label> <select
									class="form-control cpf-select2"
									on-prepare="dtmpl ; originKs,modules:originKs.detailTemplateId"
									on-change="changeDtmpl"></select>
							</div>
						</div>
						<div class="row">
							<div class="form-group col-lg-12">
								<label class="control-label">描述</label>
								<textarea class="form-control" rows="3"
									on-prepare="description ; originKs:description"></textarea>
							</div>
						</div>
					</div>
				</div>
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption"> 返回数据配置 </span>
						<div class="widget-buttons">
							<a href="#" on-click="switchResEditorView" prefix='res'
								title="切换树形视图/代码视图"> <i class="iconfont icon-view"
								style="font-size: 22px;"></i>
							</a>
						</div>
						<div class="widget-buttons buttons-bordered">
							<a href="#" on-click="toggleExpand" title="全屏/还原"> <i
								class="fa fa-expand" style="font-size: 22px;"></i>
							</a>
						</div>
					</div>
					<div class="widget-body">
						<div class="row" on-prepare="res-tree-view"></div>
						<div class="row" on-prepare="res-code-view">
							<div class="form-group col-lg-12">
								<pre on-prepare="res-editor"
									style="height: 300px; font-size: 17px;"></pre>
							</div>
						</div>
					</div>
				</div>

			</form>
		</div>
	</div>
</div>
<script>
	seajs.use([ 'config/js/jtmpl-edit' ], function(KsEdit) {
		var $page = $('#jump-edit-${RES_STAMP}');
		JtempEdit.init({
			$page : $page,
			jtmplId : '${jtmplId}'
		});
	});
</script>