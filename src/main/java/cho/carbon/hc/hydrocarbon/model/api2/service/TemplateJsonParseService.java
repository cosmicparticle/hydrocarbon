package cho.carbon.hc.hydrocarbon.model.api2.service;

import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatView;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailResult;

public interface TemplateJsonParseService {

	JSONObject toListTemplateJson(AbstractListTemplate<? extends AbstractListColumn, ? extends AbstractListCriteria> ltmpl);

	JSONObject toTemplateGroupJson(TemplateGroup tmplGroup);

	JSONObject toSelectConfig(TemplateDetailFieldGroup fieldGroup);

	JSONObject toDetailTemplateConfig(ValidateDetailResult validateResult);

	JSONObject toStatViewJson(TemplateStatView statViewTemplate);

}
