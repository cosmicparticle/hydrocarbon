package cho.carbon.hc.hydrocarbon.model.config.dao;

import java.util.Map;
import java.util.Set;

import cho.carbon.hc.hydrocarbon.model.config.pojo.AuthencationConfig;
import cho.carbon.hc.hydrocarbon.model.config.pojo.ConfigModule;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;

public interface ConfigureDao {

	Map<String, ConfigModule> getConfigModule(Set<String> moduleNames);

	AuthencationConfig getAdminDefaultAuthen(Long configId);

	SystemConfig getSystemConfig();

	void updateSystemConfig(SystemConfig sysConfig);

}
