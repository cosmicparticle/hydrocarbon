package cn.sowell.datacenter.model.modules.bean;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;

import cn.sowell.datacenter.model.modules.service.ExportService;

public class PeopleExportHandlerTask {
	
	@Resource
	ExportService eService;
	
	Logger logger = Logger.getLogger(PeopleExportHandlerTask.class);
	
	
	@Scheduled(cron="0 0 */1 * * ?")
	public void checkCacheTimeout(){
		logger.info("+++++++开始清除导出缓存+++++++++++++++");
		eService.clearExportCache();
	}
}
