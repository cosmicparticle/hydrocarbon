package cn.sowell.datacenter.model.admin.pojo;

import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.datacenter.DataCenterConstants;


@Entity
@Table(name="t_admin_user")
public class AdminUserX implements UserDetails, UserIdentifier{
	/**
	 * 
	 */
	private static final long serialVersionUID = -448781571663952822L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	
	@Column(name="c_username")
	private String userName;
	
	@Column(name="c_password")
	private String password;
	
	//账户没有过期
	@Column(name="c_account_non_expired")
	private Integer accountNonExpired;
	
	//账户没有被锁定
	@Column(name="c_account_non_locked")
	private Integer accountNonLocked;
	
	//认证没有过期
	@Column(name="c_credentials_non_expired")
	private Integer credentialsNonExpired;
	
	//启用
	@Column(name="c_enabled")
	private Integer enabled;
	
	//权限列表
	@Column(name="c_authority_chain")
	private String authorityChain;
	
	@Column(name="group_id")
	private String groupId;
	
	@Column(name="create_time")
	private Date createTime;
	
	@Column(name="update_time")
	private Date updateTime;
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		Set<GrantedAuthority> set = new LinkedHashSet<GrantedAuthority>();
		if(this.authorityChain != null){
			String[] split = this.authorityChain.split(DataCenterConstants.COMMON_SPLITER);
			for (String str : split) {
				if(!str.isEmpty()){
					set.add(new SimpleGrantedAuthority(str));
				}
			}
		}
		return set;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return userName;
	}

	@Override
	public boolean isAccountNonExpired() {
		return DataCenterConstants.VALUE_TRUE.equals(accountNonExpired);
	}

	@Override
	public boolean isAccountNonLocked() {
		return DataCenterConstants.VALUE_TRUE.equals(accountNonLocked);
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return DataCenterConstants.VALUE_TRUE.equals(credentialsNonExpired);
	}

	@Override
	public boolean isEnabled() {
		return DataCenterConstants.VALUE_TRUE.equals(enabled);
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Integer getAccountNonExpired() {
		return accountNonExpired;
	}

	public void setAccountNonExpired(Integer accountNonExpired) {
		this.accountNonExpired = accountNonExpired;
	}

	public Integer getAccountNonLocked() {
		return accountNonLocked;
	}

	public void setAccountNonLocked(Integer accountNonLocked) {
		this.accountNonLocked = accountNonLocked;
	}

	public Integer getCredentialsNonExpired() {
		return credentialsNonExpired;
	}

	public void setCredentialsNonExpired(Integer credentialsNonExpired) {
		this.credentialsNonExpired = credentialsNonExpired;
	}

	public Integer getEnabled() {
		return enabled;
	}

	public void setEnabled(Integer enabled) {
		this.enabled = enabled;
	}

	public String getAuthorityChains() {
		return authorityChain;
	}

	public void setAuthorityChains(String authorityChain) {
		this.authorityChain = authorityChain;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getGroupId() {
		return groupId;
	}

	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}

	public Date getCreateTime() {
		return createTime;
	}

	public void setCreateTime(Date createTime) {
		this.createTime = createTime;
	}

	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}

	@Override
	public String getNickname() {
		return userName;
	}

	
	
	
}
