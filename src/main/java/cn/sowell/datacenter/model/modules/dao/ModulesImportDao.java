package cn.sowell.datacenter.model.modules.dao;

import java.util.List;

import cn.sowell.datacenter.model.modules.pojo.ImportTemplateCriteria;
import cn.sowell.datacenter.model.modules.pojo.ModuleImportTemplate;
import cn.sowell.datacenter.model.modules.pojo.ModuleImportTemplateField;

public interface ModulesImportDao {

	List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria);

	List<ModuleImportTemplateField> getTemplateFields(Long tmplId);

}
