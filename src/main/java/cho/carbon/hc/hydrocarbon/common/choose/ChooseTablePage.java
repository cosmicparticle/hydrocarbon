package cho.carbon.hc.hydrocarbon.common.choose;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;

import org.springframework.util.Assert;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.FormatUtils;

public class ChooseTablePage<T> {
	private String pageId;
	private List<ChooseTableHeader> headers = new ArrayList<ChooseTableHeader>();
	private List<ChooseTableRow> rows = new ArrayList<ChooseTableRow>();
	//是否需要在每一行之前添加一列行号
	private boolean prependRowNumber = true;
	private PageInfo pageInfo;
	private JSONObject dataJson = new JSONObject();
	private String jsonPrefix;
	//搜索链接
	private String action;
	private Map<String, String> hiddens = new HashMap<String, String>();
	
	private Boolean isMulti = true;
	
	private Predicate<T> rowSelectedPredicate;
	
	/**
	 * 
	 * @param pageId
	 * @param jsonPrefix
	 */
	public ChooseTablePage(String pageId, String jsonPrefix) {
		Assert.hasText(pageId);
		Assert.hasText(jsonPrefix);
		this.pageId = pageId;
		this.jsonPrefix = jsonPrefix;
	}
	
	public class Column{
		private String headerName;
		private BiConsumer<ChooseTableCell, T> consumer;
		private Consumer<ChooseTableHeader> headerHandler;
		public String getHeaderName() {
			return headerName;
		}
		public BiConsumer<ChooseTableCell, T> getConsumer() {
			return consumer;
		}
		public Column(String headerName, BiConsumer<ChooseTableCell, T> consumer) {
			super();
			this.headerName = headerName;
			this.consumer = consumer;
		}
		public void setHeaderHandler(Consumer<ChooseTableHeader> headerHandler) {
			this.headerHandler = headerHandler;
		}
		public Consumer<ChooseTableHeader> getHeaderHandler() {
			return headerHandler;
		}
	}
	public class RowHandler{
		private List<Column> columns = new ArrayList<Column>();
		private BiConsumer<ChooseTableRow, T> rowHandler;
		private Function<T, String> dataKeyGetter;
		private Function<T, JSON> dataJsonGetter;
		/**
		 * 表格添加一列数据
		 * @param headerName 表头名称，可重复
		 * @param consumer 列数据的处理对象，处理函数有两个参数，第一个参数是表格内单元格对象，第二个参数是当前遍历的数据对象
		 * @return 返回自身
		 */
		public RowHandler addColumn(String headerName, BiConsumer<ChooseTableCell, T> consumer){
			columns.add(new Column(headerName, consumer));
			return this;
		}
		/**
		 * 处理每一行数据
		 * @param handler 行数据的处理对象。处理函数有两个参数，第一个参数是当前的航对象，第二个参数是当前遍历到的数据对象
		 * @return 返回自身
		 */
		public RowHandler handlerRow(BiConsumer<ChooseTableRow, T> handler){
			this.rowHandler = handler;
			return this;
		}
		/**
		 * 设置最终生成的json的key
		 * @param getter
		 * @return
		 */
		public RowHandler setDataKeyGetter(Function<T, String> getter){
			this.dataKeyGetter = getter;
			return this;
		}
		public RowHandler setDataJsonGetter(Function<T, JSON> getter){
			this.dataJsonGetter = getter;
			return this;
		}
		List<Column> getColumns() {
			return columns;
		}
		BiConsumer<ChooseTableRow, T> getRowHandler() {
			return rowHandler;
		}
		String getDataKey(T data) {
			if(dataKeyGetter != null){
				return dataKeyGetter.apply(data);
			}
			return null;
		}
		JSON getDataJson(T data) {
			if(dataJsonGetter != null){
				return dataJsonGetter.apply(data);
			}
			return null;
		}
	}
	/**
	 * 设置表格数据
	 * @param sourceDataList
	 * @param consumer
	 * @return
	 */
	public ChooseTablePage<T> setTableData(List<T> sourceDataList, Consumer<RowHandler> consumer){
		RowHandler handler = new RowHandler();
		consumer.accept(handler);
		handler.getColumns().forEach(column->{
			ChooseTableHeader header = new ChooseTableHeader();
			header.setText(column.getHeaderName());
			Consumer<ChooseTableHeader> headerHandler = column.getHeaderHandler();
			if(headerHandler != null){
				headerHandler.accept(header);
			}
			headers.add(header);
		});
		sourceDataList.forEach(data->{
			ChooseTableRow row = new ChooseTableRow();
			rows.add(row);
			String dataKey = handler.getDataKey(data);
			row.setDataId(dataKey);
			if(handler.getRowHandler() != null){
				handler.getRowHandler().accept(row, data);
			}
			dataKey = row.getDataId();
			handler.getColumns().forEach(column->{
				ChooseTableCell cell = new ChooseTableCell();
				column.getConsumer().accept(cell, data);
				row.addCell(cell);
			});
			if(this.rowSelectedPredicate != null && rowSelectedPredicate.test(data)) {
				row.setSelected(true);
			}
			JSON dataJson = FormatUtils.coalesce(handler.getDataJson(data), (JSON)JSON.toJSON(data));
			if(dataKey != null && dataJson != null){
				addJsonData(dataKey, dataJson);
			}
		});
		return this;
	}
	
	
	public String getPageId() {
		return pageId;
	}
	
	public List<ChooseTableHeader> getHeaders() {
		return headers;
	}
	public List<ChooseTableRow> getRows() {
		return rows;
	}

	public boolean getPrependRowNumber() {
		return prependRowNumber;
	}

	public ChooseTablePage<T> setPrependRowNumber(boolean prependRowNumber) {
		this.prependRowNumber = prependRowNumber;
		return this;
	}

	public PageInfo getPageInfo() {
		return pageInfo;
	}

	public ChooseTablePage<T> setPageInfo(PageInfo pageInfo) {
		this.pageInfo = pageInfo;
		return this;
	}

	public JSONObject getDataJson() {
		return dataJson;
	}

	public String getJsonPrefix() {
		return jsonPrefix;
	}
	
	public ChooseTablePage<T> addJsonData(String dataId, JSON data){
		this.dataJson.put(jsonPrefix + dataId, data);
		return this;
	}

	public String getAction() {
		return action;
	}

	public ChooseTablePage<T> setAction(String action) {
		this.action = action;
		return this;
	}
	
	/**
	 * 添加隐藏表单
	 * @param name
	 * @param value
	 */
	public ChooseTablePage<T> addHidden(String name, Object value){
		if(value != null){
			hiddens.put(name, value.toString());
		}
		return this;
	}

	public Map<String, String> getHiddens() {
		return hiddens;
	}


	public Boolean getIsMulti() {
		return isMulti;
	}


	public ChooseTablePage<T> setIsMulti(Boolean isMulti) {
		this.isMulti = isMulti;
		return this;
	}
	
	public ChooseTablePage<T> setSelectedPredicate(Predicate<T> rowSelectedPredicate){
		this.rowSelectedPredicate = rowSelectedPredicate;
		return this;
	}
	
}
