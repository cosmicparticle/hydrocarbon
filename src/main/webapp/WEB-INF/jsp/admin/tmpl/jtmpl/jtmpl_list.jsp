<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>跳转模板（${module.title }）</title>
<div id="tmpl-jtmpl-list-${module.name }" class="detail">
	<div>
		<form action="admin/tmpl/jtmpl/list/${module.name }">
			
		</form>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>跳转模板（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/jtmpl/to_create/${module.name }" title="创建模板" target="add_jtmpl_${module.name }">
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
					<c:forEach items="${jtmplList }" var="jtmpl" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${jtmpl.title }</td>
							<td><fmt:formatDate value="${jtmpl.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="viewtmpl_update_${jtmpl.id }" href="admin/tmpl/jtmpl/update/${jtmpl.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<c:choose>
									<c:when test="${empty relatedGroupsMap[jtmpl.id] }">
										<a confirm="确认删除模板(${jtmpl.title })?" href="admin/tmpl/jtmpl/remove/${jtmpl.id }" class="btn btn-danger btn-xs delete">
											<i class="fa fa-trash-o"></i>
											删除
										</a>
									</c:when>
									<c:otherwise>
										<a title="查看绑定的所有模板组合" href="admin/tmpl/jtmpl/group_list/${jtmpl.id }"
											target="dtmpl_group_list_${tmpl.id }" 
											class="tab btn btn-success btn-xs">
											<i class="fa fa-th-list"></i>
											模板组合
										</a>
										<a href="javascript:STATICS.TMPL.switchTemplateGroup('jtmpl', '${module.name }', ${jtmpl.id });" 
											class="btn btn-warning btn-xs "
											title="为所有已经绑定到当前跳转模板的组合重新指定一个跳转模板">
											<i class="fa fa-exchange"></i>
											解绑
										</a>
									</c:otherwise>
								</c:choose>
								<a jtmpl-id="${jtmpl.id }" jtmpl-title="${jtmpl.title }" class="btn btn-magenta btn-xs btn-copy-jtmpl">
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
		var $page = $('#tmpl-jtmpl-list-${module.name }');
		var modules = [];
		try{
			modules = $.parseJSON('${modulesJson}');
		}catch(e){}
		$('.btn-copy-jtmpl[jtmpl-id]', $page).click(function(){
			var $btn = $(this);
			Dialog.promptSelect({
				data		: modules,
				target		: $btn,
				container	: $page
			}).done(function(selected){
				if(selected.title && selected.moduleName){
					var tmplTitle = $btn.attr('jtmpl-title'),
						tmplId = $btn.attr('jtmpl-id');
					Dialog.confirm('确认复制跳转模板[' + tmplTitle + ']到模块[' + selected.title + ']？', function(yes){
						if(yes){
							Ajax.ajax('admin/tmpl/jtmpl/copy/' + tmplId + '/' + selected.moduleName, function(res){
								if(res.status === 'suc' && res.newTmplId){
									$page.getLocatePage().refresh();
									Dialog.confirm('复制成功，是否打开复制成功的跳转模板编辑页？', function(yes){
										if(yes){
											Tab.openInTab('admin/tmpl/jtmpl/update/' + res.newTmplId, 'viewtmpl_update_' + res.newTmplId);
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