package cn.sowell.datacenter.model.modules.bean;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public abstract class AbstractEntityDetail {
	private String code;
	public AbstractEntityDetail(String code) {
		super();
		this.code = code;
	}
	private Map<String, String> fieldMap = new HashMap<>();
	private Map<String, List<EntityArrayItemDetail>> arrayMap = new HashMap<>();
	
	public Map<String, String> getFieldMap(){
		return this.fieldMap;
	}
	public Map<String, List<EntityArrayItemDetail>> getArrayMap(){
		return this.arrayMap;
	}
	public String getCode() {
		return code;
	}
}
