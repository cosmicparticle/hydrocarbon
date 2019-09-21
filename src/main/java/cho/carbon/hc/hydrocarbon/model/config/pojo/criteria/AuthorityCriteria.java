package cho.carbon.hc.hydrocarbon.model.config.pojo.criteria;

import cho.carbon.auth.pojo.UserInfo;

public class AuthorityCriteria {
	private Long menuId;
	private String auths;
	private UserInfo user;

	public Long getMenuId() {
		return menuId;
	}

	public void setMenuId(Long menuId) {
		this.menuId = menuId;
	}

	public String getAuths() {
		return auths;
	}

	public void setAuths(String auths) {
		this.auths = auths;
	}

	public UserInfo getUser() {
		return user;
	}

	public void setUser(UserInfo user) {
		this.user = user;
	}
}
