package cho.carbon.hc.hydrocarbon.model.config.service.impl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.entityResolver.FusionContextConfig;
import cho.carbon.hc.entityResolver.FusionContextConfigFactory;
import cho.carbon.hc.entityResolver.config.ModuleConfigureMediator;
import cho.carbon.hc.entityResolver.config.abst.Module;
import cho.carbon.hc.entityResolver.config.param.QueryModuleCriteria;
import cho.carbon.hc.hydrocarbon.model.config.dao.ConfigureDao;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.meta.struc.er.Struc;
import cho.carbon.meta.struc.er.StrucContainer;
import cn.sowell.copframe.dao.utils.NormalOperateDao;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.FormatUtils;

@Service
public class ConfigureServiceImpl implements ConfigureService{

	@Resource
	ConfigureDao cDao;
	
	@Resource
	NormalOperateDao nDao;
	
	@Resource
	ModuleConfigureMediator moduleConfigMediator;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	FusionContextConfigFactory fFactory;
	
	@Override
	public List<Module> getEnabledModules(){
		QueryModuleCriteria criteria = new QueryModuleCriteria();
		criteria.setFilterDisabled(true);
		List<Module> modules = moduleConfigMediator.queryModules(criteria);
		return modules;
	}
	
	@Override
	public List<Module> getSiblingModules(String moduleName) {
		Module sourceModule = fFactory.getModule(moduleName);
		
		Struc node = StrucContainer.findStruc(FormatUtils.toInteger(sourceModule.getMappingId()));
		String abcattr = node.getItemCode();
		return getEnabledModules().stream().filter(module->{
			if(module.getMappingId() != null) {
				Struc abcNode = StrucContainer.findStruc(FormatUtils.toInteger(module.getMappingId()));
				return abcattr.equals(abcNode.getItemCode());
			}
			return false;
		}).collect(Collectors.toList());
	}
	
	@Override
	public JSONArray getSiblingModulesJson(String moduleName) {
		JSONArray modulesJson = new JSONArray();
		getSiblingModules(moduleName).forEach(module->{
			JSONObject jModule = new JSONObject();
			jModule.put("title", module.getTitle());
			jModule.put("moduleName", module.getName());
			modulesJson.add(jModule);
		});
		return modulesJson;
	}
	
	
	@Override
	public JSONObject getModuleConfigJson() {
		JSONObject jConfig = new JSONObject();
		JSONObject jModules = new JSONObject();
		QueryModuleCriteria criteria = new QueryModuleCriteria();
		criteria.setFilterDisabled(true);
		List<Module> modules = moduleConfigMediator.queryModules(criteria);
		Map<String, List<TemplateGroup>> moduleGroupsMap = tmplGroupService.queryModuleGroups(CollectionUtils.toSet(modules, module->module.getName()));
		Map<String, FusionContextConfig> configMap = CollectionUtils.toMap(fFactory.getAllConfigs(), FusionContextConfig::getModule);
		modules.forEach(module->{
			JSONObject jModule = new JSONObject();
			jModule.put("name", module.getName());
			jModule.put("title", module.getTitle());
			FusionContextConfig config = configMap.get(module.getName());
			if(config != null && config.isStatistic()) {
				jModule.put("isStat", true);
			}
			JSONArray jGroups = new JSONArray();
			List<TemplateGroup> groups = moduleGroupsMap.get(module.getName());
			if(groups != null) {
				for (TemplateGroup group : groups) {
					JSONObject jGroup = new JSONObject();
					jGroup.put("title", group.getTitle());
					jGroup.put("id", group.getId());
					jGroups.add(jGroup);
				}
			}
			jModule.put("groups", jGroups);
			jModules.put(module.getName(), jModule);
		});
		jConfig.put("modules", jModules);
		return jConfig;
	}
	
	SystemConfig globalSystemConfig;
	
	@Override
	public SystemConfig getSystemConfig() {
		if(globalSystemConfig == null) {
			synchronized (this) {
				if(globalSystemConfig == null) {
					globalSystemConfig = cDao.getSystemConfig();
				}
			}
		}
		return globalSystemConfig;
	}
	
	@Override
	public void refreshSystemConfig() {
		synchronized (this) {
			globalSystemConfig = null;
		}
	}
	
	@Override
	public void updateSystemConfig(SystemConfig sysConfig) {
		cDao.updateSystemConfig(sysConfig);
	}
	
	
}
