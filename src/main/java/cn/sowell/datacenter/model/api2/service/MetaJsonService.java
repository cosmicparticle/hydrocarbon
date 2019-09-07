package cn.sowell.datacenter.model.api2.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.model.config.pojo.MenuBlock;
import cn.sowell.datacenter.model.config.pojo.SideMenuBlock;
import cn.sowell.datacenter.model.config.pojo.SideMenuLevel2Menu;
import cn.sowell.dataserver.model.karuiserv.pojo.KaruiServ;
import cn.sowell.dataserver.model.modules.pojo.ModuleMeta;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroup;

public interface MetaJsonService {

	JSONObject toMenuJson(SideMenuLevel2Menu menu);

	JSONObject toModuleJson(ModuleMeta module);

	JSONObject toButtonStatus(TemplateGroup tmplGroup);

	List<MenuBlock> convertBlocksJson(List<SideMenuBlock> blocks, UserDetails user);

	JSONArray convertKaruiServJson(List<KaruiServ> ksList);

}
