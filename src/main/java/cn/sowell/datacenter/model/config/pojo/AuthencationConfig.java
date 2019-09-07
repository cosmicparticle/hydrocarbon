package cn.sowell.datacenter.model.config.pojo;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="t_sa_auth_config")
public class AuthencationConfig {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="c_admin_def_auth")
	private String adminDefaultAuthen;
	
	@Column(name="c_admin_conf_auth")
	private String adminConfigAuthen;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getAdminDefaultAuthen() {
		return adminDefaultAuthen;
	}
	public void setAdminDefaultAuthen(String adminDefaultAuthen) {
		this.adminDefaultAuthen = adminDefaultAuthen;
	}
	public String getAdminConfigAuthen() {
		return adminConfigAuthen;
	}
	public void setAdminConfigAuthen(String adminConfigAuthen) {
		this.adminConfigAuthen = adminConfigAuthen;
	}
}
