package cho.carbon.hc.hydrocarbon.model.modules.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryComposite;
import cho.carbon.hc.dataserver.model.modules.pojo.EntityVersionItem;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.entityResolver.EntityConstants;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.impl.ABCNodeProxy;
import cho.carbon.hc.entityResolver.impl.ArrayItemPropertyParser;
import cho.carbon.hc.entityResolver.impl.RelSelectionEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityArrayItemDetail;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityDetail;
import cho.carbon.hc.hydrocarbon.model.modules.service.EntityConvertService;
import cn.sowell.copframe.utils.TextUtils;

@Service
public class EntityConvertServiceImpl implements EntityConvertService{

	@Resource
	DetailTemplateService dtmplService;
	
	static Logger logger = Logger.getLogger(EntityConvertServiceImpl.class);
	
	
	@Override
	public EntityDetail convertEntityDetail(ModuleEntityPropertyParser entity, TemplateDetailTemplate dtmpl) {
		Assert.notNull(entity);
		long start = System.currentTimeMillis();
		EntityDetail detail = new EntityDetail(entity.getCode(), entity.getTitle());
		for (TemplateDetailFieldGroup group : dtmpl.getGroups()) {
			DictionaryComposite composite = group.getComposite();
			if(composite != null) {
				if(Integer.valueOf(1).equals(composite.getIsArray())) {
					List<ArrayItemPropertyParser> arrayItems = entity.getCompositeArray(composite.getName());
					if(arrayItems != null) {
						List<EntityArrayItemDetail> arrayItemDetails = new ArrayList<>();
						detail.getArrayMap().put(group.getId().toString(), arrayItemDetails);
						int index = 0;
						for (ArrayItemPropertyParser arrayItem : arrayItems) {
							EntityArrayItemDetail arrayItemDetail = new EntityArrayItemDetail(arrayItem.getCode());
							arrayItemDetail.setIndex(index++);
							if(composite.getRelationKey() != null) {
								arrayItemDetail.setRelationlabel(arrayItem.getFormatedProperty(composite.getName() + "." + EntityConstants.LABEL_KEY));
							}
							for (TemplateDetailField field : group.getFields()) {
								long arrayitemFieldStart = System.currentTimeMillis();
								String fieldValue = arrayItem.getFormatedProperty(field.getFieldName());
								arrayItemDetail.getFieldMap().put(field.getId().toString(), fieldValue);
								logger.debug("转换ArrayItem字段(" + composite.getName() + "[" + arrayItem.getItemIndex() + "]." + field.getFieldName() + ")使用时间：" + (System.currentTimeMillis() - arrayitemFieldStart));
							}
							arrayItemDetails.add(arrayItemDetail);
						}
					}
				}
			}else {
				for (TemplateDetailField field : group.getFields()) {
					long fieldStart = System.currentTimeMillis();
					String fieldValue = entity.getFormatedProperty(field.getFieldName());
					detail.getFieldMap().put(field.getId().toString(), fieldValue);
					logger.debug("转换字段[" + field.getFieldName() + "]使用时间：" + (System.currentTimeMillis() - fieldStart));
				}
			}
		}
		logger.debug("parser转换json使用时间:" + (System.currentTimeMillis() - start) + "ms");
		return detail;
	}

	@Override
	public JSONArray toHistoryItems(List<EntityVersionItem> historyItems, String currentCode) {
		JSONArray aHistoryItems = new JSONArray();
		if(historyItems != null) {
			historyItems.sort((a,b)->Long.compare(b.getTimeKey(), a.getTimeKey()));
			boolean hasCurrentId = TextUtils.hasText(currentCode);
			for (EntityVersionItem historyItem : historyItems) {
				JSONObject jHistoryItem = new JSONObject();
				aHistoryItems.add(jHistoryItem);
				jHistoryItem.put("code", historyItem.getCode());
				jHistoryItem.put("userName", historyItem.getUserName());
				jHistoryItem.put("time", historyItem.getTime());
				jHistoryItem.put("monthKey", historyItem.getMonthKey());
				if(hasCurrentId && historyItem.getCode().equals(currentCode)) {
					jHistoryItem.put("current", true);
				}
			}
			if(!hasCurrentId && !aHistoryItems.isEmpty()) {
				((JSONObject)aHistoryItems.get(0)).put("current", true);
			}
		}
		return aHistoryItems;
	}

//	@Override
//	public JSONArray toErrorItems(List<ErrorInfomation> errors) {
//		JSONArray jArray = new JSONArray();
//		if(errors != null) {
//			for (ErrorInfomation error : errors) {
//				JSONObject jError = new JSONObject();
//				jError.put("id", error.getId().longValue());
//				jError.put("code", error.getError_code());
//				jError.put("content", error.getError_content());
//				jError.put("message", error.getError_str());
//				jArray.add(jError);
//			}
//		}
//		return jArray;
//	}

	@Override
	public JSONObject toEntitiesJson(Map<String, RelSelectionEntityPropertyParser> entityMap, 
			Set<String> fieldNames, Map<Long, String> dfieldIdNameMap) {
		JSONObject json = new JSONObject();
		if(entityMap != null) {
			JSONArray jEntites = new JSONArray();
			json.put("entities", jEntites);
			if(dfieldIdNameMap != null) {
				JSONObject jDfieldIdNameMap = new JSONObject();
				json.put("dFieldIdNameMap", jDfieldIdNameMap);
				dfieldIdNameMap.forEach((dfieldId, fieldName)->{
					jDfieldIdNameMap.put(dfieldId.toString(), fieldName);
				});
			}
			entityMap.forEach((code, parser)->{
				JSONObject jEntity = new JSONObject();
				jEntity.put(ABCNodeProxy.CODE_PROPERTY_NAME_NORMAL, parser.getCode());
				jEntites.add(jEntity);
				JSONObject jFieldContainer = new JSONObject();
				if(fieldNames != null) {
					jEntity.put("byNames", jFieldContainer);
					for (String fieldName : fieldNames) {
						jFieldContainer.put(fieldName, parser.getFormatedProperty(fieldName));
					}
				}else if(dfieldIdNameMap != null) {
					jEntity.put("byDfieldIds", jFieldContainer);
					dfieldIdNameMap.forEach((dfieldId, fieldName)->{
						jFieldContainer.put(dfieldId.toString(), parser.getFormatedProperty(fieldName));
					});
				}
			});
		}
		return json;
	}

}
