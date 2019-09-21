package cho.carbon.hc.hydrocarbon.model.config.pojo;

import java.util.ArrayList;
import java.util.List;

public class MenuLevel1 {
	private Long id;
	private String title;
	private String authorities;
	private Integer order;
	private List<SideMenuLevel2Menu> l2Menus = new ArrayList<SideMenuLevel2Menu>();
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
	public Integer getOrder() {
		return order;
	}
	public void setOrder(Integer order) {
		this.order = order;
	}
	public List<SideMenuLevel2Menu> getL2Menus() {
		return l2Menus;
	}
	public void setL2Menus(List<SideMenuLevel2Menu> l2Menus) {
		this.l2Menus = l2Menus;
	}
}
