package cho.carbon.hc.hydrocarbon.common.choose;

public class ChooseTableElement {
	protected HTMLTag tag;
	
	protected ChooseTableElement(String tagName){
		this.tag = new HTMLTag(tagName);
	}
	public String getAttrText(){
		return tag.getAttributeText();
	}
	
	public void addAttr(String attrName, String attrValue){
		tag.attribute(attrName, attrValue);
	}
	
	public String getText(){
		return tag.text();
	}
	
	public void setText(String name){
		tag.text(name);
	}
}
