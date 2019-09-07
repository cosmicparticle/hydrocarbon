package cn.sowell.datacenter.model.modules.service;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.entityResolver.ModuleEntityPropertyParser;
import cn.sowell.datacenter.entityResolver.impl.RelSelectionEntityPropertyParser;
import cn.sowell.datacenter.model.modules.bean.EntityDetail;
import cn.sowell.dataserver.model.modules.pojo.EntityVersionItem;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailTemplate;

public interface EntityConvertService {
	EntityDetail convertEntityDetail(ModuleEntityPropertyParser entity, TemplateDetailTemplate dtmpl); 

	JSONArray toHistoryItems(List<EntityVersionItem> historyItems, String currentCode);

	//JSONArray toErrorItems(List<ErrorInfomation> errors);

	/**
	 * 将实体根据字段标识，转换成指定的Json对象
	 * @param entityMap
	 * @param fieldNames 关系实体字段的fullName集合，传入该对象，则返回的对象的每个实体JSON都会有byNames字段，内的key就是fullName
	 * @param dfieldIdNameMap 关系实体字段的id->fullName映射对象，传入该对象，则返回的对象的每个实体JSON都会有byDfieldIds字段，内的key就是字段id。
	 * 			并且在主对象里会有一个dFieldIdNameMap字段，是id->fullName映射关系
	 * @return
	 */
	JSONObject toEntitiesJson(Map<String, RelSelectionEntityPropertyParser> entityMap, Set<String> fieldNames, Map<Long, String> dfieldIdNameMap);

	
}
