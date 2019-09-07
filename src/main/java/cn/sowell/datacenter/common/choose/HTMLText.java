package cn.sowell.datacenter.common.choose;

import cn.sowell.copframe.utils.FormatUtils;

public class HTMLText implements HTMLElement{

	private String text;
	private HTMLTag parent;
	public HTMLText(String text){
		this.text = text;
	}
	
	@Override
	public String getOuterHtml() {
		return FormatUtils.coalesce(this.text, "");
	}

	@Override
	public HTMLTag getParent() {
		return this.parent; 
	}
	
	@Override
	public String text() {
		return text;
	}
	
	void setParent(HTMLTag parent){
		this.parent = parent;
	}

}
