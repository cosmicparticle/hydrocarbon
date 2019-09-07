package cn.sowell.datacenter.admin.controller.config;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.TextUtils;
import cn.sowell.datacenter.admin.controller.AdminConstants;
import cn.sowell.datacenter.entityResolver.config.abst.Module;
import cn.sowell.datacenter.model.api2.service.MetaJsonService;
import cn.sowell.datacenter.model.config.service.ConfigureService;
import cn.sowell.dataserver.model.karuiserv.pojo.KaruiServ;
import cn.sowell.dataserver.model.karuiserv.service.KaruiServService;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailField;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateListColumn;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cn.sowell.dataserver.model.tmpl.service.DetailTemplateService;
import cn.sowell.dataserver.model.tmpl.service.ListTemplateService;

@Controller
@RequestMapping(AdminConstants.URI_CONFIG + "/ks")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminConfigKsController {
	
	@Resource
	KaruiServService ksService;
	
	@Resource
	MetaJsonService mJsonService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	ListTemplateService ltmplService;
	
	@Resource
	DetailTemplateService dtmplService;
	
	
	static Logger logger = Logger.getLogger(AdminConfigKsController.class);
	
	
	@RequestMapping("/list")
	public String list() {
		return AdminConstants.JSP_CONFIG_KS + "/ks_list.jsp";
	}
	
	@RequestMapping({"/edit", "/edit/", "/edit/{ksId}"})
	public String edit(@PathVariable(required = false) Long ksId, Model model) {
		model.addAttribute("ksId", ksId);
		return AdminConstants.JSP_CONFIG_KS + "/ks_edit.jsp";
	}
	
	@RequestMapping("/test/{ksId}")
	public String test(@PathVariable Long ksId, Model model) {
		model.addAttribute("ksId", ksId);
		return AdminConstants.JSP_CONFIG_KS + "/ks_test.jsp";
	}
	
	@ResponseBody
	@RequestMapping("/load_all_ks")
	public ResponseJSON loadAllKaruiService() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<KaruiServ> ksList = ksService.queryAll();
		JSONArray ksListJson = mJsonService.convertKaruiServJson(ksList);
		jRes.setStatus("suc");
		jRes.put("ksList", ksListJson);
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/load_ks/{ksId}")
	public ResponseJSON loadKaruiService(@PathVariable Long ksId) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		KaruiServ ks = ksService.getTemplate(ksId);
		jRes.put("ks", ks);
		return jRes;
	}
	
	
	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON saveKaruiService(@RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		KaruiServ ks = toKaruServ(jReq.getJsonObject());
		try {
			Long ksId = ksService.merge(ks);
			jRes.put("ksId", ksId);
			jRes.setStatus("suc");
		} catch (Exception e) {
			jRes.setStatus("error");
			jRes.put("erroStack", e.getMessage());
			logger.error("保存时发生错误", e);
		}
		return jRes;
	}

	private KaruiServ toKaruServ(JSONObject json) {
		return JSON.toJavaObject(json, KaruiServ.class);
	}
	
	@ResponseBody
	@RequestMapping("/modules")
	public ResponseJSON getModules() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<Module> modules = configService.getEnabledModules();
		Set<String> moduleNames = CollectionUtils.toSet(modules, Module::getName);
		Map<String, List<TemplateListTemplate>> ltmplMap = ltmplService.queryByModuleNames(moduleNames);
		Map<String, List<TemplateDetailTemplate>> dtmplMap = dtmplService.queryByModuleNames(moduleNames);
		JSONArray jModules = toModulesJson(modules, ltmplMap, dtmplMap);
		jRes.put("modules", jModules);
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/existion_validate")
	public ResponseJSON existionValidate(String title, String path) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		boolean exist = true;
		if(title != null) {
			exist = ksService.validateTitleExistion(title);
		}
		if(exist && path != null) {
			exist = ksService.validatePathExistion(path);
		}
		jRes.put("valid", !exist);
		return jRes;
	}
	
	private ResponseJSON doMultiReq(String ksIdsStr, Consumer<Set<Long>> consumer) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		Set<Long> ksIds = TextUtils.splitToLongSet(ksIdsStr, ",");
		if(!ksIds.isEmpty()) {
			try {
				consumer.accept(ksIds);
				jRes.setStatus("suc");
			} catch (Exception e) {
				jRes.setStatus("error");
				jRes.put("msg", e.getMessage());
			}
		}else {
			jRes.put("msg", "ksIds参数不能为空");
		}
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/remove")
	public ResponseJSON removeKs(@RequestParam("ksIds") String ksIdsStr) {
		return doMultiReq(ksIdsStr, ksIds->ksService.remove(ksIds));
	}

	@ResponseBody
	@RequestMapping("/{toDisabled:enable|disable}")
	public ResponseJSON toggleKsDisabled(@RequestParam("ksIds") String ksIdsStr, 
			@PathVariable String toDisabled) {
		return doMultiReq(ksIdsStr, ksIds->ksService.toggleDisabled(ksIds, "disable".equals(toDisabled)));
	}
	
	

	private JSONArray toModulesJson(List<Module> modules, Map<String, List<TemplateListTemplate>> ltmplMap,
			Map<String, List<TemplateDetailTemplate>> dtmplMap) {
		JSONArray jModules = new JSONArray();
		for (Module module : modules) {
			JSONObject jModule = new JSONObject();
			jModule.put("name", module.getName());
			jModule.put("title", module.getTitle());
			jModule.put("codeName", module.getCodeName());
			jModule.put("titleName", module.getTitleName());
			jModules.add(jModule);
			
			JSONArray jLtmpls = new JSONArray();
			jModule.put("ltmpls", jLtmpls);
			List<TemplateListTemplate> ltmpls = ltmplMap.get(module.getName());
			if(ltmpls != null) {
				for (TemplateListTemplate ltmpl : ltmpls) {
					JSONObject ltmplJson = toListTemplateJson(ltmpl);
					jLtmpls.add(ltmplJson);
				}
			}
			
			JSONArray jDtmpls = new JSONArray();
			jModule.put("dtmpls", jDtmpls);
			List<TemplateDetailTemplate> dtmpls = dtmplMap.get(module.getName());
			if(dtmpls != null) {
				for (TemplateDetailTemplate dtmpl : dtmpls) {
					JSONObject dtmplJson = toDetailTemplateJson(dtmpl);
					jDtmpls.add(dtmplJson);
				}
			}
			
		}
		return jModules;
	}

	private JSONObject toListTemplateJson(TemplateListTemplate ltmpl) {
		JSONObject jLtmpl = new JSONObject();
		jLtmpl.put("id", ltmpl.getId());
		jLtmpl.put("title", ltmpl.getTitle());
		JSONArray jColumns = new JSONArray();
		jLtmpl.put("columns", jColumns);
		JSONArray jCriterias = new JSONArray();
		jLtmpl.put("criterias", jCriterias);
		for (TemplateListColumn column : ltmpl.getColumns()) {
			if(column.getFieldAvailable()) {
				JSONObject jColumn = new JSONObject();
				jColumns.add(jColumn);
				jColumn.put("id", column.getId());
				jColumn.put("title", column.getTitle());
				jColumn.put("fieldId", column.getFieldId());
			}
		}
		for (TemplateListCriteria criteria : ltmpl.getCriterias()) {
			if(criteria.getFieldAvailable()) {
				JSONObject jCriteria = new JSONObject();
				jCriterias.add(jCriteria);
				jCriteria.put("id", criteria.getId());
				jCriteria.put("title", criteria.getTitle());
				jCriteria.put("fieldId", criteria.getFieldId());
				jCriteria.put("inputType", criteria.getInputType());
				jCriteria.put("defaultValue", criteria.getDefaultValue());
				jCriteria.put("queryShow", criteria.getQueryShow());
			}
		}
		return jLtmpl;
	}
	
	private JSONObject toDetailTemplateJson(TemplateDetailTemplate dtmpl) {
		JSONObject jDtmpl = new JSONObject();
		jDtmpl.put("id", dtmpl.getId());
		jDtmpl.put("title", dtmpl.getTitle());
		JSONArray jGroups = new JSONArray();
		jDtmpl.put("fieldGroups", jGroups);
		for (TemplateDetailFieldGroup group : dtmpl.getGroups()) {
			JSONObject jGroup = new JSONObject();
			jGroups.add(jGroup);
			jGroup.put("id", group.getId());
			jGroup.put("title", group.getTitle());
			jGroup.put("isArray", group.getIsArray());
			jGroup.put("composite", group.getComposite());
			JSONArray jFields = new JSONArray();
			jGroup.put("fields", jFields);
			for (TemplateDetailField field : group.getFields()) {
				if(field.getFieldAvailable()) {
					JSONObject jField = new JSONObject();
					jFields.add(jField);
					jField.put("id", field.getId());
					jField.put("title", field.getTitle());
					jField.put("fieldId", field.getFieldId());
				}
			}
		}
		return jDtmpl;
	}
	
	
	
}
