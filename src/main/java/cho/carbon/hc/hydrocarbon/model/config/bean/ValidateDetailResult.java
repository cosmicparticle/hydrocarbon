package cho.carbon.hc.hydrocarbon.model.config.bean;

import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;

public class ValidateDetailResult {
	private TemplateDetailTemplate detailTemplate;
	private TemplateGroup tmplGroup;
	private SideMenuLevel2Menu menu;
	private String entityCode;
	public TemplateDetailTemplate getDetailTemplate() {
		return detailTemplate;
	}
	public void setDetailTemplate(TemplateDetailTemplate detailTemplate) {
		this.detailTemplate = detailTemplate;
	}
	public TemplateGroup getTmplGroup() {
		return tmplGroup;
	}
	public void setTmplGroup(TemplateGroup tmplGroup) {
		this.tmplGroup = tmplGroup;
	}
	public ValidateDetailResult setMenu(SideMenuLevel2Menu menu) {
		this.menu = menu;
		return this;
	}
	public SideMenuLevel2Menu getMenu() {
		return menu;
	}
	public String getEntityCode() {
		return entityCode;
	}
	public ValidateDetailResult setEntityCode(String entityCode) {
		this.entityCode = entityCode;
		return this;
	}
}
