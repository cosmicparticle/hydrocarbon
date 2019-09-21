package cho.carbon.hc.hydrocarbon.api.controller.menu;

import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;

import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.ResponseJSON;

@Controller
@RequestMapping("/api/menu")
public class ApiMenuController {

	@Resource
	SideMenuService menuService;
	
	@Resource
	AuthorityService authService;
	
	@Resource
	AdminUserService userService;
	
	@ResponseBody
	@RequestMapping("/getMenu")
	public ResponseJSON getMenu(ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		List<SideMenuLevel1Menu> menus = menuService.getSideMenuLevelMenus(user);
		menus = menus.stream().filter(menu->{
			try {
				authService.validateUserL1MenuAccessable(user, menu.getId());
			} catch (NonAuthorityException e) {
				return false;
			}
			return true;
		}).collect(Collectors.toList());
		res.put("menus", JSON.toJSON(menus));
		return res;
	}
}
