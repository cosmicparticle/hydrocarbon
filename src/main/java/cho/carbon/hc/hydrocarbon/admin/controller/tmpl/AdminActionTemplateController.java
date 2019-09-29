package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.JsonRequest;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.ViewDataService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionArrayEntity;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionArrayEntityField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/atmpl")
public class AdminActionTemplateController {
	
	@Resource
	ModulesService mService;
	
	@Resource
	ActionTemplateService atmplService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	ViewDataService vService;
	
	static Logger logger = Logger.getLogger(AdminActionTemplateController.class);
	
	
	@RequestMapping("/list/{moduleName}")
	public String list(Model model, @PathVariable String moduleName) {
		ModuleMeta moduleMeta = mService.getModule(moduleName);
		ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
		List<TemplateActionTemplate> tmplList = atmplService.queryAll(moduleName);
		Map<Long, List<TemplateGroup>> relatedGroupsMap = atmplService.getRelatedGroupsMap(CollectionUtils.toSet(tmplList, atmpl->atmpl.getId()));
		model.addAttribute("modulesJson", configService.getSiblingModulesJson(moduleName));
		model.addAttribute("tmplList", tmplList);
		model.addAttribute("module", moduleMeta);
		model.addAttribute("relatedGroupsMap", relatedGroupsMap);
		return AdminConstants.JSP_TMPL_ACTION + "/atmpl_list.jsp";
	}
	
	@RequestMapping("/to_create/{module}")
	public String toCreate(@PathVariable String module, Model model){
		ModuleMeta moduleMeta = mService.getModule(module);
		model.addAttribute("module", moduleMeta);
		return AdminConstants.JSP_TMPL_ACTION + "/atmpl_update.jsp";
	}
	
	@RequestMapping("/update/{tmplId}")
	public String update(@PathVariable Long tmplId, Model model){
		TemplateActionTemplate tmpl = atmplService.getTemplate(tmplId);
		ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
		JSONObject tmplJson = (JSONObject) JSON.toJSON(tmpl);
		ModuleMeta moduleMeta = mService.getModule(tmpl.getModule());
		model.addAttribute("module", moduleMeta);
		model.addAttribute("tmpl", tmpl);
		model.addAttribute("tmplJson", tmplJson);
		return AdminConstants.JSP_TMPL_ACTION + "/atmpl_update.jsp";
	}
	
	
	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON save(@RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
		TemplateActionTemplate data = parseToTmplData(jReq.getJsonObject());
		try {
			atmplService.merge(data);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/remove/{tmplId}")
	public AjaxPageResponse remove(@PathVariable Long tmplId){
		try {
			atmplService.remove(tmplId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}
	
	private TemplateActionTemplate parseToTmplData(JSONObject jo) {
		if(jo != null){
			TemplateActionTemplate data = new TemplateActionTemplate();
			data.setId(jo.getLong("tmplId"));
			data.setTitle(jo.getString("title"));
			data.setModule(jo.getString("module"));
			JSONArray jGroups = jo.getJSONArray("groups");
			if(jGroups != null && !jGroups.isEmpty()){
				int i = 0;
				for (Object ele : jGroups) {
					if(ele instanceof JSONObject){
						JSONObject jGroup = (JSONObject) ele;
						TemplateActionFieldGroup group = new TemplateActionFieldGroup();
						group.setId(jGroup.getLong("id"));
						group.setTitle(jGroup.getString("title"));
						group.setIsArray(jGroup.getBoolean("isArray")?1:null);
						group.setCompositeId(jGroup.getInteger("compositeId"));
						group.setSelectionTemplateId(jGroup.getLong("selectionTemplateId"));
						group.setUnallowedCreate(Integer.valueOf(1).equals(jGroup.getInteger("unallowedCreate"))? 1: null);
						group.setOrder(i++);
						data.getGroups().add(group);
						JSONArray jFields = jGroup.getJSONArray("fields");
						if(jFields != null && !jFields.isEmpty()){
							int j = 0;
							for (Object ele1 : jFields) {
								if(ele1 instanceof JSONObject){
									JSONObject jField = (JSONObject) ele1;
									TemplateActionField field = new TemplateActionField();
									field.setId(jField.getLong("id"));
									field.setFieldId(jField.getInteger("fieldId"));
									field.setTitle(jField.getString("title"));
									field.setViewValue(jField.getString("viewVal"));
									Boolean dbcol = jField.getBoolean("dbcol");
									field.setColNum((dbcol == null || !dbcol) ? 1: 2);
									field.setOrder(j++);
									field.setValidators(jField.getString("validators"));
									group.getFields().add(field);
								}
							}
							if(j > 0) {
								JSONArray aEntities = jGroup.getJSONArray("entities");
								if(aEntities != null && !aEntities.isEmpty()) {
									for (int k = 0; k < aEntities.size(); k++) {
										JSONObject jEntity = (JSONObject) aEntities.get(k);
										TemplateActionArrayEntity entity = new TemplateActionArrayEntity();
										entity.setId(jEntity.getLong("id"));
										entity.setIndex(k);
										entity.setRelationEntityCode(jEntity.getString("relationEntityCode"));
										entity.setRelationLabel(jEntity.getString("relationLabel"));
										entity.setTmplFieldGroupId(group.getId());
										JSONObject fieldsMap = jEntity.getJSONObject("fieldMap");
										group.getFields().forEach(field->{
											if(field.getFieldId() != null) {
												JSONObject jField = fieldsMap.getJSONObject("f_" + field.getFieldId());
												if(jField != null) {
													TemplateActionArrayEntityField eField = new TemplateActionArrayEntityField();
													eField.setId(jField.getLong("id"));
													eField.setFieldId(field.getFieldId());
													eField.setTmplFieldId(field.getId());
													eField.setActionArrayEntityId(entity.getId());
													eField.setValue(jField.getString("value"));
													entity.getFields().add(eField);
													field.getArrayEntityFields().add(eField);
												}
											}
										});
										group.getEntities().add(entity);
									}
								}
							}
						}
						
					}
					
				}
			}
			return data; 
		}
		return null;
	}
	
	
	@ResponseBody
	@RequestMapping("/copy/{atmplId}/{targetModuleName}")
	public ResponseJSON copy(@PathVariable Long atmplId, @PathVariable String targetModuleName) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
			Long newTmplId = atmplService.copy(atmplId, targetModuleName);
			if(newTmplId != null) {
				jRes.setStatus("suc");
				jRes.put("newTmplId", newTmplId);
			}
		} catch (Exception e) {
			logger.error("复制操作模板时发生错误", e);
		}
		return jRes;
	}
	
	
}
