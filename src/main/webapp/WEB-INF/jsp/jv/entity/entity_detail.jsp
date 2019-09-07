<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div class="entity-detail-tmpl entity-detail-page entity-update-page" id="entity-detail-${RES_STAMP}">
	<div class="float-operate-area entity-actions">
		<div class="operate-area-cover"></div>
		<style target="inner-actions"></style>
		<style target="outgoing-actions"></style>
		<style target="save-button"></style>
	</div>
	<div class="detail field-input-container">
		<div class="page-header">
			<div class="header-title">
				<h1><style target="page-title" ></style></h1>
				<style target="error-icon" ></style>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
					<i class="glyphicon glyphicon-refresh"></i>
				</a>
				<!-- 切换融合模式按钮 -->
				<style target="fusion-toggler"></style>
				<!-- 切换历史时间轴按钮 -->
				<style target="timeline-toggler" ></style>
				<!-- 切换详情导出按钮 -->
				<style target="btn-export" ></style>
			</div>
		</div>
		<div class="page-body">
			<div class="col-lg-offset-1 col-lg-10">
				<form class="form-horizontal group-container">
					<!-- 前提字段 -->
					<style target="premises"></style>
					<!-- 实体详情 -->
					<style target="groups"></style>
				</form>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['entity/js/entity-detail.js'], function(EntityDetail){
		var $page = $('#entity-detail-${RES_STAMP}');
		EntityDetail.init({
			$page		: $page,
			validateSign: '${validateSign}',
			code		: '${code}',
			mode		: '${mode}',
			fieldGroupId: '${fieldGroupId}',
			nodeId		: '${nodeId}'	
		});
	});
</script>