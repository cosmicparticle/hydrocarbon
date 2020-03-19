package cho.carbon.hc.hydrocarbon.admin.controller.modules;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.common.UserIdentifier;
import cho.carbon.hc.copframe.dao.utils.UserUtils;
import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.copframe.utils.date.FrameDateFormat;
import cho.carbon.hc.copframe.web.poll.WorkProgress;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryComposite;
import cho.carbon.hc.dataserver.model.dict.pojo.DictionaryOption;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.modules.pojo.EntityVersionItem;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.ViewDataService;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityItem;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQuery;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQueryPool;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityViewCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.ListTemplateEntityView;
import cho.carbon.hc.dataserver.model.modules.service.view.ListTemplateEntityViewCriteria;
import cho.carbon.hc.dataserver.model.modules.service.view.PagedEntityList;
import cho.carbon.hc.dataserver.model.modules.service.view.TreeNodeContext;
import cho.carbon.hc.dataserver.model.service.EntitiesQueryParameter;
import cho.carbon.hc.dataserver.model.service.EntityFusionRunner;
import cho.carbon.hc.dataserver.model.service.EntityQueryParameter;
import cho.carbon.hc.dataserver.model.service.ModuleEntityService;
import cho.carbon.hc.dataserver.model.tmpl.manager.TreeTemplateManager.TreeRelationComposite;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupJump;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupPremise;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpParam;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateSelectionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeNode;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.JumpTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ListCriteriaFactory;
import cho.carbon.hc.dataserver.model.tmpl.service.ListTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.SelectionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.dataserver.model.tmpl.service.TreeTemplateService;
import cho.carbon.hc.entityResolver.CEntityPropertyParser;
import cho.carbon.hc.entityResolver.FieldDescCacheMap;
import cho.carbon.hc.entityResolver.FusionContextConfig;
import cho.carbon.hc.entityResolver.FusionContextConfigFactory;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.impl.ABCNodeProxy;
import cho.carbon.hc.entityResolver.impl.RelSelectionEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.SessionKey;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.common.EntityQueryPoolUtils;
import cho.carbon.hc.hydrocarbon.common.RequestParameterMapComposite;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cho.carbon.hc.hydrocarbon.model.modules.service.ExportService;
import cho.carbon.meta.enun.AttributeValueType;

@Controller
@RequestMapping(AdminConstants.URI_MODULES + "/curd")
public class AdminModulesController {

	@Resource
	ModulesService mService;

	@Resource
	ExportService eService;

	@Resource
	DictionaryService dictService;

	@Resource
	TemplateGroupService tmplGroupService;

	@Resource
	DetailTemplateService dtmplService;

	@Resource
	ListTemplateService ltmplService;

	@Resource
	SelectionTemplateService stmplService;

	@Resource
	ActionTemplateService atmplService;

	@Resource
	JumpTemplateService jtmplService;

	@Resource
	TreeTemplateService treeService;

	@Resource
	FrameDateFormat dateFormat;

	@Resource
	FusionContextConfigFactory fFactory;

	@Resource
	ViewDataService vService;

	@Resource
	SideMenuService menuService;

	@Resource
	AuthorityService authService;

	@Resource
	ListCriteriaFactory lcriteriFacrory;

	@Resource
	ModuleEntityService entityService;

	@Resource
	ArrayItemFilterService arrayItemFilterService;

	Logger logger = Logger.getLogger(AdminModulesController.class);

	@Resource
	ApplicationContext applicationContext;

	@RequestMapping("/list/{menuId}")
	public String list(@PathVariable Long menuId, PageInfo pageInfo, HttpServletRequest request, Model model,
			HttpSession session) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		// String moduleName = menu.getTemplateModule();
		EntityViewCriteria criteria = getEntityListCriteria(menu, pageInfo, request);
		ListTemplateEntityView view = (ListTemplateEntityView) vService.query(criteria);
		model.addAttribute("view", view);

		// 导出状态获取
		String uuid = (String) session.getAttribute(SessionKey.EXPORT_ENTITY_STATUS_UUID);
		if (uuid != null) {
			WorkProgress progress = eService.getExportProgress(uuid);
			if (progress != null && !progress.isBreaked()) {
				model.addAttribute("exportStatus", progress);
			}
		}
		// 隐藏条件拼接成文件用于提示
		List<TemplateListCriteria> tCriterias = view.getListTemplate().getCriterias();
		StringBuffer hidenCriteriaDesc = new StringBuffer();
		if (tCriterias != null) {
			for (TemplateListCriteria tCriteria : tCriterias) {
				if (tCriteria.getQueryShow() == null && TextUtils.hasText(tCriteria.getDefaultValue())
						&& tCriteria.getFieldAvailable()) {
					hidenCriteriaDesc.append(tCriteria.getTitle() + ":" + tCriteria.getDefaultValue() + "&#10;");
				}
			}
		}
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		if (tmplGroup.getPremises() != null) {
			for (TemplateGroupPremise premise : tmplGroup.getPremises()) {
				hidenCriteriaDesc.append(premise.getFieldTitle() + ":" + premise.getFieldValue() + "&#10;");
			}
		}
		model.addAttribute("tmplGroup", tmplGroup);
		model.addAttribute("hidenCriteriaDesc", hidenCriteriaDesc);
		model.addAttribute("menu", menu);
		model.addAttribute("criteria", view.getCriteria());
		// Map<String,String> map=view.getParsers().iterator().next().getSmap();
		// String a=map.get("领用部门");
		// String b=view.getParsers().iterator().next().getSmap().get("名称");
		// a=a+b;
		model.addAttribute("moduleWritable", mService.getModuleEntityWritable(menu.getTemplateModule()));

		return AdminConstants.JSP_MODULES + "/modules_list_tmpl.jsp";
	}

	@RequestMapping("/list_tree/{menuId}")
	public String listTree(@PathVariable Long menuId, String entityCode, PageInfo pageInfo, HttpServletRequest request,
			Model model, HttpSession session) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateListTemplate ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
		ModuleMeta module = mService.getModule(menu.getTemplateModule());
		// 获得查询池
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(session, user);
		// 注册一个查询
		EntityQuery query = qPool.regist();
		TemplateTreeTemplate ttmpl = treeService.getTemplate(tmplGroup.getTreeTemplateId());
		// 构造根节点的上下文
		TreeNodeContext nodeContext = new TreeNodeContext(ttmpl);
		// 根据上下文获得节点模板
		TemplateTreeNode nodeTemplate = treeService.analyzeNodeTemplate(nodeContext);
		;
		// 设置参数
		query.setModuleName(menu.getTemplateModule()).setPageSize(pageInfo.getPageSize()).setTemplateGroup(tmplGroup)
				.setNodeTemplate(nodeTemplate);
		Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
		// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
		query.prepare(requrestCriteriaMap, applicationContext);
		// 传递参数到页面
		model.addAttribute("query", query);
		model.addAttribute("nodeTmplJson", JSON.toJSON(query.getNodeTemplate()));
		String nodesCSS = treeService.generateNodesCSS(ttmpl);
		model.addAttribute("nodesCSS", nodesCSS);
		model.addAttribute("module", module);
		model.addAttribute("menu", menu);
		model.addAttribute("tmplGroup", tmplGroup);
		model.addAttribute("ltmpl", ltmpl);
		return AdminConstants.JSP_MODULES + "/modules_list_tree.jsp";
	}

	private ListTemplateEntityViewCriteria getEntityListCriteria(SideMenuLevel2Menu menu, PageInfo pageInfo,
			HttpServletRequest request) {

		// 创建条件对象
		ListTemplateEntityViewCriteria criteria = new ListTemplateEntityViewCriteria();
		// 设置条件
		criteria.setModule(menu.getTemplateModule());
		criteria.setTemplateGroupId(menu.getTemplateGroupId());
		Map<Long, String> criteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
		criteria.setTemplateCriteriaMap(criteriaMap);
		criteria.setPageInfo(pageInfo);
		criteria.setUser(UserUtils.getCurrentUser());
		// 执行查询
		return criteria;
	}

	@ResponseBody
	@RequestMapping("/start_askfor_entity_nodes/{menuId}/{parentEntityCode}/{nodeRelationId}")
	public ResponseJSON treeNode(@PathVariable Long menuId, @PathVariable String parentEntityCode,
			@PathVariable Long nodeRelationId, @RequestParam(required = false, defaultValue = "10") Integer pageSize,
			HttpSession session) {
		JSONObjectResponse jRes = new JSONObjectResponse();

		TreeRelationComposite relationComposite = treeService.getNodeRelationTemplate(nodeRelationId);
		if (relationComposite != null) {
			// TemplateTreeRelation nodeRelationTempalte =
			// relationComposite.getReltionTempalte();
			// 构造查询节点的上下文
			TreeNodeContext nodeContext = new TreeNodeContext(relationComposite);
			// 设置当前节点路径
			// nodeContext.setPath(path);
			// 根据上下文获得节点模板
			TemplateTreeNode itemNodeTemplate = treeService.analyzeNodeTemplate(nodeContext);
			// 获得查询池
			UserIdentifier user = UserUtils.getCurrentUser();
			EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(session, user);
			// 注册一个查询
			EntityQuery query = qPool.regist();
			// 在模板中匹配查询结果的Node模板
			// 设置参数
			query.setModuleName(relationComposite.getNodeTemplate().getModuleName())
					.setParentEntityCode(parentEntityCode).setRelationTemplate(relationComposite.getRelationTempalte())
					.setPageSize(pageSize).setNodeTemplate(itemNodeTemplate);
			// 执行查询
			Map<Long, String> requrestCriteriaMap = new HashMap<>();
			query.prepare(requrestCriteriaMap, applicationContext);

			// 根据树形模板将entity转换成node
			jRes.put("queryKey", query.getKey());
			jRes.put("nodeTmpl", query.getNodeTemplate());
		}
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/askfor_entities/{key}/{pageNo}")
	public ResponseJSON askForEntityNodes(@PathVariable String key, @PathVariable Integer pageNo, HttpSession session) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryPool pool = EntityQueryPoolUtils.getEntityQueryPool(session, user);
		EntityQuery query = pool.getQuery(key);
		PagedEntityList el = query.pageList(pageNo);

		// Long treeTemplateId = query.getTreeTemplateId();

		// TemplateTreeTemplate ttmpl = treeService.getTemplate(treeTemplateId);
		// 获得模板
		// TemplateTreeNode nodeTmpl = treeService.analyzeNodeTemplate(ttmpl, el);
		// TemplateTreeNode nodeTmpl = query.getNodeTemplate();
		// List<EntityNode> nodes = CollectionUtils.toList(el.getParsers(),
		// parser->entityService.toEntityNode(parser, nodeTmpl));
		List<EntityItem> entities = entityService.convertEntityItems(el);
		jRes.put("entities", entities);
		jRes.put("isEndList", el.getIsEndList());
		jRes.put("queryKey", query.getKey());
		jRes.put("pageNo", el.getPageNo());
		return jRes;
	}

	@RequestMapping("/detail/{menuId}/{code}")
	public String detail(@PathVariable String code, @PathVariable Long menuId, Long versionCode, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		model.addAttribute("menu", menu);
		return toDetail(code, tmplGroup, versionCode, model);
	}

	@RequestMapping("/detail/{menuId}/{groupId}/{code}") // 此处后续要增加权限控制，因为会导致一个菜单权限查询所有的实体详情
	public String detail(@PathVariable String code, @PathVariable Long menuId, @PathVariable Long groupId,
			Long versionCode, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(groupId);
		model.addAttribute("menu", menu);
		return toDetail(code, tmplGroup, versionCode, model);
	}

	@RequestMapping("/node_detail/{menuId}/{nodeId}/{code}")
	public String nodeDetail(@PathVariable Long menuId, @PathVariable Long nodeId, @PathVariable String code,
			Long versionCode, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);
		Long tmplGroupId = nodeTemplate.getTemplateGroupId();
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(tmplGroupId);
		model.addAttribute("menu", menu);
		model.addAttribute("nodeTemplate", nodeTemplate);
		return toDetail(code, tmplGroup, versionCode, model);
	}

	private String toDetail(String code, TemplateGroup tmplGroup, Long versionCode, Model model) {

		String moduleName = tmplGroup.getModule();
		ModuleMeta moduleMeta = mService.getModule(moduleName);
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());

		ModuleEntityPropertyParser entity = null;
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryParameter queryParam = new EntityQueryParameter(moduleName, code, user);
		queryParam.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(dtmpl.getId(), user));

		EntityVersionItem lastHistory = entityService.getLastHistoryItem(queryParam);
		if (versionCode != null) {
			if (lastHistory != null && !versionCode.equals(lastHistory.getCode())) {
				entity = entityService.getHistoryEntityParser(queryParam, versionCode, null);
				// entity = mService.getHistoryEntityParser(moduleName, code, historyId, user);
			}
		}
		if (entity == null) {
			entity = entityService.getEntityParser(queryParam);
			// entity = mService.getEntity(moduleName, code, null, user);
		}
		if (lastHistory != null) {
			model.addAttribute("hasHistory", true);
		}

		model.addAttribute("versionCode", versionCode);
		model.addAttribute("entity", entity);
		model.addAttribute("dtmpl", dtmpl);
		model.addAttribute("groupPremises", tmplGroup.getPremises());
		model.addAttribute("module", moduleMeta);
		return AdminConstants.JSP_MODULES + "/modules_detail_tmpl.jsp";
	}

	private ModuleEntityPropertyParser getEntity(String code, TemplateGroup tmplGroup) {

		String moduleName = tmplGroup.getModule();
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());

		ModuleEntityPropertyParser entity = null;
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryParameter queryParam = new EntityQueryParameter(moduleName, code, user);
		queryParam.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(dtmpl.getId(), user));

		if (entity == null) {
			entity = entityService.getEntityParser(queryParam);
			// entity = mService.getEntity(moduleName, code, null, user);
		}

		return entity;
	}

	@RequestMapping("/add/{menuId}")
	public String add(@PathVariable Long menuId, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		String moduleName = menu.getTemplateModule();
		ModuleMeta mMeta = mService.getModule(moduleName);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());
		FusionContextConfig config = fFactory.getModuleConfig(moduleName);
		model.addAttribute("menu", menu);
		model.addAttribute("dtmpl", dtmpl);
		model.addAttribute("tmplGroup", tmplGroup);
		model.addAttribute("groupPremises", tmplGroup.getPremises());
		model.addAttribute("groupPremisesMap",
				CollectionUtils.toMap(tmplGroup.getPremises(), premise -> premise.getFieldName()));
		List<TemplateGroupAction> groupActions = tmplGroup.getActions().stream()
				.filter(action -> TemplateGroupAction.ACTION_FACE_DETAIL.equals(action.getFace()))
				.collect(Collectors.toList());
		List<TemplateGroupAction> outgoingGroupActions = new ArrayList<>(), normalGroupActions = new ArrayList<>();
		for (TemplateGroupAction action : groupActions) {
			if (TextUtils.hasText(action.getIconClass()) && Integer.valueOf(1).equals(action.getOutgoing())) {
				outgoingGroupActions.add(action);
			} else {
				normalGroupActions.add(action);
			}
		}
		model.addAttribute("outgoingGroupActions", outgoingGroupActions);
		model.addAttribute("normalGroupActions", normalGroupActions);
		model.addAttribute("module", mMeta);
		model.addAttribute("config", config);
		model.addAttribute("fieldDescMap", new FieldDescCacheMap(config.getConfigResolver()));
		return AdminConstants.JSP_MODULES + "/modules_update_tmpl.jsp";
	}

	@RequestMapping("/update/{menuId}/{code}")
	public String update(@PathVariable Long menuId, @PathVariable String code, Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		model.addAttribute("menu", menu);
		return aUpdate(tmplGroup, code, model);
	}

	@RequestMapping("/node_update/{menuId}/{nodeId}/{code}")
	public String nodeUpdate(@PathVariable Long menuId, @PathVariable Long nodeId, @PathVariable String code,
			Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(nodeTemplate.getTemplateGroupId());
		model.addAttribute("menu", menu);
		model.addAttribute("nodeTemplate", nodeTemplate);
		return aUpdate(tmplGroup, code, model);
	}

	private String aUpdate(TemplateGroup tmplGroup, String code, Model model) {
		String moduleName = tmplGroup.getModule();
		ModuleMeta mMeta = mService.getModule(moduleName);
		FusionContextConfig config = fFactory.getModuleConfig(moduleName);
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryParameter queryParam = new EntityQueryParameter(moduleName, code, user);
		queryParam.setArrayItemCriterias(
				arrayItemFilterService.getArrayItemFilterCriterias(tmplGroup.getDetailTemplateId(), user));
		ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);
		// ModuleEntityPropertyParser entity = mService.getEntity(moduleName, code,
		// null, UserUtils.getCurrentUser());
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());

		model.addAttribute("entity", entity);
		model.addAttribute("module", mMeta);
		model.addAttribute("dtmpl", dtmpl);
		model.addAttribute("tmplGroup", tmplGroup);
		model.addAttribute("groupPremises", tmplGroup.getPremises());
		List<TemplateGroupAction> groupActions = tmplGroup.getActions().stream()
				.filter(action -> TemplateGroupAction.ACTION_FACE_DETAIL.equals(action.getFace()))
				.collect(Collectors.toList());
		List<TemplateGroupAction> outgoingGroupActions = new ArrayList<>(), normalGroupActions = new ArrayList<>();
		for (TemplateGroupAction action : groupActions) {
			if (TextUtils.hasText(action.getIconClass()) && 1 == action.getOutgoing()) {
				outgoingGroupActions.add(action);
			} else {
				normalGroupActions.add(action);
			}
		}
		model.addAttribute("outgoingGroupActions", outgoingGroupActions);
		model.addAttribute("normalGroupActions", normalGroupActions);
		model.addAttribute("config", config);
		model.addAttribute("fieldDescMap", new FieldDescCacheMap(config.getConfigResolver()));
		return AdminConstants.JSP_MODULES + "/modules_update_tmpl.jsp";
	}

	@ResponseBody
	@RequestMapping({ "/save/{menuId}" })
	public AjaxPageResponse save(@PathVariable Long menuId,
			@RequestParam(value = AdminConstants.KEY_FUSE_MODE, required = false) Boolean fuseMode,
			@RequestParam(value = AdminConstants.KEY_ACTION_ID, required = false) Long actionId,
			RequestParameterMapComposite composite) {
		UserIdentifier user = UserUtils.getCurrentUser();
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		String moduleName = menu.getTemplateModule();
		Map<String, Object> entityMap = composite.getMap();
		if (actionId != null) {
			ArrayEntityProxy.setLocalUser(user);
			TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
			validateGroupAction(groupAction, menu, "");
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

			return EntityFusionRunner.running(fuseMode, entityMap, param, entityService, menuId);

		} catch (Exception e) {
			logger.error("保存时发生错误", e);
			return AjaxPageResponse.FAILD("保存失败");
		}
	}

	@ResponseBody
	@RequestMapping({ "/node_save/{menuId}/{nodeId}" })
	public AjaxPageResponse save(@PathVariable Long menuId, @PathVariable Long nodeId,
			@RequestParam(value = AdminConstants.KEY_FUSE_MODE, required = false) Boolean fuseMode,
			@RequestParam(value = AdminConstants.KEY_ACTION_ID, required = false) Long actionId,
			RequestParameterMapComposite composite) {
		UserIdentifier user = UserUtils.getCurrentUser();
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);

		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);

		String moduleName = nodeTemplate.getModuleName();
		Map<String, Object> entityMap = composite.getMap();
		if (actionId != null) {
			ArrayEntityProxy.setLocalUser(user);
			TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
			entityMap = atmplService.coverActionFields(groupAction, entityMap);
		}
		try {
			entityMap.remove(AdminConstants.KEY_FUSE_MODE);
			entityMap.remove(AdminConstants.KEY_ACTION_ID);
			EntityQueryParameter param = new EntityQueryParameter(moduleName, user);
			TemplateGroup tmplGroup = tmplGroupService.getTemplate(nodeTemplate.getTemplateGroupId());
			param.setArrayItemCriterias(
					arrayItemFilterService.getArrayItemFilterCriterias(tmplGroup.getDetailTemplateId(), user));
			return EntityFusionRunner.running(fuseMode, entityMap, param, entityService, menuId);
		} catch (Exception e) {
			logger.error("保存时发生错误", e);
			return AjaxPageResponse.FAILD("保存失败");
		}
	}

	@ResponseBody
	@RequestMapping("/paging_history/{menuId}/{code}")
	public JSONObjectResponse pagingHistory(@PathVariable Long menuId, @PathVariable String code,
			@RequestParam Integer pageNo, @RequestParam(defaultValue = "100") Integer pageSize) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		return aPagingHistory(menu.getTemplateModule(), code, pageNo, pageSize);
	}

	@ResponseBody
	@RequestMapping("/node_paging_history/{menuId}/{nodeId}/{code}")
	public JSONObjectResponse nodePagingHistory(@PathVariable Long menuId, @PathVariable Long nodeId,
			@PathVariable String code, @RequestParam Integer pageNo,
			@RequestParam(defaultValue = "100") Integer pageSize) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateTreeNode node = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);
		return aPagingHistory(node.getModuleName(), code, pageSize, pageSize);
	}

	private JSONObjectResponse aPagingHistory(String moduleName, String code, Integer pageNo, Integer pageSize) {
		JSONObjectResponse response = new JSONObjectResponse();
		try {
			EntityQueryParameter param = new EntityQueryParameter(moduleName, code, UserUtils.getCurrentUser());
			List<EntityVersionItem> historyItems = entityService.queryHistory(param, pageNo, pageSize);
			response.put("history", JSON.toJSON(historyItems));
			response.setStatus("suc");
			if (historyItems.size() < pageSize) {
				response.put("isLast", true);
			}
		} catch (Exception e) {
			logger.error("查询历史失败", e);
		}

		return response;
	}

	@ResponseBody
	@RequestMapping("/delete/{menuId}/{code}")
	public AjaxPageResponse delete(@PathVariable Long menuId, @PathVariable String code) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		try {
			EntityQueryParameter param = new EntityQueryParameter(menu.getTemplateModule(), code,
					UserUtils.getCurrentUser());
			entityService.delete(param);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}

	@ResponseBody
	@RequestMapping("/remove/{menuId}")
	public AjaxPageResponse remove(@PathVariable Long menuId, @RequestParam String codes) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		try {
			EntitiesQueryParameter param = new EntitiesQueryParameter(menu.getTemplateModule(),
					UserUtils.getCurrentUser());
			param.setEntityCodes(collectCode(codes));
			entityService.remove(param);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除失败", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}

	@RequestMapping("/rel_tree/{menuId}/{fieldGroupId}")
	public String relationTreeSelection(@PathVariable Long menuId, @PathVariable Long fieldGroupId, HttpSession session,
			PageInfo pageInfo, HttpServletRequest request, Model model) {
		SideMenuLevel2Menu mainMenu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup mainTmplGroup = tmplGroupService.getTemplate(mainMenu.getTemplateGroupId());
		TemplateDetailTemplate dtmpl = dtmplService.getTemplate(mainTmplGroup.getDetailTemplateId());
		TemplateDetailFieldGroup fieldGroup = dtmpl.getGroups().stream()
				.filter(group -> fieldGroupId.equals(group.getId())).findFirst().get();

		TemplateTreeTemplate ttmpl = treeService.getTemplate(fieldGroup.getRabcTreeTemplateId());

		String relModuleName = fieldGroup.getComposite().getRelModuleName();

		ModuleMeta module = mService.getModule(relModuleName);
		// 获得查询池
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(session, user);
		// 注册一个查询
		EntityQuery query = qPool.regist();
		// 构造根节点的上下文
		TreeNodeContext nodeContext = new TreeNodeContext(ttmpl);
		// 根据上下文获得节点模板
		TemplateTreeNode nodeTemplate = treeService.analyzeNodeTemplate(nodeContext);
		;
		// 设置参数
		query.setModuleName(nodeTemplate.getModuleName()).setPageSize(pageInfo.getPageSize())
				.setNodeTemplate(nodeTemplate);
		Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
		// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
		query.prepare(requrestCriteriaMap, applicationContext);
		// 传递参数到页面
		model.addAttribute("query", query);
		model.addAttribute("nodeTmplJson", JSON.toJSON(query.getNodeTemplate()));
		String nodesCSS = treeService.generateNodesCSS(ttmpl);
		model.addAttribute("nodesCSS", nodesCSS);
		model.addAttribute("module", module);
		model.addAttribute("fieldGroup", fieldGroup);
		model.addAttribute("mainMenu", mainMenu);
		model.addAttribute("treeTemplate", ttmpl);
		return AdminConstants.JSP_MODULES + "/modules_rel_tree.jsp";
	}

	@RequestMapping("/rel_selection/{menuId}/{stmplId}")
	public String relationSelection(@PathVariable Long menuId, @PathVariable Long stmplId, String exists,
			PageInfo pageInfo, HttpServletRequest request, Model model, HttpSession session) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		model.addAttribute("menu", menu);
		return aNodeRelationSelection(menu.getTemplateModule(), stmplId, session, exists, pageInfo, model, request);
	}

	@RequestMapping("/node_rel_selection/{menuId}/{nodeId}/{stmplId}")
	public String nodeRelationSelection(@PathVariable Long menuId, @PathVariable Long nodeId,
			@PathVariable Long stmplId, String exists, PageInfo pageInfo, HttpServletRequest request, Model model,
			HttpSession session) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);
		model.addAttribute("menu", menu);
		return aNodeRelationSelection(nodeTemplate.getModuleName(), stmplId, session, exists, pageInfo, model, request);
	}

	/**
	 * 操作的地方也有类似选择要改
	 */
	private String aNodeRelationSelection(String pmoduleName, Long stmplId, HttpSession session, String exists,
			PageInfo pageInfo, Model model, HttpServletRequest request) {
		String moduleName = pmoduleName;
		TemplateGroup tmplGroup = null;
		TemplateListTemplate ltmpl = null;
		TemplateSelectionTemplate stmpl = stmplService.getTemplate(stmplId);

		if (stmpl == null) {// 说明stmplId 对应的不是 select temp。有可能是 temp group
			tmplGroup = tmplGroupService.getTemplate(stmplId);
			ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
			moduleName = tmplGroup.getModule();
		} else {
			moduleName = stmpl.getModule();// 主要为了处理跨级点选
		}

		// 获得查询池
		UserIdentifier user = UserUtils.getCurrentUser();
		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(session, user);
		// 注册一个查询
		EntityQuery query = qPool.regist();

		Set<String> excludeCodes = TextUtils.split(exists, ",", HashSet::new, c -> c);
		// 设置参数
		query.setModuleName(moduleName).setPageSize(pageInfo.getPageSize()).setSelectionTemplate(stmpl)
				.setTemplateGroup(tmplGroup).addExcludeEntityCodes(excludeCodes);
		Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
		// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
		query.prepare(requrestCriteriaMap, applicationContext);

		model.addAttribute("ltmpl", ltmpl);
		if (stmpl == null) {
			model.addAttribute("stmpl", tmplGroup);
			model.addAttribute("stmplJson", JSON.toJSON(tmplGroup));
			model.addAttribute("ltmplJson", JSON.toJSON(ltmpl));
		} else {
			model.addAttribute("stmpl", stmpl);
			model.addAttribute("stmplJson", JSON.toJSON(stmpl));
		}

		model.addAttribute("query", query);
		// TODO：优化缓存之后需要移除此处代码
		pageInfo.setCount(query.getCount());
		model.addAttribute("pageInfo", pageInfo);
		return AdminConstants.JSP_MODULES + "/modules_rel_selection.jsp";

	}

	/*
	 * @RequestMapping("/open_selection/{menuId}/{stmplId}") public String
	 * openSelection(
	 * 
	 * @PathVariable Long menuId,
	 * 
	 * @PathVariable Long stmplId, String exists, PageInfo pageInfo,
	 * HttpServletRequest request, Model model) { SideMenuLevel2Menu menu =
	 * authService.vaidateL2MenuAccessable(menuId); TemplateSelectionTemplate stmpl
	 * = stmplService.getTemplate(stmplId);
	 * 
	 * //创建条件对象 Map<Long, String> criteriaMap =
	 * lcriteriFacrory.exractTemplateCriteriaMap(request);
	 * SelectionTemplateEntityViewCriteria criteria = new
	 * SelectionTemplateEntityViewCriteria(stmpl, criteriaMap); //设置条件
	 * criteria.setExistCodes(TextUtils.split(exists, ",", HashSet<String>::new,
	 * e->e)); criteria.setPageInfo(pageInfo);
	 * criteria.setUser(UserUtils.getCurrentUser()); //执行查询
	 * SelectionTemplateEntityView view = (SelectionTemplateEntityView)
	 * vService.query(criteria); model.addAttribute("view", view);
	 * 
	 * //隐藏条件拼接成文件用于提示 List<TemplateSelectionCriteria> tCriterias =
	 * view.getListTemplate().getCriterias(); StringBuffer hidenCriteriaDesc = new
	 * StringBuffer(); if(tCriterias != null){ for (TemplateSelectionCriteria
	 * tCriteria : tCriterias) { if(tCriteria.getQueryShow() == null &&
	 * TextUtils.hasText(tCriteria.getDefaultValue()) &&
	 * tCriteria.getFieldAvailable()) {
	 * hidenCriteriaDesc.append(tCriteria.getTitle() + ":" +
	 * tCriteria.getDefaultValue() + "&#10;"); } } }
	 * 
	 * model.addAttribute("menu", menu); model.addAttribute("stmpl", stmpl);
	 * model.addAttribute("criteria", criteria); return AdminConstants.JSP_MODULES +
	 * "/modules_selection.jsp"; }
	 */

	@RequestMapping("/rabc_create/{mainMenuId}/{fieldGroupId}")
	public String rabcCreate(@PathVariable Long mainMenuId, @PathVariable Long fieldGroupId, String entityCode,
			Model model) {
		SideMenuLevel2Menu mainMenu = authService.validateL2MenuAccessable(mainMenuId);
		model.addAttribute("mainMenu", mainMenu);
		TemplateGroup mainTmplGroup = tmplGroupService.getTemplate(mainMenu.getTemplateGroupId());
		return aRabcCreate(mainTmplGroup, fieldGroupId, entityCode, model);
	}

	@RequestMapping("/rabc_detail/{menuId}/{fieldGroupId}")
	public String rabcDetail(@PathVariable Long menuId, @PathVariable Long fieldGroupId,  String entityCode,
			 Model model) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateGroup mainTmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateDetailTemplate mainDtmpl = dtmplService.getTemplate(mainTmplGroup.getDetailTemplateId());
		TemplateGroup tmplGroup=null;
		if (mainDtmpl != null) {
			TemplateDetailFieldGroup fieldGroup = mainDtmpl.getGroups().stream()
					.filter(fg -> fieldGroupId.equals(fg.getId())).findFirst().get();

			Long relationTemplateGroupId = fieldGroup.getRabcTemplateGroupId();

			if (relationTemplateGroupId != null) {
				 tmplGroup = tmplGroupService.getTemplate(relationTemplateGroupId);
			}
		}
		model.addAttribute("menu", menu);
		return toDetail(entityCode, tmplGroup, null, model);
	}

	@RequestMapping("/node_rabc_create/{mainMenuId}/{nodeId}/{fieldGroupId}")
	public String rabcCreate(@PathVariable Long mainMenuId, @PathVariable Long fieldGroupId, @PathVariable Long nodeId,
			String entityCode, Model model) {
		SideMenuLevel2Menu mainMenu = authService.validateL2MenuAccessable(mainMenuId);
		model.addAttribute("mainMenu", mainMenu);
		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(mainMenu.getTemplateModule(), nodeId);
		TemplateGroup mainTmplGroup = tmplGroupService.getTemplate(nodeTemplate.getTemplateGroupId());

		return aRabcCreate(mainTmplGroup, fieldGroupId, entityCode, model);
	}

	private String aRabcCreate(TemplateGroup mainTmplGroup, Long fieldGroupId, String entityCode, Model model) {
		if (mainTmplGroup != null) {
			TemplateDetailTemplate mainDtmpl = dtmplService.getTemplate(mainTmplGroup.getDetailTemplateId());
			if (mainDtmpl != null) {
				TemplateDetailFieldGroup fieldGroup = mainDtmpl.getGroups().stream()
						.filter(fg -> fieldGroupId.equals(fg.getId())).findFirst().get();

				Long relationTemplateGroupId = fieldGroup.getRabcTemplateGroupId();

				if (relationTemplateGroupId != null) {
					TemplateGroup tmplGroup = tmplGroupService.getTemplate(relationTemplateGroupId);

					String rabcModuleName = tmplGroup.getModule();

					ModuleMeta mMeta = mService.getModule(rabcModuleName);

					FusionContextConfig config = fFactory.getModuleConfig(rabcModuleName);
					if (TextUtils.hasText(entityCode)) {
						EntityQueryParameter queryParam = new EntityQueryParameter(rabcModuleName, entityCode,
								UserUtils.getCurrentUser());
						ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);
						// ModuleEntityPropertyParser entity = mService.getEntity(rabcModuleName,
						// entityCode, null, UserUtils.getCurrentUser());
						model.addAttribute("entity", entity);
					}
					TemplateDetailTemplate dtmpl = dtmplService.getTemplate(tmplGroup.getDetailTemplateId());
					model.addAttribute("module", mMeta);
					model.addAttribute("dtmpl", dtmpl);
					model.addAttribute("tmplGroup", tmplGroup);
					model.addAttribute("groupPremises", tmplGroup.getPremises());
					List<TemplateGroupAction> groupActions = tmplGroup.getActions().stream()
							.filter(action -> TemplateGroupAction.ACTION_FACE_DETAIL.equals(action.getFace()))
							.collect(Collectors.toList());
					List<TemplateGroupAction> outgoingGroupActions = new ArrayList<>(),
							normalGroupActions = new ArrayList<>();
					for (TemplateGroupAction action : groupActions) {
						if (TextUtils.hasText(action.getIconClass())
								&& Integer.valueOf(1).equals(action.getOutgoing())) {
							outgoingGroupActions.add(action);
						} else {
							normalGroupActions.add(action);
						}
					}
					model.addAttribute("rabcTemplateGroup", tmplGroup);
					model.addAttribute("outgoingGroupActions", outgoingGroupActions);
					model.addAttribute("normalGroupActions", normalGroupActions);
					model.addAttribute("config", config);
					model.addAttribute("fieldDescMap", new FieldDescCacheMap(config.getConfigResolver()));
					model.addAttribute("relationCompositeId", fieldGroup.getCompositeId());
					return AdminConstants.JSP_MODULES + "/modules_update_tmpl.jsp";
				}
			}
		}
		return null;
	}

	@ResponseBody
	@RequestMapping("/rabc_save/{mainMenuId}/{rabcTemplateGroupId}")
	public ResponseJSON rabcSave(@PathVariable Long mainMenuId, @PathVariable Long rabcTemplateGroupId,
			@RequestParam(value = AdminConstants.KEY_FUSE_MODE, required = false) Boolean fuseMode,
			RequestParameterMapComposite composite) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		authService.validateL2MenuAccessable(mainMenuId);
		TemplateGroup rabcTmplGroup = tmplGroupService.getTemplate(rabcTemplateGroupId);
		String moduleName = rabcTmplGroup.getModule();
		Map<String, Object> entityMap = composite.getMap();
		try {
			entityMap.remove(AdminConstants.KEY_FUSE_MODE);
			UserIdentifier user = UserUtils.getCurrentUser();

			EntityQueryParameter param = new EntityQueryParameter(moduleName, user);

			EntityFusionRunner.running(fuseMode, jRes, entityMap, param, entityService);
		} catch (Exception e) {
			logger.error("保存时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/load_entities/{menuId}/{stmplId}")
	public ResponseJSON loadEntities(@PathVariable Long menuId, @PathVariable Long stmplId, @RequestParam String codes,
			@RequestParam String fields) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		authService.validateL2MenuAccessable(menuId);
		TemplateSelectionTemplate stmpl = stmplService.getTemplate(stmplId);
		Map<String, ? extends CEntityPropertyParser> parsers;
		Set<String> codeSet = TextUtils.split(codes, ",", HashSet<String>::new, c -> c);
		Set<String> fieldSet = TextUtils.split(fields, ",", HashSet<String>::new, f -> f);
		JSONObject entities;
		if (stmpl != null) {
			EntitiesQueryParameter param = new EntitiesQueryParameter(stmpl.getModule(), UserUtils.getCurrentUser());
			param.setEntityCodes(codeSet);
			param.setRelationName(stmpl.getRelationName());
			param.setOrderColumn(stmpl.getOrderColumn());
			parsers = entityService.queryRelationEntityParsers(param);
			entities = toEntitiesJson(parsers, fieldSet);
		} else {// 作为 groupId 使用
			Map<String, ModuleEntityPropertyParser> parserss = new HashMap<>();
			TemplateGroup tmplGroup = tmplGroupService.getTemplate(stmplId);
			for (String c : codeSet) {
				parserss.put(c, getEntity(c, tmplGroup));
			}
			parsers = parserss;
			Map<String, String> fieldMap = new HashMap<>();
			fieldSet.forEach(k -> {
				if(k.contains(".")) {
					fieldMap.put(k, k.split("\\.")[1]);
				}else {
					fieldMap.put(k, k);
				}
				
			});
			entities = toEntitiesJson(parsers, fieldMap);
		}

		/*
		 * Map<String, CEntityPropertyParser> parsers = mService.getEntityParsers(
		 * stmpl.getModule(), stmpl.getRelationName(), TextUtils.split(codes, ",",
		 * HashSet<String>::new, c->c), UserUtils.getCurrentUser()) ;
		 */

		jRes.put("entities", entities);
		jRes.setStatus("suc");
		return jRes;
	}

	@ResponseBody
	@RequestMapping("/load_rabc_entities/{menuId}/{relationCompositeId}")
	public ResponseJSON loadRabcEntities(@PathVariable Long menuId, @PathVariable Integer relationCompositeId,
			String codes, String fields) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		return aLoadRabcEntities(menu.getTemplateModule(), relationCompositeId, codes, fields);
	}

	@ResponseBody
	@RequestMapping("/node_load_rabc_entities/{menuId}/{nodeId}/{relationCompositeId}")
	public ResponseJSON nodeLoadRabcEntities(@PathVariable Long menuId, @PathVariable Long nodeId,
			@PathVariable Integer relationCompositeId, String codes, String fields) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		TemplateTreeNode nodeTemplate = treeService.getNodeTemplate(menu.getTemplateModule(), nodeId);
		return aLoadRabcEntities(nodeTemplate.getModuleName(), relationCompositeId, codes, fields);
	}

	private ResponseJSON aLoadRabcEntities(String moduleName, Integer relationCompositeId, String codes,
			String fields) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		DictionaryComposite composite = dictService.getComposite(moduleName, relationCompositeId);
		EntitiesQueryParameter param = new EntitiesQueryParameter(composite.getModule(), UserUtils.getCurrentUser());
		param.setEntityCodes(TextUtils.split(codes, ",", HashSet<String>::new, c -> c));
		param.setRelationName(composite.getName());
		Map<String, RelSelectionEntityPropertyParser> parsers = entityService.queryRelationEntityParsers(param);
		JSONObject entities = toEntitiesJson(parsers, TextUtils.split(fields, ",", HashSet<String>::new, f -> f));
		jRes.put("entities", entities);
		jRes.setStatus("suc");
		return jRes;
	}

	public static JSONObject toEntitiesJson(Map<String, ? extends CEntityPropertyParser> parsers,
			Set<String> fieldNames) {
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

	/**
	 * 
	 * @param parsers
	 * @param fieldNameMap:key relationNodeName.fieldName,value fieldName
	 * @return
	 */
	public static JSONObject toEntitiesJson(Map<String, ? extends CEntityPropertyParser> parsers,
			Map<String, String> fieldNameMap) {
		JSONObject entities = new JSONObject();
		if (parsers != null && fieldNameMap != null) {
			parsers.forEach((code, parser) -> {
				JSONObject entity = new JSONObject();
				entity.put(ABCNodeProxy.CODE_PROPERTY_NAME_NORMAL, parser.getCode());
				entities.put(parser.getCode(), entity);
				for (String key : fieldNameMap.keySet()) {
					entity.put(key, parser.getFormatedProperty(fieldNameMap.get(key)));
				}
			});
		}
		return entities;
	}

	@SuppressWarnings("unchecked")
	@ResponseBody
	@RequestMapping("/do_action/{menuId}/{actionId}")
	public AjaxPageResponse doAction(@PathVariable Long menuId, @PathVariable Long actionId,
			@RequestParam(name = "codes") String codeStr) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		ArrayEntityProxy.setLocalUser(UserUtils.getCurrentUser());
		TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
		Object vRes = validateGroupAction(groupAction, menu, codeStr);
		if (vRes instanceof AjaxPageResponse) {
			return (AjaxPageResponse) vRes;
		}
		Set<String> codes = (Set<String>) vRes;
		TemplateActionTemplate action = atmplService.getTemplate(groupAction.getAtmplId());
		if (action != null) {
			try {
				int sucs = atmplService.doAction(action, codes,
						TemplateGroupAction.ACTION_MULTIPLE_TRANSACTION.equals(groupAction.getMultiple()),
						UserUtils.getCurrentUser());
				if(sucs==0) {
					return AjaxPageResponse.FAILD("执行失败");
				}else if(sucs<codes.size()){
					return AjaxPageResponse.FAILD("执行失败"+ (codes.size()-sucs) + "个实体。"+"处理成功"+ sucs + "个实体");
				}else {
					return AjaxPageResponse.REFRESH_LOCAL("执行结束, 共成功处理" + sucs + "个实体");
				}
			} catch (Exception e) {
				logger.error("操作失败", e);
				return AjaxPageResponse.FAILD("执行失败");
			}
		} else {
			return AjaxPageResponse.FAILD("操作不存在");
		}

	}

	@SuppressWarnings("unchecked")
	@ResponseBody
	@RequestMapping("/do_jump/{menuId}/{jumpId}")
	public ResponseJSON doJump(@PathVariable Long menuId, @PathVariable Long jumpId,
			@RequestParam(name = "codes") String codeStr) {
		SideMenuLevel2Menu menu = authService.validateL2MenuAccessable(menuId);
		UserIdentifier user = UserUtils.getCurrentUser();
		ArrayEntityProxy.setLocalUser(user);
		TemplateGroupJump groupJump = tmplGroupService.getTempateGroupJump(jumpId);
		Object vRes = validateGroupJump(groupJump, menu, codeStr);
		JSONObjectResponse jRes = new JSONObjectResponse();

		if (vRes instanceof AjaxPageResponse) {
			jRes.put("error", "跳转失败");
			return jRes;
		}

		Set<String> codes = (Set<String>) vRes;
		TemplateJumpTemplate jtmpl = jtmplService.getTemplate(groupJump.getJtmplId());

		if (jtmpl != null) {
			try {
				TemplateGroup tmplGroup = tmplGroupService.getTemplate(groupJump.getGroupId());
				ModuleMeta moduleMeta = mService.getModule(tmplGroup.getModule());
				EntityQueryParameter queryParam = new EntityQueryParameter(moduleMeta.getName(),
						codes.iterator().next(), user);
				ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);
				jRes.setStatus("suc");
				jRes.put("url", buildUrl(jtmpl, entity));
				return jRes;
			} catch (Exception e) {
				logger.error("操作失败", e);
				return jRes;
			}
		} else {
			return jRes;
		}
	}

	private Object buildUrl(TemplateJumpTemplate jtmpl, ModuleEntityPropertyParser entity) {
		List<TemplateJumpParam> params = jtmpl.getJtmplParams();
		StringBuffer sb = new StringBuffer();
		sb.append(jtmpl.getPath());
		if (!jtmpl.getPath().trim().endsWith("?")) {
			sb.append("?");
		}
		if (params != null) {
			for (TemplateJumpParam param : params) {
				sb.append(param.getName());
				sb.append("=");
				sb.append(entity.getProperty(param.getFieldTitle(), AttributeValueType.STRING));
				sb.append("&");
			}
		}
		return sb.toString();
	}

	public static Object validateGroupAction(TemplateGroupAction groupAction, SideMenuLevel2Menu menu, String codes) {
		if (!groupAction.getGroupId().equals(menu.getTemplateGroupId())) {
			throw new NonAuthorityException("二级菜单[id=" + menu.getId() + "]对应的模板组合[id=" + menu.getTemplateGroupId()
					+ "]与操作[id=" + groupAction.getId() + "]对应的模板组合[id=" + groupAction.getGroupId() + "]不一致");
		}
		if (!codes.isEmpty()) {
			Set<String> codeSet = collectCode(codes);
			if (!codeSet.isEmpty()) {
				if (codeSet.size() > 1) {
					if (TemplateGroupAction.ACTION_MULTIPLE_SINGLE.equals(groupAction.getMultiple())
							|| TemplateGroupAction.ACTION_FACE_DETAIL.equals(groupAction.getFace())) {
						// 操作要单选，那么不能处理多个code
						return AjaxPageResponse.FAILD("该操作只能处理一个编码");
					}
				}
				return codeSet;
			}
		}
		return AjaxPageResponse.FAILD("没有传入编码参数");

	}

	public static Object validateGroupJump(TemplateGroupJump groupJump, SideMenuLevel2Menu menu, String codes) {
		if (!groupJump.getGroupId().equals(menu.getTemplateGroupId())) {
			throw new NonAuthorityException("二级菜单[id=" + menu.getId() + "]对应的模板组合[id=" + menu.getTemplateGroupId()
					+ "]与操作[id=" + groupJump.getId() + "]对应的模板组合[id=" + groupJump.getGroupId() + "]不一致");
		}
		if (!codes.isEmpty()) {
			Set<String> codeSet = collectCode(codes);
			if (!codeSet.isEmpty()) {
				if (codeSet.size() > 1) {
					if (TemplateGroupAction.ACTION_MULTIPLE_SINGLE.equals(groupJump.getMultiple())
							|| TemplateGroupAction.ACTION_FACE_DETAIL.equals(groupJump.getFace())) {
						// 操作要单选，那么不能处理多个code
						return AjaxPageResponse.FAILD("该操作只能处理一个编码");
					}
				}
				return codeSet;
			}
		}
		return AjaxPageResponse.FAILD("没有传入编码参数");

	}

	private static Set<String> collectCode(String codes) {
		Set<String> codeSet = new LinkedHashSet<>();
		for (String code : codes.split(",")) {
			if (!code.isEmpty()) {
				codeSet.add(code);
			}
		}
		;
		return codeSet;
	}

}
