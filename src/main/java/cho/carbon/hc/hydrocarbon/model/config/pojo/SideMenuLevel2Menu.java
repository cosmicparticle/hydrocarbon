package cho.carbon.hc.hydrocarbon.model.config.pojo;

import java.util.LinkedHashSet;
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
@Table(name="t_sa_config_sidemenu_level2")
public class SideMenuLevel2Menu {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Column(name="sidemenu_level1_id")
	private Long sideMenuLevel1Id;
	
	@Column(name="c_title")
	private String title;
	
	@Column(name="c_order")
	private Integer order;
	
	@Column(name="c_is_default")
	private Integer isDefault;
	
	@Column(name="tmplgroup_id")
	private Long templateGroupId;
	
	@Transient
	@Column(name="tmplgroup_title")
	private String templateGroupTitle;
	
	@Transient
	@Column(name="tmplgroup_key")
	private String templateGroupKey;
	
	@Column(name="stat_view_id")
	private Long statViewId;
	
	@Transient
	private String statViewTitle;
	
	@Transient
	@Column(name="tmpl_module")
	private String templateModule;
	
	@Column(name="custom_page_id")
	private Long customPageId;
	
	@Transient
	private String customPageTitle; 
	
	@Transient
	private String customPagePath;
	
	@Transient
	@Column(name="tmpl_module_title")
	private String templateModuleTitle;
	
	@Column(name="c_authorities")
	private String authorities;
	
	@JSONField(serialize=false)
	@Transient
	private SideMenuLevel1Menu level1Menu;

	@JSONField(serialize=false)
	@Transient
	private Set<String> authoritySet = new LinkedHashSet<>();

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

	public Long getTemplateGroupId() {
		return templateGroupId;
	}

	public void setTemplateGroupId(Long templateGroupId) {
		this.templateGroupId = templateGroupId;
	}

	public Integer getIsDefault() {
		return isDefault;
	}

	public void setIsDefault(Integer isDefault) {
		this.isDefault = isDefault;
	}

	public String getTemplateGroupTitle() {
		return templateGroupTitle;
	}

	public void setTemplateGroupTitle(String templateGroupTitle) {
		this.templateGroupTitle = templateGroupTitle;
	}

	public String getTemplateModule() {
		return templateModule;
	}

	public void setTemplateModule(String templateModule) {
		this.templateModule = templateModule;
	}

	public String getTemplateGroupKey() {
		return templateGroupKey;
	}

	public void setTemplateGroupKey(String templateGroupKey) {
		this.templateGroupKey = templateGroupKey;
	}

	public String getTemplateModuleTitle() {
		return templateModuleTitle;
	}

	public void setTemplateModuleTitle(String templateModuleTitle) {
		this.templateModuleTitle = templateModuleTitle;
	}

	public Long getSideMenuLevel1Id() {
		return sideMenuLevel1Id;
	}

	public void setSideMenuLevel1Id(Long sideMenuLevel1Id) {
		this.sideMenuLevel1Id = sideMenuLevel1Id;
	}

	public SideMenuLevel1Menu getLevel1Menu() {
		return level1Menu;
	}

	public void setLevel1Menu(SideMenuLevel1Menu level1Menu) {
		this.level1Menu = level1Menu;
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

	public Long getStatViewId() {
		return statViewId;
	}

	public void setStatViewId(Long statViewId) {
		this.statViewId = statViewId;
	}

	public String getStatViewTitle() {
		return statViewTitle;
	}

	public void setStatViewTitle(String statViewTitle) {
		this.statViewTitle = statViewTitle;
	}

	public Long getCustomPageId() {
		return customPageId;
	}

	public void setCustomPageId(Long customPageId) {
		this.customPageId = customPageId;
	}

	public String getCustomPageTitle() {
		return customPageTitle;
	}

	public void setCustomPageTitle(String customPageTitle) {
		this.customPageTitle = customPageTitle;
	}

	public String getCustomPagePath() {
		return customPagePath;
	}

	public void setCustomPagePath(String customPagePath) {
		this.customPagePath = customPagePath;
	}



}
