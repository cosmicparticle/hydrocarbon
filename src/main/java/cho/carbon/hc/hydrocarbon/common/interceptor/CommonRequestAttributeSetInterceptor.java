package cho.carbon.hc.hydrocarbon.common.interceptor;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.ui.ModelMap;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.WebRequestInterceptor;

import cn.sowell.copframe.spring.properties.PropertyPlaceholder;
import cn.sowell.copframe.utils.TextUtils;

public class CommonRequestAttributeSetInterceptor implements WebRequestInterceptor{
	
	Logger logger = Logger.getLogger(CommonRequestAttributeSetInterceptor.class);
	
	
	@Override
	public void preHandle(WebRequest request) throws Exception {
		if(request instanceof NativeWebRequest){
			HttpServletRequest req = ((NativeWebRequest) request).getNativeRequest(HttpServletRequest.class);
			long resStamp = System.currentTimeMillis();
			req.setAttribute("RES_STAMP", resStamp);
			String basePath = null;
			try {
				basePath = PropertyPlaceholder.getProperty("project_url");
			} catch (Exception e) {
				logger.debug("没有配置project_url，将自动根据请求设置basePath");
			}
			if(!TextUtils.hasText(basePath)) {
				basePath = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort() + req.getContextPath() + "/";
			}
			req.setAttribute("basePath", basePath);
		}
		
	}

	@Override
	public void postHandle(WebRequest request, ModelMap model) throws Exception {
		
	}

	@Override
	public void afterCompletion(WebRequest request, Exception ex)
			throws Exception {
		// TODO Auto-generated method stub
	}
}
