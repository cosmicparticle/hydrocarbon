package cn.sowell.datacenter.model.tmpl.strategy;

import java.util.Date;

import javax.annotation.Resource;

import cn.sowell.copframe.dao.utils.NormalOperateDao;
import cn.sowell.datacenter.model.modules.pojo.ModuleImportTemplate;
import cn.sowell.datacenter.model.modules.pojo.ModuleImportTemplateField;
import cn.sowell.datacenter.model.modules.service.ModulesImportService;
import cn.sowell.dataserver.model.tmpl.strategy.NormalDaoSetUpdateStrategy;
import cn.sowell.dataserver.model.tmpl.strategy.TemplateUpdateStrategy;

public class ModuleImportTemplateStrategy implements TemplateUpdateStrategy<ModuleImportTemplate>{

	@Resource
	NormalOperateDao nDao;
	
	@Resource
	ModulesImportService impService;
	
	
	@Override
	public void update(ModuleImportTemplate template) {
		ModuleImportTemplate origin = impService.getImportTempalte(template.getId());
		if(origin != null){
			origin.setTitle(template.getTitle());
			
			Date now = new Date();
			
			NormalDaoSetUpdateStrategy.build(
					ModuleImportTemplateField.class, nDao,
					field->field.getId(),
					(oField, field)->{
						oField.setFieldIndex(field.getFieldIndex());
						oField.setOrder(field.getOrder());
						oField.setUpdateTime(now);
					},field->{
						field.setUpdateTime(now);
						field.setTemplateId(origin.getId());
					})
				.doUpdate(origin.getFields(), template.getFields());
		}else{
			throw new RuntimeException("列表模板[id=" + template.getId() + "]不存在");
		}
	}

	@Override
	public Long create(ModuleImportTemplate template) {
		Date now = new Date();
		template.setCreateTime(now);
		template.setUpdateTime(now);
		Long tmplId = nDao.save(template);
		if(template.getFields() != null) {
			for (ModuleImportTemplateField field : template.getFields()) {
				field.setTemplateId(tmplId);
				field.setUpdateTime(now);
				nDao.save(field);
			}
		}
		return tmplId;
		
	}

}
