package cn.sowell.datacenter.ws.impl;

import javax.annotation.Resource;
import javax.jws.WebService;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;

import cn.sowell.datacenter.entityResolver.FieldService;
import cn.sowell.datacenter.entityResolver.config.DBFusionConfigContextFactory;
import cn.sowell.datacenter.entityResolver.config.ModuleConfigureMediator;
import cn.sowell.datacenter.model.config.service.SideMenuService;
import cn.sowell.datacenter.ws.DatacenterReloadService;
import cn.sowell.dataserver.model.karuiserv.service.KaruiServService;
import cn.sowell.dataserver.model.tmpl.service.CachableTemplateService;

@WebService(endpointInterface="cn.sowell.datacenter.ws.DatacenterReloadService")
public class DatacenterReloadServiceImpl implements DatacenterReloadService, InitializingBean{
	@Resource
	DBFusionConfigContextFactory fFactory;
	
	@Resource
	ModuleConfigureMediator moduleMediator;
	
	@Resource
	FieldService fService;
	
	@Resource
	SideMenuService menuService;
	
	@Resource
	CachableTemplateService tService;
	
	@Resource
	KaruiServService ksService;
	
	Logger logger = Logger.getLogger(DatacenterReloadServiceImpl.class);
	
	/**
	 * 同步模块。只是清除缓存，将会在下一次请求的时候加载数据
	 */
	@Override
	public String syncModule() {
		logger.info("接口通知模块数据刷新");
		ksService.reloadCache();
		menuService.reloadMenuMap();
		fService.refreshFields();
		moduleMediator.refresh();
		fFactory.sync();
		tService.clearCache();
		return "200";
	}
	
	@Override
	public void syncField() {
		fService.refreshFields();
	}
	
	/**
	 * 清除缓存，并立即加载数据
	 */
	@Override
	public String syncCache() {
		syncModule();
		tService.reloadCache();
		return "200";
	}

	@Override
	public void afterPropertiesSet() throws Exception {
		tService.reloadCache();
	}
	
}
