<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="custompage-${RES_STAMP}" class="detail custompage">
	<style target="page"></style>
</div>
<script>
	seajs.use(['custompage/js/custompage-path.js'], function(CustomPage){
		var $page = $('#custompage-${RES_STAMP}');
		
		CustomPage.initPage({
			$page	: $page,
			path	: '${path}'
		});
		
	});
</script>