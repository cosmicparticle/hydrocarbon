package cho.carbon.hc.hydrocarbon.model.modules.dao.impl;

import java.util.List;

import javax.annotation.Resource;

import org.hibernate.Query;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import cho.carbon.hc.copframe.dao.deferedQuery.DeferedParamQuery;
import cho.carbon.hc.hydrocarbon.model.modules.dao.ModulesImportDao;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplateField;

@Repository
public class ModulesImportDaoImpl implements ModulesImportDao{

	@Resource
	SessionFactory sFactory;
	
	
	@SuppressWarnings("unchecked")
	@Override
	public List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria) {
		DeferedParamQuery dQuery = new DeferedParamQuery("from ModuleImportTemplate t where t.module = :module and t.createUserCode = :createUserCode order by t.updateTime desc");
		dQuery
			.setParam("module", criteria.getModule())
			.setParam("createUserCode", criteria.getUserCode());
		return dQuery.createQuery(sFactory.getCurrentSession(), false, null).list();
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<ModuleImportTemplateField> getTemplateFields(Long tmplId) {
		String hql = "from ModuleImportTemplateField f where f.templateId = :tmplId order by f.order asc";
		Query query = sFactory.getCurrentSession().createQuery(hql);
		query.setLong("tmplId", tmplId);
		return query.list();
	}

}
