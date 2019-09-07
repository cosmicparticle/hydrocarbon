<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>操作模板（${module.title }）</title>
<div id="tmpl-dictfilter-list-${module.name }" class="detail">
	<div>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>字段过滤器列表（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/dictfilter/to_create/${module.name }" title="创建过滤器" target="create_dictfilter">
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
						<th>过滤器名</th>
						<th>更新时间</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${filters }" var="filter" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${filter.title }</td>
							<td><fmt:formatDate value="${filter.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="dictfilter_update_${filter.id }" href="admin/tmpl/dictfilter/update/${filter.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<c:choose>
									<c:when test="${empty relatedGroupsMap[filter.id] }">
										<a confirm="确认删除过滤器(${filter.title })?" href="admin/tmpl/dictfilter/remove/${filter.id }" class="btn btn-danger btn-xs delete">
											<i class="fa fa-trash-o"></i>
											删除
										</a>
									</c:when>
									<c:otherwise>
										<a title="查看绑定的所有模板组合" href="admin/tmpl/dictfilter/group_list/${filter.id }"
											target="dictfilter_group_list_${filter.id }" 
											class="tab btn btn-success btn-xs">
											<i class="fa fa-th-list"></i>
											模板组合
										</a>
										<a href="javascript:STATICS.TMPL.switchTemplateGroup('dictfilter', '${module.name }', ${filter.id });" 
											class="btn btn-warning btn-xs "
											title="为所有已经绑定到当前字段过滤器的组合重新指定一个字段过滤器">
											<i class="fa fa-exchange"></i>
											解绑
										</a>
									</c:otherwise>
								</c:choose>
								<a dictfilter-id="${filter.id }" dictfilter-title="${filter.title }" class="btn btn-magenta btn-xs btn-copy-dictfilter">
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
		var $page = $('#tmpl-dictfilter-list-${module.name }');
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