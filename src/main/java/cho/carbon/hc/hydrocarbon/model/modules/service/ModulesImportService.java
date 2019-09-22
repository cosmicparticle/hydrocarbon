package cho.carbon.hc.hydrocarbon.model.modules.service;

import java.util.List;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.web.poll.WorkProgress;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityImportDictionary;
import cho.carbon.hc.hydrocarbon.model.modules.exception.ImportBreakException;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;

public interface ModulesImportService {

	byte[] createImportTempalteBytes(ModuleImportTemplate tmpl) throws Exception;

	Long saveTemplate(ModuleImportTemplate tmpl);
	
	List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria);

	ModuleImportTemplate getImportTempalte(Long tmplId);

	void importData(Sheet sheet, WorkProgress progress, String module, UserIdentifier user, boolean doFuse, Workbook copyWorkbook)
			throws ImportBreakException;

	EntityImportDictionary getDictionary(String moduleName, UserIdentifier user);
}
