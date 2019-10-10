package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.List;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;
import cho.carbon.meta.vo.ModuleVO;

public interface ConfigureService {

	JSONObject getModuleConfigJson();

	List<ModuleVO> getEnabledModules();

	List<ModuleVO> getSiblingModules(String moduleName);

	JSONArray getSiblingModulesJson(String moduleName);

	SystemConfig getSystemConfig();

	void refreshSystemConfig();

	void updateSystemConfig(SystemConfig sysConfig);

}
