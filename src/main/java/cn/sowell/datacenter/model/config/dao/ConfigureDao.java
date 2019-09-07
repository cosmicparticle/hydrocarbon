package cn.sowell.datacenter.model.config.dao;

import java.util.Map;
import java.util.Set;

import cn.sowell.datacenter.model.config.pojo.AuthencationConfig;
import cn.sowell.datacenter.model.config.pojo.ConfigModule;
import cn.sowell.datacenter.model.config.pojo.SystemConfig;

public interface ConfigureDao {

	Map<String, ConfigModule> getConfigModule(Set<String> moduleNames);

	AuthencationConfig getAdminDefaultAuthen(Long configId);

	SystemConfig getSystemConfig();

	void updateSystemConfig(SystemConfig sysConfig);

}
