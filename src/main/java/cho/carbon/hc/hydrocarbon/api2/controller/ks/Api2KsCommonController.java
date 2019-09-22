package cho.carbon.hc.hydrocarbon.api2.controller.ks;

import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.HttpRequestUtils;
import cho.carbon.hc.dataserver.model.karuiserv.match.KaruiServMatcher;
import cho.carbon.hc.dataserver.model.karuiserv.pojo.KaruiServ;
import cho.carbon.hc.dataserver.model.karuiserv.service.KaruiServService;
import cho.carbon.hc.hydrocarbon.api2.controller.Api2Constants;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.ks.service.KaruiServExecService;

@RestController
@RequestMapping(Api2Constants.URI_KS)
public class Api2KsCommonController {
	private static final String PREFIX = "/";

	@Resource
	KaruiServService ksService;
	
	@Resource
	KaruiServExecService ksExecService;
	
	static Logger logger = Logger.getLogger(Api2KsCommonController.class);
	
	private static String extractFilePath(HttpServletRequest request) {
        String path = (String) request.getAttribute(
                HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String bestMatchPattern = (String) request.getAttribute(
                HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        AntPathMatcher apm = new AntPathMatcher(); 
        return apm.extractPathWithinPattern(bestMatchPattern, path);
    }
	
	@Resource
	AuthorityService authService;
	
	@RequestMapping("/c/**")
	public ResponseJSON index(ApiUser user, HttpServletRequest request) {
		String path = PREFIX + extractFilePath(request);
		JSONObjectResponse jRes = new JSONObjectResponse();
		jRes.put("path", path);
		Map<String, String> requestMap = HttpRequestUtils.convertParamMap(request);
		//根据路径匹配轻服务
		KaruiServMatcher matcher = ksExecService.match(path, requestMap, PREFIX);
		if(matcher != null) {
			KaruiServ ks = matcher.getKaruiServ();
			try {
				authService.validateKsAccess(ks, user);
				jRes.put("ks", matcher.getKaruiServJson());
				//执行匹配的轻服务，并返回结果
			
				JSON result = ksExecService.executeKaruiServ(matcher, user);
				jRes.put("result", result);
			} catch (Exception e) {
				jRes.put("System Error", e.getMessage());
				logger.error("执行轻服务时发生错误", e);
			}
		}else {
			jRes.put("error", "Not Found Karui Service matched uri[" + path + "]");
		}
		logger.debug("path:" + path);
		return jRes;
	}
	
	@RequestMapping("/query/{queryKey}/{pageNo}")
	public ResponseJSON pageList(@PathVariable String queryKey, @PathVariable Integer pageNo, 
			Integer pageSize, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse(); 
		try {
			JSONObject jResult = ksExecService.queryPagedEntities(queryKey, pageNo, pageSize, user);
			jRes.put("result", jResult);
		} catch (Exception e) {
			jRes.put("System Error", e.getMessage());
		}
		return jRes;
	}
}
