package cho.carbon.hc.hydrocarbon.model.api2.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.karuiserv.pojo.KaruiServ;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.hydrocarbon.model.config.pojo.MenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuBlock;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;

public interface MetaJsonService {

	JSONObject toMenuJson(SideMenuLevel2Menu menu);

	JSONObject toModuleJson(ModuleMeta module);

	JSONObject toButtonStatus(TemplateGroup tmplGroup);

	List<MenuBlock> convertBlocksJson(List<SideMenuBlock> blocks, UserDetails user);

	JSONArray convertKaruiServJson(List<KaruiServ> ksList);

}
