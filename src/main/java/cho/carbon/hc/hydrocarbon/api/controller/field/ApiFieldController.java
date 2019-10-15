package cho.carbon.hc.hydrocarbon.api.controller.field;

import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryOption;
import cho.carbon.hc.dataserver.model.dict.pojo.OptionItem;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;

@Controller
@RequestMapping("/api/field")
public class ApiFieldController {
	
	@Resource
	DictionaryService dictService;
	
	@Resource
	AuthorityService authService;
	
	@ResponseBody
	@RequestMapping("/options")
	public ResponseJSON getOptions(@RequestParam Set<String> fieldIds, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		Map<String, List<OptionItem>> optionsMap = dictService.getOptionsMap(fieldIds);
		JSONObject map = new JSONObject();
		String keyPrefix = "field_";
		optionsMap.forEach((fieldId, options)->{
			map.put(keyPrefix + fieldId, options);
		});
		res.put("keyPrefix", keyPrefix);
		res.put("optionsMap", map);
		return res;
	}
	
	@ResponseBody
	@RequestMapping("/cas_ops/{optGroupId}")
	public ResponseJSON casOptions(@PathVariable Integer optGroupId, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<DictionaryOption> options = dictService.queryOptions(optGroupId);
		jRes.put("options", options);
		jRes.setStatus("suc");
		return jRes;
	}
}
