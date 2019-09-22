package cho.carbon.hc.hydrocarbon.model.admin.pojo;

import java.io.Serializable;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import cho.carbon.auth.pojo.UserInfo;
import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.utils.CollectionUtils;

public class ABCUser implements UserDetails, UserIdentifier{

	/**
	 * 
	 */
	private static final long serialVersionUID = -8047815129638350602L;

	private String code;
	private String username;
	private String password;
	private Collection<? extends GrantedAuthority> authorities;
	private boolean accountNonExpired = true;
	private boolean accountNonLocked = true;
	private boolean credentialsNonExpired = true;
	private boolean enabled = true;

	private UserInfo userInfo;
	
	public ABCUser(UserInfo u) {
		code = u.getCode();
		username = u.getUserName();
		password = u.getPassword();
		authorities = CollectionUtils.toSet(u.getAuths(), SimpleGrantedAuthority::new);
		this.userInfo = u;
	}

	@Override
	public Serializable getId() {
		return code;
	}
	
	@Override
	public String getNickname() {
		return username;
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return accountNonExpired;
	}

	@Override
	public boolean isAccountNonLocked() {
		return accountNonLocked;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return credentialsNonExpired;
	}

	@Override
	public boolean isEnabled() {
		return enabled;
	}

	public void setAccountNonExpired(boolean accountNonExpired) {
		this.accountNonExpired = accountNonExpired;
	}

	public void setAccountNonLocked(boolean accountNonLocked) {
		this.accountNonLocked = accountNonLocked;
	}

	public void setCredentialsNonExpired(boolean credentialsNonExpired) {
		this.credentialsNonExpired = credentialsNonExpired;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public UserInfo getUserInfo() {
		return userInfo;
	}

}
