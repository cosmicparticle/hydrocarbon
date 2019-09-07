<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<!DOCTYPE html>
<html>
	<head>
		<title><fmt:message key="theme.logo" bundle="${logo}"/></title>
		<link rel="icon" href="favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
		<jsp:include page="/WEB-INF/jsp/jv/common/jv-include.jsp"></jsp:include>
	</head>
	<body>
		<div class="navbar">
	        <div class="navbar-inner">
	             <div class="navbar-header pull-left">
	                 <a href="admin/logout" class="datacenter-logo">	                   
	                  <fmt:message key="theme.logo" bundle="${logo}"/>
	                 </a>
	             </div>
	             <div class="sidebar-collapse" id="sidebar-collapse">
	                    <i class="collapse-icon fa fa-bars"></i>
	             </div>
	             <div class="blocks-area" id="blocks-area-nav">
	             	<style target="blocks"></style>
	             </div>
	             <div class="account-area" id="account-area">
	             	<div class="account-view">
	             		<div class="account-headicon">
		             		<i class="fa fa-user"></i>
		             	</div>
		             	<div class="account-userdesc">
		             		<p class="account-username">${user.nickname }</p>
		             		<p>管理员</p>
		             	</div>
		             	<div class="account-dropdown-icon">
		             		<i class="fa fa-caret-down"></i>
		             	</div>
	             	</div>
	             	<div class="account-dropdown-menu">
             			<div class="account-operate-list">
	             			<a class="tab" href="jv/config/user/detail" target="user_info" title="用户详情">
             					<i class="fa fa-book"></i>
	             				用户详情
	             			</a>
	             			<a class="tab" href="jv/config/user/update" target="user_update" title="用户修改">
             					<i class="fa fa-edit"></i>
	             				用户修改
	             			</a>
	             			<a id="logout">
             					<i class="glyphicon glyphicon-log-out"></i>
             					退出登录
             				</a>
             			</div>
             		</div>
	             	
	             </div>
			</div>
		</div>
	    <div class="main-container container-fluid">
	        <div class="page-container">
	            <div class="page-sidebar" id="sidebar">
	                <ul class="nav sidebar-menu">
	                	<li class="open first">
	                		<a href="#">
	                			<i class="menu-icon glyphicon glyphicon-home"></i>
	                			<span class="menu-text">主页面</span>
	                		</a>
	                	</li>
	                	<style target="menus"></style>
					</ul>
				</div>
				<div class="page-content">
					<div class="tabbable">	
						<div class="tab-warp">
							<a href="javascript:;" class="move left">◀</a>	
								<div class="nav-tabs-wrap">	
									<ul class="nav nav-tabs" id="main-tab-title-container">
										<li class="active main-tab-title">
										    <a data-toggle="tab" href="#cpf-home-tab">
												主页
										    </a>
										</li>
									</ul>
								</div>
							<a href="javascript:;" class="move right">▶</a>
						</div>				
						<div class="tab-content" id="main-tab-content-container">
							<div id="cpf-home-tab" class="tab-pane active main-tab-content">
								<jsp:include page="home.jsp"></jsp:include>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	    <script src="media/admin/plugins/beyond/js/bootstrap.js"></script>
	    <script src="media/admin/plugins/beyond/js/toastr/toastr.js"></script>
	    <script src="media/admin/plugins/beyond/js/beyond.min.js"></script>
	    <script src="media/admin/plugins/tooltip/popper.min.js"></script>
	    
	    
	    <script type="text/javascript">
	    	$(function(){
	    		seajs.config({
				base	: '${basePath}media/jv/',
				paths	: {
					  COMMON	: '${basePath}media/common/',
				},
				vars	: {
					ajaxHost	: '${ajaxHost}'
				},
				alias	: {
					'jquery'	: 'COMMON/cpf/cpf-jquery.js?v=${cpfVersion}',
					'$CPF'		: 'COMMON/cpf/cpf-core.js?v=${cpfVersion}',
					'utils'		: 'COMMON/cpf/cpf-utils.js?v=${cpfVersion}',
					'page'		: 'COMMON/cpf/cpf-page.js?v=${cpfVersion}',
					'dialog'	: 'COMMON/cpf/cpf-dialog.js?v=${cpfVersion}',
					'paging'	: 'COMMON/cpf/cpf-paging.js?v=${cpfVersion}',
					'tree'		: 'COMMON/cpf/cpf-tree.js?v=${cpfVersion}',
					'form'		: 'COMMON/cpf/cpf-form.js?v=${cpfVersion}',
					'tab' 		: 'COMMON/cpf/cpf-tab.js?v=${cpfVersion}',
					'ajax'		: 'COMMON/cpf/cpf-ajax.js?v=${cpfVersion}',
					'poll'		: 'COMMON/cpf/cpf-poll.js?v=${cpfVersion}',
					'event'		: 'COMMON/cpf/cpf-event.js?v=${cpfVersion}',
					'css'		: 'COMMON/cpf/cpf-css.js?v=${cpfVersion}',
					'timer'		: 'COMMON/cpf/cpf-timer.js?v=${cpfVersion}',
					'console'	: 'COMMON/cpf/cpf-console.js?v=${cpfVersion}',
					'control'	: 'COMMON/cpf/cpf-control.js?v=${cpfVersion}',
					'checkbox'	: 'COMMON/cpf/cpf-checkbox.js?v=${cpfVersion}',
					'innerpage'	: 'COMMON/cpf/cpf-innerpage.js?v=$${cpfVersion}',
					'tmpl'		: 'COMMON/cpf/cpf-tmpl.js?v=${cpfVersion}',
					'table'		: 'COMMON/cpf/cpf-table.js?v=${cpfVersion}',
					'select2'	: '${basePath}media/admin/plugins/select2/js/select2.full.js',
					'indexer'	: 'COMMON/cpf/cpf-indexer.js?v=${cpfVersion}',
					'selectable-table'	: 'COMMON/cpf/cpf-selectable-table.js?v=$${cpfVersion}',
					'custompage': '${basePath}media/jv/custompage/js/custompage.js',
				}
	    		});
	    		
	    		seajs.use('index/js/jv-main.js?v=${cpfVersion}', function(Main){
	    			Main.deferred.done(function(require){
	    				seajs.use('index/js/index.js', function(Index){
	    					Index.init({
	    	    				$page	: document.body,
	    	    				blockId	: '${blockId}',
	    	    				menuId	: '${menuId}'
		    				});
	    				});
	    			});
	    		});
	    	});
	    </script>
	</body>
</html>