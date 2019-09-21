package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.statview.service.StatViewService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatList;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatView;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cn.sowell.copframe.dto.ajax.AjaxPageResponse;
import cn.sowell.copframe.utils.CollectionUtils;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/stat/vtmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminStatViewTemplateController {
	
	@Resource
	ModulesService mService;
	
	@Resource
	StatViewService vService;
	
	@Resource
	StatListTemplateService lService;
	
	static Logger logger = Logger.getLogger(AdminStatViewTemplateController.class);
	
	
	@RequestMapping("/list/{moduleName}")
	public String list(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getStatModule(moduleName);
		List<TemplateStatView> views = vService.queryAll(moduleName);
		Map<Long, TemplateStatList> statListMap = lService.getTemplateMap(CollectionUtils.toSet(views, TemplateStatView::getStatListTemplateId));
		model.addAttribute("views", views);
		model.addAttribute("statListMap", statListMap);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_STATVIEW + "/stat_vtmpl_list.jsp";
	}
	
	@RequestMapping("/add/{moduleName}")
	public String add(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getStatModule(moduleName);
		if(module != null) {
			model.addAttribute("module", module);
			return AdminConstants.JSP_TMPL_STATVIEW + "/stat_vtmpl_update.jsp";
		}
		return null;
	}
	
	@RequestMapping("/update/{vtmplId}")
	public String update(@PathVariable Long vtmplId, Model model) {
		TemplateStatView vtmpl = vService.getTemplate(vtmplId);
		if(vtmpl != null) {
			ModuleMeta module = mService.getStatModule(vtmpl.getModule());
			if(module != null) {
				TemplateStatList statListTemplate = lService.getTemplate(vtmpl.getStatListTemplateId());
				model.addAttribute("module", module);
				model.addAttribute("vtmpl", vtmpl);
				model.addAttribute("statListTemplate", statListTemplate);
				return AdminConstants.JSP_TMPL_STATVIEW + "/stat_vtmpl_update.jsp";
			}
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping("/save")
	public AjaxPageResponse save(TemplateStatView view) {
		Assert.hasText(view.getModule());
		try {
			vService.merge(view);
			return AjaxPageResponse.CLOSE_AND_REFRESH_PAGE("保存成功", view.getModule() + "_stat_tmpl_group_list");
		}catch (Exception e) {
			logger.error("保存失败", e);
			return AjaxPageResponse.FAILD("保存失败");
		}
	}
	
}

