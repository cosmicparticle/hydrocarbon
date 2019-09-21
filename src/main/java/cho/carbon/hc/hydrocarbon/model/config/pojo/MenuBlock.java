package cho.carbon.hc.hydrocarbon.model.config.pojo;

import java.util.List;

public class MenuBlock {
	private Long id;
	private String title;
	private Integer order;
	private String authorities;
	private List<MenuLevel1> l1Menus;
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
	public String getAuthorities() {
		return authorities;
	}
	public void setAuthorities(String authorities) {
		this.authorities = authorities;
	}
	public List<MenuLevel1> getL1Menus() {
		return l1Menus;
	}
	public void setL1Menus(List<MenuLevel1> l1Menus) {
		this.l1Menus = l1Menus;
	}
}
