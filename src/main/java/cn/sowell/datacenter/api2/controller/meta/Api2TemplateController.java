package cn.sowell.datacenter.api2.controller.meta;

import javax.annotation.Resource;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.datacenter.api2.controller.Api2Constants;
import cn.sowell.datacenter.common.ApiUser;
import cn.sowell.datacenter.model.api2.service.MetaJsonService;
import cn.sowell.datacenter.model.api2.service.TemplateJsonParseService;
import cn.sowell.datacenter.model.config.bean.ValidateDetailParamter;
import cn.sowell.datacenter.model.config.bean.ValidateDetailResult;
import cn.sowell.datacenter.model.config.service.AuthorityService;
import cn.sowell.dataserver.model.modules.service.ModulesService;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateTreeTemplate;
import cn.sowell.dataserver.model.tmpl.service.DetailTemplateService;
import cn.sowell.dataserver.model.tmpl.service.TemplateGroupService;
import cn.sowell.dataserver.model.tmpl.service.TreeTemplateService;

@RestController
@RequestMapping(Api2Constants.URI_TMPL)
public class Api2TemplateController {
	@Resource
	AuthorityService authService;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	DetailTemplateService dtmplService;
	
	@Resource
	TreeTemplateService treeService;
	
	@Resource
	ModulesService mService;
	
	@Resource
	MetaJsonService metaService;
	
	@Resource
	TemplateJsonParseService tJsonService;
	
	
	@RequestMapping({
		"/dtmpl_config/{contextType:normal}/{validateSign:user|\\d+}/*",
		"/dtmpl_config/{contextType:rabc}/{validateSign:user|\\d+}/{fieldGroupId}",
		"/dtmpl_config/{contextType:node}/{validateSign:user|\\d+}/{nodeId}"
	})
	public ResponseJSON detailTemplateConfig(
			@PathVariable String contextType,
			@PathVariable String validateSign,
			@PathVariable(required=false) Long fieldGroupId,
			@PathVariable(required=false) Long nodeId,
			Long dtmplId,
			ApiUser user) {
		ValidateDetailParamter vparam = new ValidateDetailParamter(validateSign, user);
		vparam
			.setNodeId(nodeId)
			.setDetailTemplateId(dtmplId)
			.setFieldGroupId(fieldGroupId)
			;
		ValidateDetailResult validateResult = authService.validateDetailAuth(vparam);
		JSONObjectResponse jRes = new JSONObjectResponse();
		jRes.put("config", tJsonService.toDetailTemplateConfig(validateResult));
		jRes.put("menu", metaService.toMenuJson(validateResult.getMenu()));
		return jRes;
	}
	
	@RequestMapping("/select_config/{validateSign:user|\\d+}/{fieldGroupId}")
	public ResponseJSON selectConfig(@PathVariable String validateSign, 
			@PathVariable Long fieldGroupId, ApiUser user) {
		TemplateDetailFieldGroup fieldGroup = authService.validateSelectionAuth(validateSign, fieldGroupId, user);
		JSONObjectResponse jRes = new JSONObjectResponse();
		jRes.put("config", tJsonService.toSelectConfig(fieldGroup));
		return jRes;
	}
	
	
	@RequestMapping("/ttmpl/{ttmplId}")
	public ResponseJSON getTreeTemplate(@PathVariable Long ttmplId) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		TemplateTreeTemplate ttmpl = treeService.getTemplate(ttmplId);
		jRes.put("ttmpl", ttmpl);
		return jRes;
	}
}
