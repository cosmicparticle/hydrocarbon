package cho.carbon.hc.hydrocarbon.admin.controller.config;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.auth.pojo.AuthorityVO;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.statview.service.StatViewService;
import cho.carbon.hc.dataserver.model.tmpl.param.StatModuleDetail;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.entityResolver.config.abst.Module;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.common.choose.ChooseTablePage;
import cho.carbon.hc.hydrocarbon.model.admin.pojo.ABCUser;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;
import cho.carbon.hc.hydrocarbon.model.config.pojo.criteria.AuthorityCriteria;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cho.carbon.hc.hydrocarbon.ws.HydrocarbonReloadService;
import cn.sowell.copframe.common.UserIdentifier;
import cn.sowell.copframe.dao.utils.UserUtils;
import cn.sowell.copframe.dto.ajax.AjaxPageResponse;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.dto.page.PageInfo;
import cn.sowell.copframe.utils.CollectionUtils;

@Controller 
@RequestMapping(AdminConstants.URI_CONFIG + "/sidemenu")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminConfigSidemenuController {
	
	@Resource
	ConfigureService configService;
	
	@Resource
	SideMenuService menuService;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	ModulesService mService;
	
	@Resource
	AuthorityService authService;
	
	@Resource
	StatViewService statViewService;
	
	Logger logger = Logger.getLogger(AdminConfigSidemenuController.class);
	
	
	@RequestMapping({"", "/"})
	public String main(Model model) {
		UserIdentifier user = UserUtils.getCurrentUser();
		List<SideMenuLevel1Menu> menus = menuService.getSideMenuLevelMenus(user);
		List<Module> modules = configService.getEnabledModules();
		Set<String> moduleNames = CollectionUtils.toSet(modules, Module::getName);
		Map<String, List<TemplateGroup>> tmplGroupsMap = tmplGroupService.queryModuleGroups(moduleNames);
		Map<Long, String[]> level1AuthorityDescriptionMap = menuService.getMenu1AuthNameMap(CollectionUtils.toSet(menus, SideMenuLevel1Menu::getId));
		
		Set<SideMenuLevel2Menu> l2MenuSet = new HashSet<SideMenuLevel2Menu>();
		if(menus != null) {
			menus.forEach(menu->{
				List<SideMenuLevel2Menu> l2menus = menu.getLevel2s();
				if(l2menus != null) {
					l2MenuSet.addAll(l2menus);
				}
			});
		}
		Map<Long, String[]> level2AuthorityDescriptionMap = menuService.getMenu2AuthNameMap(CollectionUtils.toSet(l2MenuSet, SideMenuLevel2Menu::getId));
		
		Map<String, StatModuleDetail> statDetailMap = statViewService.getStatModuleDetail(moduleNames);
		
		SystemConfig sysConfig = configService.getSystemConfig();
		model.addAttribute("systemConfig", sysConfig);
		JSONObject config = configService.getModuleConfigJson();
		model.addAttribute("config", config);
		model.addAttribute("modules", modules);
		model.addAttribute("menus", menus);
		model.addAttribute("statDetailMap", statDetailMap);
		model.addAttribute("tmplGroupsMap", tmplGroupsMap);
		model.addAttribute("level1AuthorityDescriptionMap", level1AuthorityDescriptionMap);
		model.addAttribute("level2AuthorityDescriptionMap", level2AuthorityDescriptionMap);
		return AdminConstants.JSP_CONFIG_SIDEMENU + "/sidemenu_main.jsp";
	}
	
	
	@ResponseBody
	@RequestMapping("/save")
	public ResponseJSON save(@RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONObject req = jReq.getJsonObject();
		try {
			List<SideMenuLevel1Menu> l1Menus = toMenuModules(req);
			
			menuService.updateSideMenuModules(UserUtils.getCurrentUser(), l1Menus);
			jRes.setStatus("suc");
		} catch (Exception e) {
			jRes.setStatus("error");
			logger.error("更新功能菜单时发生错误", e);
		}
		return jRes;
	}

	private List<SideMenuLevel1Menu> toMenuModules(JSONObject req) {
		JSONArray jModules = req.getJSONArray("modules");
		List<SideMenuLevel1Menu> modules = new ArrayList<>();
		for (Object x : jModules) {
			JSONObject jL1Menu = (JSONObject) x;
			SideMenuLevel1Menu l1menu = new SideMenuLevel1Menu();
			l1menu.setId(jL1Menu.getLong("id"));
			l1menu.setTitle(jL1Menu.getString("title"));
			l1menu.setAuthorities(jL1Menu.getString("authorities"));
			l1menu.setOrder(jL1Menu.getInteger("order"));
			l1menu.setLevel2s(new ArrayList<>());
			JSONArray jGroups = jL1Menu.getJSONArray("groups");
			for (Object y : jGroups) {
				JSONObject jL2Menu = (JSONObject) y;
				SideMenuLevel2Menu l2menu = new SideMenuLevel2Menu();
				l2menu.setId(jL2Menu.getLong("id"));
				l2menu.setTitle(jL2Menu.getString("title"));
				l2menu.setOrder(jL2Menu.getInteger("order"));
				l2menu.setTemplateGroupId(jL2Menu.getLong("tmplGroupId"));
				l2menu.setStatViewId(jL2Menu.getLong("statvmplId"));
				l2menu.setAuthorities(jL2Menu.getString("authorities"));
				if(Long.valueOf(0).equals(l2menu.getTemplateGroupId())) {
					l2menu.setIsDefault(1);
					l2menu.setTemplateGroupId(null);
				}
				l1menu.getLevel2s().add(l2menu);
			}
			modules.add(l1menu);
		}
		return modules;
	}
	
	@RequestMapping("/authority_choose")
	public String authorityChoose(AuthorityCriteria criteria, PageInfo pageInfo, Model model) {
		ABCUser user = (ABCUser) UserUtils.getCurrentUser();
		criteria.setUser(user.getUserInfo());
		List<AuthorityVO> authorities = authService.queryAuthorities(criteria);
		Set<String> menuAuthorities = new HashSet<String>();
		if(criteria.getAuths() != null) {
			String[] split = criteria.getAuths().split(";");
			for (String auth : split) {
				menuAuthorities.add(auth);
			}
		}
		ChooseTablePage<AuthorityVO> page = new ChooseTablePage<>("sidemenu_authority_list", "auth-");
		page.setPageInfo(pageInfo);
		page.setIsMulti(true);
		page.setPrependRowNumber(true);
		page.setSelectedPredicate(authority->menuAuthorities.contains(authority.getCode()));
		page.setTableData(authorities, row->{
				row.setDataKeyGetter(authority->authority.getCode())
					.addColumn("权限名", (cell, authority)->cell.setText(authority.getName()))
					.addColumn("描述", (cell, authority)->cell.setText(authority.getDescription()));
			});
		page.setAction(this.getClass().getDeclaredAnnotation(RequestMapping.class).value()[0] + "/authority_choose");
		page.addHidden("menuId", criteria.getMenuId());
		if(authorities != null) {
			authorities.forEach(authority->page.addJsonData(authority.getName(), (JSON) JSON.toJSON(authority)));
		}
		model.addAttribute("tpage", page);
		return AdminConstants.PATH_CHOOSE_TABLE;
	}
	
	
	@Resource
	HydrocarbonReloadService reloadService;
	
	@ResponseBody
	@RequestMapping("/reload")
	public AjaxPageResponse reload(){
		try {
			reloadService.syncModule();
			return AjaxPageResponse.REFRESH_LOCAL("配置重载成功");
		} catch (Exception e) {
			return AjaxPageResponse.FAILD("配置重载失败");
		}
	}
	
}
