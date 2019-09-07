package cn.sowell.datacenter.admin.controller.tmpl;

import javax.annotation.Resource;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import cn.sowell.datacenter.admin.controller.AdminConstants;
import cn.sowell.dataserver.model.modules.pojo.ModuleMeta;
import cn.sowell.dataserver.model.modules.service.ModulesService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/rdtmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminRelationDetailTemplateController {
	
	@Resource
	ModulesService mService;
	
	@RequestMapping("/create")
	public String create(String moduleName, Integer compositeId, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		ModuleMeta compoisteRelateModule = mService.getCompositeRelatedModule(moduleName, compositeId);
		model.addAttribute("relationModule", compoisteRelateModule);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_RELATIONDETAIL + "/rdtmpl_update.jsp";
	}
	
	@RequestMapping("/update/{rdtmplId}")
	public String update(@PathVariable Long rdtmplId, String moduleName, String compositeId) {
		return AdminConstants.JSP_TMPL_RELATIONDETAIL + "/rdtmpl_update.jsp";
	}
}
