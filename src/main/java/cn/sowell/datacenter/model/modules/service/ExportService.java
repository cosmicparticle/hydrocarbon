package cn.sowell.datacenter.model.modules.service;

import java.io.OutputStream;
import java.util.List;

import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.web.poll.ConsumerThrowException;
import cn.sowell.copframe.web.poll.WorkProgress;
import cn.sowell.datacenter.entityResolver.ModuleEntityPropertyParser;
import cn.sowell.datacenter.model.modules.bean.ExportFileResource;
import cn.sowell.dataserver.model.modules.bean.ExportDataPageInfo;
import cn.sowell.dataserver.model.modules.pojo.criteria.NormalCriteria;
import cn.sowell.dataserver.model.modules.service.view.EntityQuery;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroup;

public interface ExportService {

	void clearExportCache();
	ExportFileResource getDownloadResource(String uuid);
	WorkProgress getExportProgress(String uuid);
	void stopExport(String uuid);
	void removeExport(String uuid);
	
	void startWholeExport(WorkProgress progress, TemplateGroup tmplGroup, boolean withDetail,
			List<NormalCriteria> criteria, ExportDataPageInfo ePageInfo, UserIdentifier user);
	String exportDetailExcel(ModuleEntityPropertyParser parser, TemplateDetailTemplate dtmpl) throws Exception;
	
	/**
	 * 开始执行导出线程
	 * @param progress
	 * @param query
	 * @param ePageInfo
	 * @param withDetail
	 */
	void startWholeExport(WorkProgress progress, EntityQuery query, ExportDataPageInfo ePageInfo, Boolean withDetail);
	void writeExportFile(String uuid, String suffix, ConsumerThrowException<OutputStream> consumer) throws Exception;
	void registCustomExportFile(String uuid, String diskFileName, String exportFileName);
}
