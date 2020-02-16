<%@ page language="java" contentType="text/html;charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<c:set var="title">
	<c:choose>
		<c:when test="${tmpl != null }">修改${module.title }详情模板-${tmpl.title }</c:when>
		<c:otherwise>创建${module.title }详情模板</c:otherwise>
	</c:choose>
</c:set>


<title>${title }</title>
<div id="dtmpl-update-${module.name}-${tmpl.id }-${RES_STAMP}"
	class="dtmpl-update">
	<script type="jquery/tmpl" id="tmpl-field-group">
		<div class="widget field-group" data-id="\${id}" stmpl-id="\${selectionTemplateId}"  rdtmpl-id="\${relationDetailTemplateId}" rabc-tmpl-group-id="\${rabcTemplateGroupId}" array-item-filter-id="\${arrayItemFilterId}">
			<div class="widget-header">
				<span class="widget-caption">
					<span class="group-title">\${title}</span>
				</span>
				<div class="widget-buttons field-group-config-buttons" style="display:none">
					<a href="#" class="field-group-config">
						<i class="fa fa-cog darkorange"></i>
					</a>
             	</div>
				<div class="widget-buttons create-arrayitem-control" style="display:none">
					<label>
						<input type="checkbox" class="colored-blue" \${unallowedCreate==1?'checked="checked"': ''}>
						<span class="text">禁止创建</span>
					</label>
             	</div>
				<c:if test="${mainModule == null}">
					<div class="widget-buttons dialog-item-control buttons-bordered" style="display:none;">
						<a class="btn btn-info btn-xs btn-dialog-rabc-tmplgroup">
							<i class="fa fa-edit"></i>
							编辑
						</a>
	          	         <label title="是否显示弹出添加按钮">
	         	            <input type="checkbox" class="rabc-uncreatable colored-blue checked-false" \${rabcUncreatable==1?'checked="checked"':''}>
	         	            <span class="text"></span>
	         	         </label>
						<label title="是否显示弹出编辑按钮">
	         	            <input type="checkbox" class="rabc-unupdatable colored-blue checked-false" \${rabcUnupdatable==1?'checked="checked"':''}>
	         	            <span class="text"></span>
	         	         </label>
						<label title="是否显示弹出详情按钮">
	         	            <input type="checkbox" class="rabc-undetailable colored-blue checked-false" \${rabcUndetailable==1?'checked="checked"':''}>
	         	            <span class="text"></span>
	         	         </label>
	             	</div>
				</c:if>
				<div class="widget-buttons filter-arrayitem-control buttons-bordered" style="display:none" >
					<a class="btn btn-info btn-xs btn-filter" style="\${arrayItemFilterId? '': 'display:none;'}">
						<i class="fa fa-link"></i>
						筛选
					</a>
					<label title="是否筛选">
         	            <input type="checkbox" class="filterable colored-blue" \${arrayItemFilterId? 'checked="checked"': ''}>
         	            <span class="text"></span>
         	         </label>
             	</div>
				<div class="widget-buttons select-arrayitem-control  buttons-bordered" style="display:none">
					<a class="btn btn-info btn-xs btn-select">
						<i class="fa fa-link"></i>
						选择
					</a>
          	         <label title="是否显示选择按钮">
         	            <input type="checkbox" class="selectable colored-blue">
         	            <span class="text"></span>
         	         </label>
             	</div>
				<div class="widget-buttons buttons-bordered">
					<div class="input-icon field-search">
						<span class="search-input-wrapper">
							<input type="text" class="search-text-input form-control input-xs glyphicon-search-input" autocomplete="off" placeholder="输入添加的字段名">
						</span>
						<i class="glyphicon glyphicon-search blue"></i>
						<i title="选择字段" class="glyphicon glyphicon-th blue field-picker-button"></i>
					</div>
					<a class="remove-group"><i class="fa fa-trash-o"></i></a>
				</div>
			</div>
			<div class="widget-body field-container">
			</div>
		</div>
	</script>
	<script type="jquery/tmpl" id="tmpl-field-array-table">
		<div class="table-scrollable field-array-table">
			<table class="table table-striped table-bordered table-hover">
				<thead>
					<tr class="title-row">
						<th class="number-col">序号</th>
					</tr>
				</thead>
				<tbody>
					<tr class="value-row">
						<td class="number-col">1</td>
					</tr>
				</tbody>
			</table>
		</div>
	</script>
	<script type="jquery/tmpl" id="tmpl-field-array-title">
		<th data-id="\${id}" field-id="\${fieldId}" refGroupId="\${refGroupId}" pointModuleName="\${pointModuleName}"
			class="\${fieldAvailable? '': 'field-unavailable'}"
			title="\${fieldAvailable? fieldOriginTitle: '无效字段' }">
			<span>\${title }</span>
			<div class="operate-buttons">     
				<a class="remove-array-field" title="删除字段">
					<i class="fa fa-trash-o"></i>
				</a>
				<a class="recover-array-field" title="恢复默认名称">
					<i class="iconfont icon-recover"></i>
				</a>
				<a  class="field-refmodule-a \${pointModuleName? pointModuleName : 'hide' } " title="\${refGroupTitle? '已选组合:'+refGroupTitle: '选择组合'}"  ><i class="icon iconfont icon-group"></i></a>
			</div>
		</th>
	</script>
	<script type="jquery/tmpl" id="tmpl-field-array-value">
		<td field-id="\${fieldId}" class="\${fieldAvailable? '': 'field-unavailable'}">\${dv }</td>
	</script>
	<script type="jquery/tmpl" id="tmpl-field">
		<div class="form-group field-item movable \${fieldAvailable? '': 'field-unavailable'} \${colNum == 2? 'dbcol': ''}" field-id="\${fieldId}" refGroupId="\${refGroupId}" pointModuleName="\${pointModuleName}"  data-id="\${id}"
			title="\${fieldAvailable? fieldOriginTitle: '无效字段' }">
			<div class="dtmpl-field-validates">
				<i class="dtmpl-field-validate-required \${validators.required? 'active-validator': ''}"></i>
			</div>
			<label class="control-label field-title">\${title}</label>
			<div class="field-value">
				<span class="field-view">\${dv}</span>
			</div>
			<div class="operate-buttons">
				<a class="remove-field" title="删除字段"><i class="fa fa-trash-o"></i></a>
				<a class="toggle-expand-field" title="拓展字段显示长度"><i class="fa fa-expand"></i></a>
				<a class="recover-field" title="恢复默认名称"><i class="iconfont icon-recover"></i></a>
				<a class="field-setdefval" title="设置默认值"><i></i></a>
				<a class="field-validate-a" title="字段约束"><i class="icon iconfont icon-rule"></i></a>
				<ul class="field-validate-menu">
					<li validate-name="required" class="\${validators.required? 'checked-validate': ''}">必填</li>
				</ul>
 				<a  class="field-refmodule-a \${pointModuleName? pointModuleName : 'hide' } " title="\${refGroupTitle? '已选组合:'+refGroupTitle: '选择组合'}"  ><i class="icon iconfont icon-group"></i></a>
			</div>
		</div>
	</script>


	<div class="page-header">
		<div class="header-title">
			<h1>${title }</h1>
		</div>
		<div class="header-buttons">
			<a class="refresh" title="刷新" id="refresh-toggler"
				href="page:refresh"> <i class="glyphicon glyphicon-refresh"></i>
			</a>
			<c:if test="${mainModule != null }">
				<a id="load-dtmpl" title="加载已有模板" href="#"> <i
					class="glyphicon glyphicon-hand-down"></i>
				</a>
			</c:if>
		</div>
	</div>
	<div class="page-body">
		<div id="operate-area">
			<div class="operate-area-cover"></div>
			<a id="add-group" title="添加字段组"><i class="fa fa-plus-square"></i></a>
			<a id="save" title="保存"><i class="fa fa-check-square"></i></a>
		</div>
		<div class="row header-row">
			<div class="col-lg-10 col-lg-offset-1">
				<input type="hidden" name="tmplId" value="" /> <input type="text"
					class="form-control" id="tmplName" placeholder="请输入模板名称"
					value="${tmpl.title }">
			</div>
		</div>
		<div class="row">
			<div
				class="col-lg-offset-1 col-sm-offset-1 col-xs-offset-1 col-lg-10 col-sm-10 col-xs-10"
				id="group-container">
				<form class="form-horizontal group-container"></form>
			</div>
		</div>
	</div>
	<c:if test="${mainModule != null }">
		<script id="dtmpl-listitem-tmpl" type="jquery/tmpl">
			<div data-id="\${id}">
				<i></i>
				<div>\${title}</div>
			</div>
		</script>
		<div id="dtmpl-list-container" class="detail-toggle-sublist"
			title="点击加载对应详情模板" style="display: none;">
			<div id="dtmpl-list-wrapper"></div>
		</div>
		<script id="dialog-dtmpl-save-options" type="jquery/tmpl">
			<div class="">
				<div class="row">
					<label class="col-lg-3">域</label>
					<div class="col-lg-9">
						<label>
							<input class="colored-blue" name="range" type="radio" checked="checked" value="0" />
							<span class="text">公有</span>
						</label>
						<label>
							<input class="colored-blue" name="range" type="radio" value="1" /> 
							<span class="text">私有</span>
						</label>
					</div>
				</div>
				<div class="row">
					<label class="col-lg-3">保存方式</label>
					<div class="col-lg-9">
						<label>
							<input class="colored-success" name="save-method" type="radio" checked="checked" value="update" /> 
							<span class="text">修改原模板</span>
						</label>
						<label>
							<input class="colored-success" name="save-method" type="radio" value="new" />
							<span class="text">创建新模板</span>
						</label>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary">确定</button>
				</div>
			</div>
		</script>
	</c:if>
</div>
<script>
	console.log(1);
	seajs.use([ 'tmpl/js/dtmpl-update.js?1' ], function(ViewTmpl) {
		var $page = $('#dtmpl-update-${module.name}-${tmpl.id }-${RES_STAMP}');
		console.log($page);
		var updateMode = '${tmplJson != null}' == 'true';
		ViewTmpl.init($page, {
			tmplId : '${tmpl.id}',
			tmplData : updateMode && $.parseJSON('${tmplJson}'),
			mode : updateMode ? 'update' : 'create',
			module : '${module.name}',
			mainModule : '${mainModule.name}',
			relationCompositeId : '${relationCompositeId}'
		});
	});
</script>
<div></div>