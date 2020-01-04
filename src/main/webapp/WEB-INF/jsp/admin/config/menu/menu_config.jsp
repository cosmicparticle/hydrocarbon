<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="menu-config-${RES_STAMP }" class="sidemenu-main detail">
	<div class="page-header">
		<div class="header-title">
			<h1>功能列表管理</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" href="#" on-click="refreshPage">
				<i class="glyphicon glyphicon-refresh"></i>
			</a>
			<a confirm="确认重载系统数据？" title="重新加载" href="admin/config/sidemenu/reload" >
				<i class="fa fa-bolt"></i>
			</a>
			<a title="版块模式" href="javascript:;" on-click="toggleBlocks" >
				<i class="fa fa-road"></i>
			</a>
			<a title="保存" href="javascript:;" on-click="save" on-render="bindSaveToggle">
				<i class="fa fa-save"></i>
			</a>
		</div>
	</div>
	<div class="page-body">
		<div class="col-lg-2">
			<div class="widget radius-bordered block-container">
				<div class="widget-header bordered-left bordered-lightred separated">
					<span class="widget-caption">版块</span>
					<div class="widget-buttons">
						<a href="#" title="保存" style="display: none"><i id="save" class="fa fa-check-square"></i></a>
						<a href="#" title="添加版块" on-click="addBlock"><i id="add-block" class="fa fa-plus-square"></i></a>
					</div>
				</div>
				<div class="widget-body block-container" style="height: 400px;"
				>
					<ol class="dd-list" id="block-container">
						<style target="blocks"></style>
					</ol>
				</div>
			</div>
		</div>
		<div class="col-lg-5">
			<div class="widget radius-bordered modules-container">
				<div class="widget-header bordered-left bordered-blueberry separated">
					<span class="widget-caption">功能列表</span>
					<div class="widget-buttons">
						<a href="#" title="保存" style="display: none"><i id="save" class="fa fa-check-square"></i></a>
						<a href="#" title="添加一级菜单" on-click="addL1Menu"><i id="add-level1" class="fa fa-plus-square"></i></a>
					</div>
				</div>
				<div class="widget-body menu-container">
					<ol id="level1-list" class="dd-list">
						<style target="menus"></style>
					</ol>
				</div>
			</div>
		</div>
		<div class="col-lg-5">
			<div class="widget radius-bordered mds-container">
				<div class="widget-header bordered-left bordered-palegreen separated">
					<span class="widget-caption">
						<style target="change-mode"></style>
					</span>
					<style target="btn-add-custom-page"></style>
					<div class="widget-buttons">
						<span class="input-icon">
							<input type="search" class="form-control input-xs" on-input="filterSourceItems" placeholder="请输入关键字">
							<i class="glyphicon glyphicon-search blue"></i>
						</span>
					</div>
				</div>
				<div class="widget-body">
					<style target="modules"></style>
					<style target="customPages"></style>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['config/js/menu-config'], function(MenuConfig){
		var $page = $('#menu-config-${RES_STAMP}');
		MenuConfig.initPage({
			$page	: $page
		});
	});
</script>