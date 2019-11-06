package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.List;
import java.util.function.Predicate;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.JumpTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.CommonTemplateActionConsumer.ChooseRequestParam;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/group")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminTemplateGroupController {
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	ActionTemplateService atmplService;
	
	@Resource
	JumpTemplateService jtmplService;
	
	@Resource
	ModulesService  mService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	FrameDateFormat dateFormat;
	
	Logger logger = Logger.getLogger(AdminTemplateGroupController.class);
	
	@RequestMapping("/list/{module}")
	public String list(@PathVariable String module, Model model) {
		ModuleMeta moduleMeta = mService.getModule(module);
		if(module != null) {
			List<TemplateGroup> tmplGroups = tmplGroupService.queryAll(module);
			model.addAttribute("module", moduleMeta);
			model.addAttribute("tmplGroups", tmplGroups);
			model.addAttribute("modulesJson", configService.getSiblingModulesJson(module));
			return AdminConstants.JSP_TMPL_GROUP + "/tmpl_group_list.jsp";
		}
		return null;
	}
	
	@RequestMapping("/to_create/{moduleName}")
	public String toCreate(@PathVariable String moduleName, Model model) {
		ModuleMeta moduleMeta = mService.getModule(moduleName);
		if(moduleName != null) {
			model.addAttribute("module", moduleMeta);
			model.addAttribute("atmpls", toActionListJson(atmplService.queryAll(moduleName)));
			model.addAttribute("jtmpls", toJumpListJson(jtmplService.queryAll(moduleName)));
			model.addAttribute("moduleWritable", mService.getModuleEntityWritable(moduleName));
			return AdminConstants.JSP_TMPL_GROUP + "/tmpl_group_update.jsp";
		}
		return null;
	}
	
	@RequestMapping("/update/{groupId}")
	public String toUpdate(@PathVariable Long groupId, Model model) {
		TemplateGroup group = tmplGroupService.getTemplate(groupId);
		if(group != null) {
			ModuleMeta module = mService.getModule(group.getModule());
			model.addAttribute("module", module);
			model.addAttribute("group", group);
			model.addAttribute("premisesJson", JSON.toJSON(group.getPremises()));
			model.addAttribute("tmplActions", JSON.toJSON(group.getActions()));
			model.addAttribute("tmplJumps", JSON.toJSON(group.getJumps()));
			model.addAttribute("atmpls", toActionListJson(atmplService.queryAll(group.getModule())));
			model.addAttribute("jtmpls", toJumpListJson(jtmplService.queryAll(group.getModule())));
			model.addAttribute("moduleWritable", mService.getModuleEntityWritable(group.getModule()));
			return AdminConstants.JSP_TMPL_GROUP + "/tmpl_group_update.jsp";
		}
		return null;
	}
	
	private JSONArray toActionListJson(List<TemplateActionTemplate> actions) {
		JSONArray aActions = new JSONArray();
		if(actions != null) {
			for (TemplateActionTemplate action : actions) {
				JSONObject jAction = new JSONObject();
				jAction.put("id", action.getId());
				jAction.put("title", action.getTitle());
				aActions.add(jAction);
			}
		}
		return aActions;
	}
	
	private JSONArray toJumpListJson(List<TemplateJumpTemplate> jumps) {
		JSONArray jJumps = new JSONArray();
		if(jumps != null) {
			for (TemplateJumpTemplate jump : jumps) {
				JSONObject jAction = new JSONObject();
				jAction.put("id", jump.getId());
				jAction.put("title", jump.getTitle());
				jJumps.add(jAction);
			}
		}
		return jJumps;
	}

	@ResponseBody
	@RequestMapping("/save")
	public AjaxPageResponse save(TemplateGroup group) {
		Assert.hasText(group.getModule());
		try {
			tmplGroupService.merge(group);
			return AjaxPageResponse.CLOSE_AND_REFRESH_PAGE("保存成功", group.getModule() + "_tmpl_group_list");
		}catch (Exception e) {
			logger.error("保存失败", e);
			if(e instanceof ConstraintViolationException) {
				if("module_key_unique".equalsIgnoreCase(((ConstraintViolationException) e).getConstraintName())) {
					return AjaxPageResponse.FAILD("Key值重复， 保存失败");
				}
			}
			return AjaxPageResponse.FAILD("保存失败");
		}
	}
	
	
	@ResponseBody
	@RequestMapping("/remove/{groupId}")
	public AjaxPageResponse remove(@PathVariable Long groupId) {
		try {
			tmplGroupService.remove(groupId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}
	
	
	@ResponseBody
	@RequestMapping("/copy/{tmplGroupId}/{targetModuleName}")
	public ResponseJSON copy(@PathVariable Long tmplGroupId, @PathVariable String targetModuleName) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
			Long newTmplId = tmplGroupService.copy(tmplGroupId, targetModuleName);
			if(newTmplId != null) {
				jRes.setStatus("suc");
				jRes.put("newTmplId", newTmplId);
			}
		} catch (Exception e) {
			logger.error("复制模板组合时发生错误", e);
		}
		return jRes;
	}
	
	@Resource
	CommonTemplateActionConsumer actionConsumer;
	
	@RequestMapping("/choose/{moduleName}")
	public String choose(@PathVariable String moduleName, String except, Model model) {
		return forChoose(moduleName, except, null, model);
	}
	
	
	private String forChoose(String moduleName, String except, Predicate<TemplateGroup> selectedPredicate, Model model) {
		return actionConsumer.choose(
				ChooseRequestParam.create(moduleName, tmplGroupService, model)
					.setExcept(except)
					.setSelectedPredicate(selectedPredicate)
					.setURI(AdminConstants.URI_TMPL + "/tmpl/group/" + moduleName)
			);
	}

	@RequestMapping("/rabc_relate/{moduleName}/{relationCompositeId}")
	public String rabcRelate(@PathVariable String moduleName, 
			@PathVariable Integer relationCompositeId,
			Long rabcTemplateGroupId,
			Model model) {
		ModuleMeta relationCompositeModule = mService.getCompositeRelatedModule(moduleName, relationCompositeId);
		if(relationCompositeModule != null) {
			return forChoose(relationCompositeModule.getName(), "", group->group.getId().equals(rabcTemplateGroupId), model);
		}
		return null;
	}
	
	
}
