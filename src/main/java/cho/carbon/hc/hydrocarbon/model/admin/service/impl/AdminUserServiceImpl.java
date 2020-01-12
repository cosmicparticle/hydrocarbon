package cho.carbon.hc.hydrocarbon.model.admin.service.impl;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import cho.carbon.auth.pojo.UserInfo;
import cho.carbon.auth.service.ServiceFactory;
import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.modules.bean.criteriaConveter.UserRelationExistCriteriaConverter.UserCodeSupplier;
import cho.carbon.hc.entityResolver.UserCodeService;
import cho.carbon.hc.hydrocarbon.common.UserWithToken;
import cho.carbon.hc.hydrocarbon.model.admin.dao.AdminUserDao;
import cho.carbon.hc.hydrocarbon.model.admin.pojo.ABCUser;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;

@Service("adminUserService")
public class AdminUserServiceImpl implements AdminUserService, UserCodeService, UserCodeSupplier{

	@Resource
	AdminUserDao userDao;
	
	static Logger logger = Logger.getLogger(AdminUserServiceImpl.class);
	
	private ThreadLocal<String> threadUserCode = new ThreadLocal<>();
	
	@Override
	public ABCUser loadUserByUsername(String username)
			throws UsernameNotFoundException {
		UserInfo u = ServiceFactory.getUserInfoService().getUserInfoByUserName(username);
		if(u != null) {
			return new ABCUser(u);
		}else {
			return null;
		}
		
		//return userDao.getUser(username);
	}
	

	@Override
	public String getUserCode(Object userPrinciple) {
		ABCUser user = (ABCUser) userPrinciple;
		return user.getCode();
	}

	@Override
	public void setUserCode(String userCode) {
		threadUserCode.set(userCode);
	}
	
	@Override
	public UserIdentifier getUser() {
		UserIdentifier user = UserUtils.getCurrentUser();
		return user;
	}
	

	public String getUserCode() {
		UserIdentifier user = UserUtils.getCurrentUser();
		if(user != null) {
			return (String) user.getId();
		}else {
			return threadUserCode.get();
		}
	}
	
	@Override
	public String renderToken(String domain, String username, String password) {
		if(!username.isEmpty() && !password.isEmpty()) {
			ABCUser user = loadUserByUsername(username);
			if(user != null) {
				//spring 升级 5.2.1后，需要增加 密码编码前缀
				String md5 = "{MD5}"+TextUtils.md5Encode(password, null);
				if(md5.equals(user.getPassword())) {
					//校验成功
					Token token = allotToken(domain, user);
					return token.getCode();
				}
			}
		}
		return null;
	}


	private Map<String, Map<String, String>> domainUsernameTokenMap = new HashMap<>();
	
	private Map<String, Token> tokenMap = new HashMap<>();
	
	/**
	 * 分配token，支持多端登录
	 * 此处不再验证user
	 * @param domain
	 * @param username
	 * @return
	 */
	private Token allotToken(String domain, ABCUser user) {
		Assert.notNull(domain);
		Assert.notNull(user);
		synchronized (this.tokenMap) {
			Map<String, String> usernameTokenMap = null;
			if(!this.domainUsernameTokenMap.containsKey(domain)) {
				usernameTokenMap = new HashMap<>();
				this.domainUsernameTokenMap.put(domain, usernameTokenMap);
			}else {
				usernameTokenMap = this.domainUsernameTokenMap.get(domain);
			}
			if(usernameTokenMap.containsKey(user.getUsername())) {
				//如果要限制同类设备类型，一个账号只能在一个地方登录
				//那么需要在tokenMap里移除已经存在的tokenCode
			}else {
			}
			Token token = new Token(user.getUserInfo(), 30 * 60 * 1000);
			usernameTokenMap.put(user.getUsername(), token.getCode());
			this.tokenMap.put(token.getCode(), token);
			return token;
		}
	}
	
	@Override
	public Token validateToken(String tokenCode) {
		synchronized (this.tokenMap) {
			Token token = this.tokenMap.get(tokenCode);
			if(token != null && !token.isExpired()) {
				return token;
			}
			throw new RuntimeException("验证失败");
		}
	}
	
	@Scheduled(cron="0 */30 * * * ?")  //每隔30分钟执行一次定时任务
	@Override
    public void clearTokenCache(){
        synchronized (this.tokenMap) {
			Iterator<Entry<String, Token>> itr = this.tokenMap.entrySet().iterator();
			while(itr.hasNext()) {
				Entry<String, Token> entry = itr.next();
				Token token = entry.getValue();
				if(token.isExpired()) {
					//如果过期了，就将其删除
					logger.debug("token[" + token.getCode() + "]已过期，被移除");
					itr.remove();
				}
			}
			
			this.domainUsernameTokenMap.values().forEach(tokenMap->{
				Iterator<Entry<String, String>> itrUsernametoken = tokenMap.entrySet().iterator();
				while(itrUsernametoken.hasNext()) {
					Entry<String, String> entry = itrUsernametoken.next();
					if(!this.tokenMap.containsKey(entry.getValue())) {
						itrUsernametoken.remove();
					}
				}
			});
		}
    }
	
	public static class Token{
		private final String code;
		private final UserWithToken user;
		private long deadline;
		private long timeout;
		
		public Token(UserInfo user, long timeout) {
			Assert.notNull(user);
			this.code = TextUtils.uuid(32, 62);
			this.user = new UserWithToken(this.code, user);
			this.deadline = System.currentTimeMillis() + timeout;
			this.timeout = timeout;
		}
		
		public boolean isExpired() {
			return System.currentTimeMillis() >= this.deadline;
		}

		public void refreshDeadline(long extraTimeout) {
			this.deadline += extraTimeout;
		}

		public void refreshDeadline() {
			this.refreshDeadline(this.timeout);
		}
		
		public String getCode() {
			return code;
		}

		public Long getDeadline() {
			return deadline;
		}

		public void setDeadline(Long deadline) {
			this.deadline = deadline;
		}

		public UserWithToken getUser() {
			return user;
		}

	}

}
