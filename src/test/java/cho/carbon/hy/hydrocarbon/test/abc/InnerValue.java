package cho.carbon.hy.hydrocarbon.test.abc;

import java.io.Serializable;
import java.util.Map;

public class InnerValue implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -7287800578745245840L;
	private String val;
	private Map<Integer, String> map;
	public String getVal() {
		return val;
	}
	public void setVal(String val) {
		this.val = val;
	}
	public Map<Integer, String> getMap() {
		return map;
	}
	public void setMap(Map<Integer, String> map) {
		this.map = map;
	}
}
