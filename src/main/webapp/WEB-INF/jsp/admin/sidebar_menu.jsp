<%@page import="cho.carbon.hc.copframe.spring.properties.PropertyPlaceholder"%>
<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<sec:authorize access="hasAuthority('${configAuth }')">
	<li>
		<a href="#" class="menu-dropdown">
			<i class="menu-iconfont icon-hydrocarbon-menupage1"></i>
			<span class="menu-text">系统配置</span>
		</a>
		<ul class="submenu">
			<li>
				<a class="tab" href="admin/config/menu/index" target="sidemenu" title="功能列表管理">
		   			<span class="menu-text">功能管理</span>
		   		</a>
			</li>
			<li>
				<a class="tab" href="admin/config/ks/list" target="ksconfig" title="轻服务管理">
		   			<span class="menu-text">轻服务管理</span>
		   		</a>
			</li>
		</ul>
	</li>
</sec:authorize>

<c:forEach var="menu" items="${block.l1Menus }">
	<c:if test="${l1disables[menu.id] != true }">
		<li l1-menu-id="${menu.id }">
			<a href="#" class="menu-dropdown">
			    <i class="menu-iconfont icon-carbon-menu"></i>
			    <span class="menu-text">${menu.title }</span>
			</a>
			
			<ul class="submenu">
				<c:forEach var="level2" items="${menu.level2s }">
					<c:if test="${l2disables[level2.id] != true}">
						<li>
							<c:choose>
								<c:when test="${level2.templateGroupId != null }">
									<a l2-menu-id="${level2.id }" class="tab" href="admin/modules/curd/list/${level2.id }" 
							   			target="entity_list_${level2.id }" title="${level2.title }">
							   			<span class="menu-text">${level2.title }</span>
							   		</a>
								</c:when>
								<c:when test="${level2.customPageId != null }">
									<a l2-menu-id="${level2.id }" class="tab" href="${level2.customPagePath }" 
							   			target="entity_list_${level2.id }" title="${level2.title }">
							   			<span class="menu-text">${level2.title }</span>
							   		</a>
								</c:when>
								<c:when test="${level2.statViewId != null}">
									<a l2-menu-id="${level2.id }" class="tab" href="admin/stat/view/index/${level2.id }" 
							   			target="stat_view_${level2.statViewId }" title="${level2.title }">
							   			<span class="menu-text">${level2.title }</span>
							   		</a>
								</c:when>
							</c:choose>
					   	</li>
					</c:if>
				</c:forEach>
			</ul>
		</li>
	</c:if>
</c:forEach>
