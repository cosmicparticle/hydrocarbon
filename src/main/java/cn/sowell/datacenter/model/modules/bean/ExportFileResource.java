package cn.sowell.datacenter.model.modules.bean;

import org.springframework.core.io.FileSystemResource;

public class ExportFileResource {
	private String exportName;
	private FileSystemResource file;
	public ExportFileResource(String exportName, FileSystemResource file) {
		super();
		this.exportName = exportName;
		this.file = file;
	}
	public String getExportName() {
		return exportName;
	}
	public void setExportName(String exportName) {
		this.exportName = exportName;
	}
	public FileSystemResource getFile() {
		return file;
	}
	public void setFile(FileSystemResource file) {
		this.file = file;
	}
}
