package cn.sowell.datacenter.test.abc;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class JedicaValue implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1699153826312347690L;
	private Map<String, String> map;
	private List<Integer> list;
	private long[] array;
	private InnerValue inner;
	public Map<String, String> getMap() {
		return map;
	}
	public void setMap(Map<String, String> map) {
		this.map = map;
	}
	public List<Integer> getList() {
		return list;
	}
	public void setList(List<Integer> list) {
		this.list = list;
	}
	public long[] getArray() {
		return array;
	}
	public void setArray(long[] array) {
		this.array = array;
	}
	public InnerValue getInner() {
		return inner;
	}
	public void setInner(InnerValue inner) {
		this.inner = inner;
	}
}
