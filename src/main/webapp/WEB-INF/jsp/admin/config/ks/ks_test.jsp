<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="ks-test-${RES_STAMP }" class="ks-test detail">
	<div class="page-header">
		<div class="header-title">
			<h1>轻服务测试</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="row">
			<div class="col-lg-10 col-lg-offset-1 col-sm-12 col-xs-12">
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption">请求用户</span>
						<div class="widget-buttons buttons-bordered">
							<button on-click="signIn" on-prepare="btn-sign-in" class="btn btn-xs btn-primary">登录</button>
						</div>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="form-group col-lg-5">
								<input on-prepare="username" on-change="userChanged" type="text" class="form-control" autocomplete="new-password" placeholder="用户名"/>
							</div>
							<div class="form-group col-lg-5">
								<input on-prepare="password" on-change="userChanged" type="password" class="form-control" autocomplete="new-password" placeholder="密码" />
							</div>
						</div>
					</div>
				</div>
				
				<div class="widget" on-prepare="requestparam-widget" >
					<div class="widget-header">
						<span class="widget-caption">请求参数</span>
					</div>
					<div class="widget-body">
						<style target="ks-criterias"></style>
					</div>
				</div>
				
				<div class="widget" on-prepare="page-widge" style="display: none">
					<div class="widget-header">
						<span class="widget-caption">分页参数</span>
					</div>
					<div class="widget-body">
						<div class="row" style="margin-top:5px;display: flex;align-items: center;">
							<label class="control-label col-lg-2 col-lg-offset-1">页号</label>
							<div class="col-lg-3">
								<input on-prepare="pageNo" class="form-control cpf-field-int" type="number" value="1"/>
							</div>
						</div>
						<div class="row" style="margin-top:5px;display: flex;align-items: center;">
							<label class="control-label col-lg-2 col-lg-offset-1">条数</label>
							<div class="col-lg-3">
								<input on-prepare="pageSize" class="form-control cpf-field-int" type="number" value="10" max="1000" />
							</div>
						</div>
					</div>
				</div>
				
				
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption">请求预览</span>
						<div class="widget-buttons buttons-bordered">
							<button on-click="submit" on-prepare="btn-submit" class="btn btn-xs btn-primary" disabled="disabled">提交</button>
						</div>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="form-group col-lg-12">
								<label class="control-label col-lg-12">提交路径</label>
								<div class="col-lg-12">
									<input class="form-control" type="text" on-prepare="path;ks:path" readonly="readonly" />
								</div>
							</div>
						</div>
						<div class="row" on-prepare="requestparam-body-widget" >
							<div class="form-group col-lg-12">
								<label class="col-lg-12">请求参数体</label>
								<div class="col-lg-12">
									<pre on-prepare="paramsEditor" style="height: 100px;font-size: 17px;"></pre>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="widget" on-prepare="requestpost-widget">
					<div class="widget-header">
						<span class="widget-caption">提交实体数据</span>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="col-lg-12">
								<pre on-prepare="postEditor" style="height: 300px;font-size: 17px;"></pre>
								<!-- <textarea on-prepare="resData" rows="20" class="form-control"></textarea> -->
							</div>
						</div>
					</div>
				</div>
				
				<div class="widget">
					<div class="widget-header">
						<span class="widget-caption">返回数据</span>
					</div>
					<div class="widget-body">
						<div class="row">
							<div class="col-lg-12">
								<pre on-prepare="resEditor" style="height: 300px;font-size: 17px;"></pre>
								<!-- <textarea on-prepare="resData" rows="20" class="form-control"></textarea> -->
							</div>
						</div>
					</div>
				</div>
				
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['config/js/ks-test'], function(KsTest){
		var $page = $('#ks-test-${RES_STAMP}');
		KsTest.init({
			$page: $page,
			ksId : '${ksId}'
		});
	});
</script>