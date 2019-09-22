package cho.carbon.hc.hydrocarbon.model.modules.bean;

import java.util.List;

import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Hyperlink;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.entityResolver.EntityConstants;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.impl.ArrayItemPropertyParser;

public class EntityExportWriter{

	private String fontFamilyName = "微软雅黑";
	
	private CellStyle createArrayFieldTitleStyle(Workbook workbook) {
		CellStyle style = createFieldTitleStyle(workbook);
		Font font = workbook.createFont();
		font.setBold(true);
		style.setFont(font);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	
	private static CellStyle createArrayFieldValueStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		setCellBorder(style, BorderStyle.THIN);
		style.setAlignment(HorizontalAlignment.CENTER);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	private static CellStyle createFieldIntervalCellStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setBorderTop(BorderStyle.THIN);
		style.setBorderBottom(BorderStyle.THIN);
		return style;
	}

	private CellStyle createFieldValueStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		style.setAlignment(HorizontalAlignment.CENTER);
		Font font = workbook.createFont();
		font.setFontName(fontFamilyName);
		font.setFontHeightInPoints((short) 11);
		setCellBorder(style, BorderStyle.THIN);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	private CellStyle createFieldTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		if(style instanceof XSSFCellStyle) {
			XSSFCellStyle xssfStyle = (XSSFCellStyle) style;
			XSSFColor color = new XSSFColor(new byte[]{-14, -14, -14});
			xssfStyle.setFillForegroundColor(color);
		}else {
			style.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
		}
		style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		Font font = workbook.createFont();
		font.setFontName(fontFamilyName);
		font.setFontHeightInPoints((short) 11);
		if(font instanceof XSSFFont) {
			((XSSFFont) font).setColor(new XSSFColor(new byte[] {101, 101, 101}));
		}else {
			font.setColor(IndexedColors.BLACK.getIndex());
		}
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		setCellBorder(style, BorderStyle.THIN);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	
	
	private static void setCellBorder(CellStyle style, BorderStyle border) {
		style.setBorderTop(border);
		style.setBorderRight(border);
		style.setBorderBottom(border);
		style.setBorderLeft(border);
	}

	public void wrapBorder(Sheet sheet, CellRangeAddress range, BorderStyle border) {
		Row firstRow = getRow(sheet, range.getFirstRow());
		for(int i = range.getFirstColumn(); i <= range.getLastColumn(); i++) {
			Cell cell = getCell(firstRow, i);
			CellStyle style = cell.getCellStyle();
			style.setBorderTop(border);
		}
		Row lastRow = getRow(sheet, range.getLastRow());
		
		for(int i = range.getFirstColumn(); i <= range.getLastColumn(); i++) {
			Cell cell = getCell(lastRow, i);
			CellStyle style = cell.getCellStyle();
			style.setBorderBottom(border);
		}
		
		for(int i = range.getFirstRow(); i <= range.getLastRow(); i++) {
			Row row = getRow(sheet, i);
			Cell firstCell = getCell(row, range.getFirstColumn()),
					lastCell = getCell(row, range.getLastColumn());
			firstCell.getCellStyle().setBorderLeft(border);
			lastCell.getCellStyle().setBorderRight(border);
		}
	}
	
	private static Cell getCell(Row row, int colnum) {
		Cell cell = row.getCell(colnum);
		if(cell == null) {
			cell = row.createCell(colnum, CellType.STRING);
			cell.setCellStyle(row.getSheet().getWorkbook().createCellStyle());
		}
		return cell;
	}

	private static Row getRow(Sheet sheet, int rownum) {
		Row row = sheet.getRow(rownum);
		if(row == null) {
			row = sheet.createRow(rownum);
		}
		return row;
	}

	private static Cell createAndMergeCell(Sheet sheet, CellRangeAddress range, CellStyle style) {
		for (int i = range.getFirstRow(); i <= range.getLastRow(); i++) {
			Row row = getRow(sheet, i);
			for (int j = range.getFirstColumn(); j <= range.getLastColumn(); j++) {
				Cell cell = getCell(row, j);
				cell.setCellStyle(style);
			}
		}
		sheet.addMergedRegion(range);
		return sheet.getRow(range.getFirstRow()).getCell(range.getFirstColumn());
	}

	private CellStyle createFieldGroupTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setFontHeightInPoints((short) 16);
		font.setFontName(fontFamilyName);
		font.setBold(true);
		font.setColor((short) 0);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.LEFT);
		style.setIndention((short) 2);
		setCellBorder(style, BorderStyle.THIN);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}

	private CellStyle createTitleStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setFontName(fontFamilyName);
		font.setFontHeightInPoints((short) 20);
		font.setColor((short) 0);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.CENTER);
		setCellBorder(style, BorderStyle.THIN);
		style.setWrapText(true);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}
	
	public CellStyle createLinkStyle(Workbook workbook) {
		CellStyle style = workbook.createCellStyle();
		Font font = workbook.createFont();
		font.setFontName(fontFamilyName);
		font.setColor(IndexedColors.BLUE.getIndex());
		font.setUnderline((byte) 1);
		style.setFont(font);
		style.setAlignment(HorizontalAlignment.RIGHT);
		setCellBorder(style, BorderStyle.THIN);
		style.setWrapText(false);
		style.setVerticalAlignment(VerticalAlignment.CENTER);
		return style;
	}



	public void writeDetail(ModuleEntityPropertyParser parser, TemplateDetailTemplate dtmpl, Sheet sheet,
			String listSheetRef) {
		Workbook workbook = sheet.getWorkbook();
		CellStyle linkStyle = createLinkStyle(workbook);
		if(parser != null) {
			
			int lastColumnNumber = 8;
			int lastRowNumber = 2;
			int writeRownum = 4;
			int FIELD_DATA_COLNUM_START = 2;
			
			
			//字段组标题
			List<TemplateDetailFieldGroup> groups = dtmpl.getGroups();
			
			if(groups != null && !groups.isEmpty()) {
				CellStyle fieldGroupTitleStyle = createFieldGroupTitleStyle(workbook);
				//普通字段组内字段样式
				CellStyle fieldTitleStyle = createFieldTitleStyle(workbook);
				CellStyle fieldValueStyle = createFieldValueStyle(workbook);
				CellStyle fieldIntervalCellStyle = createFieldIntervalCellStyle(workbook);
				CellStyle arrayFieldTileStyle = createArrayFieldTitleStyle(workbook);
				CellStyle arrayFieldValueStyle = createArrayFieldValueStyle(workbook);
				
				for (TemplateDetailFieldGroup group : groups) {
					int groupTitleRownum = writeRownum;
					writeRownum++;
					List<TemplateDetailField> fields = group.getFields();
					if(!Integer.valueOf(1).equals(group.getIsArray())) {
						//普通字段组
						
						//字段
						if(fields != null && !fields.isEmpty()) {
							boolean breakRow = true;
							int fieldTitleColnum = FIELD_DATA_COLNUM_START;
							for (TemplateDetailField field : fields) {
								Row fieldRow;
								boolean isdbCol = Integer.valueOf(2).equals(field.getColNum());
								//普通字段组内字段-值
								if(breakRow) {
									fieldRow = sheet.createRow(writeRownum);
									fieldRow.setHeightInPoints(30);
									fieldTitleColnum = FIELD_DATA_COLNUM_START;
								}else {
									if(isdbCol) {
										//如果当前是在后一列，并且在字段要占两列，那么强制换行
										breakRow = true;
										writeRownum++;
										fieldRow = sheet.createRow(writeRownum);
										fieldRow.setHeightInPoints(30);
										fieldTitleColnum = FIELD_DATA_COLNUM_START;
									}else {
										//字段在后一列
										fieldRow = sheet.getRow(writeRownum);
										//同行字段的间隔
										Cell intervalCell = fieldRow.createCell(FIELD_DATA_COLNUM_START + 3);
										intervalCell.setCellStyle(fieldIntervalCellStyle);
										
										fieldTitleColnum = FIELD_DATA_COLNUM_START + 4;
									}
								}
								Cell fieldTitleCell = fieldRow.createCell(fieldTitleColnum);
								fieldTitleCell.setCellStyle(fieldTitleStyle);
								fieldTitleCell.setCellValue(field.getTitle());
								sheet.autoSizeColumn(FIELD_DATA_COLNUM_START);
								
								//
								CellRangeAddress fieldValueRange;
								if(isdbCol) {
									fieldValueRange = new CellRangeAddress(writeRownum, writeRownum, FIELD_DATA_COLNUM_START + 1, FIELD_DATA_COLNUM_START + 6);
									breakRow = true;
									writeRownum++;
								}else {
									if(breakRow) {
										fieldValueRange = new CellRangeAddress(writeRownum, writeRownum, FIELD_DATA_COLNUM_START + 1, FIELD_DATA_COLNUM_START + 2);
										//下一个字段的标题显示在同一行的后一列
										breakRow = false;
									}else {
										fieldValueRange = new CellRangeAddress(writeRownum, writeRownum, FIELD_DATA_COLNUM_START + 5, FIELD_DATA_COLNUM_START + 6);
										//下一个字段显示在下一行的前一列
										breakRow = true;
										writeRownum++;
									}
								}
								Cell fieldValueCell = createAndMergeCell(sheet, fieldValueRange, fieldValueStyle);
								fieldValueCell.setCellValue(parser.getFormatedProperty(field.getFieldName()));
							}
							//字段组后换一行
							if(breakRow) {
								writeRownum += 1;
							}else {
								writeRownum += 2;
							}
						}
					}else {
						//数组字段组

						//记录数组字段组的标题行，等生成表头后再生成标题
						
						Row headerRow = sheet.createRow(writeRownum);
						headerRow.setHeightInPoints(32);
						int fieldsCount = fields.size();
						
						int colNumber = FIELD_DATA_COLNUM_START;
						//序号列
						Cell rownumTitleCell = headerRow.createCell(colNumber++, CellType.STRING);
						rownumTitleCell.setCellValue("#");
						rownumTitleCell.setCellStyle(arrayFieldTileStyle);
						if(group.getRelationSubdomain() != null) {
							//关系列
							Cell relationTitleCell = headerRow.createCell(colNumber++, CellType.STRING);
							relationTitleCell.setCellValue("关系");
							relationTitleCell.setCellStyle(arrayFieldTileStyle);
						}
						
						for (int i = 0; i < fieldsCount; i++) {
							TemplateDetailField field = fields.get(i);
							String header = field.getTitle();
							Cell headerCell = headerRow.createCell(colNumber + i, CellType.STRING);
							headerCell.setCellValue(header);
							headerCell.setCellStyle(arrayFieldTileStyle);
						}
						if(lastColumnNumber < colNumber + fieldsCount) {
							lastColumnNumber = colNumber + fieldsCount;
						}
						writeRownum++;
						
						List<ArrayItemPropertyParser> items = parser.getCompositeArray(group.getComposite().getName());
						if(items != null && !items.isEmpty()) {
							int itemNumber = 1;
							for (ArrayItemPropertyParser item : items) {
								Row fieldRow = sheet.createRow(writeRownum);
								fieldRow.setHeightInPoints(30);
								//设置序号列
								Cell rownumCell = fieldRow.createCell(FIELD_DATA_COLNUM_START, CellType.STRING);
								rownumCell.setCellValue(itemNumber++);
								rownumCell.setCellStyle(arrayFieldValueStyle);
								
								if(group.getRelationSubdomain() != null) {
									//关系列
									Cell relationValueCell = fieldRow.createCell(FIELD_DATA_COLNUM_START + 1, CellType.STRING);
									relationValueCell.setCellValue(item.getFormatedProperty(group.getComposite().getName() + "." + EntityConstants.LABEL_KEY));
									relationValueCell.setCellStyle(arrayFieldValueStyle);
								}
								
								for (int i = 0; i < fieldsCount; i++) {
									TemplateDetailField field = fields.get(i);
									Cell cell = fieldRow.createCell(colNumber + i, CellType.STRING);
									cell.setCellStyle(arrayFieldValueStyle);
									if(field.getFieldAvailable()) {
										cell.setCellValue(item.getFormatedProperty(field.getFieldName()));
									}
								}
								
								writeRownum++;
							}
						}
						
						
					}
					
					//等表头创建之后，再根据宽度创建数组字段组标题
					CellRangeAddress fieldGroupTitleRange = new CellRangeAddress(groupTitleRownum, groupTitleRownum, 2, lastColumnNumber);
					Cell fieldGroupTitleCell = createAndMergeCell(sheet, fieldGroupTitleRange, fieldGroupTitleStyle);
					fieldGroupTitleCell.setCellValue(group.getTitle());
					fieldGroupTitleCell.getRow().setHeightInPoints(35);
				}
				
			}
			
			
			lastRowNumber = writeRownum + 1;
			
			CellStyle titleStyle = createTitleStyle(workbook);
			CellRangeAddress titleRange = new CellRangeAddress(1,2,1,lastColumnNumber);
			Cell titleCell = createAndMergeCell(sheet, titleRange, titleStyle);
			titleCell.setCellStyle(titleStyle);
			titleCell.setCellValue(parser.getTitle() + "-详情");
			
			sheet.addMergedRegion(new CellRangeAddress(0, 0, 1, lastColumnNumber));
			sheet.addMergedRegion(new CellRangeAddress(3, 3, 1, lastColumnNumber));
			sheet.setColumnWidth(0, 800);
			sheet.addMergedRegion(new CellRangeAddress(0, lastRowNumber, 0, 0));
			wrapBorder(sheet, new CellRangeAddress(1, lastRowNumber, 1, lastColumnNumber), BorderStyle.MEDIUM);
		}
		if(TextUtils.hasText(listSheetRef)) {
			Row firstRow = getRow(sheet, 0);
			Cell linkCell = getCell(firstRow, 1);
			Hyperlink link = workbook.getCreationHelper().createHyperlink(HyperlinkType.DOCUMENT);
			link.setAddress(listSheetRef);
			linkCell.setHyperlink(link);
			linkCell.setCellValue("列表页");
			linkCell.setCellStyle(linkStyle);
		}
	}
	
	public void writeDetail(ModuleEntityPropertyParser parser, TemplateDetailTemplate dtmpl, Sheet sheet) {
		writeDetail(parser, dtmpl, sheet, null);
	}


	public CellStyle getListHeaderStyle(Workbook workbook) {
		CellStyle style = createArrayFieldTitleStyle(workbook);
		Font font = workbook.getFontAt(style.getFontIndex());
		font.setFontHeightInPoints((short) 12);
		return style;
	}


	public CellStyle getListValueStyle(XSSFWorkbook workbook) {
		CellStyle style = createArrayFieldValueStyle(workbook);
		return style;
	}
}
