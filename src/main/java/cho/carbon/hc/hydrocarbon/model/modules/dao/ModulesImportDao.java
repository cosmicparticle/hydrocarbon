package cho.carbon.hc.hydrocarbon.model.modules.dao;

import java.util.List;

import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplateField;

public interface ModulesImportDao {

	List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria);

	List<ModuleImportTemplateField> getTemplateFields(Long tmplId);

}
