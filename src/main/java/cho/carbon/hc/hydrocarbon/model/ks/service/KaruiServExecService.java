package cho.carbon.hc.hydrocarbon.model.ks.service;

import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.karuiserv.match.KaruiServMatcher;
import cho.carbon.hc.hydrocarbon.common.ApiUser;

public interface KaruiServExecService {
	KaruiServMatcher match(String path, Map<String, String> requestMap, String prefix);

	JSON executeKaruiServ(KaruiServMatcher matcher, ApiUser user);

	JSONObject queryPagedEntities(String queryKey, Integer pageNo, Integer pageSize, ApiUser user);

}
