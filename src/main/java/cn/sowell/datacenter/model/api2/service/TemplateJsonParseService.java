package cn.sowell.datacenter.model.api2.service;

import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.model.config.bean.ValidateDetailResult;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListColumn;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateStatView;

public interface TemplateJsonParseService {

	JSONObject toListTemplateJson(AbstractListTemplate<? extends AbstractListColumn, ? extends AbstractListCriteria> ltmpl);

	JSONObject toTemplateGroupJson(TemplateGroup tmplGroup);

	JSONObject toSelectConfig(TemplateDetailFieldGroup fieldGroup);

	JSONObject toDetailTemplateConfig(ValidateDetailResult validateResult);

	JSONObject toStatViewJson(TemplateStatView statViewTemplate);

}
