<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="demo-update">
	<div class="page-header">
		<div class="header-title">
			<h1>修改Demo</h1>
		</div>
	</div>
	<div class="page-body">
		<div class="row">
			<div class="col-lg-12">
				<form class="bv-form form-horizontal validate-form" action="admin/demo/do_update">
					<input type="hidden" name="id" value="${demo.id }" />
					<div class="form-group">
						<label class="col-lg-2 control-label" for="name" >名称</label>
						<div class="col-lg-5">
							<input type="text" class="form-control" name="name" value="${demo.name }" />
						</div>
					</div>
					<div class="form-group">
			        	<div class="col-lg-offset-3 col-lg-3">
			        		<input class="btn btn-block btn-darkorange" type="submit" value="提交"  />
				        </div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>