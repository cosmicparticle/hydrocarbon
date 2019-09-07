package cn.sowell.datacenter.model.api2.service.impl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.model.api2.service.MetaJsonService;
import cn.sowell.datacenter.model.config.pojo.MenuBlock;
import cn.sowell.datacenter.model.config.pojo.MenuLevel1;
import cn.sowell.datacenter.model.config.pojo.SideMenuBlock;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel1Menu;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel2Menu;
import cn.sowell.datacenter.model.config.service.AuthorityService;
import cn.sowell.dataserver.model.karuiserv.pojo.KaruiServ;
import cn.sowell.dataserver.model.modules.pojo.ModuleMeta;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroup;

@Service
public class MetaJsonServiceImpl implements MetaJsonService{

	@Resource
	AuthorityService authService;
	
	@Override
	public JSONObject toMenuJson(SideMenuLevel2Menu menu) {
		if(menu != null) {
			JSONObject jMenu = new JSONObject();
			jMenu.put("id", menu.getId());
			jMenu.put("title", menu.getTitle());
			return jMenu;
		}
		return null;
	}

	@Override
	public JSONObject toModuleJson(ModuleMeta module) {
		if(module != null) {
			JSONObject jModule = new JSONObject();
			jModule.put("name", module.getName());
			jModule.put("title", module.getTitle());
			return jModule;
		}
		return null;
	}

	@Override
	public JSONObject toButtonStatus(TemplateGroup tmplGroup) {
		if(tmplGroup != null) {
			JSONObject jStatus = new JSONObject();
			jStatus.put("saveButton", !isTrue(tmplGroup.getHideSaveButton()));
			jStatus.put("createButton", !isTrue(tmplGroup.getHideCreateButton()));
			jStatus.put("deleteButton", !isTrue(tmplGroup.getHideDeleteButton()));
			jStatus.put("exportButton", !isTrue(tmplGroup.getHideExportButton()));
			jStatus.put("importButton", !isTrue(tmplGroup.getHideImportButton()));
			jStatus.put("queryButton", !isTrue(tmplGroup.getHideQueryButton()));
			jStatus.put("treeToggleButton", !isTrue(tmplGroup.getHideTreeToggleButton()));
			return jStatus;
		}
		return null;
	}

	private boolean isTrue(Integer hideSaveButton) {
		return Integer.valueOf(1).equals(hideSaveButton);
	}

	@Override
	public List<MenuBlock> convertBlocksJson(List<SideMenuBlock> blocks, UserDetails user) {
		List<MenuBlock> jBlocks = new ArrayList<MenuBlock>();
		for (SideMenuBlock block : blocks) {
			try {
				if(user != null) {
					authService.validateUserBlockAccessable(user, block.getId());
				}
				MenuBlock jBlock = new MenuBlock();
				jBlocks.add(jBlock);
				jBlock.setId(block.getId());
				jBlock.setTitle(block.getTitle());
				jBlock.setOrder(block.getOrder());
				jBlock.setAuthorities(block.getAuthorities());
				if(block.getL1Menus() != null) {
					List<MenuLevel1>  jL1Menus = new ArrayList<MenuLevel1>();
					jBlock.setL1Menus(jL1Menus);
					for (SideMenuLevel1Menu l1Menu : block.getL1Menus()) {
						try {
							if(user != null) {
								authService.validateUserL1MenuAccessable(user, l1Menu.getId());
							}
							MenuLevel1 jL1Menu = new MenuLevel1();
							jL1Menu.setId(l1Menu.getId());
							jL1Menu.setTitle(l1Menu.getTitle());
							jL1Menu.setAuthorities(l1Menu.getAuthorities());
							jL1Menu.setOrder(l1Menu.getOrder());
							jL1Menus.add(jL1Menu);
							if(l1Menu.getLevel2s() != null) {
								List<SideMenuLevel2Menu> l2Menus = new ArrayList<SideMenuLevel2Menu>();
								jL1Menu.setL2Menus(l2Menus);
								for (SideMenuLevel2Menu l2Menu : l1Menu.getLevel2s()) {
									try {
										if(user != null) {
											authService.validateUserL2MenuAccessable(user, l2Menu.getId());
										}
										l2Menus.add(l2Menu);
									} catch (Exception e) {}
								}
							}
						} catch (Exception e1) {}
					}
				}
				
			} catch (Exception e) {}
		}
		return jBlocks;
	}

	@Override
	public JSONArray convertKaruiServJson(List<KaruiServ> ksList) {
		return (JSONArray) JSON.toJSON(ksList);
	}

	
}
