package cho.carbon.hc.hydrocarbon.api.controller.entity;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.copframe.web.poll.WorkProgress;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryComposite;
import cho.carbon.hc.dataserver.model.modules.bean.ExportDataPageInfo;
import cho.carbon.hc.dataserver.model.modules.pojo.EntityVersionItem;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.ViewDataService;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityView;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityViewCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.ListTemplateEntityView;
import cho.carbon.hc.dataserver.model.modules.service.view.ListTemplateEntityViewCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.SelectionTemplateEntityView;
import cho.carbon.hc.dataserver.model.modules.service.view.SelectionTemplateEntityViewCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityView.EntityColumn;
import cho.carbon.hc.dataserver.model.service.EntitiesQueryParameter;
import cho.carbon.hc.dataserver.model.service.EntityFusionRunner;
import cho.carbon.hc.dataserver.model.service.EntityQueryParameter;
import cho.carbon.hc.dataserver.model.service.ModuleEntityService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupJump;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListColumn;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateSelectionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ListCriteriaFactory;
import cho.carbon.hc.dataserver.model.tmpl.service.SelectionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.entityResolver.CEntityPropertyParser;
import cho.carbon.hc.entityResolver.EntityConstants;
import cho.carbon.hc.entityResolver.FieldParserDescription;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.UserCodeService;
import cho.carbon.hc.entityResolver.impl.ABCNodeProxy;
import cho.carbon.hc.entityResolver.impl.ArrayItemPropertyParser;
import cho.carbon.hc.entityResolver.impl.RelSelectionEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.SessionKey;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.modules.AdminModulesController;
import cho.carbon.hc.hydrocarbon.api.controller.APiDataNotFoundException;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.common.RequestParameterMapComposite;
import cho.carbon.hc.hydrocarbon.model.admin.service.AdminUserService;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.modules.service.ExportService;

@Controller
@RequestMapping("/api/entity/curd")
public class ApiEntityController {

	@Resource
	AdminUserService userService;

	@Resource
	AuthorityService authService;

	@Resource
	TemplateGroupService tmplGroupService;

	@Resource
	DetailTemplateService dtmplService;

	@Resource
	SelectionTemplateService stmplService;

	@Resource
	ActionTemplateService atmplService;

	@Resource
	ViewDataService vService;

	@Resource
	ModulesService mService;

	@Resource
	ExportService eService;

	@Resource
	ActionTemplateService actService;

	@Resource
	ListCriteriaFactory lCriteriaFactory;

	@Resource
	UserCodeService userCodeService;

	@Resource
	ModuleEntityService entityService;

	@Resource
	ArrayItemFilterService arrayItemFilterService;

	static Logger logger = Logger.getLogger(ApiEntityController.class);

	@ResponseBody
	@RequestMapping("/list/{menuId}")
	public ResponseJSON list(@PathVariable Long menuId, PageInfo pageInfo, HttpServletRequest request, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		String moduleName = menu.getTemplateModule();
		ModuleMeta module = mService.getModule(moduleName);

		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());

		// 创建条件对象
		ListTemplateEntityViewCriteria criteria = new ListTemplateEntityViewCriteria();
		// 设置条件
		criteria.setModule(moduleName);
		criteria.setTemplateGroupId(menu.getTemplateGroupId());
		Map<Long, String> criteriaMap = lCriteriaFactory.exractTemplateCriteriaMap(request);
		criteria.setTemplateCriteriaMap(criteriaMap);
		criteria.setPageInfo(pageInfo);
		criteria.setUser(user);
		// 执行查询
		ListTemplateEntityView view = (ListTemplateEntityView) vService.query(criteria);

		// 导出状态获取
		String uuid = (String) user.getCache(SessionKey.EXPORT_ENTITY_STATUS_UUID);
		if (uuid != null) {
			WorkProgress progress = eService.getExportProgress(uuid);
			if (progress != null && !progress.isBreaked()) {
				res.put("exportProgress", toProgressJson(progress));
			}
		}

		res.put("module", toModule(module));
		res.put("ltmpl", toListTemplate(view.getListTemplate()));
		res.put("entities", toEntities(view));
		res.put("pageInfo", view.getCriteria().getPageInfo());
		res.put("criterias", toCriterias(view, criteria));
		res.put("actions", toActions(tmplGroup.getActions(), TemplateGroupAction.ACTION_FACE_LIST));
		res.put("actions", toJumps(tmplGroup.getJumps(), TemplateGroupJump.JUMP_FACE_LIST));
		res.put("buttons", toHideButtons(tmplGroup));
		return res;
	}

	private JSONObject toHideButtons(TemplateGroup tmplGroup) {
		JSONObject jButton = new JSONObject();
		jButton.put("hideCreateButton", tmplGroup.getHideCreateButton());
		jButton.put("hideDeleteButton", tmplGroup.getHideDeleteButton());
		jButton.put("hideExportButton", tmplGroup.getHideExportButton());
		jButton.put("hideImportButton", tmplGroup.getHideImportButton());
		jButton.put("hideQueryButton", tmplGroup.getHideQueryButton());
		return jButton;
	}

	private JSONArray toActions(List<TemplateGroupAction> actions, String actionFace) {
		JSONArray aActions = new JSONArray();
		if (actions != null) {
			Stream<TemplateGroupAction> stream = actions.stream();
			;
			if (actionFace != null) {
				stream = actions.stream().filter(action -> actionFace.equals(action.getFace()));
			}
			stream.forEach(action -> {
				JSONObject jAction = new JSONObject();
				jAction.put("id", action.getId());
				jAction.put("title", action.getTitle());
				jAction.put("iconClass", action.getIconClass());
				jAction.put("outgoing", action.getOutgoing());
				jAction.put("order", action.getOrder());
				jAction.put("multiple", action.getMultiple());
				aActions.add(jAction);
			});
		}
		return aActions;
	}
	
	private JSONArray toJumps(List<TemplateGroupJump> jumps, String actionFace) {
		JSONArray jJumps = new JSONArray();
		if (jumps != null) {
			Stream<TemplateGroupJump> stream = jumps.stream();
			;
			if (actionFace != null) {
				stream = jumps.stream().filter(action -> actionFace.equals(action.getFace()));
			}
			stream.forEach(action -> {
				JSONObject jJump = new JSONObject();
				jJump.put("id", action.getId());
				jJump.put("title", action.getTitle());
				jJump.put("iconClass", action.getIconClass());
				jJump.put("outgoing", action.getOutgoing());
				jJump.put("order", action.getOrder());
				jJump.put("multiple", action.getMultiple());
				jJumps.add(jJump);
			});
		}
		return jJumps;
	}

	private JSONObject toProgressJson(WorkProgress progress) {
		JSONObject jProgress = new JSONObject();
		jProgress.put("uuid", progress.getUUID());
		Map<String, Object> dataMap = progress.getDataMap();
		jProgress.put("withDetail", dataMap.get("withDetail"));
		ExportDataPageInfo pageInfo = (ExportDataPageInfo) dataMap.get("exportPageInfo");
		if (pageInfo != null) {
			jProgress.put("scope", pageInfo.getScope());
			jProgress.put("rangeStart", pageInfo.getRangeStart());
			jProgress.put("rangeEnd", pageInfo.getRangeEnd());
		}
		return jProgress;
	}

	private JSONObject toModule(ModuleMeta module) {
		JSONObject jModule = new JSONObject();
		jModule.put("name", module.getName());
		jModule.put("title", module.getTitle());
		return jModule;
	}

	static Pattern operatePattern = Pattern.compile("^operate[(-d)*(-u)*(-r)*]$");

	private JSONObject toListTemplate(TemplateListTemplate listTemplate) {
		JSONObject jDtmpl = new JSONObject();
		jDtmpl.put("id", listTemplate.getId());
		jDtmpl.put("title", listTemplate.getTitle());
		jDtmpl.put("module", listTemplate.getModule());
		jDtmpl.put("columns", toColumns(listTemplate.getColumns()));
		Set<String> operates = null;
		List<TemplateListColumn> columns = listTemplate.getColumns();
		for (TemplateListColumn column : columns) {
			if (column.getSpecialField() != null && operates == null
					&& column.getSpecialField().startsWith("operate")) {
				operates = new LinkedHashSet<>();
				String specialField = column.getSpecialField();
				if (specialField.contains("-d")) {
					operates.add("detail");
				}
				if (specialField.contains("-u")) {
					operates.add("update");
				}
				if (specialField.contains("-r")) {
					operates.add("remove");
				}
			}
		}
		if (operates != null) {
			jDtmpl.put("operates", operates);
		}
		return jDtmpl;
	}

	private JSONArray toColumns(List<TemplateListColumn> columns) {
		JSONArray aColumns = new JSONArray();
		if (columns != null) {
			columns.forEach(column -> {
				aColumns.add(column);
			});
		}
		return aColumns;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private JSONArray toCriterias(EntityView view, EntityViewCriteria lcriteria) {
		JSONArray aCriterias = new JSONArray();
		AbstractListTemplate ltmpl = view.getListTemplate();
		List<? extends AbstractListCriteria> criterias = ltmpl.getCriterias();
		if (criterias != null && !criterias.isEmpty()) {
			for (AbstractListCriteria criteria : criterias) {
				if (criteria.getQueryShow() != null) {
					JSONObject jCriteria = (JSONObject) JSONObject.toJSON(criteria);
					jCriteria.put("value", lcriteria.getTemplateCriteriaMap().get(criteria.getId()));
					aCriterias.add(jCriteria);
				}
			}
		}
		return aCriterias;

	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	private <T> JSONArray toEntities(EntityView view) {
		JSONArray arrayEntities = new JSONArray();
		int index = view.getCriteria().getPageInfo().getFirstIndex();
		List<EntityColumn> cols = view.getColumns();
		List<? extends CEntityPropertyParser> parsers = view.getParsers();
		for (CEntityPropertyParser parser : parsers) {
			JSONObject jEntity = new JSONObject();
			jEntity.put("code", parser.getCode());
			if (parser instanceof ModuleEntityPropertyParser) {
				jEntity.put("title", ((ModuleEntityPropertyParser) parser).getTitle());
			}
			jEntity.put("index", index++);
			JSONArray arrayFields = new JSONArray();
			jEntity.put("fields", arrayFields);
			cols.forEach(col -> {
				JSONObject jField = new JSONObject();
				jField.put("id", col.getColumnId());
				jField.put("title", col.getTitle());
				jField.put("value",
						parser.getFormatedProperty(col.getFieldName(), col.getFieldType(), col.getFieldFormat()));
				arrayFields.add(jField);
			});
			arrayEntities.add(jEntity);
		}
		return arrayEntities;
	}

	@ResponseBody
	@RequestMapping("/dtmpl/{menuId}")
	public ResponseJSON dtmpl(@PathVariable Long menuId, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();

		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		String moduleName = menu.getTemplateModule();

		ModuleMeta moduleMeta = mService.getModule(moduleName);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());

		List<TemplateGroupAction> actions = tmplGroup.getActions();
		res.put("actions", toActions(actions, TemplateGroupAction.ACTION_FACE_DETAIL));
		res.put("premises", JSON.toJSON(tmplGroup.getPremises()));

		JSONObject jEntity = toEntityJson(null, dtmpl);

		res.put("module", toModule(moduleMeta));
		res.put("entity", jEntity);
		return res;
	}

	@ResponseBody
	@RequestMapping("/detail/{menuId}/{code}")
	public ResponseJSON detail(@PathVariable Long menuId, @PathVariable String code,
			@RequestParam(required = false) Long versionCode, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();

		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		String moduleName = menu.getTemplateModule();

		ModuleMeta moduleMeta = mService.getModule(moduleName);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());

		ModuleEntityPropertyParser entity = null;

		EntityQueryParameter param = new EntityQueryParameter(moduleName, code, user);
		param.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(dtmpl.getId(), user));
		// param.setCriteriasMap(arrayItemFilterService.getArrayItemFilterCriteriasMap(dtmpl.getId(),
		// user));
		EntityVersionItem lastHistory = entityService.getLastHistoryItem(param);
		// EntityHistoryItem lastHistory = mService.getLastHistoryItem(moduleName, code,
		// user);
		if (versionCode != null) {
			if (lastHistory != null && !versionCode.equals(lastHistory.getCode())) {
				entity = entityService.getHistoryEntityParser(param, versionCode, null);
				// entity = mService.getHistoryEntityParser(moduleName, code, historyId, user);
			}
		}
		if (entity == null) {
			entity = entityService.getEntityParser(param);
			// entity = mService.getEntity(moduleName, code, null, user);
		}
		List<TemplateGroupAction> actions = tmplGroup.getActions();
		res.put("actions", toActions(actions, TemplateGroupAction.ACTION_FACE_DETAIL));
		res.put("premises", JSON.toJSON(tmplGroup.getPremises()));

		if (entity != null) {
			JSONObject jEntity = toEntityJson(entity, dtmpl);

			List<EntityVersionItem> historyItems = entityService.queryHistory(param, 1, 100);
			// List<EntityHistoryItem> historyItems =
			// mService.queryHistory(menu.getTemplateModule(), code, 1, 100, user);

			res.put("module", toModule(moduleMeta));
			res.put("entity", jEntity);
			JSONArray aHistoryItems = toHistoryItems(historyItems, versionCode);
			res.put("history", aHistoryItems);
		} else {
			throw new APiDataNotFoundException();
		}
		return res;
	}

	private JSONArray toHistoryItems(List<EntityVersionItem> historyItems, Long versionCode) {
		JSONArray aHistoryItems = new JSONArray();
		if (historyItems != null) {
			boolean hasCurrentId = (versionCode!=null);
			for (EntityVersionItem historyItem : historyItems) {
				JSONObject jHistoryItem = new JSONObject();
				aHistoryItems.add(jHistoryItem);
				jHistoryItem.put("id", historyItem.getCode());
				jHistoryItem.put("userName", historyItem.getUserName());
				jHistoryItem.put("time", historyItem.getTime());
				jHistoryItem.put("monthKey", historyItem.getMonthKey());
				if (hasCurrentId && historyItem.getCode().equals(versionCode)) {
					jHistoryItem.put("current", true);
				}
			}
			if (!hasCurrentId && !aHistoryItems.isEmpty()) {
				((JSONObject) aHistoryItems.get(0)).put("current", true);
			}
		}
		return aHistoryItems;
	}

	private JSONObject toEntityJson(ModuleEntityPropertyParser entity, TemplateDetailTemplate dtmpl) {
		JSONObject jEntity = new JSONObject();
		if (entity != null) {
			jEntity.put("title", entity.getTitle());
			jEntity.put("code", entity.getCode());
		}
		JSONArray aFieldGroups = new JSONArray();
		jEntity.put("fieldGroups", aFieldGroups);

		for (TemplateDetailFieldGroup fieldGroup : dtmpl.getGroups()) {
			JSONObject jFieldGroup = new JSONObject();
			aFieldGroups.add(jFieldGroup);
			jFieldGroup.put("id", fieldGroup.getId());
			jFieldGroup.put("title", fieldGroup.getTitle());
			if (fieldGroup.getComposite() != null) {
				JSONObject jComposite = new JSONObject();
				jFieldGroup.put("composite", jComposite);
				DictionaryComposite composite = fieldGroup.getComposite();
				jComposite.put("id", composite.getId());
				jComposite.put("name", composite.getName());
				jComposite.put("addType", composite.getAddType());
				jComposite.put("relationSubdomain", composite.getRelationSubdomain());
				jComposite.put("access", composite.getAccess());
				jComposite.put("isArray", composite.getIsArray());
				jComposite.put("relationLabelAccess", composite.getRelationLabelAccess());
				jComposite.put("relationKey", composite.getRelationKey());
			}
			if (!Integer.valueOf(1).equals(fieldGroup.getIsArray())) {
				JSONArray aFields = new JSONArray();
				jFieldGroup.put("fields", aFields);
				for (TemplateDetailField field : fieldGroup.getFields()) {
					JSONObject jField = new JSONObject();
					aFields.add(jField);
					bindCommonData(field, jField);
					jField.put("fieldName", field.getFieldName());
					if (entity != null && field.getFieldAvailable()) {
						jField.put("value", entity.getFormatedProperty(field.getFieldName()));
					}
				}
			} else {
				JSONArray aDescs = new JSONArray();
				jFieldGroup.put("descs", aDescs);
				jFieldGroup.put("stmplId", fieldGroup.getSelectionTemplateId());
				String compositeName = null;
				if (fieldGroup.getComposite() != null) {
					compositeName = fieldGroup.getComposite().getName();
					for (TemplateDetailField field : fieldGroup.getFields()) {
						JSONObject jDesc = new JSONObject();
						aDescs.add(jDesc);
						jDesc.put("format",
								FieldParserDescription.getArrayFieldNameFormat(field.getFieldName(), compositeName));
						bindCommonData(field, jDesc);
					}
				}

				JSONArray aCompositeEntities = new JSONArray();
				jFieldGroup.put("array", aCompositeEntities);
				if (entity != null) {
					List<ArrayItemPropertyParser> compositeEntities = entity
							.getCompositeArray(fieldGroup.getComposite().getName());
					if (compositeEntities != null) {
						for (ArrayItemPropertyParser compositeEntity : compositeEntities) {
							JSONObject jCompositeEntity = new JSONObject();
							aCompositeEntities.add(jCompositeEntity);
							jCompositeEntity.put("code", compositeEntity.getCode());
							if (fieldGroup.getRelationSubdomain() != null) {
								jCompositeEntity.put("relation", compositeEntity.getFormatedProperty(
										fieldGroup.getComposite().getName() + "." + EntityConstants.LABEL_KEY));
							}
							JSONArray aFields = new JSONArray();
							jCompositeEntity.put("fields", aFields);
							for (TemplateDetailField field : fieldGroup.getFields()) {
								JSONObject jField = new JSONObject();
								aFields.add(jField);
								bindCommonData(field, jField);
								if (field.getFieldAvailable()) {
									jField.put("value", compositeEntity.getFormatedProperty(field.getFieldName()));
								}
							}
						}
					}
				}
			}
		}

		return jEntity;
	}

	void bindCommonData(TemplateDetailField field, JSONObject jField) {
		jField.put("id", field.getId());
		jField.put("fieldName", field.getFieldName());
		jField.put("title", field.getTitle());
		jField.put("type", field.getType());
		jField.put("available", field.getFieldAvailable());
		jField.put("optionKey", field.getOptionGroupKey());
		jField.put("fieldId", field.getFieldId());
		jField.put("access", field.getFieldAccess());
		jField.put("validators", field.getValidators());
		jField.put("additionAccess", field.getAdditionAccess());
	}

	final static String KEY_FUSE_MODE = "%fuseMode%";

	@ResponseBody
	@RequestMapping("/update/{menuId}")
	public ResponseJSON update(@PathVariable Long menuId,
			@RequestParam(value = AdminConstants.KEY_FUSE_MODE, required = false) Boolean fuseMode,
			@RequestParam(value = AdminConstants.KEY_ACTION_ID, required = false) Long actionId,
			RequestParameterMapComposite composite, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		String moduleName = menu.getTemplateModule();
		Map<String, Object> entityMap = composite.getMap();
		if (actionId != null) {
			ArrayEntityProxy.setLocalUser(user);
			TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
			AdminModulesController.validateGroupAction(groupAction, menu, "");
			entityMap = atmplService.coverActionFields(groupAction, entityMap);
		}
		try {
			entityMap.remove(AdminConstants.KEY_FUSE_MODE);
			entityMap.remove(AdminConstants.KEY_ACTION_ID);

			EntityQueryParameter param = new EntityQueryParameter(moduleName, user);
			Long tmplGroupId = menu.getTemplateGroupId();
			TemplateGroup tmplGroup = tmplGroupService.getTemplate(tmplGroupId);
			param.setArrayItemCriterias(
					arrayItemFilterService.getArrayItemFilterCriterias(tmplGroup.getDetailTemplateId(), user));
			// param.setCriteriasMap(arrayItemFilterService.getArrayItemFilterCriteriasMap(tmplGroup.getDetailTemplateId(),
			// user));
			EntityFusionRunner.running(fuseMode, jRes, entityMap, param, entityService);
		} catch (Exception e) {
			logger.error("保存实体时出现异常", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/remove/{menuId}")
	public ResponseJSON removeEntities(@PathVariable Long menuId, @RequestParam String codes, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		try {
			EntitiesQueryParameter param = new EntitiesQueryParameter(menu.getTemplateModule(), user);
			param.setEntityCodes(collectCode(codes));
			entityService.remove(param);
			// mService.removeEntities(menu.getTemplateModule(), collectCode(codes), user);
			res.setStatus("suc");
		} catch (Exception e) {
			logger.error("删除失败", e);
			res.setStatus("error");
		}
		return res;
	}

	private Set<String> collectCode(String codes) {
		Set<String> codeSet = new LinkedHashSet<>();
		for (String code : codes.split(",")) {
			if (!code.isEmpty()) {
				codeSet.add(code);
			}
		}
		;
		return codeSet;
	}

	@ResponseBody
	@RequestMapping("/selections/{menuId}/{stmplId}")
	public ResponseJSON selections(@PathVariable Long menuId, @PathVariable Long stmplId, String excepts,
			PageInfo pageInfo, HttpServletRequest request, ApiUser user) {
		authService.validateUserL2MenuAccessable(user, menuId);
		TemplateSelectionTemplate stmpl = stmplService.getTemplate(stmplId);

		// 创建条件对象
		Map<Long, String> criteriaMap = lCriteriaFactory.exractTemplateCriteriaMap(request);
		SelectionTemplateEntityViewCriteria criteria = new SelectionTemplateEntityViewCriteria(stmpl, criteriaMap);
		// 设置条件
		criteria.setExistCodes(TextUtils.split(excepts, ",", HashSet<String>::new, e -> e));
		criteria.setPageInfo(pageInfo);
		criteria.setUser(user);
		// 执行查询
		SelectionTemplateEntityView view = (SelectionTemplateEntityView) vService.query(criteria);

		JSONObjectResponse jRes = new JSONObjectResponse();
		jRes.put("entities", toEntities(view));
		jRes.put("pageInfo", view.getCriteria().getPageInfo());
		jRes.put("criterias", toCriterias(view, criteria));
		jRes.put("stmpl", toSelectionTemplate(stmpl));
		// jRes.put("criterias", toCriterias(view, criteria));
		return jRes;
	}

	private JSONObject toSelectionTemplate(TemplateSelectionTemplate stmpl) {
		JSONObject jstmpl = new JSONObject();
		jstmpl.put("relationName", stmpl.getRelationName());
		jstmpl.put("id", stmpl.getId());
		jstmpl.put("nonunique", stmpl.getNonunique());
		jstmpl.put("compositeId", stmpl.getCompositeId());
		jstmpl.put("module", stmpl.getModule());
		jstmpl.put("title", stmpl.getTitle());
		jstmpl.put("columns", stmpl.getColumns());
		return jstmpl;
	}

	@ResponseBody
	@RequestMapping("/load_entities/{menuId}/{stmplId}")
	public ResponseJSON loadSelectionEntities(@PathVariable Long menuId, @PathVariable Long stmplId,
			@RequestParam String codes, @RequestParam String fields, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		authService.validateUserL2MenuAccessable(user, menuId);
		TemplateSelectionTemplate stmpl = stmplService.getTemplate(stmplId);

		EntitiesQueryParameter param = new EntitiesQueryParameter(stmpl.getModule(), user);
		param.setEntityCodes(TextUtils.split(codes, ",", HashSet<String>::new, c -> c));
		param.setRelationName(stmpl.getRelationName());
		Map<String, RelSelectionEntityPropertyParser> parsers = entityService.queryRelationEntityParsers(param);

		/*
		 * Map<String, CEntityPropertyParser> parsers = mService.getEntityParsers(
		 * stmpl.getModule(), stmpl.getRelationName(), TextUtils.split(codes, ",",
		 * HashSet<String>::new, c->c), user) ;
		 */
		JSONObject entities = toEntitiesJson(parsers, TextUtils.split(fields, ",", HashSet<String>::new, f -> f));
		jRes.put("entities", entities);
		jRes.setStatus("suc");
		return jRes;
	}

	private JSONObject toEntitiesJson(Map<String, RelSelectionEntityPropertyParser> parsers, Set<String> fieldNames) {
		JSONObject entities = new JSONObject();
		if (parsers != null && fieldNames != null) {
			parsers.forEach((code, parser) -> {
				JSONObject entity = new JSONObject();
				entity.put(ABCNodeProxy.CODE_PROPERTY_NAME_NORMAL, parser.getCode());
				entities.put(parser.getCode(), entity);
				for (String fieldName : fieldNames) {
					entity.put(fieldName, parser.getFormatedProperty(fieldName));
				}
			});
		}
		return entities;
	}

	@SuppressWarnings("unchecked")
	@ResponseBody
	@RequestMapping("/do_action/{menuId}/{actionId}")
	public ResponseJSON doAction(@PathVariable Long menuId, @PathVariable Long actionId,
			@RequestParam(name = "codes") String codeStr, ApiUser user) {
		JSONObjectResponse res = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		ArrayEntityProxy.setLocalUser(user);
		TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
		Object vRes = AdminModulesController.validateGroupAction(groupAction, menu, codeStr);
		if (!(vRes instanceof Set)) {
			res.setStatus("error");
		} else {
			Set<String> codes = (Set<String>) vRes;
			TemplateActionTemplate atmpl = atmplService.getTemplate(groupAction.getAtmplId());
			if (atmpl != null) {
				try {
					int sucs = actService.doAction(atmpl, codes,
							TemplateGroupAction.ACTION_MULTIPLE_TRANSACTION.equals(groupAction.getMultiple()), user);
					res.setStatus("suc");
					res.put("msg", "执行结束, 共成功处理" + sucs + "个实体");
				} catch (Exception e) {
					logger.error("操作失败", e);
					res.setStatus("error");
					res.put("msg", "操作失败");
				}
			} else {
				res.setStatus("action not found");
			}
		}
		return res;

	}

}
