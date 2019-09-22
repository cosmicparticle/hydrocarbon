package cho.carbon.hc.hydrocarbon.admin.controller.main;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SystemConfig;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigAuthencationService;
import cho.carbon.hc.hydrocarbon.model.config.service.ConfigureService;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;

@Controller
@RequestMapping("/admin")
public class  AdminMainController {
	
	@Resource
	SideMenuService menuService;
	
	@Resource
	AuthorityService authService;

	@Resource
	ConfigAuthencationService confAuthenService;
	
	@Resource
	ConfigureService configService;
	
	@RequestMapping("/login")
	public String login(@RequestParam(name="error",required=false) String error, Model model){
		model.addAttribute("error", error);
		model.addAttribute("errorMap", AdminConstants.ERROR_CODE_MAP);
		return "/admin/common/login.jsp";
	}
	
	@RequestMapping({"/", "", "/block/{blockId}", "/menu/{menuId}"})
	public String index(@PathVariable(required = false) Long blockId, @PathVariable(required = false) Long menuId, Model model){
		UserIdentifier user = UserUtils.getCurrentUser();
		SystemConfig sysConfig = configService.getSystemConfig();
		SideMenuBlock block = null;
		if(blockId != null) {
			block = menuService.getBlock(blockId);
		}
		if(menuId != null) {
			SideMenuLevel2Menu l2Menu = authService.validateUserL2MenuAccessable((UserDetails) user, menuId);
			if(l2Menu != null) {
				block = menuService.getBlock(l2Menu.getLevel1Menu().getBlockId());
			}else {
				return null;
			}
		}
		if(block == null) {
			block = menuService.getBlock(sysConfig.getDefaultBlockId());
		}
		
		
		Map<Long, Boolean> l1disables = new HashMap<Long, Boolean>(),
					l2disables = new HashMap<Long, Boolean>();
		List<SideMenuLevel1Menu> menus = menuService.getSideMenuLevelMenus(user);
		menus.forEach(l1->{
			try {
				authService.validateL1MenuAccessable(l1.getId());
				for(SideMenuLevel2Menu l2 : l1.getLevel2s()) {
					try {
						authService.validateL2MenuAccessable(l2.getId());
					} catch (Exception e) {
						l2disables.put(l2.getId(), true);
					}
				}
			} catch (NonAuthorityException e) {
				l1disables.put(l1.getId(), true);
			}
		});
		List<SideMenuBlock> blocks = null;
		if(!Integer.valueOf(1).equals(sysConfig.getOnlyShowDefaultBlock())) {
			blocks = menuService.getAllBlocks();
			Iterator<SideMenuBlock> itr = blocks.iterator();
			while(itr.hasNext()) {
				SideMenuBlock thisBlock = itr.next();
				try {
					authService.validateUserBlockAccessable((UserDetails) user, thisBlock.getId());
				} catch (NonAuthorityException e) {
					itr.remove();
				}
			}
		}
		model.addAttribute("sysConfig", sysConfig);
		model.addAttribute("blocks", blocks);
		model.addAttribute("user", user);
		model.addAttribute("block", block);
		model.addAttribute("menuId", menuId);
		model.addAttribute("l1disables", l1disables);
		model.addAttribute("l2disables", l2disables);
		model.addAttribute("configAuth", confAuthenService.getAdminConfigAuthen());
		return "/admin/index.jsp";
	}
	
}
