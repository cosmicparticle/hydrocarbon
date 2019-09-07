package cn.sowell.datacenter.model.modules.service;

import java.util.List;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.web.poll.WorkProgress;
import cn.sowell.datacenter.model.modules.bean.EntityImportDictionary;
import cn.sowell.datacenter.model.modules.exception.ImportBreakException;
import cn.sowell.datacenter.model.modules.pojo.ImportTemplateCriteria;
import cn.sowell.datacenter.model.modules.pojo.ModuleImportTemplate;

public interface ModulesImportService {

	byte[] createImportTempalteBytes(ModuleImportTemplate tmpl) throws Exception;

	Long saveTemplate(ModuleImportTemplate tmpl);
	
	List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria);

	ModuleImportTemplate getImportTempalte(Long tmplId);

	void importData(Sheet sheet, WorkProgress progress, String module, UserIdentifier user, boolean doFuse, Workbook copyWorkbook)
			throws ImportBreakException;

	EntityImportDictionary getDictionary(String moduleName, UserIdentifier user);
}
