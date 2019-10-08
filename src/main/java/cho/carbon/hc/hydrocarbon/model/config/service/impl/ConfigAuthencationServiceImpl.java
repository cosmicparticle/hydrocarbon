package cho.carbon.hc.hydrocarbon.model.config.service.impl;

import javax.annotation.Resource;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import cho.carbon.hc.copframe.spring.properties.PropertyPlaceholder;
import cho.carbon.hc.copframe.utils.TimelinenessWrapper;
import cho.carbon.hc.hydrocarbon.model.config.dao.ConfigureDao;
import cho.carbon.hc.hydrocarbon.model.config.pojo.AuthencationConfig;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigAuthencationService;

public class ConfigAuthencationServiceImpl implements ConfigAuthencationService{
	@Resource
	ConfigureDao configDao;
	
	TimelinenessWrapper<AuthencationConfig> defAuthen = new TimelinenessWrapper<>(30000);
	
	
	
	private  AuthencationConfig getConfigAuthen() {
		String configIdStr = PropertyPlaceholder.getProperty("auth_config_id");
		Assert.hasText(configIdStr, "config.property配置文件内没有配置auth_config_id的值");
		Long configId;
		try {
			configId = Long.parseLong(configIdStr);
		} catch (NumberFormatException e) {
			throw new RuntimeException("config.property配置文件内没有配置auth_config_id的值不是一个整型数字", e);
		}
		AuthencationConfig authen = defAuthen.getObject(()->{
			return configDao.getAdminDefaultAuthen(configId);
		});
		Assert.notNull(authen, "根据id[" + configId + "]没有找到ConfigAuthencation对象，请检查数据库内t_ca_auth_config表内是否有配置");
		Assert.hasText(authen.getAdminConfigAuthen(), "t_ca_auth_config表内配置的管理权限(admin_config_authen)不能为空");
		Assert.hasText(authen.getAdminDefaultAuthen(), "t_ca_auth_config表内配置的管理权限(admin_default_authen)不能为空");
		return authen;
	}
	
	@Override
	@Transactional
	public String getAdminDefaultAuthen() {
		return getConfigAuthen().getAdminDefaultAuthen();
	}
	
	@Override
	@Transactional
	public String getAdminConfigAuthen() {
		return getConfigAuthen().getAdminConfigAuthen();
	}
}
