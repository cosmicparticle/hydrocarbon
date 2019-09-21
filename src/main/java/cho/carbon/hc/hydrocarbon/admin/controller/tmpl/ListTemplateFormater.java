package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Supplier;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cn.sowell.copframe.dao.utils.UserUtils;
import cn.sowell.copframe.dto.ajax.JsonRequest;

public class ListTemplateFormater {
	
	public static JSONArray toCriteriaData(List<? extends AbstractListCriteria> list) {
		JSONArray array = new JSONArray();
		if(list != null) {
			for (AbstractListCriteria criteria : list) {
				Object item = JSON.toJSON(criteria);
				array.add(item);
			}
		}
		return array;
	}
	
	public static JSONObject toLtmplData(AbstractListTemplate<?,?> ltmpl) {
		JSONObject json = new JSONObject();
		json.put("title", ltmpl.getTitle());
		json.put("defaultOrderFieldId", ltmpl.getDefaultOrderFieldId());
		json.put("defaultOrderDirection", ltmpl.getDefaultOrderDirection());
		json.put("defaultPageSize", ltmpl.getDefaultPageSize());
		json.put("id", ltmpl.getId());
		return json;
	}
	
	public static JSONArray toColumnData(List<? extends AbstractListColumn> columns) {
		JSONArray json = new JSONArray();
		for (AbstractListColumn column : columns) {
			JSONObject col = new JSONObject();
			col.put("id", column.getId());
			col.put("fieldId", column.getFieldId());
			String compositeName = "",
					fieldName = column.getFieldKey();
			if(fieldName != null && fieldName.contains("\\.")){
				int dotIndex = fieldName.lastIndexOf("\\.");
				compositeName = fieldName.substring(0, dotIndex);
				fieldName = fieldName.substring(dotIndex + 1, fieldName.length());
			}
			col.put("fieldAvailable", column.getFieldAvailable());
			col.put("compositeName", compositeName);
			col.put("fieldName", fieldName);
			col.put("title", column.getTitle());
			col.put("specialField", column.getSpecialField());
			json.add(col);
		}
		return json;
	}
	public static class Handlers
		<T extends AbstractListTemplate<COL, CRI>, 
		COL extends AbstractListColumn, 
		CRI extends AbstractListCriteria> {
		private BiConsumer<CRI, JSONObject> criteriaConsumer;

		public BiConsumer<CRI, JSONObject> getCriteriaConsumer() {
			return criteriaConsumer;
		}

		public void setCriteriaConsumer(BiConsumer<CRI, JSONObject> criteriaConsumer) {
			this.criteriaConsumer = criteriaConsumer;
		}
	}
	
	public static 
			<T extends AbstractListTemplate<COL, CRI>, 
			COL extends AbstractListColumn, 
			CRI extends AbstractListCriteria> 
		T generateLtmplData(
				JsonRequest jReq,DictionaryService dictionaryService,
				Supplier<T> tmplSupplier, 
				Supplier<COL> colSupplier, 
				Supplier<CRI> criSupplier,
				Handlers<T, COL, CRI> handlers) {
		T tmpl = null;
		if(jReq != null && jReq.getJsonObject() != null){
			JSONObject json = jReq.getJsonObject();
			tmpl = tmplSupplier.get();
			tmpl.setId(json.getLong("tmplId"));
			tmpl.setTitle(json.getString("title"));
			tmpl.setDefaultPageSize(json.getInteger("defPageSize"));
			tmpl.setDefaultOrderFieldId(json.getInteger("defOrderFieldId"));
			tmpl.setDefaultOrderDirection(json.getString("defOrderDir"));
			tmpl.setCreateUserCode((String) UserUtils.getCurrentUser().getId());
			tmpl.setModule(json.getString("module"));
			JSONArray columnData = json.getJSONArray("columnData");
			if(columnData != null){
				List<COL> columns = new ArrayList<COL>();
				int i = 0;
				for (Object c : columnData) {
					JSONObject src = (JSONObject) c;
					COL column = colSupplier.get();
					column.setTitle(src.getString("title"));
					column.setOrderable(src.getInteger("orderable"));
					if(src.getString("specField") != null){
						column.setSpecialField(src.getString("specField"));
					}else{
						column.setFieldId(src.getInteger("fieldId"));
						column.setViewOption(dictionaryService.getField(src.getInteger("fieldId")).getType()); 
					}
					column.setOrder(i++);
					columns.add(column);
				}
				tmpl.setColumns(columns);
			}
			
			List<CRI> criterias = getCriterias(json.getJSONArray("criteriaData"), criSupplier, handlers);
			if(criterias != null) {
				tmpl.setCriterias(criterias);
			}
			
		}
		return tmpl;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	public static 
				<CRI extends AbstractListCriteria> 
			List<CRI> getCriterias(JSONArray criteriaData, Supplier<CRI> criSupplier,
					Handlers handlers) {
		if(criteriaData != null){
			List<CRI> criterias = new ArrayList<CRI>();
			int order = 0;
			for (Object e : criteriaData) {
				JSONObject item = (JSONObject) e;
				CRI criteria = criSupplier.get();
				criteria.setRelation("and");
				criteria.setId(item.getLong("id"));
				criteria.setTitle(item.getString("title"));
				criteria.setOrder(order++);
				if(item.getBooleanValue("fieldAvailable")) {
					criteria.setFieldId(item.getInteger("fieldId"));
					criteria.setRelationLabel(item.getString("relationLabel"));
					//条件需要显示
					criteria.setComparator(item.getString("comparator"));
					criteria.setInputType(item.getString("inputType"));
					criteria.setDefaultValue(item.getString("defVal"));
					Boolean queryShow = item.getBoolean("queryShow");
					if(queryShow != null && queryShow){
						criteria.setQueryShow(1);
						criteria.setPlaceholder(item.getString("placeholder"));
					}
				}else {
					criteria.setFieldUnavailable();
				}
				if(handlers != null && handlers.getCriteriaConsumer() != null) {
					handlers.getCriteriaConsumer().accept(criteria, item);
				}
				criterias.add(criteria);
			}
			return criterias;
		}
		return null;
	}
}
