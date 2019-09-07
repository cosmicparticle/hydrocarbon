package cn.sowell.datacenter.model.admin.pojo;

import cn.sowell.dataserver.model.modules.bean.ExportDataPageInfo;

public class ExportStatus {

	private Integer current;
	private Integer totalCount;
	private boolean completed = false;
	private String errorMsg = null;
	private final String uuid;
	
	private Integer currentData = 0;
	private Integer totalData;
	private boolean breaked = false;
	private ExportDataPageInfo exportPageInfo;
	private String message;
	
	private long lastCheckTime = System.currentTimeMillis();
	
	public ExportStatus(String uuid) {
		this.uuid = uuid;
	}
	
	public Integer getCurrent() {
		return current;
	}
	public void setCurrent(Integer current) {
		this.current = current;
	}
	public Integer getTotalCount() {
		return totalCount;
	}
	public void setTotalCount(Integer totalCount) {
		this.totalCount = totalCount;
	}
	public boolean isCompleted() {
		return completed;
	}
	public void setCompleted(boolean completed) {
		this.completed = completed;
	}
	public String getErrorMsg() {
		return errorMsg;
	}
	public void setErrorMsg(String errorMsg) {
		this.errorMsg = errorMsg;
	}
	public Integer getCurrentData() {
		return currentData;
	}
	public void setCurrentData(Integer currentData) {
		this.currentData = currentData;
	}
	public Integer getTotalData() {
		return totalData;
	}
	public void setTotalData(Integer totalData) {
		this.totalData = totalData;
	}
	
	public void setBreaked(){
		this.breaked = true;
	}
	public boolean isBreaked() {
		return breaked;
	}
	public String getUuid() {
		return uuid;
	}

	public void setExportPageInfo(ExportDataPageInfo exportPageInfo) {
		this.exportPageInfo = exportPageInfo;
	}

	public ExportDataPageInfo getExportPageInfo() {
		return exportPageInfo;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public long getLastCheckTime() {
		return lastCheckTime;
	}

	public void setLastCheckTime(long lastCheckTime) {
		this.lastCheckTime = lastCheckTime;
	}
	
	public long check(){
		this.lastCheckTime = System.currentTimeMillis();
		return this.lastCheckTime;
	}

}
