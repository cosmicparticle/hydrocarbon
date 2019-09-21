package cho.carbon.hc.hydrocarbon.model.admin.service;

import org.springframework.security.core.userdetails.UserDetailsService;

import cho.carbon.hc.hydrocarbon.model.admin.service.impl.AdminUserServiceImpl.Token;

public interface AdminUserService extends UserDetailsService{
	String renderToken(String domain, String username, String password);

	Token validateToken(String tokenCode);

	void clearTokenCache();
}
