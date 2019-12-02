<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${filter != null }">修改过滤器</c:when>
		<c:otherwise>创建过滤器</c:otherwise>
	</c:choose>
</c:set>
<title>${title }</title>
<div class="ltmpl-update dtmpl-arrayitem-filter" id="dtmpl-arrayitem-filter-update-${RES_STAMP }">
	<script type="jquery/tmpl" id="col-row-tmpl">
		<div class="row \${fieldAvailable? '': 'col-field-unavailable'}" column-id="\${columnId}" field-id="\${id}" field-key="\${name}">
			<span class="col-name">\${cname}</span>
			{{if !withoutOpr}}
				<span class="col-operates">
					<i class="col-orderable glyphicon glyphicon-ban-circle"></i>
					<i class="col-delete fa fa-trash-o"></i>
				</span>
			{{/if}}
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
	<script type="jquery/tmpl" id="criteria-partition-tmpl">
		<div class="criteria-partition">
			<div class="criteria-partition-relation">
				<span>\${relationTitle}</span>
			</div>
			<div class="criteria-partition-comparator">
				<span>\${comparatorTitle}</span>
			</div>
			<div class="criteria-partition-value">
				<span>\${value}</span>
			</div>
		</div>
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
		</div>
		<div class="page-body">
			<div class="row header-row">
				<div class="col-lg-12 ltmpl-criterias">
					<div class="widget radius-bordered">
						<div class="widget-header">
							<span class="widget-caption">过滤条件</span>
						</div>
						<div class="widget-body">
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
															<label id="default-value-label">值</label>
															<div id="criteria-default-value-container">
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
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	seajs.use(['tmpl/js/ltmpl-update.js', 'utils'], function(LtmplUpdate, Utils){
		try{
			var $page = $('#dtmpl-arrayitem-filter-update-${RES_STAMP }');
			console.log($page);
			var tmplData = null,
				criteriaData = Utils.parseJSON('${criteriaDataJSON}'),
				columnData = undefined,
				fieldInputTypeMap = Utils.parseJSON('${fieldInputTypeMap}')
				;
			LtmplUpdate.init($page, tmplData, criteriaData, columnData, '${module.name}', fieldInputTypeMap, '${compositeId}');
		}catch(e){
			console.error(e);
		}
	});
</script>