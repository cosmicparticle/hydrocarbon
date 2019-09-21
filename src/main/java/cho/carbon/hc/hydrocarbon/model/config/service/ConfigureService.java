package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.List;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.entityResolver.config.abst.Module;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;

public interface ConfigureService {

	JSONObject getModuleConfigJson();

	List<Module> getEnabledModules();

	List<Module> getSiblingModules(String moduleName);

	JSONArray getSiblingModulesJson(String moduleName);

	SystemConfig getSystemConfig();

	void refreshSystemConfig();

	void updateSystemConfig(SystemConfig sysConfig);

}
