package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.FormatUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDictionaryFilter;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.service.DictionaryFilterService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.common.choose.ChooseTablePage;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/dictfilter")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminDictionaryFilterController {
	
	@Resource
	DictionaryFilterService fService;
	
	@Resource
	ModulesService mService;

	@Resource
	ConfigureService configService;
	
	static Logger logger = Logger.getLogger(AdminDictionaryFilterController.class);
	
	@Resource
	FrameDateFormat dateFormat;
	
	
	@RequestMapping("/list/{moduleName}")
	public String list(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		List<TemplateDictionaryFilter> filters = fService.queryAll(moduleName);
		Map<Long, List<TemplateGroup>> relatedGroupsMap = fService.getRelatedGroupsMap(CollectionUtils.toSet(filters, TemplateDictionaryFilter::getId));

		model.addAttribute("modulesJson", configService.getSiblingModulesJson(moduleName));
		model.addAttribute("filters", filters);
		model.addAttribute("module", module);
		model.addAttribute("relatedGroupsMap", relatedGroupsMap);
		return AdminConstants.JSP_TMPL_DICTFILTER + "/dictfilter_list.jsp";
	}
	
	@RequestMapping("/to_create/{moduleName}")
	public String toCreate(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_DICTFILTER + "/dictfilter_update.jsp";
	}
	
	@RequestMapping("/update/{filterId}")
	public String toUpdate(@PathVariable Long filterId, Model model) {
		TemplateDictionaryFilter filter = fService.getTemplate(filterId);
		ModuleMeta module = mService.getModule(filter.getModule());
		model.addAttribute("filter", filter);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_DICTFILTER + "/dictfilter_update.jsp";
	}
	
	
	@ResponseBody
	@RequestMapping("/save")
	public AjaxPageResponse save(TemplateDictionaryFilter filter) {
		try {
			validateSave(filter);
			fService.merge(filter);
		} catch (Exception e) {
			logger.error("保存时发生错误", e);
			return AjaxPageResponse.FAILD("保存失败");
		}
		return AjaxPageResponse.CLOSE_AND_REFRESH_PAGE("保存成功", filter.getModule() + "_dictfilter_list");
	}

	@ResponseBody
	@RequestMapping("/remove/{dictFilterId}")
	public AjaxPageResponse remove(@PathVariable Long dictFilterId) {
		try {
			fService.remove(dictFilterId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}
	
	
	private void validateSave(TemplateDictionaryFilter filter) {
		ModuleMeta module = mService.getModule(filter.getModule());
		Assert.notNull(module, "模块[" + filter.getModule() + "]不存在");
		Assert.hasText(filter.getTitle(), "title不能为空");
	}
	
	@RequestMapping("/choose/{module}")
	public String choose(@PathVariable String module, String except, Model model) {
		List<TemplateDictionaryFilter> tmplList = fService.queryAll(module);
		if(TextUtils.hasText(except)) {
			Set<Long> excepts = TextUtils.split(except, ",", HashSet::new, FormatUtils::toLong);
			tmplList = tmplList.stream().filter(tmpl->!excepts.contains(tmpl.getId())).collect(Collectors.toList());
		}
		ChooseTablePage<TemplateDictionaryFilter> tpage = new ChooseTablePage<TemplateDictionaryFilter>(
				"difilter-choose-list", "difilter_");
		tpage
			.setPageInfo(null)
			.setAction(AdminConstants.URI_TMPL + "/dictfilter/choose/" + module)
			.setIsMulti(false)
			.setTableData(tmplList, handler->{
				handler
					.setDataKeyGetter(data->"difilter_" + data.getId())
					.addColumn("模板名", (cell, data)->cell.setText(data.getTitle()))
					.addColumn("创建时间", (cell, data)->cell.setText(dateFormat.formatDateTime(data.getCreateTime())))
					;
			})
			;
		
		model.addAttribute("tpage", tpage);
		return AdminConstants.PATH_CHOOSE_TABLE;
	}
	
}
