package cho.carbon.hc.hydrocarbon.jv.controller.entity;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.jv.JvConstants;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;

@Controller
@RequestMapping(JvConstants.URI_ENTITY + "/curd")
public class JvEntityCurdController {
	@Resource
	AuthorityService authService;
	
	@RequestMapping("/list/{menuId}")
	public String list(@PathVariable Long menuId, ApiUser user, Model model) {
		authService.validateUserL2MenuAccessable(user, menuId);
		model.addAttribute("menuId", menuId);
		return JvConstants.JSP_ENTITY + "/entity_list.jsp";
	}
	
	@RequestMapping("/tree/{menuId}")
	public String index(@PathVariable Long menuId, ApiUser user, Model model) {
		authService.validateUserL2MenuAccessable(user, menuId);
		model.addAttribute("menuId", menuId);
		return JvConstants.JSP_ENTITY + "/entity_tree.jsp";
	}
	
	@RequestMapping("/detail/{validateSign}/{code}")
	public String detail(@PathVariable String validateSign, @PathVariable String code, ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("code", code);
		model.addAttribute("mode", "detail");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	
	@RequestMapping("/create/{validateSign}")
	public String add(@PathVariable String validateSign, ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("mode", "create");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/update/{validateSign}/{code}")
	public String update(@PathVariable String validateSign, @PathVariable String code, ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("code", code);
		model.addAttribute("mode", "update");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/select/{validateSign}/{dtmplFieldGroupId}")
	public String select(@PathVariable String validateSign, 
			@PathVariable Long dtmplFieldGroupId,
			String except,
			ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("groupId", dtmplFieldGroupId);
		model.addAttribute("except", except);
		return JvConstants.JSP_ENTITY + "/entity_select.jsp";
	}
	
	@RequestMapping("/rabc_create/{validateSign}/{fieldGroupId}")
	public String rabcCreate(@PathVariable String validateSign, @PathVariable Long fieldGroupId, ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("fieldGroupId", fieldGroupId);
		model.addAttribute("mode", "rabc_create");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/rabc_update/{validateSign}/{fieldGroupId}/{code}")
	public String rabcUpdate(@PathVariable String validateSign, 
			@PathVariable Long fieldGroupId, 
			@PathVariable String code, ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("fieldGroupId", fieldGroupId);
		model.addAttribute("code", code);
		model.addAttribute("mode", "rabc_update");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/node_detail/{validateSign}/{nodeId}/{code}")
	public String nodeDetail(@PathVariable String validateSign, 
			@PathVariable Long nodeId,
			@PathVariable String code, 
			ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("nodeId", nodeId);
		model.addAttribute("code", code);
		model.addAttribute("mode", "node_detail");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/node_update/{validateSign}/{nodeId}/{code}")
	public String nodeUpdate(@PathVariable String validateSign, 
			@PathVariable Long nodeId,
			@PathVariable String code, 
			ApiUser user, Model model) {
		authService.validateUserAccessable(user, validateSign);
		model.addAttribute("validateSign", validateSign);
		model.addAttribute("nodeId", nodeId);
		model.addAttribute("code", code);
		model.addAttribute("mode", "node_update");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	
	@RequestMapping("/import/{menuId}")
	public String entityImport(@PathVariable Long menuId, ApiUser user, Model model) {
		authService.validateUserL2MenuAccessable(user, menuId);
		model.addAttribute("menuId", menuId);
		return JvConstants.JSP_ENTITY + "/entity_import.jsp";
	}
	
	
	@RequestMapping({"/import_tmpl/{menuId}", "/import_tmpl/{menuId}/{tmplId}"})
	public String entityImportTmpl(@PathVariable Long menuId, @PathVariable(required=false) Long tmplId, ApiUser user, Model model) {
		model.addAttribute("menuId", menuId);
		model.addAttribute("tmplId", tmplId);
		return JvConstants.JSP_ENTITY + "/entity_import_tmpl.jsp";
	}
	
}
