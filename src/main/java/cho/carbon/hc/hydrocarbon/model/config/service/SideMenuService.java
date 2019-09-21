package cho.carbon.hc.hydrocarbon.model.config.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cn.sowell.copframe.common.UserIdentifier;

public interface SideMenuService {
	SideMenuLevel2Menu getLevel2Menu(Long menuId);

	List<SideMenuLevel1Menu> getSideMenuLevelMenus(UserIdentifier user);

	void updateSideMenuModules(UserIdentifier user, List<SideMenuLevel1Menu> modules);

	SideMenuLevel1Menu getLevel1Menu(Long menuId);

	Map<Long, String[]> getBlockAuthNameMap(Set<Long> set);
	
	Map<Long, String[]> getMenu1AuthNameMap(Set<Long> level1MenuId);

	Map<Long, String[]> getMenu2AuthNameMap(Set<Long> level2MenuId);

	void reloadMenuMap();

	SideMenuBlock getBlock(Long blockId);

	List<SideMenuBlock> getAllBlocks();

	void updateSideMenuBlocks(List<SideMenuBlock> blocks);

}
