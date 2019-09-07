<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="list-tmpl-${RES_STAMP}" class="detail module-list-tmpl">
	<div class="page-body">
		<form class="form-inline">
			<style target="criterias"></style>
			<style target="btn-query"></style>
		</form>
		<style target="select-entities"></style>
	</div>
</div>
<div class="modal-footer">
	<div class="row">
		<div class="col-lg-3 col-lg-offset-4">
			<input id="submit-btn-${RES_STAMP}" class="btn btn-primary btn-block submit" type="button" value="确定" disabled="disabled" /> 
		</div>
	</div>
</div>
<script>
	console.warn('entity-select');
	seajs.use(['entity/js/entity-select.js?3'], function(EntitySelect){
		var $page = $('#list-tmpl-${RES_STAMP}');
		console.log(EntitySelect);
		EntitySelect.init({
			$page			: $page,
			validateSign	: '${validateSign}',
			except			: '${except}',
			groupId			: '${groupId}',
			$submitButton	: $('#submit-btn-${RES_STAMP}')
		})
	});
</script>