<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<title>统计列表模板（${module.title }）</title>
<div id="stltmpl-list-${module.name }" class="detail">
	<div>
		<form action="admin/tmpl/stat/ltmpl/list/${module.name }">
			
		</form>
	</div>
	<div class="page-header">
		<div class="header-title">
			<h1>列表模板（${module.title }）</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a class="tab"  href="admin/tmpl/stat/ltmpl/add/${module.name }" title="创建模板" target="add_stltmpl_${module.name }">
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
					<c:forEach items="${ltmpls }" var="ltmpl" varStatus="i" >
						<tr>
							<td>${i.index + 1 }</td>
							<td>${ltmpl.title }</td>
							<td><fmt:formatDate value="${ltmpl.updateTime }" pattern="yyyy-MM-dd HH:mm:ss" /> </td>
							<td>
								<a target="stltmpl_update_${ltmpl.id }" href="admin/tmpl/stat/ltmpl/update/${ltmpl.id }" class="tab btn btn-info btn-xs edit">
									<i class="fa fa-edit"></i>
									修改
								</a>
								<a confirm="确认删除统计列表模板(${ltmpl.title })?" href="admin/tmpl/stat/ltmpl/remove/${ltmpl.id }" class="btn btn-danger btn-xs delete">
									<i class="fa fa-trash-o"></i>
									删除
								</a>
								<a ltmpl-id="${ltmpl.id }" ltmpl-title="${ltmpl.title }" class="btn btn-magenta btn-xs btn-copy-ltmpl">
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
		var $page = $('#stltmpl-list-${module.name }');
		var modules = [];
		try{
			modules = $.parseJSON('${modulesJson}');
		}catch(e){}
	});
</script>