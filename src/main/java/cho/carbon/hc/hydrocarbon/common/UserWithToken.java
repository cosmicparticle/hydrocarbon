package cho.carbon.hc.hydrocarbon.common;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.util.Assert;

import cho.carbon.auth.pojo.UserInfo;
import cho.carbon.hc.hydrocarbon.model.admin.pojo.ABCUser;

public class UserWithToken extends ABCUser implements ApiUser{

	/**
	 * 
	 */
	private static final long serialVersionUID = -2902469238615382046L;
	private String token;
	private Map<Object, Object> cacheMap = new LinkedHashMap<>();
	
	public UserWithToken(String token, UserInfo u) {
		super(u);
		this.token = token;
	}

	@Override
	public String getToken() {
		return token;
	}

	@Override
	public void setCache(Object key, Object value) {
		Assert.notNull(key);
		cacheMap.put(key, value);
	}

	@Override
	public Object getCache(Object key) {
		return cacheMap.get(key);
	}

}
