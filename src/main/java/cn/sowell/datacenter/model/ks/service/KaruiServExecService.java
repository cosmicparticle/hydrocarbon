package cn.sowell.datacenter.model.ks.service;

import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.common.ApiUser;
import cn.sowell.dataserver.model.karuiserv.match.KaruiServMatcher;

public interface KaruiServExecService {
	KaruiServMatcher match(String path, Map<String, String> requestMap, String prefix);

	JSON executeKaruiServ(KaruiServMatcher matcher, ApiUser user);

	JSONObject queryPagedEntities(String queryKey, Integer pageNo, Integer pageSize, ApiUser user);

}
