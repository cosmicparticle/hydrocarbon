package cn.sowell.datacenter.common.choose;

import java.util.ArrayList;
import java.util.List;


public class ChooseTableRow extends ChooseTableElement{
	public ChooseTableRow() {
		super("tr");
	}
	public List<ChooseTableCell> cells = new ArrayList<ChooseTableCell>();

	public List<ChooseTableCell> getCells() {
		return cells;
	}
	
	public void addCell(String text){
		ChooseTableCell cell = new ChooseTableCell();
		cell.setText(text);
		addCell(cell);
	}
	
	/**
	 * 设置该行的id（在生成的标签中是以data-id属性存在）
	 * @param dataId
	 */
	public void setDataId(String dataId){
		addAttr("data-id", dataId);
	}
	public String getDataId() {
		return tag.attribute("data-id");
	}
	
	public void addCell(ChooseTableCell cell){
		cells.add(cell);
	}

	public void setSelected(boolean selected) {
		tag.addClass("selected");
	}
	
}
