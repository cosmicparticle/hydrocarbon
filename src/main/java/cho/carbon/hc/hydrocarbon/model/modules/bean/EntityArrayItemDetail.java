package cho.carbon.hc.hydrocarbon.model.modules.bean;

import com.alibaba.fastjson.annotation.JSONField;

public class EntityArrayItemDetail extends AbstractEntityDetail{
	@JSONField(name="index")
	private Integer index;
	
	@JSONField(name="relationLabel")
	private String relationlabel;
	
	public EntityArrayItemDetail(String code) {
		super(code);
	}

	public String getRelationlabel() {
		return relationlabel;
	}

	public void setRelationlabel(String relationlabel) {
		this.relationlabel = relationlabel;
	}

	public Integer getIndex() {
		return index;
	}

	public void setIndex(Integer index) {
		this.index = index;
	}
}
