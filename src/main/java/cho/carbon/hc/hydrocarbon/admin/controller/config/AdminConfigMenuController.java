package cho.carbon.hc.hydrocarbon.admin.controller.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.statview.service.StatViewService;
import cho.carbon.hc.dataserver.model.tmpl.param.StatModuleDetail;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.entityResolver.config.abst.Module;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.model.api2.service.MetaJsonService;
import cho.carbon.hc.hydrocarbon.model.config.pojo.CustomPage;
import cho.carbon.hc.hydrocarbon.model.config.pojo.MenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.hc.hydrocarbon.model.config.service.CustomPageService;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cn.sowell.copframe.dto.ajax.JSONObjectResponse;
import cn.sowell.copframe.dto.ajax.JsonRequest;
import cn.sowell.copframe.dto.ajax.ResponseJSON;
import cn.sowell.copframe.utils.CollectionUtils;
import cn.sowell.copframe.utils.JsonUtils;

@Controller
@RequestMapping(AdminConstants.URI_CONFIG + "/menu")
@PreAuthorize("hasAuthority(@confAuthenService.getAdminConfigAuthen())")
public class AdminConfigMenuController {
	
	@Resource
	SideMenuService menuService;
		
	@Resource
	MetaJsonService mJsonService;
	
	@Resource
	ConfigureService configService;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	StatViewService statViewService;
	
	@Resource
	AuthorityService authService;
	
	@Resource
	CustomPageService customPageService;
	
	static Logger logger = Logger.getLogger(AdminConfigMenuController.class);
	
	@RequestMapping("/index")
	public String index() {
		return AdminConstants.JSP_CONFIG_MENU + "/menu_config.jsp";
	}
	
	@ResponseBody
	@RequestMapping("/sysconfig")
	public ResponseJSON getSystemConfig() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		SystemConfig sysconfig = configService.getSystemConfig();
		jRes.put("sysconfig", sysconfig);
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/blocks")
	public ResponseJSON getAllBlocks() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<SideMenuBlock> blocks = menuService.getAllBlocks();
		List<MenuBlock> jBlocks = mJsonService.convertBlocksJson(blocks, null);
		jRes.put("blocks", jBlocks);
		List<SideMenuLevel1Menu> l1Memus = new ArrayList<SideMenuLevel1Menu>();
		List<SideMenuLevel2Menu> l2Menus = new ArrayList<SideMenuLevel2Menu>();
		
		for (SideMenuBlock block : blocks) {
			for (SideMenuLevel1Menu l1Menu : block.getL1Menus()) {
				l1Memus.add(l1Menu);
				for (SideMenuLevel2Menu l2Menu : l1Menu.getLevel2s()) {
					l2Menus.add(l2Menu);
				}
			}
		}
		Map<Long, String[]> blockAuthorityDescriptionMap = menuService.getBlockAuthNameMap(CollectionUtils.toSet(blocks, SideMenuBlock::getId));
		Map<Long, String[]> level1AuthorityDescriptionMap = menuService.getMenu1AuthNameMap(CollectionUtils.toSet(l1Memus, SideMenuLevel1Menu::getId));
		Map<Long, String[]> level2AuthorityDescriptionMap = menuService.getMenu2AuthNameMap(CollectionUtils.toSet(l2Menus, SideMenuLevel2Menu::getId));
		jRes.put("blockAuthDescMap", JsonUtils.convertToStringKeyMap(blockAuthorityDescriptionMap));
		jRes.put("l1AuthDescMap", JsonUtils.convertToStringKeyMap(level1AuthorityDescriptionMap));
		jRes.put("l2AuthDescMap", JsonUtils.convertToStringKeyMap(level2AuthorityDescriptionMap));
		
		return jRes;
		
	}
	
	@ResponseBody
	@RequestMapping("/modules")
	public ResponseJSON getAllModules() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<Module> modules = configService.getEnabledModules();
		Set<String> moduleNames = CollectionUtils.toSet(modules, Module::getName);
		Map<String, List<TemplateGroup>> tmplGroupsMap = tmplGroupService.queryModuleGroups(moduleNames);
		Map<String, StatModuleDetail> statDetailMap = statViewService.getStatModuleDetail(moduleNames);
		JSONArray jModules = new JSONArray();
		for (Module module : modules) {
			JSONObject jModule = (JSONObject) JSON.toJSON(module);
			jModules.add(jModule);
			if(statDetailMap.containsKey(module.getName())) {
				StatModuleDetail statDetail = statDetailMap.get(module.getName());
				jModule.put("statDetail", statDetail);
			}else if(tmplGroupsMap.containsKey(module.getName())) {
				List<TemplateGroup> tmplGroupList = tmplGroupsMap.get(module.getName());
				JSONArray jTmplGroups = new JSONArray();
				jModule.put("tmplGroups", jTmplGroups);
				for (TemplateGroup tmplGroup : tmplGroupList) {
					JSONObject jTmplGroup = new JSONObject();
					jTmplGroup.put("id", tmplGroup.getId());
					jTmplGroup.put("title", tmplGroup.getTitle());
					jTmplGroups.add(jTmplGroup);
				}
			}
		}
		jRes.put("modules", jModules);
		return jRes;
		
	}
	
	
	@ResponseBody
	@RequestMapping("/custom_pages")
	public ResponseJSON getCustomPages() {
		JSONObjectResponse jRes = new JSONObjectResponse();
		List<CustomPage> customPages = customPageService.getCustomPageList();
		jRes.put("customPages", customPages);
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/custom_page/save")
	public ResponseJSON addCustomPage(CustomPage customPage) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			customPageService.save(customPage);
			jRes.setStatus("suc");
			jRes.put("customPageId", customPage.getId());
		} catch (Exception e) {
			jRes.setStatus("error");
			logger.error("保存自定义页面时发生错误", e);
		}
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/custom_page/remove/{customPageId}")
	public ResponseJSON removeCustomPage(@PathVariable Long customPageId) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		try {
			customPageService.remove(customPageId);
			jRes.setStatus("suc");
		} catch (Exception e) {
			jRes.setStatus("error");
			logger.error("移除自定义页面是发生错误", e);
		}
		return jRes;
	}
	
	
	
	@ResponseBody
	@RequestMapping("/save_blocks")
	public ResponseJSON saveBlocks(@RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		JSONArray jBlocks = jReq.getJsonObject().getJSONArray("blocks");
		try {
			List<SideMenuBlock> blocks = toBlocks(jBlocks);
			menuService.updateSideMenuBlocks(blocks);
			jRes.setStatus("suc");
		} catch (Exception e) {
			jRes.setStatus("error");
			logger.error("保存版块失败", e);
		}
		return jRes;
		
	}

	private List<SideMenuBlock> toBlocks(JSONArray jBlocks) {
		int blockIndex = 0;
		List<SideMenuBlock> blocks = new ArrayList<SideMenuBlock>();
		for (Object obj : jBlocks) {
			JSONObject jBlock = (JSONObject) obj;
			SideMenuBlock block = new SideMenuBlock();
			blocks.add(block);
			block.setId(jBlock.getLong("id"));
			block.setTitle(jBlock.getString("title"));
			block.setOrder(blockIndex++);
			block.setAuthorities(jBlock.getString("authorities"));
			block.setL1Menus(new ArrayList<SideMenuLevel1Menu>());
			JSONArray jL1Menus = jBlock.getJSONArray("l1Menus");
			int l1MenuIndex = 0;
			for (Object x : jL1Menus) {
				JSONObject jL1Menu = (JSONObject) x;
				SideMenuLevel1Menu l1menu = new SideMenuLevel1Menu();
				l1menu.setId(jL1Menu.getLong("id"));
				l1menu.setTitle(jL1Menu.getString("title"));
				l1menu.setAuthorities(jL1Menu.getString("authorities"));
				l1menu.setOrder(l1MenuIndex++);
				l1menu.setLevel2s(new ArrayList<>());
				JSONArray jL2Memus = jL1Menu.getJSONArray("l2Menus");
				int l2MenuIndex = 0;
				for (Object y : jL2Memus) {
					JSONObject jL2Menu = (JSONObject) y;
					SideMenuLevel2Menu l2menu = new SideMenuLevel2Menu();
					l2menu.setId(jL2Menu.getLong("id"));
					l2menu.setTitle(jL2Menu.getString("title"));
					l2menu.setOrder(l2MenuIndex++);
					l2menu.setTemplateGroupId(jL2Menu.getLong("templateGroupId"));
					l2menu.setStatViewId(jL2Menu.getLong("statViewId"));
					l2menu.setCustomPageId(jL2Menu.getLong("customPageId"));
					l2menu.setAuthorities(jL2Menu.getString("authorities"));
					l1menu.getLevel2s().add(l2menu);
				}
				block.getL1Menus().add(l1menu);
			}
		}
		return blocks;
	}
	
}
