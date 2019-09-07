<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div class="modules-import-page" id="entity-import-${RES_STAMP }">
	<div class="page-header">
		<div class="header-title">
			<style target="page-title"></style>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="row">
			<div class="col-lg-12">
				<form class="bv-form form-horizontal validate-form">
					<div class="form-group">
						<label class="col-lg-2 control-label">上传文件</label>
						<div class="col-lg-6">
							<input id="file" type="file" name="file" class="form-control" accept=".xls,.xlsx" />
						</div>
						<a href="javascript:;" id="link-import-tmpl">模板</a>
					</div>
					<div class="form-group">
						<label class="col-lg-2 control-label">进度</label>
						<div class="col-lg-6">
							<div id="progress" class="progress progress-striped active">
                                <div class="progress-bar progress-bar-success" 
                                	role="progressbar" 
                                	aria-valuenow="0" 
                                	aria-valuemin="0" 
                                	aria-valuemax="100" 
                                	style="width: 0">
                                    <span>
                                        0
                                    </span>
                                </div>
                            </div>
						</div>
					</div>
					<div class="form-group">
						<div class="col-lg-offset-3 col-lg-2">
			        		<a class="btn btn-block btn-primary" id="submit">开始导入</a>
				        </div>
						<div class="col-lg-2">
			        		<a class="btn btn-block btn-defualt" id="break" css-display="none">停止导入</a>
				        </div>
					</div>
					<div class="form-group">
						<div class="col-lg-6 col-lg-offset-2">
							<div class="widget" id="feedback-msg-container">
								<div class="widget-header">
									<span class="widget-caption">导入日志</span>
									<div class="widget-buttons" id="message-filter">
										<label msg-type="INFO"> 
											<input type="checkbox" checked="checked" class="inverted" />
											<span class="text">常规</span>
										</label>
										<label msg-type="SUC"> 
											<input type="checkbox" checked="checked" class="inverted" />
											<span class="text">成功</span>
										</label>
										<label msg-type="ERROR"> 
											<input type="checkbox" checked="checked" class="inverted" />
											<span class="text">错误</span>
										</label>
										<label msg-type="WARN"> 
											<input type="checkbox" checked="checked" class="inverted" />
											<span class="text">警告</span>
										</label>
									</div>
									<div class="widget-buttons buttons-bordered">
										<a href="#" id="import-log-download" title="导入日志下载" style="display: none">
											<i class="fa fa-download azure"></i>
										</a>
										<a href="#" id="import-log-setting" title="导入日志设置">
											<i class="fa fa-cog darkorange"></i>
										</a>
                                    </div>
								</div>
								<div class="widget-body" id="feedback-msg">
								</div>
								<div class="widge-footer" id="feedback-instance">
									
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['entity/js/entity-import.js'], function(EntityImport){
		var $page = $('#entity-import-${RES_STAMP }');
		EntityImport.initPage({
			$page		: $page,
			menuId		: '${menuId}'
		});
	});
</script>