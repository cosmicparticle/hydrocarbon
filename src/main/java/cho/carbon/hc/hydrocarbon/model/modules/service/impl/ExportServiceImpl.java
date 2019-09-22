package cho.carbon.hc.hydrocarbon.model.modules.service.impl;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.text.DecimalFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFHyperlink;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.spring.properties.PropertyPlaceholder;
import cho.carbon.hc.copframe.utils.Assert;
import cho.carbon.hc.copframe.utils.FormatUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.copframe.web.poll.ConsumerThrowException;
import cho.carbon.hc.copframe.web.poll.ProgressPollableThreadFactory;
import cho.carbon.hc.copframe.web.poll.WorkProgress;
import cho.carbon.hc.dataserver.model.abc.service.EntitiesQueryParameter;
import cho.carbon.hc.dataserver.model.abc.service.ModuleEntityService;
import cho.carbon.hc.dataserver.model.modules.bean.EntityPagingIterator;
import cho.carbon.hc.dataserver.model.modules.bean.ExportDataPageInfo;
import cho.carbon.hc.dataserver.model.modules.pojo.criteria.NormalCriteria;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQuery;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ListCriteriaFactory;
import cho.carbon.hc.dataserver.model.tmpl.service.ListTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.entityResolver.FusionContextConfigFactory;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.UserCodeService;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityExportWriter;
import cho.carbon.hc.hydrocarbon.model.modules.bean.ExportFileResource;
import cho.carbon.hc.hydrocarbon.model.modules.bean.ExportResource;
import cho.carbon.hc.hydrocarbon.model.modules.exception.ExportBreakException;
import cho.carbon.hc.hydrocarbon.model.modules.service.ExportService;

@Service
public class ExportServiceImpl implements ExportService {

	//ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
	
	ProgressPollableThreadFactory pFactory = new ProgressPollableThreadFactory() {
		{
			setThreadExecutor(new ThreadPoolExecutor(6, 10, 5, TimeUnit.SECONDS, new SynchronousQueue<Runnable>()));
		}
	};
	
	
	Logger logger = Logger.getLogger(ExportServiceImpl.class);
	
	@Resource
	ModulesService mService;
	
	@Resource
	UserCodeService userCodeService;
	
	@Resource
	ModuleEntityService entityService;
	
	@Resource
	FusionContextConfigFactory fFactory;
	
	@Resource
	ListCriteriaFactory lcriteriaFactory;
	
	@Resource
	ArrayItemFilterService arrayItemFilterService;
	
	@Resource
	ListTemplateService ltmplService;
	
	@Resource
	DetailTemplateService dtmplService;
	
	@Resource
	ApplicationContext appContext;
	
	private Long exportCacheTimeout = null;
	
	//自定义的导出文件的Map，key是唯一编码，value是下载时的文件名
	private Map<String, ExportResource> customExportResourceMap = new HashMap<>();
	
	@Override
	public void clearExportCache(){
		if(exportCacheTimeout == null){
			try {
				exportCacheTimeout = FormatUtils.toLong(PropertyPlaceholder.getProperty("export_cache_timeout")) * 1000;
			} catch (Exception e) {
				exportCacheTimeout = Long.MAX_VALUE;
			}
		}
		FileSystemResource folder = new FileSystemResource(PropertyPlaceholder.getProperty("export_cache_path"));
		File[] fs = folder.getFile().listFiles();
		if(fs != null){
			for (File file : fs) {
				String uuid = file.getName().split("\\.")[0];
				if(customExportResourceMap.containsKey(uuid)) {
					ExportResource exportResource = customExportResourceMap.get(uuid);
					if(System.currentTimeMillis() > exportResource.getTimeout()) {
						if(file.exists()) {
							try {
								file.delete();
								customExportResourceMap.remove(uuid);
							} catch (Exception e) {
							}
						}
					}
				}else {
					WorkProgress progress = pFactory.getProgress(uuid);
					if(progress == null || System.currentTimeMillis() - progress.getLastVeniTime() > exportCacheTimeout) {
						if(file.exists()) {
							try {
								file.delete();
							} catch (Exception e) {
							}
						}
					}
				}
			}
		}
	}
	
	Long exportCheckPollTimeout = null;
	
	private void checkBreaked(WorkProgress progress) throws ExportBreakException {
		if(exportCheckPollTimeout == null){
			try{
				exportCheckPollTimeout = FormatUtils.toLong(PropertyPlaceholder.getProperty("export_check_poll_timeout")) * 1000;
			}catch(Exception e){exportCheckPollTimeout = Long.MAX_VALUE;}
		}
		if(System.currentTimeMillis() - progress.getLastVeniTime() > exportCheckPollTimeout){
			throw new ExportBreakException("超过" + exportCheckPollTimeout + "毫秒没有检测导入状态，将关闭该导出");
		}
		if(progress.isBreaked()){
			throw new ExportBreakException();
		}
	}
	
	@Override
	public WorkProgress getExportProgress(String uuid) {
		return pFactory.getProgress(uuid);
	}
	
	
	@Resource
	FrameDateFormat dateFormat;
	@Override
	public ExportFileResource getDownloadResource(String uuid) {
		WorkProgress progress = pFactory.getProgress(uuid);
		if(progress != null && progress.isCompleted()
			){
			FileSystemResource f = new FileSystemResource(PropertyPlaceholder.getProperty("export_cache_path") + uuid + ".xlsx");
			return new ExportFileResource("导出数据-" + dateFormat.format(new Date(), "yyyyMMddHHmmss") + ".xlsx", f);
		}else if(customExportResourceMap.containsKey(uuid)) {
			ExportResource resource = customExportResourceMap.get(uuid);

			FileSystemResource f = new FileSystemResource(PropertyPlaceholder.getProperty("export_cache_path") + resource.getDiskFileName());
			return new ExportFileResource(resource.getExportFileName(), f);
		}
		return null;
	}
	
	@Override
	public void stopExport(String uuid) {
		WorkProgress progress = getExportProgress(uuid);
		if(progress != null) {
			progress.setBreaked();
			removeExport(uuid);
		}
	}
	@Override
	public void removeExport(String uuid) {
		pFactory.removeProgress(uuid);
	}
	
	
	DecimalFormat df = new DecimalFormat("0.00");
	@Override
	public void startWholeExport(
			WorkProgress progress, 
			TemplateGroup tmplGroup, 
			boolean withDetail,
			List<NormalCriteria> nCriteria, 
			ExportDataPageInfo ePageInfo, 
			UserIdentifier user) {
		TemplateListTemplate ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
		progress.setTotal(100);
		progress.setCurrent(0);
		XSSFWorkbook workbook = new XSSFWorkbook();
		progress.veni();
		pFactory.createThread(progress, p->{
			userCodeService.setUserCode((String) user.getId());
			progress.setCurrent(1);
			XSSFSheet sheet = workbook.createSheet();
			XSSFRow headerRow = sheet.createRow(1);
			int colnum = 1;
			progress.setCurrent(10);
			CellStyle listHeaderStyle = entityExportWriter.getListHeaderStyle(workbook),
						listValueStyle = entityExportWriter.getListValueStyle(workbook);
			for (TemplateListColumn column : ltmpl.getColumns()) {
				if("number".equals(column.getSpecialField()) || column.getSpecialField() == null){
					XSSFCell header = headerRow.createCell(colnum++);
					header.setCellType(CellType.STRING);
					header.setCellValue(column.getTitle());
					header.setCellStyle(listHeaderStyle);
				}
			}
			progress.setCurrent(13);
			progress.appendMessage("开始查询数据...");
			
			EntitiesQueryParameter param = new EntitiesQueryParameter(ltmpl.getModule(), user);
			param.setConjunctionFactoryConsumer((criteriaFactory)->{
				lcriteriaFactory.appendPremiseCriteria(ltmpl.getModule(), tmplGroup.getPremises(), nCriteria);
				lcriteriaFactory.appendCriterias(nCriteria, ltmpl.getModule(), criteriaFactory);
			});
			if(withDetail) {
				param.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(tmplGroup.getDetailTemplateId(), user));
				//param.setCriteriasMap(arrayItemFilterService.getArrayItemFilterCriteriasMap(tmplGroup.getDetailTemplateId(), user));
			}
			EntityPagingIterator itr = entityService.queryExportIterator(param, ePageInfo);
			
			//EntityPagingIterator itr = entityService.queryExportIterator(ltmpl, criteria, ePageInfo, user);
			progress.getLogger().success("数据查找完成，共有" + itr.getDataCount() + "条数据。开始处理数据...");
			progress.setCurrent(20);
			int entityNumber = 1;
			progress.setResponseData("totalData", itr.getDataCount());
			CellStyle linkStyle = entityExportWriter.createLinkStyle(workbook);
			linkStyle.setAlignment(HorizontalAlignment.CENTER);
			int lastColnum = 1;
			while(itr.hasNext()){
				checkBreaked(progress);
				ModuleEntityPropertyParser parser = itr.next();
				XSSFRow row = sheet.createRow(entityNumber + 1);
				float dataProgress = ((float)entityNumber)/itr.getDataCount();
				progress.setCurrent(20 + (int)(dataProgress * 50));
				int j = 1;
				for (TemplateListColumn column : ltmpl.getColumns()) {
					if("number".equals(column.getSpecialField()) || column.getSpecialField() == null){
						XSSFCell cell = row.createCell(j++, CellType.STRING);
						cell.setCellStyle(listValueStyle);
						if("number".equals(column.getSpecialField())){
							cell.setCellValue(entityNumber);
						}else{
							cell.setCellValue(FormatUtils.toString(parser.getFormatedProperty(column.getFieldKey())));
						}
					}
				}
				if(withDetail) {
					TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());
					String detailSheetName = "entity_" + entityNumber;
					
					XSSFCell linkCell = row.createCell(j);
					XSSFHyperlink link = workbook.getCreationHelper().createHyperlink(HyperlinkType.DOCUMENT);
					link.setAddress(detailSheetName + "!B2");
					linkCell.setHyperlink(link);
					linkCell.setCellValue("详情");
					linkCell.setCellStyle(linkStyle);
					
					
					XSSFSheet detailSheet = workbook.createSheet(detailSheetName);
					entityExportWriter.writeDetail(parser, dtmpl, detailSheet, sheet.getSheetName() + "!" + linkCell.getReference());
				}else {
					j--;
				}
				if(j > lastColnum) {
					lastColnum = j;
				}
				progress.setResponseData("currentData", entityNumber);
				progress.getLogger().success("已处理数据(" + entityNumber + "/" + itr.getDataCount() + ")，速度" + df.format(itr.getSpeed()) 
						+ "条/秒，预计还需要" + df.format(itr.getRemainSecond()) + "秒");
				entityNumber++;
			}
			entityExportWriter.wrapBorder(sheet, new CellRangeAddress(1, entityNumber + 1, 1, lastColnum), BorderStyle.MEDIUM);
			progress.appendMessage("数据处理完成，开始生成文件");
			writeExportFile(progress.getUUID(), os->{
				progress.setCurrent(80);
				workbook.write(os);
			});
			progress.getLogger().success("文件生成成功，请点击“下载导出文件”按钮下载导出数据文件");
			progress.setCurrent(100);
			progress.setCompleted();
		}, (p, e)->{
			if(e instanceof ExportBreakException) {
				p.getLogger().warn("导出被取消");
				logger.info("取消导出");
			}else if(e instanceof IOException) {
				p.getLogger().error("创建导出文件时发生错误");
				logger.error("创建导出文件时发生错误", e);
			}else {
				p.getLogger().error("导出时发生错误");
				logger.error("导出时发生错误", e);
			}
		}, p->{
			try {
				workbook.close();
			} catch (IOException e) {
				logger.error("关闭导出工作簿之前发生错误", e);
			}
		}).start();;
	}
	

	EntityExportWriter entityExportWriter = new EntityExportWriter();

	
	@Override
	public String exportDetailExcel(ModuleEntityPropertyParser parser, TemplateDetailTemplate dtmpl) throws Exception {
		XSSFWorkbook workbook = new XSSFWorkbook();
		try {
			XSSFSheet sheet = workbook.createSheet("详情" + parser.getTitle());
			entityExportWriter.writeDetail(parser, dtmpl, sheet);
			String uuid = TextUtils.uuid();
			
			writeExportFile(uuid, ".xlsx", os->workbook.write(os));
			registCustomExportFile(uuid, uuid + ".xlsx", "导出实体详情（" + parser.getTitle() + "）.xlsx");
			return uuid;
		} catch (Exception e) {
			throw e;
		}finally {
			workbook.close();
		}
	}
	@Override
	public void writeExportFile(String uuid, String suffix, ConsumerThrowException<OutputStream> consumer) throws Exception {
		Assert.notNull(uuid);
		Assert.notNull(consumer);
		FileSystemResource resource = new FileSystemResource(PropertyPlaceholder.getProperty("export_cache_path") + uuid + suffix);
		File file = resource.getFile();
		if(!file.getParentFile().exists()){
			file.getParentFile().mkdirs();
		}
		file.createNewFile();
		OutputStream os = resource.getOutputStream();
		try {
			consumer.accept(os);
			logger.info("创建文件成功[" + file.getAbsolutePath() + "]");
		} catch (Exception e) {
			logger.info("创建文件失败[" + file.getAbsolutePath() + "]");
			throw e;
		}finally {
			os.flush();
			os.close();
		}
	}
	
	private void writeExportFile(String uuid, ConsumerThrowException<OutputStream> consumer) throws Exception {
		writeExportFile(uuid, ".xlsx", consumer);
	}
	
	@Resource
	StatListTemplateService statListService;
	
	@Override
	public void startWholeExport(WorkProgress progress, EntityQuery query, ExportDataPageInfo ePageInfo,
			Boolean withDetail) {
		progress.setTotal(100);
		progress.setCurrent(0);
		XSSFWorkbook workbook = new XSSFWorkbook();
		progress.veni();
		pFactory.createThread(progress, p->{
			AbstractListTemplate<? extends AbstractListColumn, ?> ltmpl = null;
			TemplateDetailTemplate dtmpl = null;
			if(query.getTemplateGroup() != null) {
				ltmpl = ltmplService.getTemplate(query.getTemplateGroup().getListTemplateId());
				dtmpl = dtmplService.getTemplate(query.getTemplateGroup().getDetailTemplateId());
			}else if(query.getStatViewTemplate() != null) {
				ltmpl = statListService.getTemplate(query.getStatViewTemplate().getStatListTemplateId());
			}else {
				throw new RuntimeException();
			}
			userCodeService.setUserCode((String) query.getUser().getId());
			progress.setCurrent(1);
			XSSFSheet sheet = workbook.createSheet();
			XSSFRow headerRow = sheet.createRow(1);
			int colnum = 1;
			progress.setCurrent(10);
			CellStyle listHeaderStyle = entityExportWriter.getListHeaderStyle(workbook),
						listValueStyle = entityExportWriter.getListValueStyle(workbook);
			for (AbstractListColumn column : ltmpl.getColumns()) {
				if("number".equals(column.getSpecialField()) || column.getSpecialField() == null){
					XSSFCell header = headerRow.createCell(colnum++);
					header.setCellType(CellType.STRING);
					header.setCellValue(column.getTitle());
					header.setCellStyle(listHeaderStyle);
				}
			}
			progress.setCurrent(13);
			progress.appendMessage("开始查询数据...");
			EntityPagingIterator itr = query.createExportIterator(ePageInfo, appContext);
			progress.getLogger().success("数据查找完成，共有" + itr.getDataCount() + "条数据。开始处理数据...");
			progress.setCurrent(20);
			int entityNumber = 1;
			progress.setResponseData("totalData", itr.getDataCount());
			CellStyle linkStyle = entityExportWriter.createLinkStyle(workbook);
			linkStyle.setAlignment(HorizontalAlignment.CENTER);
			int lastColnum = 1;
			while(itr.hasNext()){
				checkBreaked(progress);
				ModuleEntityPropertyParser parser = itr.next();
				XSSFRow row = sheet.createRow(entityNumber + 1);
				float dataProgress = ((float)entityNumber)/itr.getDataCount();
				progress.setCurrent(20 + (int)(dataProgress * 50));
				int j = 1;
				for (AbstractListColumn column : ltmpl.getColumns()) {
					if("number".equals(column.getSpecialField()) || column.getSpecialField() == null){
						XSSFCell cell = row.createCell(j++, CellType.STRING);
						cell.setCellStyle(listValueStyle);
						if("number".equals(column.getSpecialField())){
							cell.setCellValue(entityNumber);
						}else{
							cell.setCellValue(FormatUtils.toString(parser.getFormatedProperty(column.getFieldKey())));
						}
					}
				}
				if(withDetail && dtmpl != null) {
					String detailSheetName = "entity_" + entityNumber;
					
					XSSFCell linkCell = row.createCell(j);
					XSSFHyperlink link = workbook.getCreationHelper().createHyperlink(HyperlinkType.DOCUMENT);
					link.setAddress(detailSheetName + "!B2");
					linkCell.setHyperlink(link);
					linkCell.setCellValue("详情");
					linkCell.setCellStyle(linkStyle);
					
					
					XSSFSheet detailSheet = workbook.createSheet(detailSheetName);
					entityExportWriter.writeDetail(parser, dtmpl, detailSheet, sheet.getSheetName() + "!" + linkCell.getReference());
				}else {
					j--;
				}
				if(j > lastColnum) {
					lastColnum = j;
				}
				progress.setResponseData("currentData", entityNumber);
				progress.getLogger().success("已处理数据(" + entityNumber + "/" + itr.getDataCount() + ")，速度" + df.format(itr.getSpeed()) 
						+ "条/秒，预计还需要" + df.format(itr.getRemainSecond()) + "秒");
				entityNumber++;
			}
			entityExportWriter.wrapBorder(sheet, new CellRangeAddress(1, entityNumber + 1, 1, lastColnum), BorderStyle.MEDIUM);
			progress.appendMessage("数据处理完成，开始生成文件");
			writeExportFile(progress.getUUID(), os->{
				progress.setCurrent(80);
				workbook.write(os);
			});
			progress.getLogger().success("文件生成成功，请点击“下载导出文件”按钮下载导出数据文件");
			progress.setCurrent(100);
			progress.setCompleted();
		}, (p, e)->{
			if(e instanceof ExportBreakException) {
				p.getLogger().warn("导出被取消");
				logger.info("取消导出");
			}else if(e instanceof IOException) {
				p.getLogger().error("创建导出文件时发生错误");
				logger.error("创建导出文件时发生错误", e);
			}else {
				p.getLogger().error("导出时发生错误");
				logger.error("导出时发生错误", e);
			}
		}, p->{
			try {
				workbook.close();
			} catch (IOException e) {
				logger.error("关闭导出工作簿之前发生错误", e);
			}
		}).start();
		
	}

	@Override
	public void registCustomExportFile(String uuid, String diskFileName, String exportFileName) {
		ExportResource resource = new ExportResource(exportFileName, System.currentTimeMillis() + 30 * 60 * 1000);
		resource.setDiskFileName(diskFileName);
		customExportResourceMap.put(uuid, resource);
	}

}
