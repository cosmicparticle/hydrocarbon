package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.Map;

import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.entityResolver.FusionContextConfig;
import cho.carbon.hc.hydrocarbon.model.admin.pojo.ABCUser;

public interface ConfigUserService {

	TemplateDetailTemplate getUserDetailTemplate(Long tmplId);

	void validateUserAuthentication(String moduleName);

	void mergeUserEntity(Map<String, Object> map, ABCUser operateUser);

	FusionContextConfig getUserModuleConfig();

	String getUserModuleName();

}
