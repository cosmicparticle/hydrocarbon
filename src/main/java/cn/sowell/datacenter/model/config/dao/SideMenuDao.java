package cn.sowell.datacenter.model.config.dao;

import java.util.List;
import java.util.Map;

import cn.sowell.datacenter.model.config.pojo.SideMenuBlock;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel1Menu;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel2Menu;

public interface SideMenuDao {

	List<SideMenuLevel1Menu> getSideMenus();

	SideMenuLevel2Menu getLevel2Menu(Long menuId);

	Map<Long, List<SideMenuLevel2Menu>> querySideMenuLevel2Map();

	List<SideMenuBlock> getAllBlocks();

}
