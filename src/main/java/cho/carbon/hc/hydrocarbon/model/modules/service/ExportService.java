package cho.carbon.hc.hydrocarbon.model.modules.service;

import java.io.OutputStream;
import java.util.List;

import cho.carbon.hc.dataserver.model.modules.bean.ExportDataPageInfo;
import cho.carbon.hc.dataserver.model.modules.pojo.criteria.NormalCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQuery;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.model.modules.bean.ExportFileResource;
import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.web.poll.ConsumerThrowException;
import cn.sowell.copframe.web.poll.WorkProgress;

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
