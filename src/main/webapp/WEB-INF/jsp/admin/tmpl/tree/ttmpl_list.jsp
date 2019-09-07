<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>树形模板（${module.title }）</title>
<div id="tmpl-ttmpl-list-${module.name }" class="detail">
	<div>
		<form action="admin/tmpl/ltmpl/list/${module.name }">
			
		</form>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>树形模板（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/tree/add/${module.name }" title="创建模板" target="add_ttmpl_${module.name }">
				<i class="fa fa-plus"></i>
			</a>
		</div>
	</div>
	<div class="page-body" style="font-size: 15px;">
		<div class="col-lg-offset-1 col-lg-10">
			<table class="table">
				<thead>
					<tr>
						<th>序号</th>
						<th>模板名</th>
						<th>更新时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${ttmpls }" var="ttmpl" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${ttmpl.title }</td>
							<td><fmt:formatDate value="${ttmpl.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="ttmpl_update_${ttmpl.id }" href="admin/tmpl/tree/update/${ttmpl.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<a confirm="确认删除模板(${ttmpl.title })?" href="admin/tmpl/tree/remove/${ttmpl.id }" class="btn btn-danger btn-xs delete">
									<i class="fa fa-trash-o"></i>
									删除
								</a>
								<a ttmpl-id="${ttmpl.id }" ttmpl-title="${ttmpl.title }" class="btn btn-magenta btn-xs btn-copy-ltmpl">
									<i class="fa fa-copy"></i>
									复制到模块
								</a>
								
							</td>
						</tr>
					</c:forEach>
				</tbody>
			</table>
		</div>
	</div>
</div>
<script>
	seajs.use(['utils', 'ajax', 'dialog', 'tab'], function(Utils, Ajax, Dialog, Tab){
		var $page = $('#tmpl-ttmpl-list-${module.name }');
		var modules = [];
		try{
			modules = $.parseJSON('${modulesJson}');
		}catch(e){}
		$('.btn-copy-ttmpl[ttmpl-id]', $page).click(function(){
			var $btn = $(this);
			Dialog.promptSelect({
				data		: modules,
				target		: $btn,
				container	: $page
			}).done(function(selected){
				if(selected.title && selected.moduleName){
					var tmplTitle = $btn.attr('ltmpl-title'),
						tmplId = $btn.attr('ltmpl-id');
					Dialog.confirm('确认复制列表模板[' + tmplTitle + ']到模块[' + selected.title + ']？', function(yes){
						if(yes){
							Ajax.ajax('admin/tmpl/ltmpl/copy/' + tmplId + '/' + selected.moduleName, function(res){
								if(res.status === 'suc' && res.newTmplId){
									$page.getLocatePage().refresh();
									Dialog.confirm('复制成功，是否打开复制成功的列表模板编辑页？', function(yes){
										if(yes){
											Tab.openInTab('admin/tmpl/ltmpl/update/' + res.newTmplId, 'viewtmpl_update_' + res.newTmplId);
										}
									})
								}else{
									Dialog.notice('复制失败', 'error');
								}
							});
						}
					});
				}
			});
			return false;
		});
	});
</script>