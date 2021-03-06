package cho.carbon.hc.hydrocarbon.model.modules.pojo;

import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import cho.carbon.hc.dataserver.model.tmpl.pojo.Cachable;


@Entity
@Table(name="t_ca_import_tmpl")
public class ModuleImportTemplate extends Cachable{
	
	@Transient
	private Set<ModuleImportTemplateField> fields;
	
	public Set<ModuleImportTemplateField> getFields() {
		return fields;
	}
	public void setFields(Set<ModuleImportTemplateField> fields) {
		this.fields = fields;
	}
}
