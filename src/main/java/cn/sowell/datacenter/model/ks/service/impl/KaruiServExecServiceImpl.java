package cn.sowell.datacenter.model.ks.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.common.ApiUser;
import cn.sowell.datacenter.common.EntityQueryPoolUtils;
import cn.sowell.datacenter.entityResolver.CEntityPropertyParser;
import cn.sowell.datacenter.entityResolver.EntityConstants;
import cn.sowell.datacenter.entityResolver.ModuleEntityPropertyParser;
import cn.sowell.datacenter.model.ks.service.KaruiServExecService;
import cn.sowell.dataserver.Constants;
import cn.sowell.dataserver.model.abc.service.EntityQueryParameter;
import cn.sowell.dataserver.model.abc.service.ModuleEntityService;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.EntityJsonMeta;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.JsonMetaComposite;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.JsonMetaField;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.JsonMetaProperty;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.JsonMetaRelationLabel;
import cn.sowell.dataserver.model.karuiserv.jsonresolver.JsonMetaResolver;
import cn.sowell.dataserver.model.karuiserv.match.KaruiEntityQueryCriteria;
import cn.sowell.dataserver.model.karuiserv.match.KaruiServMatcher;
import cn.sowell.dataserver.model.karuiserv.pojo.KaruiServ;
import cn.sowell.dataserver.model.karuiserv.pojo.KaruiServCriteria;
import cn.sowell.dataserver.model.karuiserv.service.KaruiServService;
import cn.sowell.dataserver.model.modules.service.view.EntityQuery;
import cn.sowell.dataserver.model.modules.service.view.EntityQueryPool;
import cn.sowell.dataserver.model.modules.service.view.PagedEntityList;
import cn.sowell.dataserver.model.tmpl.service.ArrayItemFilterService;

@Service
public class KaruiServExecServiceImpl implements KaruiServExecService {
	@Resource
	KaruiServService ksService;

	@Resource
	ModuleEntityService entityService;

	@Resource
	ApplicationContext appContext;

	@Resource
	ArrayItemFilterService arrayItemFilterService;

	AntPathMatcher antPathMatcher = new AntPathMatcher();

	@Override
	public KaruiServMatcher match(String path, Map<String, String> parameters, String prefix) {
		List<KaruiServ> ksList = ksService.queryAll();

		for (KaruiServ ks : ksList) {
			String ksPath = prefix + ks.getPath();
			if (!Constants.TRUE.equals(ks.getDisabled()) && antPathMatcher.match(ksPath, path)) {
				KaruiServMatcher matcher = new KaruiServMatcher();
				matcher.setKaruiServ(ks);
				Map<String, String> vars = antPathMatcher.extractUriTemplateVariables(ksPath, path);
				matcher.setPathVariableMap(vars);
				matcher.setParameters(parameters);
				return matcher;
			}
		}
		return null;
	}

	@Override
	public JSON executeKaruiServ(KaruiServMatcher matcher, ApiUser user) {
		KaruiServ ks = matcher.getKaruiServ();
		String ksType = ks.getType();
		if (KaruiServ.TYPE_SINGLE_QUERY.equals(ksType) || KaruiServ.TYPE_MULTI_QUERY.equals(ksType)) {
			// 获得查询池
			EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
			// 注册一个查询
			EntityQuery query = qPool.regist();
			query.setModuleName(matcher.getKaruiServ().getModule()).setKaruiServ(ks);
			KaruiEntityQueryCriteria qCriteria = getEntityQueryCriteria(matcher);
			query.doPrepareForKaruiServ(qCriteria, appContext);
			if (ks.getResponseJsonMetaResolver() == null) {
				synchronized (ks) {
					if (ks.getResponseJsonMetaResolver() == null) {
						ks.setResponseJsonMetaResolver(
								new JsonMetaResolver(toJsonMeta(ks.getResponseMeta()), ks.getDetailTemplate()));
					}
				}
			}
			if (KaruiServ.TYPE_SINGLE_QUERY.equals(ks.getType())) {
				ModuleEntityPropertyParser entity = (ModuleEntityPropertyParser) query.uniqueResult();
				return ks.getResponseJsonMetaResolver().resolve(entity);
			} else {
				JSONObject jResult = new JSONObject();
				jResult.put("queryKey", query.getKey());
				return jResult;
			}
		} else if (KaruiServ.TYPE_SINGLE_UPDATE.equals(ksType)) {
			String moduleName = ks.getDetailTemplate().getModule();
			EntityQueryParameter param = new EntityQueryParameter(moduleName, user);
			param.setArrayItemCriterias(
					arrayItemFilterService.getArrayItemFilterCriterias(ks.getDetailTemplate().getId(), user));
			if (ks.getRequestJsonMetaResolver() == null) {
				synchronized (ks) {
					if (ks.getRequestJsonMetaResolver() == null) {
						ks.setRequestJsonMetaResolver(
								new JsonMetaResolver(toJsonMeta(ks.getRequestPostMeta()), ks.getDetailTemplate()));
					}
				}
			}
			String code = entityService.mergeEntity(param,
					ks.getRequestJsonMetaResolver().resolve(matcher.getParameters().get("JSONENTITY")));

			if (code != null) {// 执行查询
				if(ks.getResponseMeta()==null) {//若果没有定义需要返回的entity信息，直接返回 code
					JSONObject jResult = new JSONObject();
					jResult.put("code", code);
					return jResult;
				}
				EntityQueryParameter queryParam = new EntityQueryParameter(moduleName, code, user);
				queryParam.setArrayItemCriterias(
						arrayItemFilterService.getArrayItemFilterCriterias(ks.getDetailTemplate().getId(), user));
				ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);
				if (ks.getResponseJsonMetaResolver() == null) {
					synchronized (ks) {
						if (ks.getResponseJsonMetaResolver() == null) {
							ks.setResponseJsonMetaResolver(
									new JsonMetaResolver(toJsonMeta(ks.getResponseMeta()), ks.getDetailTemplate()));
						}
					}
				}
				return ks.getResponseJsonMetaResolver().resolve(entity);
			}
		}
		return null;
	}

	@Override
	public JSONObject queryPagedEntities(String queryKey, Integer pageNo, Integer pageSize, ApiUser user) {
		EntityQueryPool pool = EntityQueryPoolUtils.getEntityQueryPool(user);
		EntityQuery query = pool.getQuery(queryKey);
		JSONObject jResult = new JSONObject();
		if (query != null && query.getKaruiServ() != null) {
			if (pageSize != null) {
				query.setPageSize(pageSize);
			}
			PagedEntityList parsers = query.pageList(pageNo);
			if (parsers != null) {
				jResult.put("isEndList", parsers.getIsEndList());
				JSONArray jEntities = new JSONArray();
				for (CEntityPropertyParser entity : parsers.getParsers()) {
					JSONObject jEntity = query.getKaruiServ().getResponseJsonMetaResolver()
							.resolve((ModuleEntityPropertyParser) entity);
					jEntities.add(jEntity);
				}
				jResult.put("entities", jEntities);
			}
		} else {
			jResult.put("error", "unknown queryKey");
		}
		return jResult;
	}

	// 此法，每次都对json进行解析，着实影响效率
	private EntityJsonMeta toJsonMeta(String responseMeta) {
		JSONObject jMeta = JSON.parseObject(responseMeta);
		EntityJsonMeta jsonMeta = new EntityJsonMeta();
		jsonMeta.setFields(toJsonMetaFields(null, jMeta.getJSONObject("fields")));
		return jsonMeta;
	}

	private List<JsonMetaField> toJsonMetaFields(JsonMetaField parent, JSONObject jFields) {
		if (jFields != null) {
			List<JsonMetaField> metaFields = new ArrayList<JsonMetaField>();
			jFields.forEach((fieldName, jObj) -> {
				JSONObject jField = (JSONObject) jObj;
				String fieldType = jField.getString("type");
				if ("normal".equals(fieldType)) {
					JsonMetaComposite composite = new JsonMetaComposite();
					setCompositeData(parent, jField, fieldName, composite);
					metaFields.add(composite);
				} else if ("array".equals(fieldType)) {
					JsonMetaComposite composite = new JsonMetaComposite();
					setCompositeData(parent, jField, fieldName, composite);
					metaFields.add(composite);
				} else if (parent instanceof JsonMetaComposite
						&& jField.getString("dtmplFieldId").equals(EntityConstants.LABEL_KEY)) {
					JsonMetaRelationLabel label = new JsonMetaRelationLabel();
					setFieldData(parent, jField, fieldName, label);
					label.setLabel(jField.getBoolean("label"));
					metaFields.add(label);
				} else {
					JsonMetaProperty metaProperty = new JsonMetaProperty();
					setFieldData(parent, jField, fieldName, metaProperty);
					metaProperty.setDtmplFieldId(jField.getLong("dtmplFieldId"));
					metaProperty.setFieldId(jField.getLong("fieldId"));
					metaFields.add(metaProperty);
				}
			});
			return metaFields;
		} else {
			return null;
		}
	}

	private void setCompositeData(JsonMetaField parent, JSONObject jField, String fieldName,
			JsonMetaComposite composite) {
		setFieldData(parent, jField, fieldName, composite);
		composite.setType(jField.getString("type"));
		composite.setDtmplCompositeId(jField.getLong("dtmplCompositeId"));
		composite.setCompositeId(jField.getLong("compositeId"));
		JSONObject jFields = jField.getJSONObject("fields");
		if (jFields != null) {
			composite.setFields(toJsonMetaFields(composite, jFields));
		}
	}

	private void setFieldData(JsonMetaField parent, JSONObject source, String fieldName, JsonMetaField field) {
		field.setName(fieldName);
		field.setDesc(source.getString("desc"));
		field.setParent(parent);
		field.setDisabled(Boolean.TRUE.equals(source.getBoolean("disabled")));
	}

	private KaruiEntityQueryCriteria getEntityQueryCriteria(KaruiServMatcher matcher) {
		KaruiEntityQueryCriteria queryCriteria = new KaruiEntityQueryCriteria();
		KaruiServ ks = matcher.getKaruiServ();

		List<KaruiServCriteria> criterias = ks.getCriterias();
		for (KaruiServCriteria criteria : criterias) {
			String paramName = criteria.getName();
			String paramValue = null;
			if (KaruiServCriteria.SOURCE_PATH_VAR.equals(criteria.getSource())) {
				paramValue = matcher.getPathVariableMap().get(paramName);
			} else if (KaruiServCriteria.SOURCE_PARAM.equals(criteria.getSource())) {
				paramValue = matcher.getParameters().get(paramName);
			} else if (KaruiServCriteria.SOURCE_CONSTANT.equals(criteria.getSource())) {
				paramValue = criteria.getConstantValue();
			}
			putCriteria(queryCriteria, criteria, paramValue);
		}
		return queryCriteria;
	}

	private void putCriteria(KaruiEntityQueryCriteria queryCriteria, KaruiServCriteria criteria, String paramValue) {
		// 如果条件不为空的话就将其放到条件条件中
		if (paramValue != null) {
			if (criteria.getLtmplFieldId() != null) {
				queryCriteria.putRequrestLtmplCriteria(criteria.getLtmplFieldId(), paramValue);
			} else if (criteria.getFieldId() != null) {
				// TODO：直接根据字段主键添加条件
			}
		}
	}
}
