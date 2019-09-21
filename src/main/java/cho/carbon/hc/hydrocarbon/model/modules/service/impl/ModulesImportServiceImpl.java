package cho.carbon.hc.hydrocarbon.model.modules.service.impl;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CellValue;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Hyperlink;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import cho.carbon.entity.entity.Entity;
import cho.carbon.hc.FusionContext;
import cho.carbon.hc.HCFusionContext;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryComposite;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryField;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryOption;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.tmpl.strategy.NormalDaoSetUpdateStrategy;
import cho.carbon.hc.entityResolver.EntityConstants;
import cho.carbon.hc.entityResolver.FusionContextConfig;
import cho.carbon.hc.entityResolver.FusionContextConfigFactory;
import cho.carbon.hc.entityResolver.ImportCompositeField;
import cho.carbon.hc.entityResolver.impl.EntityComponent;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityImportDictionary;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityImportDictionaryComposite;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityImportDictionaryField;
import cho.carbon.hc.hydrocarbon.model.modules.dao.ModulesImportDao;
import cho.carbon.hc.hydrocarbon.model.modules.exception.ImportBreakException;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ImportTemplateCriteria;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplate;
import cho.carbon.hc.hydrocarbon.model.modules.pojo.ModuleImportTemplateField;
import cho.carbon.hc.hydrocarbon.model.modules.service.ExportService;
import cho.carbon.hc.hydrocarbon.model.modules.service.ModulesImportService;
import cho.carbon.panel.Integration;
import cho.carbon.panel.IntegrationMsg;
import cho.carbon.panel.PanelFactory;
import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.dao.utils.NormalOperateDao;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.FormatUtils;
import cn.sowell.copframe.utils.PoiUtils;
import cn.sowell.copframe.utils.TextUtils;
import cn.sowell.copframe.utils.excel.CellTypeUtils;
import cn.sowell.copframe.web.poll.Message;
import cn.sowell.copframe.web.poll.MessagesSequence;
import cn.sowell.copframe.web.poll.WorkProgress;

@Service
public class ModulesImportServiceImpl implements ModulesImportService {

	

	@Resource
	FusionContextConfigFactory fFactory;

	@Resource
	NormalOperateDao nDao;
	
	@Resource
	ModulesImportDao impDao;
	
	@Resource
	DictionaryService dService;
	
	Logger logger = Logger.getLogger(ModulesImportServiceImpl.class);
	
	private DateFormat defaultDateFormat = new SimpleDateFormat("yyyy-MM-dd");
	private NumberFormat numberFormat = new DecimalFormat("0.000");
	
	
	
	@Override
	public void importData(Sheet sheet, WorkProgress progress, String module, UserIdentifier user, boolean doFuse, Workbook copyWorkbook)
			throws ImportBreakException {
		Row headerRow = sheet.getRow(1);
		if(module != null){
			FusionContextConfig config = fFactory.getModuleConfig(module);
			if(config != null) {
				execute(sheet, headerRow, config, progress, user, doFuse, copyWorkbook);
			}
		}
	}
	
	private void execute(Sheet sheet, Row headerRow, FusionContextConfig config, WorkProgress progress, UserIdentifier user, boolean doFuse, Workbook copyWorkbook) throws ImportBreakException {
		logger.debug("导入表格【" + sheet.getSheetName() + "】");
		progress.appendMessage("正在计算总行数");
		progress.setTotal(colculateRowCount(sheet));
		int rowIndex = 2;
		progress.appendMessage("开始导入");
		Integration integration = PanelFactory.getIntegration();
		HCFusionContext context = config.getCurrentContext(user);
		context.setSource(FusionContext.SOURCE_COMMON);
		while(true){
			if(progress.isBreaked()){
				progress.getLogger().warn("导入中断");
				throw new ImportBreakException();
			}
			Row row = sheet.getRow(rowIndex);
			if(row == null || row.getCell(0) == null || !TextUtils.hasText(getStringWithBlank(row.getCell(0)))){
				break;
			}
			progress.setCurrent(rowIndex - 1);
			progress.startItemTimer().appendMessage("导入第" + progress.getCurrent() + "条数据");
			try {
				Map<String, Object> map = createImportData(headerRow, row);
				if(map == null) {
					progress.endItemTimer().getLogger().error("第" + progress.getCurrent() + "条数据的所有字段均为空，跳过导入");
					continue;
				}
				progress.appendMessage("解析数据：\r\n" + displayRow(map));
				String error = (String) FormatUtils.coalesce(map.get("$ERROR$"), null);
				Assert.isTrue(!TextUtils.hasText(error), "$ERROR$字段不为空“" + error + "”");;
				EntityComponent entityC = config.getConfigResolver().createEntityIgnoreUnsupportedElement(map);
				Assert.isTrue(entityC != null && entityC.getEntity() != null, "创建的实体为null");
				IntegrationMsg msg = null;
				if(doFuse) {
					msg = integration.integrate(context, (Entity) entityC.getEntity());
					logger.debug("导入EntityCode：" + msg.getCode());
				}else {
					Thread.sleep(1);
				}
				if(!doFuse || msg.success()) {
					progress.endItemTimer()
						.getLogger().success("第" + progress.getCurrent() + "条数据导入完成，用时" + numberFormat.format(progress.getLastItemInterval() / 1000f) + "秒");
				}else {
					progress.getFailedIndexs().add(rowIndex);
					progress.endItemTimer().getLogger().error("第" + progress.getCurrent() + "条数据导入出错，用时" + numberFormat.format(progress.getLastItemInterval() / 1000f) + "秒)");
					progress.getLogger().error("错误信息：" + String.valueOf(msg.getError()));
					logger.debug("导入记录时出错");
				}
			} catch (Exception e) {
				progress.getFailedIndexs().add(rowIndex);
				logger.error("导入第" + progress.getCurrent() + "行时发生异常", e);
				progress.endItemTimer()
					.getLogger().error("第" + progress.getCurrent() + "条数据导入异常，用时" + numberFormat.format(progress.getLastItemInterval() / 1000f) + "秒)");
				progress.getLogger().error("系统错误信息：" + e.getMessage());
			}
			rowIndex++;
		}
		progress.getLogger().success("导入完成,共导入" + (progress.getTotal() - progress.getFailedIndexs().size()) + "/" + progress.getTotal() + "条");
		if(copyWorkbook != null && progress.getFailedIndexs().size() > 0) {
			progress.appendMessage("开始生成导入失败行文件======");
			writeFailedRows(copyWorkbook, progress);
		}
		progress.setCompleted();
		
		
	}

	private String getExcelSuffix(Workbook workbook) {
		if(workbook instanceof XSSFWorkbook) {
			return ".xlsx";
		}else if(workbook instanceof HSSFWorkbook) {
			return ".xls";
		}
		throw new RuntimeException("无法识别的Workbook类:" + workbook.getClass());
	}

	private String displayRow(Map<String, Object> map) {
		StringBuffer buffer = new StringBuffer();
		map.forEach((key, value)->{
			buffer.append("\t" + key + ":" + value + "\r\n");
		});
		return buffer.toString();
	}

	private Integer colculateRowCount(Sheet sheet) {
		int rownum = 2;
		Row row;
		do {
			row = sheet.getRow(rownum++);
		} while (row != null && row.getCell(0) != null && TextUtils.hasText(getStringWithBlank(row.getCell(0))));
		return rownum - 3;
	}
	
	private String trim(String str) {
		if(str != null) {
			str = str.replaceAll("^\\u00a0+", "").replaceAll("\\u00a0+$", "");
			return str.trim();
		}else {
			return null;
		}
	}
	
	private String getStringWithBlank(Cell cell){
		//如果有覆盖至
		if(cell == null){
			return null;
		}
		CellType cellType = cell.getCellTypeEnum();
		if(cellType == CellType.STRING){
			return trim(cell.getStringCellValue());
		}else if(cellType == CellType.NUMERIC){
			if(CellTypeUtils.isCellDateFormatted(cell)){
				return trim(defaultDateFormat.format(HSSFDateUtil.getJavaDate(cell.getNumericCellValue())));
			}
			double val = cell.getNumericCellValue();
			if(val == 0 || val > 0 && Math.ceil(val) == val || val < 0 && Math.floor(val) == val) {
				return trim(FormatUtils.toString(FormatUtils.toLong(cell.getNumericCellValue())));
			}else {
				return trim(Double.toString(val));
			}
		}else if(cellType == CellType.FORMULA){
			FormulaEvaluator evaluator = cell.getSheet().getWorkbook().getCreationHelper().createFormulaEvaluator();
			CellValue cellValue = evaluator.evaluate(cell);
			CellType cellValueType = cellValue.getCellTypeEnum();
			if(cellValueType == CellType.STRING){
				return trim(cellValue.getStringValue());
			}else if(cellValueType == CellType.NUMERIC){
				return trim(FormatUtils.toString(FormatUtils.toLong(cellValue.getNumberValue())));
			}
			return null;
		}
		return null;
	}
	
	private Map<String, Object> createImportData(Row headerRow, Row row){
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		int length = headerRow.getPhysicalNumberOfCells();
		boolean allEmpty = true;
		for (int i = 1; i < length; i++) {
			Cell cell = row.getCell(i);
			Object value = getStringWithBlank(cell);
			if(value != null) {
				if(allEmpty && value instanceof String && !((String) value).isEmpty()) {
					allEmpty = false;
				}
			}else {
				value = "";
			}
			map.put(getStringWithBlank(headerRow.getCell(i)), value);
		}
		return allEmpty? null: map;
	}
	
	@Override
	public byte[] createImportTempalteBytes(ModuleImportTemplate tmpl) throws Exception {
		XSSFWorkbook workbook = new XSSFWorkbook();
		try {
			XSSFSheet sheet = workbook.createSheet("导入数据");
			XSSFSheet optionsSheet = workbook.createSheet("枚举字段");
			
			CreationHelper createHelper = workbook.getCreationHelper();
			
			//导入说明
			XSSFRow titleRow = sheet.createRow(0);
			titleRow.setHeight((short) 2000);
			XSSFCell descriptionCell = titleRow.createCell(0);
			XSSFRichTextString desc = getEntityImportDescrption();
			descriptionCell.setCellValue(desc);
			descriptionCell.setCellStyle(descCellStyle(workbook));
			
			XSSFRow headerRow = sheet.createRow(1);
			XSSFRow firstDataRow = sheet.createRow(2);
			
			CellStyle titleStyle = getTitleStyle(workbook);
			CellStyle dataStyle = getDataStyle(workbook);
			CellStyle hyperlinkTitleStyle = getHyperlinkTitleStyle(workbook);
			
			sheet.setDefaultColumnStyle(0, dataStyle);
			XSSFCell numberTitleCell = headerRow.createCell(0);
			numberTitleCell.setCellValue("序号");
			numberTitleCell.setCellStyle(titleStyle);
			XSSFCell valueCell = firstDataRow.createCell(0);
			valueCell.setCellValue(1);
			valueCell.setCellStyle(dataStyle);
			
			Set<ModuleImportTemplateField> fields = tmpl.getFields();
			if(fields != null) {
				int columnIndex = 1;
				ImportTemplateOptionsHandler optionHandler = new ImportTemplateOptionsHandler(optionsSheet);
				optionHandler.setModuleName(tmpl.getModule());
				
				for (ModuleImportTemplateField field : fields) {
					sheet.setDefaultColumnStyle(columnIndex, dataStyle);
					XSSFCell titleCell = headerRow.createCell(columnIndex);
					titleCell.setCellValue(field.getTitle());
					titleCell.setCellStyle(titleStyle);
					XSSFCell dataCell = firstDataRow.createCell(columnIndex);
					dataCell.setCellType(CellType.STRING);
					dataCell.setCellStyle(dataStyle);
					sheet.autoSizeColumn(columnIndex);
					XSSFCell optionsCell = (XSSFCell) optionHandler.appendOptions(field, optionHandler);
					if(optionsCell != null) {
						titleCell.setCellStyle(hyperlinkTitleStyle);
						Hyperlink hyperlink = createHelper.createHyperlink(HyperlinkType.DOCUMENT);
						hyperlink.setAddress("#'" + optionsCell.getSheet().getSheetName() + "'!" + optionsCell.getAddress());
						titleCell.setHyperlink(hyperlink);
					}
					columnIndex++;
				}
				
			}
			CellRangeAddress region = new CellRangeAddress(0, 0, 0, fields.size() + 1);
			sheet.addMergedRegion(region);
			
			try {
				ByteArrayOutputStream os = new ByteArrayOutputStream();
				workbook.write(os);
				return os.toByteArray();
			} catch (IOException e) {
				throw e;
			}
		} catch (Exception e) {
			throw e;
		}finally{
			try {
				workbook.close();
			} catch (IOException e) {
			}
		}
	}

	


	private CellStyle getHyperlinkTitleStyle(XSSFWorkbook workbook) {
		Font hyperlinkFont = workbook.createFont();
		hyperlinkFont.setBold(true);
		hyperlinkFont.setUnderline(XSSFFont.U_SINGLE);
		hyperlinkFont.setColor(IndexedColors.BLUE.getIndex());
		CellStyle hyperlinkTitleStyle = getTitleStyle(workbook);
		hyperlinkTitleStyle.setFont(hyperlinkFont);
		return hyperlinkTitleStyle;
	}

	private CellStyle descCellStyle(XSSFWorkbook workbook) {
		XSSFCellStyle style = workbook.createCellStyle();
		style.setWrapText(true);
		return style;
	}

	private static XSSFRichTextString getEntityImportDescrption() {
		ClassPathResource file = new ClassPathResource("entity-import-desc.txt");
		if(file.exists()) {
			try {
				String desc = TextUtils.trim(TextUtils.readAsString(file.getInputStream()));
				return new XSSFRichTextString(desc);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return new XSSFRichTextString("（读取导入说明失败）");
	}

	private CellStyle getTitleStyle(XSSFWorkbook workbook) {
		XSSFCellStyle style = workbook.createCellStyle();
		style.setFillForegroundColor(new XSSFColor( new Color(146, 208, 80)));
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		XSSFFont font = workbook.createFont();
		font.setBold(true);
		font.setFontName("宋体");
		style.setFont(font);
		return style;
	}
	
	private CellStyle getDataStyle(XSSFWorkbook workbook) {
		XSSFCellStyle style = workbook.createCellStyle();
		style.setBorderBottom(BorderStyle.THIN);
		style.setBorderLeft(BorderStyle.THIN);
		style.setBorderRight(BorderStyle.THIN);
		style.setBorderTop(BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		XSSFFont font = workbook.createFont();
		font.setFontName("宋体");
		style.setFont(font);
		return style;
	}
	
	@Override
	public Long saveTemplate(ModuleImportTemplate tmpl) {
		if(tmpl.getId() == null) {
			return createTemplate(tmpl);
		}else {
			updateTemplate(tmpl);
			return tmpl.getId();
		}
	}
	
	private void updateTemplate(ModuleImportTemplate template) {
		ModuleImportTemplate origin = getImportTempalte(template.getId());
		if(origin != null){
			origin.setTitle(template.getTitle());
			
			Date now = new Date();
			origin.setUpdateTime(now);
			NormalDaoSetUpdateStrategy.build(
					ModuleImportTemplateField.class, nDao,
					field->field.getId(),
					(oField, field)->{
						oField.setFieldIndex(field.getFieldIndex());
						oField.setOrder(field.getOrder());
						oField.setUpdateTime(now);
					},field->{
						field.setUpdateTime(now);
						field.setTemplateId(origin.getId());
					})
				.doUpdate(origin.getFields(), template.getFields());
		}else{
			throw new RuntimeException("列表模板[id=" + template.getId() + "]不存在");
		}
	}

	private Long createTemplate(ModuleImportTemplate template) {
		Date now = new Date();
		template.setCreateTime(now);
		template.setUpdateTime(now);
		Long tmplId = nDao.save(template);
		if(template.getFields() != null) {
			for (ModuleImportTemplateField field : template.getFields()) {
				field.setTemplateId(tmplId);
				field.setUpdateTime(now);
				nDao.save(field);
			}
		}
		return tmplId;
	}

	@Override
	public List<ModuleImportTemplate> getImportTemplates(ImportTemplateCriteria criteria) {
		return impDao.getImportTemplates(criteria);
	}
	
	@Override
	public ModuleImportTemplate getImportTempalte(Long tmplId) {
		ModuleImportTemplate tmpl = nDao.get(ModuleImportTemplate.class, tmplId);
		Set<ModuleImportTemplateField> fields = new LinkedHashSet<>(impDao.getTemplateFields(tmpl.getId()));
		Iterator<ModuleImportTemplateField> itr = fields.iterator();
		while(itr.hasNext()) {
			ModuleImportTemplateField tmplField = itr.next();
			if(tmplField.getFieldId() != null) {
				DictionaryField field = dService.getField(tmpl.getModule(), tmplField.getFieldId());
				if(field != null) {
					String fieldTitle = field.getFieldPattern();
					if(tmplField.getFieldIndex() != null) {
						fieldTitle = fieldTitle.replaceFirst(ImportCompositeField.REPLACE_INDEX, tmplField.getFieldIndex().toString());
					}
					tmplField.setTitle(fieldTitle);
					continue;
				}
			}else if(tmplField.getCompositeId() != null && tmplField.getFieldIndex() != null){
				DictionaryComposite composite = dService.getComposite(tmpl.getModule(), tmplField.getCompositeId());
				if(composite != null) {
					tmplField.setTitle(composite.getName() + "[" + tmplField.getFieldIndex() + "]." + EntityConstants.LABEL_KEY);
					continue;
				}
			}
			itr.remove();
		}
		tmpl.setFields(fields);
		return tmpl;
	}
	
	@Resource
	ExportService exportService;
	
	private void writeFailedRows(Workbook workbook, WorkProgress progress) {
		Assert.notNull(workbook);
		Assert.notNull(progress);
		try {
			Sheet sheet = workbook.getSheetAt(0);
			Workbook newWorkbook = workbook.getClass().newInstance();
			Sheet newSheet = newWorkbook.createSheet();
			TreeSet<Integer> copyRownums = new TreeSet<>();
			copyRownums.add(0);
			copyRownums.add(1);
			copyRownums.addAll(progress.getFailedIndexs());
			PoiUtils.copySheets(sheet, newSheet, copyRownums, false, true);
			
			int index = 0;
			final int MAX_ROW_NUM = 65535;
			MessagesSequence messages = progress.getLogger().getMessagesFrom(0);
			Sheet logSheet = null;
			for (Message msg : messages.getMessages()) {
				int rownum = index % MAX_ROW_NUM;
				if(rownum == 0) {
					logSheet = newWorkbook.createSheet("导入日志(" + (index / MAX_ROW_NUM + 1) + ")");
				}
				Cell logCell = logSheet.createRow(rownum).createCell(0);
				logCell.setCellValue(msg.getText());
				index++;
			}
			
			String suffix = getExcelSuffix(workbook);
			exportService.registCustomExportFile(progress.getUuid(), progress.getUUID() + suffix, "导入失败行" + suffix);
			exportService.writeExportFile(progress.getUUID(), suffix, os->{
				newWorkbook.write(os);
			});
			progress.appendMessage("生成失败行文件成功");
			progress.getDataMap().put("failedRowsFileUUID", progress.getUuid());
		} catch (Exception e) {
			logger.error("创建导入失败行文件时发生错误", e);
			progress.appendMessage("创建导入失败行文件时发生错误");
		}
	}

	@Resource
	DictionaryService dictService;
	
	@Override
	public EntityImportDictionary getDictionary(String moduleName, UserIdentifier user) {
		List<DictionaryComposite> composites = dictService.getAllComposites(moduleName);
		if(composites != null) {
			EntityImportDictionary impDict = new EntityImportDictionary();
			List<EntityImportDictionaryComposite> impCompostes = new ArrayList<>();
			for (DictionaryComposite dictionaryComposite : composites) {
				EntityImportDictionaryComposite impComposite = new EntityImportDictionaryComposite();
				impComposite.setId(dictionaryComposite.getId());
				impComposite.setName(dictionaryComposite.getTitle());
				impComposite.setType(dictionaryComposite.getCompositeType());
				List<EntityImportDictionaryField> impFields = new ArrayList<>(); 
				impComposite.setFields(impFields);
				for (DictionaryField field : dictionaryComposite.getFields()) {
					EntityImportDictionaryField impField = new EntityImportDictionaryField();
					impField.setId(field.getId());
					impField.setName(field.getTitle());
					impField.setPattern(field.getFieldPattern());
					impField.setType(field.getType());
					impField.setCasLevel(field.getCasLevel());
					impFields.add(impField);
				}
				impCompostes.add(impComposite);
			}
			impDict.setComposites(impCompostes);
			return impDict;
		}
		return null;
	}

	
	private class ImportTemplateOptionsHandler {
		private Map<Integer, Cell> enumFieldCellMap = new HashMap<Integer, Cell>();
		private Map<Integer, Cell> compositeLabelCellMap = new HashMap<Integer, Cell>();
		private Sheet optionsSheet;
		private String moduleName;
		private int nextOptionsRowNum = 1;
		private CellStyle titleStyle;
		private CellStyle optionStyle;
		public ImportTemplateOptionsHandler(Sheet optionsSheet) {
			this.optionsSheet = optionsSheet;
			this.titleStyle = optionsSheet.getWorkbook().createCellStyle();
			titleStyle.setBorderLeft(BorderStyle.THIN);
			titleStyle.setBorderTop(BorderStyle.THIN);
			titleStyle.setBorderBottom(BorderStyle.THIN);
			titleStyle.setBorderRight(BorderStyle.THIN);
			titleStyle.setAlignment(HorizontalAlignment.CENTER);
			Font titleFont = optionsSheet.getWorkbook().createFont();
			titleFont.setBold(true);
			titleFont.setFontName("宋体");
			titleStyle.setFont(titleFont);
			
			this.optionStyle = optionsSheet.getWorkbook().createCellStyle();
			optionStyle.setBorderLeft(BorderStyle.THIN);
			optionStyle.setBorderTop(BorderStyle.THIN);
			optionStyle.setBorderBottom(BorderStyle.THIN);
			optionStyle.setBorderRight(BorderStyle.THIN);
			optionStyle.setAlignment(HorizontalAlignment.CENTER);
			Font optionFont = optionsSheet.getWorkbook().createFont();
			optionFont.setFontName("宋体");
			optionStyle.setFont(optionFont);
		}
		public void setModuleName(String moduleName) {
			this.moduleName = moduleName;
		}
		public Cell appendOptions(ModuleImportTemplateField field, ImportTemplateOptionsHandler optionHandler) {
			if(field.getFieldId() != null) {
				DictionaryField dictField = dictService.getField(moduleName, field.getFieldId());
				//普通枚举字段
				if(dictField != null && dictField.getOptionGroupId() != null && dictField.getOptionGroupId() > 0) {
					if(!enumFieldCellMap.containsKey(dictField.getOptionGroupId())) {
						List<DictionaryOption> options = dictService.getAllOptions().stream().filter((opt)->opt.getGroupId().equals(dictField.getOptionGroupId())).collect(Collectors.toList());
						Cell cell = appendCells(dictField.getFullKey(), CollectionUtils.toList(options, DictionaryOption::getTitle));
						enumFieldCellMap.put(dictField.getOptionGroupId(), cell);
					}
					return enumFieldCellMap.get(dictField.getOptionGroupId());
				}
			}else if(field.getCompositeId() != null){
				//关系名称字段
				DictionaryComposite composite = dictService.getComposite(moduleName, field.getCompositeId());
				if(!compositeLabelCellMap.containsKey(composite.getId())) {
					Set<String> labels = composite.getRelationSubdomain();
					Cell cell = appendCells(composite.getTitle() + "." + EntityConstants.LABEL_KEY, labels);
					compositeLabelCellMap.put(composite.getId(), cell);
				}
				return compositeLabelCellMap.get(composite.getId());
			}
			return null;
		}
		static final int MAX_CELL_INDEX_PER_ROW = 21;
		private Cell appendCells(String fullKey, Collection<String> options) {
			Row row = this.optionsSheet.createRow(nextOptionsRowNum++);
			Cell titleCell = row.createCell(0);
			titleCell.setCellValue(fullKey);
			titleCell.setCellStyle(this.titleStyle);
			this.optionsSheet.autoSizeColumn(0);
			int cellIndex = 0;
			Iterator<String> itr = options.iterator();
			while(itr.hasNext()) {
				cellIndex++;
				if(cellIndex <= MAX_CELL_INDEX_PER_ROW) {
					Cell cell = row.createCell(cellIndex);
					cell.setCellValue(itr.next());
					cell.setCellStyle(this.optionStyle);
				}else {
					cellIndex = 0;
					row = this.optionsSheet.createRow(nextOptionsRowNum++);
				}
			}
			if(titleCell.getRowIndex() < nextOptionsRowNum - 1) {
				CellRangeAddress region = new CellRangeAddress(titleCell.getRowIndex(), nextOptionsRowNum - 1, 0, 0);
				this.optionsSheet.addMergedRegion(region);
			}
			nextOptionsRowNum++;
			return titleCell;
		}
	}
}
