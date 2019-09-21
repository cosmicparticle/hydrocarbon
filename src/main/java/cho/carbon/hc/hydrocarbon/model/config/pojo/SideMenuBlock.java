package cho.carbon.hc.hydrocarbon.model.config.pojo;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import cn.sowell.copframe.utils.TextUtils;

@Entity
@Table(name="t_sa_config_sidemenu_block")
public class SideMenuBlock {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="c_title")
	private String title;
	
	@Column(name="c_order")
	private Integer order;
	
	@Column(name="c_authorities")
	private String authorities;
	
	@Transient
	private List<SideMenuLevel1Menu> l1Menus;
	
	public List<SideMenuLevel1Menu> getL1Menus() {
		return l1Menus;
	}
	public void setL1Menus(List<SideMenuLevel1Menu> l1Menus) {
		this.l1Menus = l1Menus;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getAuthorities() {
		return authorities;
	}
	public void setAuthorities(String authorities) {
		this.authorities = authorities;
	}
	
	@Transient
	private Set<String> authoritySet;
	public Set<String> getAuthoritySet() {
		if(this.authoritySet == null) {
			synchronized (this) {
				if(this.authoritySet == null) {
					this.authoritySet = new LinkedHashSet<String>();
					if(this.authorities != null) {
						this.authoritySet = TextUtils.split(this.authorities, ";");
					}
				}
			}
		}
		return this.authoritySet;
	}
	public Integer getOrder() {
		return order;
	}
	public void setOrder(Integer order) {
		this.order = order;
	}
	
}
