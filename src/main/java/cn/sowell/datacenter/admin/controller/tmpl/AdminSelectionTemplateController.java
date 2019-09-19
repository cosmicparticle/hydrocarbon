package cn.sowell.datacenter.admin.controller.tmpl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.copframe.dao.utils.UserUtils;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.datacenter.admin.controller.AdminConstants;
import cn.sowell.datacenter.entityResolver.Composite;
import cn.sowell.dataserver.model.dict.pojo.DictionaryComposite;
import cn.sowell.dataserver.model.dict.service.DictionaryService;
import cn.sowell.dataserver.model.dict.service.impl.DictionaryServiceImpl;
import cn.sowell.dataserver.model.modules.pojo.ModuleMeta;
import cn.sowell.dataserver.model.modules.service.ModulesService;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateSelectionColumn;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateSelectionCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateSelectionTemplate;
import cn.sowell.dataserver.model.tmpl.service.SelectionTemplateService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/stmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminSelectionTemplateController {

	@Resource
	DictionaryService dService;
	
	@Resource
	ModulesService mService;

	@Resource
	SelectionTemplateService stmplService;
	
	@Resource(name="dictionaryServiceImpl")
	DictionaryService  dictionaryService;
	
	static Logger logger = Logger.getLogger(AdminSelectionTemplateController.class);
	
	
	@RequestMapping("/create")
	public String createSelectionTemplate(String moduleName, Integer compositeId, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		Assert.notNull(module, "module[" + moduleName + "]不存在");
		DictionaryComposite composite = dService.getComposite(moduleName, compositeId);
		Assert.isTrue(composite != null && Composite.RELATION_ADD_TYPE.equals(composite.getAddType()), 
				"composite[" + compositeId + "]不存在或者不是一个relation");
		model.addAttribute("composite", composite);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_SELECTION + "/stmpl_update.jsp";
	}
	
	@RequestMapping("/update/{stmplId}")
	public String showSeletionTemplate(@PathVariable Long stmplId, Model model) {
		TemplateSelectionTemplate stmpl = stmplService.getTemplate(stmplId);
		Assert.notNull(stmpl, "选项模板[" + stmplId + "]不存在");
		JSONArray columnDataJSON = toColumnData(stmpl.getColumns());
		JSONObject tmplDataJSON = toLtmplData(stmpl);
		JSONArray criteriaDataJSON = toCriteriaData(stmpl.getCriterias());
		model.addAttribute("stmpl", stmpl);
		model.addAttribute("tmplDataJSON", tmplDataJSON);
		model.addAttribute("columnDataJSON", columnDataJSON);
		model.addAttribute("criteriaDataJSON", criteriaDataJSON);
		model.addAttribute("module", mService.getModule(stmpl.getModule()));
		DictionaryComposite composite = dService.getComposite(stmpl.getModule(), stmpl.getCompositeId());
		model.addAttribute("composite", composite);
		return AdminConstants.JSP_TMPL_SELECTION + "/stmpl_update.jsp";
	}
	
	private JSONArray toColumnData(List<TemplateSelectionColumn> columns) {
		JSONArray json = new JSONArray();
		for (TemplateSelectionColumn column : columns) {
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
	
	private JSONArray toCriteriaData(List<TemplateSelectionCriteria> list) {
		JSONArray array = new JSONArray();
		for (TemplateSelectionCriteria criteria : list) {
			Object item = JSON.toJSON(criteria);
			array.add(item);
		}
		return array;
	}
	
	private JSONObject toLtmplData(TemplateSelectionTemplate stmpl) {
		JSONObject json = new JSONObject();
		json.put("defaultOrderFieldId", stmpl.getDefaultOrderFieldId());
		json.put("defaultOrderDirection", stmpl.getDefaultOrderDirection());
		json.put("defaultPageSize", stmpl.getDefaultPageSize());
		json.put("multiple", Integer.valueOf(1).equals(stmpl.getMultiple()));
		json.put("nonunique", Integer.valueOf(1).equals(stmpl.getNonunique()));
		json.put("compositeId", stmpl.getCompositeId());
		json.put("id", stmpl.getId());
		return json;
	}
	
	
	
	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON save(@RequestBody JsonRequest jReq){
		JSONObjectResponse jRes = new JSONObjectResponse();
		TemplateSelectionTemplate tmpl = generateStmplData(jReq);
		try {
			Long stmplId = stmplService.merge(tmpl);
			jRes.put("stmplId", stmplId);
		} catch (Exception e) {
			logger.error("保存列表模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}
	

	private TemplateSelectionTemplate generateStmplData(JsonRequest jReq) {
		TemplateSelectionTemplate tmpl = null;
		if(jReq != null && jReq.getJsonObject() != null){
			JSONObject json = jReq.getJsonObject();
			tmpl = new TemplateSelectionTemplate();
			tmpl.setId(json.getLong("tmplId"));
			tmpl.setTitle(json.getString("title"));
			tmpl.setDefaultPageSize(json.getInteger("defPageSize"));
			tmpl.setDefaultOrderFieldId(json.getInteger("defOrderFieldId"));
			tmpl.setDefaultOrderDirection(json.getString("defOrderDir"));
			tmpl.setCreateUserCode((String) UserUtils.getCurrentUser().getId());
			tmpl.setModule(json.getString("module"));
			tmpl.setCompositeId(json.getInteger("compositeId"));
			tmpl.setMultiple(Boolean.TRUE.equals(json.getBoolean("multiple"))? 1: null);
			tmpl.setNonunique(Boolean.TRUE.equals(json.getBoolean("nonunique"))? 1: null);
			JSONArray columnData = json.getJSONArray("columnData");
			if(columnData != null){
				List<TemplateSelectionColumn> columns = new ArrayList<TemplateSelectionColumn>();
				int i = 0;
				for (Object c : columnData) {
					JSONObject src = (JSONObject) c;
					TemplateSelectionColumn column = new TemplateSelectionColumn();
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
			
			JSONArray criteriaData = json.getJSONArray("criteriaData");
			if(criteriaData != null){
				List<TemplateSelectionCriteria> criterias = new ArrayList<TemplateSelectionCriteria>();
				int order = 0;
				for (Object e : criteriaData) {
					JSONObject item = (JSONObject) e;
					TemplateSelectionCriteria criteria = new TemplateSelectionCriteria();
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
					criterias.add(criteria);
				}
				tmpl.setCriterias(criterias);
			}
			
		}
		return tmpl;
	}
	
	
}
