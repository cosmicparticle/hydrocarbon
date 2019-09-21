package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatList;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.ListTemplateFormater.Handlers;
import cho.carbon.hc.hydrocarbon.common.choose.ChooseTablePage;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cn.sowell.copframe.dto.ajax.AjaxPageResponse;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.utils.FormatUtils;
import cn.sowell.copframe.utils.TextUtils;
import cn.sowell.copframe.utils.date.FrameDateFormat;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/stat/ltmpl")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminStatListTemplateController {
	
	@Resource
	StatListTemplateService stltmplService;
	
	@Resource
	ModulesService mService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	DictionaryService dictService;
	
	@Resource(name="dictionaryServiceImpl")
	DictionaryService dictionaryService;
	
	static Logger logger = Logger.getLogger(AdminStatListTemplateController.class);
	
	@Resource
	FrameDateFormat dateFormat;
	
	@RequestMapping("/list/{moduleName}")
	public String list(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getStatModule(moduleName);
		if(module != null) {
			List<TemplateStatList> stltmpls = stltmplService.queryAll(moduleName);
			model.addAttribute("module", module);
			model.addAttribute("ltmpls", stltmpls);
			model.addAttribute("modulesJson", configService.getSiblingModulesJson(moduleName));
			return AdminConstants.JSP_TMPL_STATLIST + "/stat_ltmpl_list.jsp";
		}else {
			return null;
		}
	}
	
	@RequestMapping("/add/{moduleName}")
	public String add(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getStatModule(moduleName);
		if(module != null) {
			model.addAttribute("fieldInputTypeMap", JSON.toJSON(dictService.getFieldInputTypeMap()));
			model.addAttribute("module", module);
		}else {
			return null;
		}
		return AdminConstants.JSP_TMPL_STATLIST + "/stat_ltmpl_update.jsp";
	}
	
	@RequestMapping("/update/{stltmplId}")
	public String update(@PathVariable Long stltmplId, Model model) {
		TemplateStatList stltmpl = stltmplService.getTemplate(stltmplId);
		if(stltmpl != null) {
			ModuleMeta module = mService.getStatModule(stltmpl.getModule());
			if(module != null) {
				JSONArray columnDataJSON = ListTemplateFormater.toColumnData(stltmpl.getColumns());
				JSONObject tmplDataJSON = ListTemplateFormater.toLtmplData(stltmpl);
				JSONArray criteriaDataJSON = ListTemplateFormater.toCriteriaData(stltmpl.getCriterias());
				model.addAttribute("tmplDataJSON", tmplDataJSON);
				model.addAttribute("columnDataJSON", columnDataJSON);
				model.addAttribute("criteriaDataJSON", criteriaDataJSON);
				model.addAttribute("module", module);
				model.addAttribute("ltmpl", stltmpl);
				return AdminConstants.JSP_TMPL_STATLIST + "/stat_ltmpl_update.jsp";
			}else {
			}
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON save(@RequestBody JsonRequest jReq){
		JSONObjectResponse jRes = new JSONObjectResponse();
		Handlers<TemplateStatList, TemplateStatColumn, TemplateStatCriteria> handler = new Handlers<TemplateStatList, TemplateStatColumn, TemplateStatCriteria>();
		handler.setCriteriaConsumer((criteria, item)->{
			criteria.setFilterOccasion(item.getInteger("filterOccasion"));
		});
		TemplateStatList tmpl = ListTemplateFormater.generateLtmplData(
				jReq, dictionaryService,
				TemplateStatList::new, 
				TemplateStatColumn::new, 
				TemplateStatCriteria::new,
				handler);
		try {
			stltmplService.merge(tmpl);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存列表模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}
	
	
	
	@ResponseBody
	@RequestMapping("/remove/{stltmplId}")
	public AjaxPageResponse remove(@PathVariable Long stltmplId) {
		try {
			stltmplService.remove(stltmplId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		}catch (Exception e) {
			logger.error("删除模板时发生错误", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}
	
	
	@RequestMapping("/choose/{module}")
	public String choose(@PathVariable String module, String except, Model model) {
		List<TemplateStatList> list = stltmplService.queryAll(module);
		if(TextUtils.hasText(except)) {
			Set<Long> excepts = TextUtils.split(except, ",", HashSet::new, FormatUtils::toLong);
			list = list.stream().filter(tmpl->!excepts.contains(tmpl.getId())).collect(Collectors.toList());
		}
		ChooseTablePage<TemplateStatList> tpage = new ChooseTablePage<TemplateStatList>(
				"stltmpl-choose-list", "stltmpl_");
		tpage
			.setPageInfo(null)
			.setAction(AdminConstants.URI_TMPL + "/stat/ltmpl/choose/" + module)
			.setIsMulti(false)
			.setTableData(list, handler->{
				handler
					.setDataKeyGetter(data->"stltmpl_" + data.getId())
					.addColumn("模板名", (cell, data)->cell.setText(data.getTitle()))
					.addColumn("创建时间", (cell, data)->cell.setText(dateFormat.formatDateTime(data.getCreateTime())))
					;
			})
			;
		
		model.addAttribute("tpage", tpage);
		return AdminConstants.PATH_CHOOSE_TABLE;
	}
	
}
