package cn.sowell.datacenter.model.config.pojo;

import java.util.ArrayList;
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

import com.alibaba.fastjson.annotation.JSONField;

@Entity
@Table(name="t_sa_config_sidemenu_level1")
public class SideMenuLevel1Menu {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="c_title")
	private String title;
	
	@Column(name="c_order")
	private Integer order;
	
	@Column(name="c_authorities")
	private String authorities;

	@Column(name="block_id")
	private Long blockId;
	
	@JSONField(serialize=false)
	@Transient
	private Set<String> authoritySet = new LinkedHashSet<>();
	
	
	@Transient
	private List<SideMenuLevel2Menu> level2s = new ArrayList<SideMenuLevel2Menu>();

	
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

	public Integer getOrder() {
		return order;
	}

	public void setOrder(Integer order) {
		this.order = order;
	}

	public List<SideMenuLevel2Menu> getLevel2s() {
		return level2s;
	}

	public void setLevel2s(List<SideMenuLevel2Menu> level2s) {
		this.level2s = level2s;
	}

	public String getAuthorities() {
		return authorities;
	}

	public void setAuthorities(String authorities) {
		this.authorities = authorities;
	}

	public Set<String> getAuthoritySet() {
		return authoritySet;
	}

	public void setAuthoritySet(Set<String> authoritySet) {
		this.authoritySet = authoritySet;
	}

	public Long getBlockId() {
		return blockId;
	}

	public void setBlockId(Long blockId) {
		this.blockId = blockId;
	}


}
