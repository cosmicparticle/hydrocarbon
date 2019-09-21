package cho.carbon.hc.hydrocarbon.jv.controller.main;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.jv.JvConstants;

@Controller
@RequestMapping(JvConstants.URI_BASE + "/config/user")
public class JvUserController {
	
	@RequestMapping("/detail")
	public String detail(ApiUser user, Model model) {
		model.addAttribute("mode", "user_detail");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
	
	@RequestMapping("/update")
	public String update(ApiUser user, Model model) {
		model.addAttribute("mode", "user_update");
		return JvConstants.JSP_ENTITY + "/entity_detail.jsp";
	}
}
