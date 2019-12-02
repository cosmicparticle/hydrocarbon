<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>操作模板（${module.title }）</title>
<div id="tmpl-atmpl-list-${module.name }" class="detail">
	<div>
		<form action="admin/tmpl/atmpl/list">
			
		</form>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>操作模板（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/atmpl/to_create/${module.name }" title="创建模板" target="create_atmpl">
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
					<c:forEach items="${tmplList }" var="tmpl" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${tmpl.title }</td>
							<td><fmt:formatDate value="${tmpl.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="atmpl_update_${tmpl.id }" href="admin/tmpl/atmpl/update/${tmpl.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<c:choose>
									<c:when test="${empty relatedGroupsMap[tmpl.id] }">
										<a confirm="确认删除模板(${tmpl.title })?" href="admin/tmpl/atmpl/remove/${tmpl.id }" class="btn btn-danger btn-xs delete">
											<i class="fa fa-trash-o"></i>
											删除
										</a>
									</c:when>
									<c:otherwise>
										<a title="查看绑定的所有模板组合" href="admin/tmpl/atmpl/group_list/${tmpl.id }"
											target="atmpl_group_list_${tmpl.id }" 
											class="tab btn btn-success btn-xs">
											<i class="fa fa-th-list"></i>
											模板组合
										</a>
										<a href="javascript:STATICS.TMPL.switchTemplateGroup('atmpl', '${module.name }', ${tmpl.id });" 
											class="btn btn-warning btn-xs "
											title="为所有已经绑定到当前列表模板的组合重新指定一个列表模板">
											<i class="fa fa-exchange"></i>
											解绑
										</a>
									</c:otherwise>
								</c:choose>
								<a atmpl-id="${tmpl.id }" atmpl-title="${tmpl.title }" class="btn btn-magenta btn-xs btn-copy-atmpl">
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
		var $page = $('#tmpl-atmpl-list-${module.name }');
		var modules = [];
		try{
			modules = $.parseJSON('${modulesJson}');
		}catch(e){}
		$('.btn-copy-atmpl[atmpl-id]', $page).click(function(){
			var $btn = $(this);
			Dialog.promptSelect({
				data		: modules,
				target		: $btn,
				container	: $page
			}).done(function(selected){
				if(selected.title && selected.moduleName){
					var tmplTitle = $btn.attr('atmpl-title'),
						tmplId = $btn.attr('atmpl-id');
					Dialog.confirm('确认复制操作模板[' + tmplTitle + ']到模块[' + selected.title + ']？', function(yes){
						if(yes){
							Ajax.ajax('admin/tmpl/atmpl/copy/' + tmplId + '/' + selected.moduleName, function(res){
								if(res.status === 'suc' && res.newTmplId){
									$page.getLocatePage().refresh();
									Dialog.confirm('复制成功，是否打开复制成功的操作模板编辑页？', function(yes){
										if(yes){
											Tab.openInTab('admin/tmpl/atmpl/update/' + res.newTmplId, 'atmpl_update_' + res.newTmplId);
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