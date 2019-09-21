package cho.carbon.hc.hydrocarbon.model.modules.bean;

import java.util.List;

public class EntityImportDictionaryComposite {
	private Integer id;
	private String name;
	private String type;
	private List<EntityImportDictionaryField> fields;
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public List<EntityImportDictionaryField> getFields() {
		return fields;
	}
	public void setFields(List<EntityImportDictionaryField> fields) {
		this.fields = fields;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
}
