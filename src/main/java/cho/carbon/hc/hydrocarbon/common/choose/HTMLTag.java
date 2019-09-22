package cho.carbon.hc.hydrocarbon.common.choose;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.util.Assert;

import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.FormatUtils;

public class HTMLTag implements HTMLElement{
	private String tagName;
	private LinkedHashMap<String, String> attributes;
	private List<HTMLElement> inner;
	private HTMLTag parent;
	private Set<String> className;
	
	public HTMLTag(String tagName){
		Assert.hasText(tagName);
		this.tagName = tagName;
		this.inner = new ArrayList<HTMLElement>();
		this.attributes = new LinkedHashMap<String, String>();
		this.className = new LinkedHashSet<String>();
	}
	
	private boolean checkChild(HTMLElement element, boolean throwException){
		HTMLElement cur = this;
		while(cur.getParent() != null){
			if(cur.equals(element)){
				if(throwException){
					throw new RuntimeException("检测到指定的子元素为当前元素的祖先节点");
				}
				return false;
			}else{
				cur = cur.getParent();
			}
		}
		return true;
	}
	
	public HTMLTag append(HTMLElement element){
		checkChild(element, true);
		this.inner.add(element);
		if(element instanceof HTMLTag){
			((HTMLTag) element).setParent(this);
		}else if(element instanceof HTMLText){
			((HTMLText) element).setParent(this);
		}
		return this;
	}
	
	public HTMLTag prepend(HTMLElement element){
		checkChild(element, true);
		this.inner.add(0, element);
		return this;
	}
	
	public String attribute(String attrName){
		if("class".equals(attrName)){
			return CollectionUtils.toChain(className, " ");
		}else{
			return attributes.get(attrName);
		}
	}
	
	public HTMLTag attribute(String attrName, String attrValue){
		if("class".equals(attrName)){
			className.clear();
			className.add(attrValue);
		}else{
			attributes.put(attrName, attrValue);
		}
		return this;
	}
	
	public HTMLTag removeAttribute(String attrName){
		attributes.remove(attrName);
		return this;
	}
	
	public HTMLTag addClass(String className){
		this.className.add(className);
		return this;
	}
	
	public HTMLTag removeClass(String className){
		this.className.remove(className);
		return this;
	}
	
	public HTMLTag clearContent(){
		this.inner.clear();
		return this;
	}
	
	public HTMLTag text(String text){
		this.inner.clear();
		this.append(new HTMLText(text));
		return this;
	}
	
	@Override
	public String text(){
		StringBuffer buffer = new StringBuffer();
		inner.forEach(element->{
			buffer.append(element.text());
		});
		return buffer.toString();
	}
	
	public String getInnertHTML(){
		StringBuffer buffer = new StringBuffer();
		inner.forEach(element->{
			buffer.append(element.getOuterHtml());
		});
		return buffer.toString();
	}
	
	
	
	@Override
	public String getOuterHtml() {
		StringBuffer buffer = new StringBuffer();
		buffer.append("<" + tagName);
		buffer.append(getAttributeText());
		buffer.append(">");
		buffer.append(this.getInnertHTML());
		buffer.append("</" + tagName + ">");
		return buffer.toString();
	}
	
	/**
	 * 将标签的所有属性以key="value"的形式连接起来
	 * @return
	 */
	public String getAttributeText() {
		StringBuffer buffer = new StringBuffer();
		if(!className.isEmpty()){
			buffer.append(" class=\"" + CollectionUtils.toChain(className, " ") + "\"");
		}
		attributes.forEach((name, value)->{
			buffer.append(" " + name + "=\"" + FormatUtils.coalesce(value, "") + "\"");
		});
		return buffer.toString();
	}

	@Override
	public String toString() {
		return this.getOuterHtml();
	}
	
	@Override
	public HTMLTag getParent() {
		return parent;
	}
	
	void setParent(HTMLTag parent){
		this.parent = parent;
	}
}
