<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${ttmpl != null }">修改${module.title }树形模板-${ttmpl.title }</c:when>
		<c:otherwise>创建${module.title }树形模板</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<div class="ttmpl-update" id="ttmpl-update-${RES_STAMP }">
	<script type="text/json" id="ttmplJson">${ttmplJson}</script>
	<script type="text/json" id="config-structure-json">${configStructureJson}</script>
	<script type="jquery/tmpl" id="node-attr-tmpl">
		<div>\${name}</div>
	</script>
	
	<script type="jquery/tmpl" id="criteria-item-tmpl">
		<div class="criteria-item">
			<div class="criteria-property-name">
				<span>\${fieldTitle}</span>
			</div>
			<div class="criteria-partitions-container"></div>
			<span class="btn-remove-criteria"></span>
		</div>
	</script>
	
	<script type="jquery/tmpl" id="criteria-field-search-tmpl">
		<div class="input-icon field-search criteria-field-search">
			<span class="search-input-wrapper">
				<input type="text" class="search-text-input form-control input-xs glyphicon-search-input" autocomplete="off" placeholder="输入添加的字段名">
			</span>
			<i class="glyphicon glyphicon-search blue"></i>
			<i title="选择字段" class="glyphicon glyphicon-th blue field-picker-button"></i>
		</div>
	</script>
	
	<script type="jquery/tmpl" id="selectable-relation-tmpl">
		<div data-id="\${id}" rel-name="\${name}" mapping-id="\${mappingId}">
			<div class="selectable-relation-title">\${title}</div>
			<span class="btn-remove-relation"></span>
		</div>
	</script>
	
	<script type="jquery/text" id="node-config-tmpl" >
		<div class="widget node-config" data-id="\${nodeId}">
			<div class="widget-header bordered-bottom bordered-blue">
				<span class="widget-caption">
					<label class="node-title">\${nodeTitle}</label>
					<label>（\${nodeName}）</label>
				</span>
				<input type="hidden" class="nodeModule" value="\${nodeModule}" />
				<div class="widget-buttons">
					<button id="btn-remove-node" class="btn btn-default btn-sm">删除</button>
				</div>
			</div>
			<div class="widget-body">
				<div class="widget-body">
					<div class="form-group">
						<label>选择器</label>
						<div>
							<input type="text" class="node-selector form-control" value="\${selector}">
						</div>
					</div>
					<div class="form-group">
						<label>节点文本</label>
						<div>
							<div class="node-text" contenteditable="true">\${nodeText }</div>
						</div>
					</div>
					<div class="form-group">
						<label>节点颜色</label>
						<div>
							<input type="text" class="form-control colorpicker node-color" data-control="wheel" value="\${nodeColor || '#2dc3e8'}">
						</div>
					</div>
					{{if nodeModule === '${module.name}'}}
						<div class="form-group">
							<label>设为根节点</label>
							<div class="form-value">
								<label class="col-lg-6 col-xs-6 form-control-static">
									<input type="checkbox" class="checkbox-slider colored-blue is-root-node"  />
									<span class="text"></span>
								</label>
							</div>
							<div class="ltmpl-update ttmpl-root-criterias"></div>
						</div>
					{{/if}}
					<div class="form-group">
						<label class="tooltip-label">
							关联模板组合
							<span class="badge badge-orange" data-toggle="tooltip" title="用于打开详情和修改页面">?</span>	
						</label>
						<div>
							<a 
								class="form-control"
								href="admin/tmpl/group/choose/\${nodeModule }" 
								title="选择模板组合"
								choose-key="choose-tmplgroup-\${uuid}" 
								crn-choose-tmplgroup-\${uuid}="title" 
								>\${templateGroupId? templateGroupTitle: '选择模板组合' }</a>
							<input type="hidden" crn-choose-tmplgroup-\${uuid}="id" id="templateGroupId" value="\${templateGroupId }" />
						</div>
					</div>
					<div class="form-group">
						<label>操作按钮</label>
						<div class="operate-buttons form-value">
							<div class="operate-buttons-common">
								<label class="col-lg-6 col-xs-6 form-control-static">
									<input type="checkbox" class="checkbox-slider colored-blue show-detail-button" \${hideDetailButton == 1? '': 'checked="checked"'} />
									<span class="text">详情按钮</span>
								</label>
								<label class="col-lg-6 col-xs-6 form-control-static">
									<input type="checkbox" class="checkbox-slider colored-success show-update-button" \${hideUpdateButton == 1? '': 'checked="checked"'} /> 
									<span class="text">修改按钮</span>
								</label>
							</div>
						</div>
					</div>
					<div class="form-group">
						<label class="tooltip-label">
							直接显示子实体
							<span class="badge badge-orange" data-toggle="tooltip"
								title="当只有一个可选关系时能够勾选。
								勾选后在树形图上，以当前节点模板显示的实体下，将不显示关系名，直接显示子关系实体">?</span>	
						</label>
						<div class="operate-buttons form-value">
							<div class="operate-buttons-common">
								<label class="col-lg-6 col-xs-6 form-control-static">
									<input type="checkbox" class="checkbox-slider colored-blue is-direct" \${isDirect == 1? 'checked="checked"': ''} />
									<span class="text"></span>
								</label>
							</div>
						</div>
					</div>
					{{if rels && rels.length > 0}}
						<div class="form-group">
							<label>可选关系</label>
							<div class="node-relations">
								<div class="node-relation-list">
									<div class="selectable-relations">
										{{each(i, rel) selectableRelations}}
											{{tmpl(rel) '#ttmpl-update-${RES_STAMP } #selectable-relation-tmpl'}}
										{{/each}}
									</div>
									<div class="node-relation-selector">
										<i></i>
										<div class="node-relation-popup">
											{{each(i, rel) rels}}
												<div rel-index="\${rel.relIndex}" mapping-id="\${rel.mappingId}">\${rel.name}</div>
											{{/each}}
										</div>
									</div>
								</div>
								<div class="relation-config">
									<div class="tabbable tabs-flat tabs-left">
			                            <ul class="nav nav-tabs" id="myTab3">
			                                <li class="tab-sky"><a data-toggle="tab" href="#rel-config-tab-pane-\${uuid}" aria-expanded="false">配置</a></li>
			                                <li class="tab-red active"><a data-toggle="tab" href="#rel-filter-tab-pane-\${uuid}" aria-expanded="true">筛选</a></li>
			                            </ul>
			
			                            <div class="tab-content">
			                                <div id="rel-config-tab-pane-\${uuid}" class="tab-pane">
			                                	<div>
			                                	</div>
			                                </div>
			
			                                <div id="rel-filter-tab-pane-\${uuid}" class="tab-pane active">
			                                	<div class="relation-criteria-fields">
													<div class="relation-criterias">
													</div>
													<div class="criteria-opr-area"><i></i></div>
			                                	</div>
												<div class="relation-criteria-detail relation-filter-mode-field">
													<div class="relation-criteria-detail-top">
														<div style="flex:1;">
															<div style="float:right;position:relative;">
																<label >          
																	<input type="checkbox" class="relation-filter-mode-switch checkbox-slider colored-darkorange">
																	<span class="text">筛选关系名</span>
																</label>
															</div>
														</div>
													</div>
													<div class="relation-filter-label-mode">
														<label>关系名</label>
														<div id="filter-labels-wrap" style="flex:1;">
															<select class="input-xs" multiple="multiple">
															</select>
														</div>
													</div>
													<div class="relation-filter-label-mode">
														<label>包含关系</label>
														<div id="filter-labels-exclusion">
															<select class="input-xs">
																<option value="0">包含</option>
																<option value="1">排除</option>
															</select>
														</div>
													</div>
													<div id="relation-label-row" class="relation-filter-field-mode">
														<label>关系名</label>
														<div id="relation-label-value-wrap">
														</div>
													</div>
													<div id="criteria-detail-field-input-type-row" class="relation-filter-field-mode">
														<label>控件</label>
														<div>
															<select id="field-input-type" class="input-xs">
																<option value="text">文本框</option>
																<option value="select">单选下拉框</option>
															</select>
														</div>
													</div>
													<div class="relation-filter-field-mode">
														<label>关系</label>
														<div>
															<select id="criteria-detail-comparator" class="input-xs">
																<option value="s1">包含</option>
																<option value="s2">开头为</option>
																<option value="s3">结尾为</option>
																<option value="s4">等于</option>
															</select>
														</div>
													</div>
													<div class="relation-filter-field-mode">
														<label id="default-value-label">值</label>
														<div id="criteria-default-value-container">
														</div>
													</div>
												</div>
											</div>
			                            </div>
			                        </div>
								</div>
							</div>
						</div>
					{{/if}}
				</div>
			</div>
		</div>
	</script>
	<script type="jquery/tmpl" id="criteria-item-tmpl">
		<div class="criteria-item">
			<div class="criteria-property-name">
				<span>\${fieldTitle}</span>
			</div>
			<div class="criteria-partitions-container"></div>
			<span class="btn-remove-criteria"></span>
		</div>
	</script>
	<script type="jquery/tmpl" id="node-main-criteria-tmpl">
	
		<div class="criterias-area-body">
			<div class="criterias-area col-lg-6 col-md-6 col-xs-12 col-sm-12"> 
				<div class="critreias-area-wrapper">
					<div class="criterias-area-title">
						<h2>条件列表</h2>
						<span id="add-criteria">
							<i class="fa fa-plus"></i>
						</span>
					</div>
					<div class="criterias-wrapper">
						<div class="criterias-container">
						</div>
					</div>
				</div>
			</div>
			<div class="criteria-detail-area col-lg-6 col-md-6 col-xs-12 col-sm-12">
				<div class="criteria-detail-area-wrapper">
					<div class="criteria-detail-title">
						<h2>条件详情</h2>
					</div>
					<div class="criteria-detail-wrapper">
						<div class="criteria-detail-container">
							<div class="row criteria-field-search-row">
								<div class="col-lg-12">
									<div class="input-icon field-search">
										<span class="search-input-wrapper">
											<input type="text" class="search-text-input form-control input-xs glyphicon-search-input" autocomplete="off" placeholder="输入条件字段名 ">
										</span>
										<i class="glyphicon glyphicon-search blue"></i>
										<i title="选择字段" class="glyphicon glyphicon-th blue field-picker-button"></i>
									</div>
								</div>
							</div>
							<div class="row criteria-show-toggle-row hide-when-no-field">
								<div class="col-lg-12">
									<label>
										<input id="toggle-show-criteria" class="checkbox-slider slider-icon colored-blue" checked="checked" type="checkbox">
										<span class="text">显示(勾选时将条件显示在列表上方，供用户查询)</span>
									</label>
								</div>
							</div>
							<div class="row hide-when-no-field">
								<div class="col-lg-12 criteria-detail-partitions-container">
									<div class="criteria-detail-partition">
										<div class="criteria-detail-relation">
											<select>
												<option>或</option>
												<option>与</option>
											</select>
										</div>
										<div class="criteria-detail-comparator">
											<select>
												<option>早于</option>
												<option>晚于</option>
											</select>
										</div>
										<div class="criteria-detail-value">
											<input type="text" />
										</div>
									</div>
									<div class="criteria-partition-add">
										<i class="fa fa-plus"></i>
									</div>
								</div>
								<div class="col-lg-12 criteria-detail-show-config-container">
									<div id="relation-label-row">
										<label>关系名</label>
										<div id="relation-label-value-wrap">
										</div>
									</div>
									<div id="criteria-detail-field-input-type-row">
										<label>控件</label>
										<div>
											<select id="field-input-type">
												<option value="text">文本框</option>
												<option value="select">单选下拉框</option>
											</select>
										</div>
									</div>
									<div>
										<label>关系</label>
										<div>
											<select id="criteria-detail-comparator">
												<option value="s1">包含</option>
												<option value="s2">开头为</option>
												<option value="s3">结尾为</option>
												<option value="s4">等于</option>
											</select>
										</div>
									</div>
									<div>
										<label id="default-value-label">默认值</label>
										<div id="criteria-default-value-container">
										</div>
									</div>
									<div id="criteria-placeholder-row">
										<label>占位文本</label>
										<div>
											<input id="criteria-detail-placeholder" type="text">
										</div>
									</div>
								</div>
							</div>
						</div>
						<div id="criteria-detail-cover"></div>
					</div>
				</div>
			</div>
		</div>
	</script>
	
	
	
	<div class="float-operate-area">
		<div class="operate-area-cover"></div>
		<a id="save" class="btn-save" title="保存"><i class="fa fa-check-square"></i></a>
	</div>
	<div class="">
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
			<div class="row header-row">
				<div class="col-lg-10 col-lg-offset-1">
					<input type="text" class="form-control" id="tmplTitle" placeholder="请输入模板名称" value="${ttmpl.title }">
				</div>
			</div>
			<div class="row">
				<div id="configs-area" class="col-lg-10 col-lg-offset-1">
					<div class="widget">
						<div class="widget-header bordered-bottom bordered-blue">
							<span class="widget-caption">全局配置</span>
						</div>
						<!--Widget Header-->
						<div class="widget-body">
							<div class="form-group">
								<label>默认节点颜色</label>
								<div>
									<input type="text" id="def-node-color" autocomplete="off" class="form-control colorpicker" data-control="wheel" value="${empty ttmpl.defaultNodeColor? '#47a3ff': ttmpl.defaultNodeColor }">
								</div>
							</div>
							<div class="form-group">
								<label>最大深度</label>
								<div>
									<input type="number" id="max-deep" class="form-control" value="${ttmpl.maxDeep }">
								</div>
							</div>

						</div>
					</div>
					<div class="widget">
						<div class="widget-header bordered-bottom bordered-blue">
							<span class="widget-caption">节点配置</span>
							<div class="widget-buttons">
								<span class="input-icon">
									<select id="add-node-type" class="form-control input-xs">
									</select>
								</span>
							</div>
							<div class="widget-buttons">
								<button id="btn-add-node" class="btn btn-default btn-sm">添加</button>
							</div>
						</div>
						<div class="widget-body" id="node-configs-container">
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['tmpl/js/ttmpl-update.js', 'utils'], function(TreeTmplUpdate, Utils){
		try{
			var $page = $('#ttmpl-update-${RES_STAMP }');
			console.log($page);
			var tmplData = {}, configStructure = {};
			try{
				tmplData = $.parseJSON($('#ttmplJson', $page).html());
			}catch(e1){}
			configStructure = Utils.parseJSON($('#config-structure-json', $page).html());
			TreeTmplUpdate.init({
				$page			: $page,
				moduleName		: '${module.name}',
				ttmplData		: tmplData,
				configStructure	: configStructure
			});
		}catch(e){
			console.error(e);
		}
	});
</script>