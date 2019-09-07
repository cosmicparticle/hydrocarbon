package cn.sowell.datacenter.model.modules.bean;

public class ExportResource {
	private String exportFileName;
	private String diskFileName;
	private long timeout;
	public ExportResource(String exportFileName, long timeout) {
		super();
		this.exportFileName = exportFileName;
		this.timeout = timeout;
	}
	public String getExportFileName() {
		return exportFileName;
	}
	public void setExportFileName(String exportFileName) {
		this.exportFileName = exportFileName;
	}
	public long getTimeout() {
		return timeout;
	}
	public void setTimeout(long timeout) {
		this.timeout = timeout;
	}
	public String getDiskFileName() {
		return diskFileName;
	}
	public void setDiskFileName(String diskFileName) {
		this.diskFileName = diskFileName;
	}
}
