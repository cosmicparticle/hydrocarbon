package cn.sowell.datacenter.model.modules.pojo;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.alibaba.fastjson.annotation.JSONField;

@Entity
@Table(name="t_sa_import_tmpl_field")
public class ModuleImportTemplateField {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Transient
	private String title;
	
	@Column(name="field_id")
	private Integer fieldId;
	
	@Column(name="composite_id")
	private Integer compositeId;
	
	@Column(name="c_field_index")
	private Integer fieldIndex;
	
	@Column(name="c_order")
	private Integer order;
	
	@Column(name="update_time")
	@JSONField(serialize=false, deserialize=false)
	private Date updateTime;
	
	@Column(name="tmpl_id")
	@JSONField(serialize=false, deserialize=false)
	private Long templateId;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public Integer getOrder() {
		return order;
	}
	public void setOrder(Integer order) {
		this.order = order;
	}
	public Date getUpdateTime() {
		return updateTime;
	}
	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}
	public Long getTemplateId() {
		return templateId;
	}
	public void setTemplateId(Long templateId) {
		this.templateId = templateId;
	}
	public Integer getFieldIndex() {
		return fieldIndex;
	}
	public void setFieldIndex(Integer fieldIndex) {
		this.fieldIndex = fieldIndex;
	}
	public Integer getFieldId() {
		return fieldId;
	}
	public void setFieldId(Integer fieldId) {
		this.fieldId = fieldId;
	}
	public Integer getCompositeId() {
		return compositeId;
	}
	public void setCompositeId(Integer compositeId) {
		this.compositeId = compositeId;
	}
}
