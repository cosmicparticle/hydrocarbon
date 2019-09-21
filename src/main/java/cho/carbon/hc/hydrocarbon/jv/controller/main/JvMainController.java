package cho.carbon.hc.hydrocarbon.jv.controller.main;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import cho.carbon.hc.hydrocarbon.SessionKey;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.jv.JvConstants;
import cho.carbon.hc.hydrocarbon.jv.controller.entity.JvBaseController;

@Controller
@RequestMapping(JvConstants.URI_BASE + "/main")
public class JvMainController extends JvBaseController{
	
	@RequestMapping("/login")
	public String login() {
		return JvConstants.JSP_MAIN + "/login.jsp";
	}

	@RequestMapping("/redirect/{token}")
	public String redirect(@PathVariable String token, HttpSession session) {
		session.setAttribute(SessionKey.API_USER_TOKEN, token);
		return "redirect:/jv/main/index";
	}
	
	@RequestMapping({"/index"})
	public String home(Long blockId, Long menuId, ApiUser user, Model model) {
		model.addAttribute("blockId", blockId);
		model.addAttribute("menuId", menuId);
		return JvConstants.JSP_MAIN + "/index.jsp";
	}
}
