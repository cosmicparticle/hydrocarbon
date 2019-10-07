package cho.carbon.hc.hydrocarbon.admin.controller.statview;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.FormatUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.view.StatListTemplateEntityView;
import cho.carbon.hc.dataserver.model.statview.pojo.StatCriteria;
import cho.carbon.hc.dataserver.model.statview.service.StatViewService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatList;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatView;
import cho.carbon.hc.dataserver.model.tmpl.service.ListCriteriaFactory;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;

@Controller
@RequestMapping(AdminConstants.URI_STAT + "/view")
public class AdminStatViewController {
	
	@Resource
	StatViewService statViewService;
	
	@Resource
	StatListTemplateService statListService;
	
	@Resource
	ModulesService mService;

	@Resource
	AuthorityService authService;
	
	@Resource
	ListCriteriaFactory lcriteriaFactory;
	
	static Logger logger = Logger.getLogger(AdminStatViewController.class);
	
	
	@RequestMapping("/index/{menuId}")
	public String view(
			@PathVariable Long menuId, 
			Model model, 
			PageInfo pageInfo, 
			String disabledColIds,
			HttpServletRequest request) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		model.addAttribute("menu", menu);
		UserIdentifier user = UserUtils.getCurrentUser();
		if(menu.getStatViewId() != null) {
			TemplateStatView vtmpl = statViewService.getTemplate(menu.getStatViewId());
			if(vtmpl != null) {
				ModuleMeta module = mService.getModule(vtmpl.getModule());
				model.addAttribute("module", module);
				StatCriteria criteria = new StatCriteria();
				criteria.setPageInfo(pageInfo);
				criteria.setUser(user);
				Map<Long, String> reqCriteriaMap = lcriteriaFactory.exractTemplateCriteriaMap(request);
				criteria.setReqCriteriaMap(reqCriteriaMap);
				Set<Long> disabledColumnIds = TextUtils.split(disabledColIds, ",", HashSet::new, FormatUtils::toLong);
				criteria.setDisabledColumnIds(disabledColumnIds);
				return dispatch(vtmpl, model, criteria);
				
			}
		}
		return null;
	}


	private String dispatch(TemplateStatView vtmpl, Model model, StatCriteria criteria) {
		if(vtmpl.getStatListTemplateId() != null) {
			
			TemplateStatList ltmpl = statListService.getTemplate(vtmpl.getStatListTemplateId());
			model.addAttribute("ltmpl", ltmpl);
			criteria.setStatListTemplate(ltmpl);
			StatListTemplateEntityView view = statViewService.stat(criteria);
			model.addAttribute("vtmpl", vtmpl);
			model.addAttribute("view", view);
			model.addAttribute("criteria", criteria);
			model.addAttribute("disabledColIds", CollectionUtils.toChain(criteria.getDisabledColumnIds()));
			return AdminConstants.JSP_STATVIEW + "/statview_list.jsp";
		}
		return null;
	}
	
	@ResponseBody
	@RequestMapping("/recalc/{menuId}")
	public AjaxPageResponse recalc(@PathVariable Long menuId) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		if(menu.getStatViewId() != null) {
			TemplateStatView vtmpl = statViewService.getTemplate(menu.getStatViewId());
			if(vtmpl != null) {
				UserIdentifier user = UserUtils.getCurrentUser();
				try {
					statViewService.recalc(vtmpl.getModule(), user );
					return AjaxPageResponse.REFRESH_LOCAL("执行成功");
				} catch (Exception e) {
					logger.error("统计数据时发生错误", e);
				}
			}
		}
		return AjaxPageResponse.FAILD("处理失败");
	}
	
}
