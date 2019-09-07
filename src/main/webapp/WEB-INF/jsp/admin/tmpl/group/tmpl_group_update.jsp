<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${group != null }">修改${module.title }模板组合-${group.title }</c:when>
		<c:otherwise>创建${group.title }模板组合</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<link type="text/css" rel="stylesheet" href="media/admin/tmpl/css/tmpl-group-update.css" />
<div id="tmpl-group-update-${group.id }" class="tmpl-group-update">
	<script type="jquery/tmpl" id="tmpl-field">
		<div class="form-group field-item field-id="\${fieldId}" data-id="\${id}">
			<label class="control-label field-title">\${title}</label>
			<div class="field-value">
				<span class="field-view"></span>
			</div>
			<div class="operate-buttons">
				<a class="remove-field" title="删除字段"><i class="fa fa-trash-o"></i></a>
			</div>
		</div>
	</script>
	<script type="jquery/tmpl" id="tmpl-action">
		<tr>
			<td>\${index + 1 }</td>
			<td><input class="action-title" type="text" value="\${title }" /></td>
			{{if multiple}}
				<td>
					<select class="multiple">
						<option value="2">事务型多选</option>
						<option value="1">多选</option>
						<option value="0">单选</option>
					</select>
				</td>
			{{else}}
				<td>
					<label>
                        <input class="outgoing" type="checkbox" class="colored-blue">
                        <span class="text"></span>
                    </label>
				</td>
			{{/if}}
			<td>
				<div class="btn-icon-selector" data-icon="">
					{{if iconClass !== ''}}
						<i class="\${iconClass}"></i>
					{{/if}}
				</div>
			</td>
			<td>
				<a class="btn btn-danger btn-xs delete">
					<i class="fa fa-trash-o"></i>
					删除
				</a>
			</td>
		</tr>
	</script>
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" class="btn-save" title="保存"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="detail">
		<div class="page-header">
			<div class="header-title">
				<h1>${title }</h1>
			</div>
			<div class="header-buttons">
				<a class="refresh" title="刷新" id="refresh-toggler" href="page:refresh">
					<i class="glyphicon glyphicon-refresh"></i>
				</a>
			</div>
		</div>
		<div class="page-body">
			<div class="row">
				<div class="row">
					<div class="col-lg-offset-1 col-sm-offset-1 col-xs-offset-1 col-lg-10 col-sm-10 col-xs-10" id="group-container">
						<form class="bv-form form-horizontal validate-form" action="admin/tmpl/group/save">
							<div class="widget field-group">
								<div class="widget-header">
									<span class="widget-caption"> <span class="group-title">基本信息</span>
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="id" value="${group.id }" />
									<input type="hidden" name="module" value="${module.name }" />
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">名称</label>
												<div class="col-lg-8">
													<input type="text"
													data-bv-notempty="true"
													data-bv-notempty-message="模板组合名称必填"
													class="form-control" name="title" value="${group.title }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">列表模板</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/ltmpl/choose/${module.name }" 
														title="选择列表模板"
														choose-key="choose-ltmpl" 
														crn-choose-ltmpl="title" 
														>${group.listTemplateId != null? group.listTemplateTitle: '选择列表模板' }</a>
													<input type="hidden" crn-choose-ltmpl="id" name="listTemplateId" value="${group.listTemplateId }" />
												</div>
											</div>
										</div>
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">详情模板</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/dtmpl/choose/${module.name }" 
														title="选择列表模板"
														choose-key="choose-dtmpl" 
														crn-choose-dtmpl="title" >${group.detailTemplateId != null? group.detailTemplateTitle: '选择详情模板' }</a>
													<input type="hidden" crn-choose-dtmpl="id" name="detailTemplateId" value="${group.detailTemplateId }" />
												</div>
											</div>
										</div>
									</div> 
									<div class="row">
										<div class="form-group"> 
											<div class="col-lg-12"> 
												<label class="col-lg-2 control-label" for="name">列表功能按钮</label>
												<div class="col-lg-10">
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showCreateButton" 
															type="checkbox" 
															class="checkbox-slider colored-blue" 
															${moduleWritable? '': 'disabled="disabled"' } 
															${group.hideCreateButton == 1? '': 'checked="checked"' }>
														<span class="text">创建按钮</span>
													</label>
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showImportButton" 
															type="checkbox" class="checkbox-slider colored-success" 
															${moduleWritable? '': 'disabled="disabled"' } 
															${group.hideImportButton == 1? '': 'checked="checked"' }>
														<span class="text">导入按钮</span>
													</label>
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showExportButton" 
															type="checkbox" 
															class="checkbox-slider colored-darkorange" 
															${group.hideExportButton == 1? '': 'checked="checked"' }>
														<span class="text">导出按钮</span>
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="form-group"> 
											<div class="col-lg-12">
												<label class="col-lg-2 control-label" for="name">列表操作按钮</label>
												<div class="col-lg-10">
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showQueryButton" 
															type="checkbox" 
															class="checkbox-slider colored-magenta" 
															${moduleWritable? '': 'disabled="disabled"' } 
															${group.hideQueryButton == 1? '': 'checked="checked"' }>
														<span class="text">查询及条件</span>
													</label>
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showDeleteButton" 
															type="checkbox" class="checkbox-slider colored-danger" 
															${moduleWritable? '': 'disabled="disabled"' } 
															${group.hideDeleteButton == 1? '': 'checked="checked"' }>
														<span class="text">删除按钮</span>
													</label>
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="form-group"> 
											<div class="col-lg-12">
												<label class="col-lg-2 control-label" for="name">详情修改按钮</label>
												<div class="col-lg-10">
													<label class="col-lg-4 col-xs-3 form-control-static">
														<input id="showSaveButton" 
															type="checkbox" 
															class="checkbox-slider colored-success" 
															${moduleWritable? '': 'disabled="disabled"' } 
															${group.hideSaveButton == 1? '': 'checked="checked"' }>
														<span class="text">保存</span>
													</label>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="widget">
								<div class="widget-header">
									<span class="widget-caption">树形视图配置</span>
									<div class="widget-buttons">
									</div>
								</div>
								<div class="widget-body">
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">树形模板</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/tree/choose/${module.name }" 
														title="选择树形模板"
														choose-key="choose-ttmpl" 
														crn-choose-ttmpl="title" 
														>${group.treeTemplateId != null? group.treeTemplateTitle: '选择树形模板' }</a>
													<input type="hidden" crn-choose-ttmpl="id" name="treeTemplateId" value="${group.treeTemplateId }" />
												</div>
											</div>
										</div>
									</div>
									<div class="row">
										<div class="form-group"> 
											<div class="col-lg-12">
												<label class="col-lg-5 col-lg-offset-1 col-xs-3 form-control-static">
													<input id="showTreeToggleButton" 
														type="checkbox" 
														class="checkbox-slider colored-magenta" 
														${group.hideTreeToggleButton == 1? '': 'checked="checked"' }>
													<span class="text">切换树形视图按钮</span>
												</label>
												<label class="col-lg-5 col-lg-offset-1 col-xs-3 form-control-static">
													<input id="defaultTreeView" name="defaultTreeView"
														type="checkbox" class="checkbox-slider colored-danger" 
														value="1"
														${group.defaultTreeView == 1? 'checked="checked"': '' }>
													<span class="text">默认显示树形视图</span>
												</label>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="widget">
								<div class="widget-header">
									<span class="widget-caption">列表操作按钮</span>
									<div class="widget-buttons">
										<div id="list-action-select" class="chooser">
										</div>
									</div>
								</div>
								<div class="widget-body">
									<table class="table table-condensed">
										<thead>
											<tr>
												<th>序号</th>
												<th>按钮文字</th>
												<th>
													多选选项
													<span 
														title="“事务型多选”指在选中多个实体进行操作时，只有全部都处理成功才算成功，中间任一实体处理失败都会放弃其他实体的处理"
														class="badge badge-darkorange badge-helper"></span>	
												</th>
												<th>图标</th>
												<th>操作</th>
											</tr>
										</thead>
										<tbody id="list-actions">
										</tbody>
									</table>
								</div>
							</div>
							<div class="widget">
								<div class="widget-header">
									<span class="widget-caption">详情操作按钮</span>
									<div class="widget-buttons">
										<div id="detail-action-select" class="chooser">
										</div>
									</div>
								</div>
								<div class="widget-body">
									<table class="table table-condensed">
										<thead>
											<tr>
												<th>序号</th>
												<th>按钮文字</th>
												<th>外部显示</th>
												<th>图标</th>
												<th>操作</th>
											</tr>
										</thead>
										<tbody id="detail-actions">
										</tbody>
									</table>
								</div>
							</div>
							<div class="widget field-group">
								<div class="widget-header">
									<span class="widget-caption"> <span class="group-title">默认字段</span>
									</span>
									<div class="widget-buttons">
										<div class="input-icon field-search">
											<span class="search-input-wrapper"> <input type="text"
												class="search-text-input form-control input-xs glyphicon-search-input"
												autocomplete="off" placeholder="输入添加的字段名">
											</span> <i class="glyphicon glyphicon-search blue"></i> <i
												title="选择字段"
												class="glyphicon glyphicon-th blue field-picker-button"></i>
										</div>
									</div>
								</div>
								<div class="widget-body field-container"></div>
							</div>
							<div class="widget">
								<div class="widget-header">
									<span class="widget-caption">导入字段过滤
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="importDictionaryFilter.id" value="${group.importDictionaryFilter.id }" />
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" >基础字段</label>
												<div class="base-fields col-lg-8">
													<label>
														<input name="importDictionaryFilter.withModule" type="checkbox" ${group.importDictionaryFilter.withModule == 1? 'checked="checked"': '' } value="1" />
														<span class="text">模块</span>
													</label>
													<label>
														<input name="importDictionaryFilter.withDetailTemplate" type="checkbox" class="colored-blue" ${group == null || group.importDictionaryFilter.withDetailTemplate == 1? 'checked="checked"': '' } value="1" />
														<span class="text">详情</span>
													</label>
													<label>
														<input name="importDictionaryFilter.withListTemplate" type="checkbox" class="colored-success" ${group == null || group.importDictionaryFilter.withListTemplate == 1? 'checked="checked"': '' } value="1" />
														<span class="text">列表</span>
													</label>
												</div>
											</div>
											<div class="form-group"> 
												<label class="col-lg-4 control-label">过滤器</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/dictfilter/choose/${module.name }" 
														title="选择字段过滤器"
														choose-key="choose-difilter-i" 
														crn-choose-difilter-i="title" 
														>${group.importDictionaryFilter.filter != null? group.importDictionaryFilter.filter.title: '选择字段过滤器' }</a>
													<input type="hidden" crn-choose-difilter-i="id" name="importDictionaryFilter.filterId" value="${group.importDictionaryFilter.filter.id }" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="widget">
								<div class="widget-header">
									<span class="widget-caption">导出字段过滤
									</span>
								</div>
								<div class="widget-body">
									<input type="hidden" name="exportDictionaryFilter.id" value="${group.exportDictionaryFilter.id }" />
									<div class="row">
										<div class="col-lg-6">
											<div class="form-group">
												<label class="col-lg-4 control-label" for="name">基础字段</label>
												<div class="base-fields col-lg-8">
													<label>
														<input name="exportDictionaryFilter.withModule" type="checkbox" ${group.exportDictionaryFilter.withModule == 1? 'checked="checked"': '' } value="1" />
														<span class="text">模块</span>
													</label>
													<label>
														<input name="exportDictionaryFilter.withDetailTemplate" type="checkbox" class="colored-blue" ${group == null || group.exportDictionaryFilter.withDetailTemplate == 1? 'checked="checked"': '' } value="1" />
														<span class="text">详情</span>
													</label>
													<label>
														<input name="exportDictionaryFilter.withListTemplate" type="checkbox" class="colored-success" ${group == null || group.exportDictionaryFilter.withListTemplate == 1? 'checked="checked"': '' } value="1" />
														<span class="text">列表</span>
													</label>
												</div>
											</div>
											<div class="form-group"> 
												<label class="col-lg-4 control-label" for="name">过滤器</label>
												<div class="col-lg-8">
													<a 
														class="form-control"
														href="admin/tmpl/dictfilter/choose/${module.name }" 
														title="选择列表模板"
														choose-key="choose-difilter-e" 
														crn-choose-difilter-e="title" 
														>${group.exportDictionaryFilter.filter != null? group.exportDictionaryFilter.filter.title: '选择字段过滤器' }</a>
													<input type="hidden" crn-choose-difilter-e="id" name="exportDictionaryFilter.filterId" value="${group.exportDictionaryFilter.filter.id }" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['tmpl/js/tmpl-group-update', 'utils'], function(TmplGroupUpdate, Utils){
		var $page = $('#tmpl-group-update-${group.id }');
		console.log($page);
		var premisesJson = [];
		var actions = [];
		var tmplActions = [];
		var atmpls = [];
		try{
			premisesJson = Utils.parseJSON('${premisesJson}') || [];
			tmplActions = Utils.parseJSON('${tmplActions}') || [];
			atmpls = Utils.parseJSON('${atmpls}') || [];
		}catch(e){console.log(e)}
		TmplGroupUpdate.init($page, '${module.name}', premisesJson, {
			tmplActions	: tmplActions,
			atmpls		: atmpls
		});
	});
</script>
<div></div>