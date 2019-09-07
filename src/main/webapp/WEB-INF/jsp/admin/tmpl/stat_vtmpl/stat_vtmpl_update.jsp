<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${vtmpl != null }">修改${module.title }统计视图模板-${vtmpl.title }</c:when>
		<c:otherwise>创建${module.title }模板组合</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<div id="tmpl-statview-update-${view.id }" class="tmpl-group-update">
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" class="btn-save" title="保存"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="detail">
		<div class="page-header">
			<div class="header-title">
				<h1>${title }</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
					<i class="glyphicon glyphicon-refresh"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="row">
				<div class="row">
					<div class="col-lg-offset-1 col-sm-offset-1 col-xs-offset-1 col-lg-10 col-sm-10 col-xs-10" id="group-container">
						<form id="form" class="bv-form form-horizontal validate-form" action="admin/tmpl/stat/vtmpl/save">
							<div class="widget field-group">
								<div class="widget-header">
									<span class="widget-caption"> <span class="group-title">基本信息</span>
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="id" value="${vtmpl.id }" />
									<input type="hidden" name="module" value="${module.name }" />
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">名称</label>
												<div class="col-lg-8">
													<input type="text"
													data-bv-notempty="true"
													data-bv-notempty-message="模板组合名称必填"
													class="form-control" name="title" value="${vtmpl.title }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">统计列表模板</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/stat/ltmpl/choose/${module.name }" 
														title="选择统计列表模板"
														choose-key="choose-ltmpl" 
														crn-choose-ltmpl="title" 
														>${statListTemplate != null? statListTemplate.title: '选择列表模板' }</a>
													<input type="hidden" crn-choose-ltmpl="id" name="statListTemplateId" value="${vtmpl.statListTemplateId }" />
												</div>
											</div>
										</div>
									</div> 
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['dialog'], function(Dialog){
		var $page = $('#tmpl-statview-update-${view.id }');
		$('#save', $page).click(function(){
			Dialog.confirm('确认提交？', function(yes){
				if(yes){
					$('form', $page).submit();
				}
			})
		});
	});
</script>
<div></div>