package cho.carbon.hc.hydrocarbon.common;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.entityResolver.UserCodeService;
import cho.carbon.hc.hydrocarbon.SessionKey;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;
import cho.carbon.hc.hydrocarbon.model.admin.service.impl.AdminUserServiceImpl.Token;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;

public class ApiUserResolver implements HandlerMethodArgumentResolver{

	@Resource
	AdminUserService uService;
	
	@Resource
	UserCodeService userCodeService;
	
	static Logger logger = Logger.getLogger(ApiUserResolver.class);
	
	
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		Class<?> paramClass = parameter.getParameterType();
		if(ApiUser.class.isAssignableFrom(paramClass)){
			return true;
		}
		return false;
	}

	@Override
	public ApiUser resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
		String tokenCode = webRequest.getParameter("@token");
		if(!TextUtils.hasText(tokenCode)) {
			tokenCode = webRequest.getHeader("hydrocarbon-token");
		}
		if(!TextUtils.hasText(tokenCode)) {
			tokenCode = webRequest.getHeader("datamobile-token");
		}
		if(!TextUtils.hasText(tokenCode)) {
			if(webRequest.getSessionMutex() instanceof HttpSession) {
				HttpSession session = (HttpSession) webRequest.getSessionMutex();
				tokenCode = (String) session.getAttribute(SessionKey.API_USER_TOKEN);
			}
		}
		if(TextUtils.hasText(tokenCode)) {
			try {
				Token token = uService.validateToken(tokenCode);
				token.refreshDeadline();
				UserWithToken user = token.getUser();
				if(user != null) {
					userCodeService.setUserCode(user.getCode());
				}
				return user;
			} catch (Exception e) {
				logger.error("验证用户token时发生异常", e);
			}
		}
		throw new NonAuthorityException("没有权限");
		
	}

}
