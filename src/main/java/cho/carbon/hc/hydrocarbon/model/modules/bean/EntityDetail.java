package cho.carbon.hc.hydrocarbon.model.modules.bean;

public class EntityDetail extends AbstractEntityDetail{
	
	private String title;
	
	public EntityDetail(String code, String title) {
		super(code);
		this.title = title;
	}

	public String getTitle() {
		return title;
	}

	
}
