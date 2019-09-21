package cho.carbon.hc.hydrocarbon.model.config.dao;

import java.util.List;
import java.util.Map;

import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel1Menu;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;

public interface SideMenuDao {

	List<SideMenuLevel1Menu> getSideMenus();

	SideMenuLevel2Menu getLevel2Menu(Long menuId);

	Map<Long, List<SideMenuLevel2Menu>> querySideMenuLevel2Map();

	List<SideMenuBlock> getAllBlocks();

}
