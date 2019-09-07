package cn.sowell.datacenter.api2.controller.meta;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;

import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.datacenter.api2.controller.Api2Constants;
import cn.sowell.datacenter.common.ApiUser;
import cn.sowell.datacenter.model.config.service.ConfigUserService;

@RestController
@RequestMapping(Api2Constants.URI_META + "/user")
public class Api2UserController {
	
	@Resource
	ConfigUserService userService;
	
	static {
		JSON.DEFAULT_GENERATE_FEATURE |= SerializerFeature.WriteMapNullValue.getMask();
	}
	
	@RequestMapping("/current_user")
	public JSONObjectResponse currentUser(ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONObject jUser = new JSONObject();
		jUser.put("id", user.getId());
		jUser.put("username", user.getUsername());
		jUser.put("nickname", user.getNickname());
		jUser.put("token", user.getToken());
		JSONArray authorities = new JSONArray();
		if(user.getAuthorities() != null) {
			user.getAuthorities().forEach(auth->authorities.add(auth.getAuthority()));
		}
		jUser.put("authorities", authorities);
		jRes.put("user", jUser);
		
		return jRes;
	}
	
	
	
	
	
}
