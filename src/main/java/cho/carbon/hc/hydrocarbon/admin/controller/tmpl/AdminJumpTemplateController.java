package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.List;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.JsonRequest;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.JumpTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.CommonTemplateActionConsumer.ChooseRequestParam;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/jtmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminJumpTemplateController {

	@Resource
	JumpTemplateService jtmplService;

	Logger logger = Logger.getLogger(AdminJumpTemplateController.class);

	@Resource
	FrameDateFormat dateFormat;

	@Resource
	ModulesService mService;

	@Resource
	ConfigureService configService;

	@Resource
	ArrayItemFilterService arrayItemFilterService;

	@Resource
	CommonTemplateActionConsumer actionConsumer;

	@Resource
	DictionaryService dService;

	@RequestMapping("/to_create/{module}")
	public String toCreate(@PathVariable String module, Model model) {
		ModuleMeta moduleMeta = mService.getModule(module);
		model.addAttribute("module", moduleMeta);
		return AdminConstants.JSP_TMPL_JUMP + "/jtmpl_update.jsp";
	}


	@RequestMapping("/list/{moduleName}")
	public String list(Model model, @PathVariable String moduleName) {
		ModuleMeta moduleMeta = mService.getModule(moduleName);
		List<TemplateJumpTemplate> tmplList = jtmplService.queryAll(moduleName);
		model.addAttribute("modulesJson", configService.getSiblingModulesJson(moduleName));
		model.addAttribute("tmplList", tmplList);
		model.addAttribute("module", moduleMeta);
		return AdminConstants.JSP_TMPL_JUMP + "/jtmpl_list.jsp";
	}

	@RequestMapping("/choose/{moduleName}")
	public String choose(@PathVariable String moduleName, String except, Model model) {
		return actionConsumer.choose(ChooseRequestParam.create(moduleName, jtmplService, model).setExcept(except)
				.setURI(AdminConstants.URI_TMPL + "/jtmpl/choose/" + moduleName));
	}

	

	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON saveTmpl(@RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		TemplateJumpTemplate data = parseToTmplData(jReq.getJsonObject());
		try {
			Long dtmplId = jtmplService.merge(data);
			jRes.put("dtmplId", dtmplId);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	@RequestMapping("/update/{tmplId}")
	public String update(@PathVariable Long tmplId, Model model) {
		TemplateJumpTemplate tmpl = jtmplService.getTemplate(tmplId);
		JSONObject tmplJson = (JSONObject) JSON.toJSON(tmpl);
		ModuleMeta moduleMeta = mService.getModule(tmpl.getModule());
		model.addAttribute("module", moduleMeta);
		model.addAttribute("tmpl", tmpl);
		model.addAttribute("tmplJson", tmplJson);
		return AdminConstants.JSP_TMPL_JUMP + "/dtmpl_update.jsp";
	}

	

	@ResponseBody
	@RequestMapping("/remove/{tmplId}")
	public AjaxPageResponse remove(@PathVariable Long tmplId) {
		try {
			jtmplService.remove(tmplId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}

	private TemplateJumpTemplate parseToTmplData(JSONObject json) {
		return JSON.toJavaObject(json, TemplateJumpTemplate.class);
	}

	@ResponseBody
	@RequestMapping("/copy/{dtmplId}/{targetModuleName}")
	public ResponseJSON copy(@PathVariable Long dtmplId, @PathVariable String targetModuleName) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			Long newTmplId = jtmplService.copy(dtmplId, targetModuleName);
			if (newTmplId != null) {
				jRes.setStatus("suc");
				jRes.put("newTmplId", newTmplId);
			}
		} catch (Exception e) {
			logger.error("复制详情模板时发生错误", e);
		}
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/load_jtmpls/{moduleName}")
	public ResponseJSON loadDetailTemplates(@PathVariable String moduleName, Long dtmplId) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			List<TemplateJumpTemplate> tmplList = jtmplService.queryAll(moduleName);
			if (tmplList != null) {
				JSONArray jDtmpls = new JSONArray();
				tmplList.forEach((tmpl) -> {
					JSONObject jDtmpl = new JSONObject();
					jDtmpl.put("id", tmpl.getId());
					jDtmpl.put("title", tmpl.getTitle());
					jDtmpls.add(jDtmpl);
				});
				jRes.put("dtmpls", jDtmpls);
				jRes.setStatus("suc");
			}

		} catch (Exception e) {
			logger.error("加载详情模板列表时发生错误[moduleName=" + moduleName + "]", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	



}
