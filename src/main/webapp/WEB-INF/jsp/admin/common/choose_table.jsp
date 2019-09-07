<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<div id="${tpage.pageId }" class="cpf-choose-table">
	<script type="text/json" id="data-json">${tpage.dataJson}</script>
	<div>
		<nav>
			<form action="${tpage.action }">
				<c:forEach items="${tpage.hiddens }" var="hidden">
					<input type="hidden" name="${hidden.key }" value="${hidden.value }" />
				</c:forEach>
			</form>
		</nav>
		<table class="table table-hover">
			<thead>
				<tr>
					<c:if test="${tpage.prependRowNumber }">
						<th>序号</th>
					</c:if>
					<c:forEach var="th" items="${tpage.headers }">
						<th ${th.attrText }>${th.text }</th>
					</c:forEach>
				</tr>
			</thead>
			<tbody>
				<c:forEach var="row" items="${tpage.rows }" varStatus="i">
					<tr ${row.attrText }>
						<c:if test="${tpage.prependRowNumber }">
							<td>${i.index + 1 }</td>
						</c:if>
						<c:forEach items="${row.cells }" var="cell">
							<td ${cell.attrText }>${cell.text }</td>
						</c:forEach>
					</tr>
				</c:forEach>
			</tbody>
		</table>
		<c:if test="${tpage.pageInfo != null }">
			<div class="cpf-paginator" pageNo="${tpage.pageInfo.pageNo }" pageSize="${tpage.pageInfo.pageSize }" count="${tpage.pageInfo.count }"></div>
		</c:if>
	</div>
</div>
<div class="modal-footer">
	<div class="row">
		<div class="col-lg-3 col-lg-offset-4">
			<input id="submit" class="btn btn-primary btn-block submit" type="button" value="确定" /> 
		</div>
	</div>
</div>
<script>
	$(function(){
		seajs.use(['utils', 'dialog'], function(Utils, Dialog){
			var $page = $('#${tpage.pageId}'),
				page = $page.getLocatePage(),
				isMulti = '${tpage.isMulti}' !== 'false';
			$('tbody>tr', $page).click(function(){
				if(!isMulti){
					$('tbody>tr.selected', $page).removeClass('selected');
				}
				$(this).closest('tbody>tr').toggleClass('selected');
			});
			var dataJson = {};
			try{
				dataJson = $.parseJSON($('#data-json', $page).text());
			}catch(e){}
			
			page.bind('footer-submit', function(data){
				var data = [];
				$('tbody>tr.selected', $page).each(function(){
					var dataId = $(this).attr('data-id');
					if(dataId){
						data.push(dataJson['${tpage.jsonPrefix}' + dataId]);
					}
				});
				console.log(data);
				return data;
			});
			
		});
	});
</script>

