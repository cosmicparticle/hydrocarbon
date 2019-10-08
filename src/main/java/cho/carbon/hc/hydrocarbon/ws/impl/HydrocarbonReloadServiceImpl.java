package cho.carbon.hc.hydrocarbon.ws.impl;

import javax.annotation.Resource;
import javax.jws.WebService;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;

import cho.carbon.hc.dataserver.model.karuiserv.service.KaruiServService;
import cho.carbon.hc.dataserver.model.tmpl.service.CachableTemplateService;
import cho.carbon.hc.entityResolver.FieldService;
import cho.carbon.hc.entityResolver.config.DBFusionConfigContextFactory;
import cho.carbon.hc.entityResolver.config.ModuleConfigureMediator;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cho.carbon.hc.hydrocarbon.ws.HydrocarbonReloadService;
import cho.carbon.service.impl.ModelReLoadServiceImpl;

@WebService(endpointInterface="cho.carbon.hc.hydrocarbon.ws.HydrocarbonReloadService")
public class HydrocarbonReloadServiceImpl implements HydrocarbonReloadService, InitializingBean{
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
	
	Logger logger = Logger.getLogger(HydrocarbonReloadServiceImpl.class);
	
	/**
	 * 同步模块。只是清除缓存，将会在下一次请求的时候加载数据
	 */
	@Override
	public String syncModule() {
		logger.info("接口通知模块数据刷新");
		
		// 先 加载 carbon core 元数据
		new ModelReLoadServiceImpl().reload();
		
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
