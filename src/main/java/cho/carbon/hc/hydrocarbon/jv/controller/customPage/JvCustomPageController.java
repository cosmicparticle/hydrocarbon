package cho.carbon.hc.hydrocarbon.jv.controller.customPage;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import cho.carbon.hc.hydrocarbon.jv.JvConstants;

@Controller
@RequestMapping(JvConstants.URI_BASE + "/custompage")
public class JvCustomPageController {
	
	@RequestMapping("/path/{path}")
	public String path(@PathVariable String path, Model model) {
		model.addAttribute("path", path);
		return JvConstants.JSP_CUSTOM_PAGE + "/custompage.jsp";
	}
}
