<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="${RES_STAMP }" class="sidemenu-main detail">
	<div class="page-header">
		<div class="header-title">
			<h1>功能列表管理</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a confirm="确认重载系统数据？" href="admin/config/sidemenu/reload" >
				<i class="fa fa-bolt"></i>
			</a>
			<a title="版块模式" href="javascript:;" on-click="toggleBlocks" >
				<i class="fa fa-road"></i>
			</a>
			<a title="保存" href="javascript:;" on-click="save" >
				<i class="fa fa-save"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="col-lg-2">
			<div class="widget radius-bordered block-container">
				<div class="widget-header bordered-left bordered-lightred separated">
					<span class="widget-caption">版块列表</span>
					<div class="widget-buttons">
						<a href="#" title="保存" style="display: none"><i id="save" class="fa fa-check-square"></i></a>
						<a href="#" title="添加版块"><i id="add-block" class="fa fa-plus-square"></i></a>
					</div>
				</div>
				<div class="widget-body block-container">
				</div>
			</div>
		</div>
		<div class="col-lg-5">
			<div class="widget radius-bordered modules-container">
				<div class="widget-header bordered-left bordered-blueberry separated">
					<span class="widget-caption">功能列表</span>
					<div class="widget-buttons">
						<a href="#" title="保存" style="display: none"><i id="save" class="fa fa-check-square"></i></a>
						<a href="#" title="添加一级菜单"><i id="add-level1" class="fa fa-plus-square"></i></a>
					</div>
				</div>
				<div class="widget-body menu-container">
					<ol id="level1-list" class="dd-list">
						<c:forEach items="${menus }" var="menu">
							<li class="dd-item" data-id="${menu.id }" data-auths="${menu.authorities }">
								<div class="dd-handle">
									<span class="level1-title">${menu.title }</span>
									<span class="level-operate">
										<a href="#" title="权限：(${fn:join(level1AuthorityDescriptionMap[menu.id], ';') })"><i class="authority-config icon iconfont icon-authority"></i></a>
										<a href="#"><i class="del-level fa fa-trash-o"></i></a>
									</span>
								</div>
								<ol class="dd-list">
									<c:if test="${!empty menu.level2s }">
										<c:forEach items="${menu.level2s }" var="level2">
											<c:choose>
												<c:when test="${level2.templateGroupId != null }">
													<li class="dd-item" data-id="${level2.id }" group-id="${level2.isDefault == 1? 0: level2.templateGroupId }" data-auths="${level2.authorities }">
														<div class="dd-handle">
															<span class="level2-title">${level2.title }</span>
															<span class="level-operate">
																<a href="#" title="权限：(${fn:join(level2AuthorityDescriptionMap[level2.id], ';') })"><i class="authority-config icon iconfont icon-authority"></i></a>
																<a href="#"><i class="del-level fa fa-trash-o"></i></a>
															</span>
															<span class="tip-level-title">${level2.templateModuleTitle}-${level2.templateGroupTitle}</span>
														</div>
													</li>
												</c:when>
												<c:when test="${level2.statViewId != null }">
													<li class="dd-item" data-id="${level2.id }" statvtmpl-id="${level2.statViewId }" data-auths="${level2.authorities }">
														<div class="dd-handle">
															<span class="level2-title">${level2.title }</span>
															<span class="level-operate">
																<a href="#" title="权限：(${fn:join(level2AuthorityDescriptionMap[level2.id], ';') })"><i class="authority-config icon iconfont icon-authority"></i></a>
																<a href="#"><i class="del-level fa fa-trash-o"></i></a>
															</span>
															<span class="tip-level-title">${level2.templateModuleTitle}-${level2.statViewTitle }</span>
														</div>
													</li>
												</c:when>
											</c:choose>
											
										</c:forEach>
									</c:if>
								</ol>
							</li>
						</c:forEach>
					</ol>
				</div>
			</div>
		</div>
		<div class="col-lg-5">
			<div class="widget radius-bordered mds-container">
				<div class="widget-header bordered-left bordered-palegreen separated">
					<span class="widget-caption">模块列表</span>
					<div class="widget-buttons">
						<span class="input-icon">
							<input type="search" class="form-control input-xs" id="modules-search" placeholder="请输入关键字">
							<i class="glyphicon glyphicon-search blue"></i>
						</span>
					</div>
				</div>
				<div class="widget-body">
					<ol class="dd-list">
						<c:forEach items="${modules }" var="module">
							<c:set var="statDetail" value="${statDetailMap[module.name] }" />
							<c:choose>
								<c:when test="${statDetail == null }">
									<li class="dd-item module-wrapper" module-name="${module.name }">
										<div class="dd-handle">
											<span class="module-title">${module.title }</span>
											<span class="level-operate">
												<a title="列表模板" href="admin/tmpl/ltmpl/list/${module.name }" class="tab" target="${module.name }_ltmpl_list"><i class="iconfont icon-tools"></i></a>
												<a title="详情模板" href="admin/tmpl/dtmpl/list/${module.name }" class="tab" target="${module.name }_dtmpl_list"><i class="iconfont icon-detail"></i></a>
												<a title="操作模板" href="admin/tmpl/atmpl/list/${module.name }" class="tab" target="${module.name }_atmpl_list"><i class="iconfont icon-action"></i></a>
												<a title="字段过滤" href="admin/tmpl/dictfilter/list/${module.name }" class="tab" target="${module.name }_dictfilter_list"><i class="iconfont icon-filter"></i></a>
												<a title="树形结构" href="admin/tmpl/tree/list/${module.name }" class="tab" target="${module.name }_tmpl_tree_list"><i class="iconfont icon-tree"></i></a>
												<a title="模板组合" href="admin/tmpl/group/list/${module.name }" class="tab" target="${module.name }_tmpl_group_list"><i class="iconfont icon-group"></i></a>
											</span>
										</div>
										<ol class="dd-list">
											<c:forEach items="${tmplGroupsMap[module.name] }" var="group">
												<li>
													<div class="dd-handle md-group-title" group-id="${group.id }">
														<span>${group.title }</span>
													</div>
												</li>
											</c:forEach>
										</ol>
									</li>
								</c:when>
								<c:otherwise>
									<li class="dd-item module-wrapper stat-module" module-name="${module.name }">
										<div class="dd-handle">
											<span class="module-title">${module.title }</span>
											<span class="level-operate">
												<a title="列表模板" href="admin/tmpl/stat/ltmpl/list/${module.name }" class="tab" target="${module.name }_stat_ltmpl_list"><i class="iconfont icon-tools"></i></a>
												<a title="统计视图模板" href="admin/tmpl/stat/vtmpl/list/${module.name }" class="tab" target="${module.name }_stat_tmpl_group_list"><i class="iconfont icon-group"></i></a>
											</span>
										</div>
										<ol class="dd-list">
											<c:forEach items="${statDetail.views }" var="view">
												<li>
													<div class="dd-handle md-group-title" statvtmpl-id="${view.id }">
														<span>${view.title }</span>
													</div>
												</li>
											</c:forEach>
										</ol>
									</li>
								</c:otherwise>
							</c:choose>
						</c:forEach>
					</ol>
				</div>
		</div>
	</div>
	<script type="jquery/tmpl" id="level1-item-tmpl">
		<li class="dd-item">
			<div class="dd-handle">
				<span class="level1-title"><input type="text" value="新功能菜单" /></span>
				<span class="level-operate">
					<a href="#"><i class="authority-config icon iconfont icon-authority"></i></a>
					<a href="#"><i class="del-level fa fa-trash-o"></i></a>
				</span>
				<span class="tip-level-title"></span>
			</div>
			<ol class="dd-list"></ol>
		</li>
	</script>
	<script type="jquery/tmpl" id="level2-item-tmpl">
		<li class="dd-item">
			<div class="dd-handle">
				<span class="level2-title"><input type="text" value="\${level2Title}" data-auths="" /></span>
				<span class="level-operate">
					<a href="#" title="权限：()"><i class="authority-config icon iconfont icon-authority"></i></a>
					<a href="#"><i class="del-level fa fa-trash-o"></i></a>
				</span>	
				<span class="tip-level-title">\${moduleTitle}-\${vtmplTitle}</span>
			</div>
		</li>
	</script>
</div>
<script type="text/javascript">
	seajs.use(['config/js/sidemenu-main'], function(S){
		var $page = $('#${RES_STAMP }.sidemenu-main');
		try{
			var config = $.parseJSON('${config}');
			S.init($page, config);
		}catch(e){}
	});
</script>