<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div class="detail" id="demo-${demo.id }">
	<div class="page-header">
		<div class="header-title">
			<h1>订单${demo.name }-详情</h1>
		</div>
	</div>
	<div class="page-body">
		<div class="row">
			<label class="col-lg-2">名称</label>
			<div class="col-lg-5">${demo.name }</div>
		</div>
	</div>
</div>