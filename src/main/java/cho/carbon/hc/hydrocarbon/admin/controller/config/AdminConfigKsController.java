package cho.carbon.hc.hydrocarbon.admin.controller.config;

import java.util.Collection;
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

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.JsonRequest;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.karuiserv.pojo.KaruiServ;
import cho.carbon.hc.dataserver.model.karuiserv.service.KaruiServService;
import cho.carbon.hc.dataserver.model.tmpl.manager.StatListTemplateManager;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatList;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ListTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.entityResolver.config.abst.Module;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.common.UserWithToken;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;
import cho.carbon.hc.hydrocarbon.model.api2.service.MetaJsonService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.meta.vo.ModuleVO;

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
	
	@Resource
	ActionTemplateService atmplService;

	static Logger logger = Logger.getLogger(AdminConfigKsController.class);

	@RequestMapping("/list")
	public String list() {
		return AdminConstants.JSP_CONFIG_KS + "/ks_list.jsp";
	}

	@RequestMapping({ "/edit", "/edit/", "/edit/{ksId}" })
	public String edit(@PathVariable(required = false) Long ksId, Model model) {
		model.addAttribute("ksId", ksId);
		return AdminConstants.JSP_CONFIG_KS + "/ks_edit.jsp";
	}

	@RequestMapping("/test/{ksId}")
	public String test(@PathVariable Long ksId, Model model) {
		model.addAttribute("ksId", ksId);
		return AdminConstants.JSP_CONFIG_KS + "/ks_test.jsp";
	}
	@Resource
	AdminUserService uService;
	@ResponseBody
	@RequestMapping("/load_all_ks")
	public ResponseJSON loadAllKaruiService() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<KaruiServ> ksList = ksService.queryAll();
		ArrayEntityProxy.setLocalUser(uService.getUser());
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
		ArrayEntityProxy.setLocalUser(uService.getUser());
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
		Collection<ModuleVO> modules = configService.getEnabledModules();
		Set<String> moduleNames = CollectionUtils.toSet(modules, ModuleVO::getName);
		Map<String, List<TemplateListTemplate>> ltmplMap = ltmplService.queryByModuleNames(moduleNames);
		Map<String, List<TemplateActionTemplate>> atmplMap = atmplService.queryByModuleNames(moduleNames);
		Map<String, List<TemplateDetailTemplate>> dtmplMap = dtmplService.queryByModuleNames(moduleNames);
		ArrayEntityProxy.setLocalUser(uService.getUser());
		JSONArray jModules = toModulesJson(modules, ltmplMap,atmplMap, dtmplMap);
		jRes.put("modules", jModules);
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/existion_validate")
	public ResponseJSON existionValidate(String title, String path) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		boolean exist = true;
		if (title != null) {
			exist = ksService.validateTitleExistion(title);
		}
		if (exist && path != null) {
			exist = ksService.validatePathExistion(path);
		}
		jRes.put("valid", !exist);
		return jRes;
	}

	private ResponseJSON doMultiReq(String ksIdsStr, Consumer<Set<Long>> consumer) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		Set<Long> ksIds = TextUtils.splitToLongSet(ksIdsStr, ",");
		if (!ksIds.isEmpty()) {
			try {
				consumer.accept(ksIds);
				jRes.setStatus("suc");
			} catch (Exception e) {
				jRes.setStatus("error");
				jRes.put("msg", e.getMessage());
			}
		} else {
			jRes.put("msg", "ksIds参数不能为空");
		}
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/remove")
	public ResponseJSON removeKs(@RequestParam("ksIds") String ksIdsStr) {
		return doMultiReq(ksIdsStr, ksIds -> ksService.remove(ksIds));
	}

	@ResponseBody
	@RequestMapping("/{toDisabled:enable|disable}")
	public ResponseJSON toggleKsDisabled(@RequestParam("ksIds") String ksIdsStr, @PathVariable String toDisabled) {
		return doMultiReq(ksIdsStr, ksIds -> ksService.toggleDisabled(ksIds, "disable".equals(toDisabled)));
	}

	private JSONArray toModulesJson(Collection<ModuleVO> modules, Map<String, List<TemplateListTemplate>> ltmplMap,
			Map<String, List<TemplateActionTemplate>> atmplMap, Map<String, List<TemplateDetailTemplate>> dtmplMap) {
		JSONArray jModules = new JSONArray();
		for (ModuleVO module : modules) {
			JSONObject jModule = new JSONObject();
			jModule.put("name", module.getName());
			jModule.put("title", module.getTitle());
			jModule.put("codeName", module.getCodeName());
			jModule.put("titleName", module.getTitleName());
			jModules.add(jModule);

			JSONArray jLtmpls = new JSONArray();
			jModule.put("ltmpls", jLtmpls);
			List<TemplateListTemplate> ltmpls = ltmplMap.get(module.getName());
			if (ltmpls != null) {
				for (TemplateListTemplate ltmpl : ltmpls) {
					JSONObject ltmplJson = toListTemplateJson(ltmpl);
					jLtmpls.add(ltmplJson);
				}
			}

			JSONArray jAtmpls = new JSONArray();
			jModule.put("atmpls", jAtmpls);
			List<TemplateActionTemplate> atmpls = atmplMap.get(module.getName());
			if (atmpls != null) {
				for (TemplateActionTemplate atmpl : atmpls) {
					JSONObject atmplJson = toActionTemplateJson(atmpl);
					jAtmpls.add(atmplJson);
				}
			}

			// List<TemplateStatList> statltmpls = statLtmplMap.get(module.getName());
			// if(statltmpls != null) {
			// for (TemplateStatList ltmpl : statltmpls) {
			// JSONObject ltmplJson = toListTemplateJson(ltmpl);
			// jLtmpls.add(ltmplJson);
			// }
			// }

			JSONArray jDtmpls = new JSONArray();
			jModule.put("dtmpls", jDtmpls);
			List<TemplateDetailTemplate> dtmpls = dtmplMap.get(module.getName());
			if (dtmpls != null) {
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
			if (column.getFieldAvailable()) {
				JSONObject jColumn = new JSONObject();
				jColumns.add(jColumn);
				jColumn.put("id", column.getId());
				jColumn.put("title", column.getTitle());
				jColumn.put("fieldId", column.getFieldId());
			}
		}
		for (TemplateListCriteria criteria : ltmpl.getCriterias()) {
			if (criteria.getFieldAvailable()) {
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

	private JSONObject toListTemplateJson(TemplateStatList ltmpl) {
		JSONObject jLtmpl = new JSONObject();
		jLtmpl.put("id", ltmpl.getId());
		jLtmpl.put("title", ltmpl.getTitle());
		JSONArray jColumns = new JSONArray();
		jLtmpl.put("columns", jColumns);
		JSONArray jCriterias = new JSONArray();
		jLtmpl.put("criterias", jCriterias);
		for (TemplateStatColumn column : ltmpl.getColumns()) {
			if (column.getFieldAvailable()) {
				JSONObject jColumn = new JSONObject();
				jColumns.add(jColumn);
				jColumn.put("id", column.getId());
				jColumn.put("title", column.getTitle());
				jColumn.put("fieldId", column.getFieldId());
			}
		}
		for (TemplateStatCriteria criteria : ltmpl.getCriterias()) {
			if (criteria.getFieldAvailable()) {
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

	private JSONObject toActionTemplateJson(TemplateActionTemplate atmpl) {
		JSONObject jDtmpl = new JSONObject();
		jDtmpl.put("id", atmpl.getId());
		jDtmpl.put("title", atmpl.getTitle());
		JSONArray jGroups = new JSONArray();
		jDtmpl.put("fieldGroups", jGroups);
		for (TemplateActionFieldGroup group : atmpl.getGroups()) {
			JSONObject jGroup = new JSONObject();
			jGroups.add(jGroup);
			jGroup.put("id", group.getId());
			jGroup.put("title", group.getTitle());
			jGroup.put("isArray", group.getIsArray());
			jGroup.put("composite", group.getComposite());
			JSONArray jFields = new JSONArray();
			jGroup.put("fields", jFields);
			for (TemplateActionField field : group.getFields()) {
				if (field.getFieldAvailable()) {
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
				if (field.getFieldAvailable()) {
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
