package cho.carbon.hc.hydrocarbon.model.modules.pojo;

public class ImportTemplateCriteria {
	private String module;
	private String userCode;
	private String composite;
	private boolean loadFields = false;
	public String getModule() {
		return module;
	}
	public void setModule(String module) {
		this.module = module;
	}
	public String getUserCode() {
		return userCode;
	}
	public void setUserId(String userCode) {
		this.userCode = userCode;
	}
	public String getComposite() {
		return composite;
	}
	public void setComposite(String composite) {
		this.composite = composite;
	}
	public boolean isLoadFields() {
		return loadFields;
	}
	public void setLoadFields(boolean loadFields) {
		this.loadFields = loadFields;
	}
}
