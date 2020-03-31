package cho.carbon.hc.hydrocarbon.api2.controller.meta;

import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryOption;
import cho.carbon.hc.dataserver.model.dict.pojo.OptionItem;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.hydrocarbon.api2.controller.Api2Constants;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;

@RestController
@RequestMapping(Api2Constants.URI_META + "/dict")
public class Api2DictionaryController {
	@Resource
	DictionaryService dictService;
	
	@Resource
	AuthorityService authService;
	
	@RequestMapping("/field_options")
	public ResponseJSON getOptions(@RequestParam String fieldIds, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		Set<String> fieldIdSet = TextUtils.split(fieldIds, ",");
		Map<String, List<OptionItem>> optionsMap = dictService.getOptionsMap(fieldIdSet);
//		JSONObject map = new JSONObject();
//		optionsMap.forEach((fieldId, options)->{
//			map.put(String.valueOf(fieldId), options);
//		});
		res.put("optionsMap", optionsMap);
		return res;
	}
	
	@RequestMapping("/cas_ops/{optGroupId}")
	public ResponseJSON casOptions(@PathVariable Integer optGroupId, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<DictionaryOption> options = dictService.queryOptions(optGroupId);
		jRes.put("options", options);
		jRes.setStatus("suc");
		return jRes;
	}
}
