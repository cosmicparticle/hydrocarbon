package cho.carbon.hc.hydrocarbon.common;

import org.springframework.security.core.userdetails.UserDetails;

import cho.carbon.hc.copframe.common.UserIdentifier;

public interface ApiUser extends UserDetails, UserIdentifier{
	String getToken();
	void setCache(Object key, Object value);
	Object getCache(Object key);
}
