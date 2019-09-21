package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.dict.service.impl.DictionaryServiceImpl;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ListTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.CommonTemplateActionConsumer.ChooseRequestParam;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.ListTemplateFormater.Handlers;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cn.sowell.copframe.dto.ajax.AjaxPageResponse;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.date.FrameDateFormat;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/ltmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminListTemplateController {
	
	Logger logger = Logger.getLogger(AdminListTemplateController.class);

	@Resource
	ListTemplateService ltmplService;
	
	@Resource
	FrameDateFormat dateFormat;
	
	@Resource
	DictionaryService dictService;

	@Resource
	private ModulesService mService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	CommonTemplateActionConsumer actionConsumer;
	
	@Resource(name="dictionaryServiceImpl")
	DictionaryService  dictionaryService;
	
	@RequestMapping("/list/{moduleName}")
	public String list(Model model, @PathVariable String moduleName){
		ModuleMeta moduleMeta = mService.getModule(moduleName);
		List<TemplateListTemplate> ltmplList = ltmplService.queryAll(moduleName);
		Map<Long, List<TemplateGroup>> relatedGroupsMap = ltmplService.getRelatedGroupsMap(CollectionUtils.toSet(ltmplList, ltmpl->ltmpl.getId()));
		model.addAttribute("modulesJson", configService.getSiblingModulesJson(moduleName));
		model.addAttribute("ltmplList", ltmplList);
		model.addAttribute("module", moduleMeta);
		model.addAttribute("relatedGroupsMap", relatedGroupsMap);
		return AdminConstants.JSP_TMPL_LIST + "/ltmpl_list.jsp";
	}
	
	@RequestMapping("/choose/{moduleName}")
	public String choose(@PathVariable String moduleName, String except, Model model) {
		return actionConsumer.choose(
				ChooseRequestParam.create(moduleName, ltmplService, model)
					.setExcept(except)
					.setURI(AdminConstants.URI_TMPL + "/ltmpl/choose/" +moduleName)
			);
		
		/*List<TemplateListTemplate> list = ltmplService.queryAll(moduleName);
		if(TextUtils.hasText(except)) {
			Set<Long> excepts = TextUtils.split(except, ",", HashSet::new, FormatUtils::toLong);
			list = list.stream().filter(tmpl->!excepts.contains(tmpl.getId())).collect(Collectors.toList());
		}
		ChooseTablePage<TemplateListTemplate> tpage = new ChooseTablePage<TemplateListTemplate>(
				"ltmpl-choose-list", "ltmpl_");
		tpage
			.setPageInfo(null)
			.setAction(AdminConstants.URI_TMPL + "/ltmpl/choose/" + moduleName)
			.setIsMulti(false)
			.setTableData(list, handler->{
				handler
					.setDataKeyGetter(data->"ltmpl_" + data.getId())
					.addColumn("模板名", (cell, data)->cell.setText(data.getTitle()))
					.addColumn("创建时间", (cell, data)->cell.setText(dateFormat.formatDateTime(data.getCreateTime())))
					;
			})
			;
		
		model.addAttribute("tpage", tpage);
		return AdminConstants.PATH_CHOOSE_TABLE;*/
	}
	
	@ResponseBody
	@RequestMapping("/switch_groups/{ltmplId}/{targetLtmplId}")
	public AjaxPageResponse switchGroups(@PathVariable Long ltmplId, @PathVariable Long targetLtmplId) {
		try {
			TemplateListTemplate ltmpl = ltmplService.getTemplate(ltmplId),
									targerTemplate = ltmplService.getTemplate(targetLtmplId);
			if(ltmpl != null) {
				if(targerTemplate != null) {
					ltmplService.switchAllRelatedGroups(ltmplId, targetLtmplId);
					return AjaxPageResponse.CLOSE_AND_REFRESH_PAGE("切换成功", ltmpl.getModule() + "_dtmpl_list");
				}else {
					throw new Exception("切换详情模板的列表模板[id=" + targetLtmplId + "]不存在");
				}
			}else {
				throw new Exception("原详情模板[id=" + ltmplId + "]不存在");
			}
		} catch (Exception e) {
			logger.error("切换时发生错误", e);
		}
		return AjaxPageResponse.FAILD("切换失败");
	}
	
	
	@RequestMapping("/add/{module}")
	public String add(@PathVariable String module, Model model){
		ModuleMeta moduleMeta = mService.getModule(module);
		model.addAttribute("fieldInputTypeMap", JSON.toJSON(dictService.getFieldInputTypeMap()));
		model.addAttribute("module", moduleMeta);
		return AdminConstants.JSP_TMPL_LIST + "/ltmpl_update.jsp";
	}
	
	@RequestMapping("/update/{ltmplId}")
	public String update(@PathVariable Long ltmplId, Model model){
		TemplateListTemplate ltmpl = ltmplService.getTemplate(ltmplId);
		JSONArray columnDataJSON = ListTemplateFormater.toColumnData(ltmpl.getColumns());
		JSONObject tmplDataJSON = ListTemplateFormater.toLtmplData(ltmpl);
		JSONArray criteriaDataJSON = ListTemplateFormater.toCriteriaData(ltmpl.getCriterias());
		ModuleMeta moduleMeta = mService.getModule(ltmpl.getModule());
		model.addAttribute("module", moduleMeta);
		model.addAttribute("ltmpl", ltmpl);
		model.addAttribute("tmplDataJSON", tmplDataJSON);
		model.addAttribute("columnDataJSON", columnDataJSON);
		model.addAttribute("criteriaDataJSON", criteriaDataJSON);
		return AdminConstants.JSP_TMPL_LIST + "/ltmpl_update.jsp";
	}
	
	
	@RequestMapping("/group_list/{ltmplId}")
	public String groupList(@PathVariable Long ltmplId, Model model) {
		TemplateListTemplate ltmpl = ltmplService.getTemplate(ltmplId);
		List<TemplateGroup> tmplGroups = ltmplService.getRelatedGroups(ltmplId);
		model.addAttribute("tmplGroups", tmplGroups);
		model.addAttribute("tmplType", "list");
		model.addAttribute("tmplId", ltmplId);
		model.addAttribute("tmpl", ltmpl);
		return AdminConstants.JSP_TMPL_GROUP + "/tmpl_group_list_from_tmpl.jsp";
	}
	
	
	

	@ResponseBody
	@RequestMapping("/remove/{ltmplId}")
	public AjaxPageResponse remove(@PathVariable Long ltmplId){
		try {
			ltmplService.remove(ltmplId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除模板时发生错误", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}
	

	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON save(@RequestBody JsonRequest jReq){
		JSONObjectResponse jRes = new JSONObjectResponse();
		Handlers<TemplateListTemplate, TemplateListColumn, TemplateListCriteria> handler = new Handlers<>();
		handler.setCriteriaConsumer((criteria, item)->{
			if(criteria.getFieldAvailable()) {
				criteria.setCompositeId(item.getInteger("compositeId"));
			}
		});
		TemplateListTemplate tmpl = ListTemplateFormater.generateLtmplData(
				jReq,dictionaryService
				,TemplateListTemplate::new,
				TemplateListColumn::new,
				TemplateListCriteria::new,
				handler 
				);
		try {
			ltmplService.merge(tmpl);
			//ltService.saveListTemplate(tmpl);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存列表模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	
	@ResponseBody
	@RequestMapping("/copy/{ltmplId}/{targetModuleName}")
	public ResponseJSON copy(@PathVariable Long ltmplId, @PathVariable String targetModuleName) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			Long newTmplId = ltmplService.copy(ltmplId, targetModuleName);
			if(newTmplId != null) {
				jRes.setStatus("suc");
				jRes.put("newTmplId", newTmplId);
			}
		} catch (Exception e) {
			logger.error("复制列表模板时发生错误", e);
		}
		return jRes;
	}
	
	
	
}
