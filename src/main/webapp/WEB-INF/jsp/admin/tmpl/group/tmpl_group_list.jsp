<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>模板组合管理（${module.title }）</title>
<div id="tmplgroup-${module.name }" class="detail">
	<div>
		<form action="admin/tmpl/group/list">
			
		</form>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>模板组合管理（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/group/to_create/${module.name }" title="创建模板" target="create_tmpl_group">
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
						<th>组合名称</th>
						<th>列表模板</th>
						<th>详情模板</th>
						<th>Key</th>
						<th>最近更新时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${tmplGroups }" var="group" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${group.title }</td>
							<td><a class="tab" target="dtmpl_update_${group.listTemplateId }" href="admin/tmpl/ltmpl/update/${group.listTemplateId }">${group.listTemplateTitle }</a></td>
							<td><a class="tab" target="viewtmpl_update_${group.detailTemplateId }" href="admin/tmpl/dtmpl/update/${group.detailTemplateId }">${group.detailTemplateTitle }</a></td>
							<td>${group.key }</td>
							<td><fmt:formatDate value="${group.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="tmpl_group_update_${group.id }" href="admin/tmpl/group/update/${group.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<a confirm="确认删除模板组合(${group.title })?" href="admin/tmpl/group/remove/${group.id }" class="btn btn-danger btn-xs delete">
									<i class="fa fa-trash-o"></i>
									删除
								</a>
								<a tmpl-id="${group.id }" tmpl-title="${group.title }" class="btn btn-magenta btn-xs btn-copy-tmplgroup">
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
		var $page = $('#tmplgroup-${module.name }');
		var modules = [];
		try{
			modules = $.parseJSON('${modulesJson}');
		}catch(e){}
		$('.btn-copy-tmplgroup[tmpl-id]', $page).click(function(){
			var $btn = $(this);
			Dialog.promptSelect({
				data		: modules,
				target		: $btn,
				container	: $page
			}).done(function(selected){
				if(selected.title && selected.moduleName){
					var tmplTitle = $btn.attr('tmpl-title'),
						tmplId = $btn.attr('tmpl-id');
					Dialog.confirm('确认复制模板组合[' + tmplTitle + ']到模块[' + selected.title + ']？（注意：复制模板组合将会同时复制该模板组合下的列表模板和详情模板）', function(yes){
						if(yes){
							Ajax.ajax('admin/tmpl/group/copy/' + tmplId + '/' + selected.moduleName, function(res){
								if(res.status === 'suc' && res.newTmplId){
									$page.getLocatePage().refresh();
									Dialog.confirm('复制成功，是否打开复制成功的模板组合编辑页？', function(yes){
										if(yes){
											Tab.openInTab('admin/tmpl/group/update/' + res.newTmplId, 'tmpl_group_update_' + res.newTmplId);
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