package cn.sowell.datacenter.model.config.service.impl;

import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import cn.sowell.copframe.spring.properties.PropertyPlaceholder;
import cn.sowell.datacenter.entityResolver.FusionContextConfig;
import cn.sowell.datacenter.entityResolver.FusionContextConfigFactory;
import cn.sowell.datacenter.model.admin.pojo.ABCUser;
import cn.sowell.datacenter.model.config.service.ConfigUserService;
import cn.sowell.datacenter.model.config.service.NonAuthorityException;
import cn.sowell.dataserver.model.abc.service.EntityQueryParameter;
import cn.sowell.dataserver.model.abc.service.ModuleEntityService;
import cn.sowell.dataserver.model.modules.service.ModulesService;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cn.sowell.dataserver.model.tmpl.service.DetailTemplateService;

@Service
public class ConfigUserServiceImpl implements ConfigUserService {

	@Resource
	FusionContextConfigFactory fFactory;
	
	@Resource
	ModulesService mService;
	
	@Resource
	DetailTemplateService dtmplService;
	
	@Resource
	ModuleEntityService entityService;
	
	@Override
	public String getUserModuleName() {
		return PropertyPlaceholder.getProperty("user_module_name");
	}
	
	@Override
	public FusionContextConfig getUserModuleConfig() {
		String moduleName = getUserModuleName();
		return fFactory.getModuleConfig(moduleName);
	}
	
	
	@Override
	public TemplateDetailTemplate getUserDetailTemplate(Long tmplId) {
		String userModuleName = getUserModuleName();
		if(tmplId == null) {
			tmplId = Long.valueOf(PropertyPlaceholder.getProperty("default_user_dtmpl_id"));
		}
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplId);
		Assert.state(userModuleName.equals(dtmpl.getModule()), "详情模板[id=" + tmplId + ", moduleName=" + dtmpl.getModule() + "]不是用户信息详情模板[moduleName=" + userModuleName + "]");
		return dtmpl;
		
	}
	
	@Override
	public void validateUserAuthentication(String moduleName) {
		if(moduleName != null) {
			if(moduleName.equals(getUserModuleName())) {
				return;
			}
		}
		throw new NonAuthorityException("请求的moduleName[" + moduleName + "]与设置的用户的moduleName[" + getUserModuleName() + "]不相同，拒绝访问");
	}
	
	
	@Override
	public void mergeUserEntity(Map<String, Object> map, ABCUser operateUser) {
		//TODO: 验证操作用户的权限
		EntityQueryParameter param = new EntityQueryParameter(getUserModuleName(), operateUser);
		entityService.mergeEntity(param, map);
		//mService.mergeEntity(getUserModuleName(), map, operateUser);
		
	}

}
