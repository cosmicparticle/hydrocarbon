package cho.carbon.hc.hydrocarbon.api.controller.auth;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;

@Controller
@RequestMapping("/api/auth")
public class ApiAuthencationController {
	
	@Resource
	AdminUserService uService;
	
	@ResponseBody
	@RequestMapping("/token")
	public ResponseJSON getToken(@RequestParam String username, @RequestParam String password) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		if(username.isEmpty() || password.isEmpty()) {
			jRes.setStatus("error");
			jRes.put("errorMsg", "账号密码不能为空");
		}else {
			String token = uService.renderToken("mobile", username, password);
			if(token != null) {
				jRes.setStatus("suc");
				jRes.put("token", token);
			}else {
				jRes.setStatus("error");
				jRes.put("errorMsg", "密码错误或用户不存在");
			}
		}
		return jRes;
	}
}
