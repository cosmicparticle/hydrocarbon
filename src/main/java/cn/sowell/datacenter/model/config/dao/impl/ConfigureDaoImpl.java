package cn.sowell.datacenter.model.config.dao.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.hibernate.Criteria;
import org.hibernate.Query;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Order;
import org.springframework.stereotype.Repository;

import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.datacenter.model.config.dao.ConfigureDao;
import cn.sowell.datacenter.model.config.pojo.AuthencationConfig;
import cn.sowell.datacenter.model.config.pojo.ConfigModule;
import cn.sowell.datacenter.model.config.pojo.SystemConfig;

@Repository
public class ConfigureDaoImpl implements ConfigureDao{

	@Resource
	SessionFactory sFactory;
	
	@SuppressWarnings("unchecked")
	@Override
	public Map<String, ConfigModule> getConfigModule(Set<String> moduleNames) {
		if(moduleNames != null && !moduleNames.isEmpty()) {
			String hql = "from ConfigModule m where m.name in (:moduleNames) and m.disabled is null";
			Query query = sFactory.getCurrentSession().createQuery(hql);
			query.setParameterList("moduleNames", moduleNames);
			List<ConfigModule> modules = query.list();
			return CollectionUtils.toMap(modules, module->module.getName());
		}else {
			return new HashMap<>();
		}
	}

	@Override
	public AuthencationConfig getAdminDefaultAuthen(Long configId) {
		return sFactory.getCurrentSession().get(AuthencationConfig.class, configId);
	}

	@Override
	public SystemConfig getSystemConfig() {
		Criteria c = sFactory.getCurrentSession().createCriteria(SystemConfig.class);
		c.addOrder(Order.asc("id"));
		c.setFirstResult(0);
		c.setMaxResults(1);
		return (SystemConfig) c.uniqueResult();
	}
	
	@Override
	public void updateSystemConfig(SystemConfig sysConfig) {
		SystemConfig originConfig = getSystemConfig();
		originConfig.setDefaultBlockId(sysConfig.getDefaultBlockId());
		originConfig.setShowBlocksAnyway(sysConfig.getShowBlocksAnyway());
		sFactory.getCurrentSession().update(originConfig);
	}
}
