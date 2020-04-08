package cho.carbon.hc.hydrocarbon.api2.controller.entity;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.dto.page.PageInfo;
import cho.carbon.hc.copframe.utils.CollectionUtils;
import cho.carbon.hc.copframe.utils.FormatUtils;
import cho.carbon.hc.copframe.utils.JsonUtils;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.dict.service.DictionaryService;
import cho.carbon.hc.dataserver.model.modules.pojo.EntityVersionItem;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityItem;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQuery;
import cho.carbon.hc.dataserver.model.modules.service.view.EntityQueryPool;
import cho.carbon.hc.dataserver.model.modules.service.view.PagedEntityList;
import cho.carbon.hc.dataserver.model.modules.service.view.TreeNodeContext;
import cho.carbon.hc.dataserver.model.service.EntitiesQueryParameter;
import cho.carbon.hc.dataserver.model.service.EntityFusionRunner;
import cho.carbon.hc.dataserver.model.service.EntityQueryParameter;
import cho.carbon.hc.dataserver.model.service.ModuleEntityService;
import cho.carbon.hc.dataserver.model.statview.service.StatViewService;
import cho.carbon.hc.dataserver.model.tmpl.manager.TreeTemplateManager.TreeRelationComposite;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.ArrayEntityProxy;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailField;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupJump;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpParam;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateJumpTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateRActionTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateStatView;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeNode;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.ActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ArrayItemFilterService;
import cho.carbon.hc.dataserver.model.tmpl.service.DetailTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.JumpTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.ListCriteriaFactory;
import cho.carbon.hc.dataserver.model.tmpl.service.ListTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.RActionTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.StatListTemplateService;
import cho.carbon.hc.dataserver.model.tmpl.service.TemplateGroupService;
import cho.carbon.hc.dataserver.model.tmpl.service.TreeTemplateService;
import cho.carbon.hc.entityResolver.ModuleEntityPropertyParser;
import cho.carbon.hc.entityResolver.impl.RelSelectionEntityPropertyParser;
import cho.carbon.hc.hydrocarbon.api2.controller.Api2Constants;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.common.EntityQueryPoolUtils;
import cho.carbon.hc.hydrocarbon.common.RequestParameterMapComposite;
import cho.carbon.hc.hydrocarbon.model.api2.service.MetaJsonService;
import cho.carbon.hc.hydrocarbon.model.api2.service.TemplateJsonParseService;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailParamter;
import cho.carbon.hc.hydrocarbon.model.config.bean.ValidateDetailResult;
import cho.carbon.hc.hydrocarbon.model.config.pojo.SideMenuLevel2Menu;
import cho.carbon.hc.hydrocarbon.model.config.service.AuthorityService;
import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;
import cho.carbon.hc.hydrocarbon.model.config.service.SideMenuService;
import cho.carbon.hc.hydrocarbon.model.modules.bean.EntityDetail;
import cho.carbon.hc.hydrocarbon.model.modules.service.EntityConvertService;
import cho.carbon.meta.enun.AttributeValueType;

@RestController
@RequestMapping(Api2Constants.URI_ENTITY + "/curd")
public class Api2EntityCurdController {
	@Resource
	DictionaryService dictService;

	@Resource
	SideMenuService menuService;

	@Resource
	AuthorityService authService;

	@Resource
	TemplateGroupService tmplGroupService;

	@Resource
	ListTemplateService ltmplService;

	@Resource
	ModulesService mService;

	@Resource
	ListCriteriaFactory lcriteriFacrory;

	@Resource
	ApplicationContext applicationContext;

	@Resource
	TemplateJsonParseService tJsonService;

	@Resource
	MetaJsonService mJsonService;

	@Resource
	ModuleEntityService entityService;

	@Resource
	TreeTemplateService treeService;

	@Resource
	ArrayItemFilterService arrayItemFilterService;

	@Resource
	EntityConvertService entityConvertService;

	@Resource
	ActionTemplateService atmplService;

	@Resource
	RActionTemplateService ratmplService;

	@Resource
	DetailTemplateService dtmplService;

	@Resource
	MetaJsonService metaService;

	@Resource
	StatViewService statViewService;

	@Resource
	StatListTemplateService statListService;

	@Resource
	JumpTemplateService jtmplService;

	static Logger logger = Logger.getLogger(Api2EntityCurdController.class);

	@RequestMapping({ "/start_query/{menuId}", "/start_query/{menuId}/{ratmplId}/{rootCode}" })
	public ResponseJSON startQuery(@PathVariable Long menuId, @PathVariable(required = false) Long ratmplId,
			@PathVariable(required = false) String rootCode, PageInfo pageInfo, HttpServletRequest request,
			String disabledColIds, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		
		TemplateRActionTemplate raction =null;

		if (menu.getStatViewId() != null || menu.getTemplateGroupId() != null) {
			Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
			AbstractListTemplate<?, ?> ltmpl = null;
			// 获得查询池
			EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
			// 注册一个查询
			EntityQuery query = qPool.regist();
			
			query.setPageSize(pageInfo.getPageSize());
			if (ratmplId != null) {
				raction = ratmplService.getTemplate(ratmplId);
				TemplateRActionTemplate tmpl = ratmplService.getTemplate(ratmplId);
				TemplateGroup tmplGroup = null;
				if (tmpl != null) {
					tmplGroup = tmplGroupService.getTemplate(tmpl.getGroupId());
				}
				query.setModuleName(tmplGroup.getModule()).setParentEntityCode(rootCode);
				ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
				query.setTemplateGroup(tmplGroup);
				query.setRactionTemplate(tmpl);
			} else if (menu.getStatViewId() != null) {
				query.setModuleName(menu.getTemplateModule());
				TemplateStatView statViewTmpl = statViewService.getTemplate(menu.getStatViewId());
				ltmpl = statListService.getTemplate(statViewTmpl.getStatListTemplateId());
				Set<Long> disabledColumnIds = TextUtils.splitToLongSet(disabledColIds, ",");
				query.setStatViewTemplate(statViewTmpl).setStatDisabledColumnIds(disabledColumnIds);
			} else if (menu.getTemplateGroupId() != null) {
				query.setModuleName(menu.getTemplateModule());
				TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
				ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
				// 根据上下文获得节点模板
				// 设置参数
				query.setTemplateGroup(tmplGroup);
			}
			// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
			query.prepare(requrestCriteriaMap, applicationContext);
			// 传递参数到页面
			writeListPageAttributes(jRes, query, menu, ltmpl);
		}
		if(raction!=null) {
			jRes.put("ratmplId", ratmplId);
			jRes.put("rootCode", rootCode);
			jRes.put("ratmplTitle", raction.getTitle());
		}
		return jRes;
	}

//	@RequestMapping({})
//	public ResponseJSON startRelationQuery(@PathVariable Long menuId, @PathVariable Long ratmplId,
//			@PathVariable String recordCode, PageInfo pageInfo, HttpServletRequest request, String disabledColIds,
//			ApiUser user) {
//		JSONObjectResponse jRes = new JSONObjectResponse();
//		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
//
//		// 获得查询池
//		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
//		// 注册一个查询
//		EntityQuery query = qPool.regist();
//		AbstractListTemplate<?, ?> ltmpl = null;
//		if (tmplGroup != null) {
//			Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
//
//			query.setModuleName(tmplGroup.getModule()).setParentEntityCode(recordCode)
//					.setRelationType(tmpl.getRelationType()).setTemplateGroup(tmplGroup);
//			query.setPageSize(pageInfo.getPageSize());
//
//			ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
//			// 根据上下文获得节点模板
//			// 设置参数
//			query.setTemplateGroup(tmplGroup);
//
//			// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
//			query.prepare(requrestCriteriaMap, applicationContext);
//
//		}
//		// 传递参数到页面
//		writeListPageAttributes(jRes, query, menu, ltmpl);
//		jRes.put("ratmplId", ratmplId);
//		jRes.put("rootCode", recordCode);
//		return jRes;
//
//	}

	private void writeListPageAttributes(JSONObjectResponse jRes, EntityQuery query, SideMenuLevel2Menu menu,
			AbstractListTemplate<?, ?> ltmpl) {
		jRes.put("queryKey", query.getKey());
		jRes.put("menu", mJsonService.toMenuJson(menu));

		jRes.put("ltmpl", tJsonService.toListTemplateJson(ltmpl));
		jRes.put("criteriaValueMap", JsonUtils.convertToStringKeyMap(query.getCriteriaValueMap()));
		jRes.put("moduleWritable", mService.getModuleEntityWritable(menu.getTemplateModule()));
		jRes.put("tmplGroup", tJsonService.toTemplateGroupJson(query.getTemplateGroup()));
		jRes.put("statView", tJsonService.toStatViewJson(query.getStatViewTemplate()));
		jRes.put("disabledColIds", query.getStatDisabledColumnIds());
	}

	@RequestMapping("/tree/{menuId}")
	public ResponseJSON tree(@PathVariable Long menuId, HttpSession session, PageInfo pageInfo,
			HttpServletRequest request, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();

		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		TemplateGroup tmplGroup = tmplGroupService.getTemplate(menu.getTemplateGroupId());
		TemplateListTemplate ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
		// 获得查询池
		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
		// 注册一个查询
		EntityQuery query = qPool.regist();
		TemplateTreeTemplate ttmpl = treeService.getTemplate(tmplGroup.getTreeTemplateId());
		// 根据上下文获得节点模板
		TemplateTreeNode nodeTemplate = treeService.getDefaultNodeTemplate(ttmpl);
		// 设置参数
		query.setModuleName(menu.getTemplateModule()).setPageSize(pageInfo.getPageSize()).setTemplateGroup(tmplGroup)
				.setNodeTemplate(nodeTemplate);
		Map<Long, String> requrestCriteriaMap = lcriteriFacrory.exractTemplateCriteriaMap(request);
		// 根据传入的条件和约束开始初始化查询对象，但还不获取实体数据
		query.prepare(requrestCriteriaMap, applicationContext);
		String nodesCSS = treeService.generateNodesCSS(ttmpl);
		jRes.put("nodeCSS", nodesCSS);
		jRes.put("nodeTmpl", query.getNodeTemplate());
		jRes.put("nodeStyle", treeService.getTreeNodeStyle(ttmpl));
		writeListPageAttributes(jRes, query, menu, ltmpl);
		return jRes;
	}

	@RequestMapping("/start_query_rel/{menuId}/{parentEntityCode}/{nodeRelationId}")
	public ResponseJSON treeNode(@PathVariable Long menuId, @PathVariable String parentEntityCode,
			@PathVariable Long nodeRelationId, @RequestParam(required = false, defaultValue = "10") Integer pageSize,
			ApiUser user) {
		authService.validateUserL2MenuAccessable(user, menuId);
		JSONObjectResponse jRes = new JSONObjectResponse();

		TreeRelationComposite relationComposite = treeService.getNodeRelationTemplate(nodeRelationId);
		if (relationComposite != null) {
			// 构造查询节点的上下文
			TreeNodeContext nodeContext = new TreeNodeContext(relationComposite);
			// 设置当前节点路径
			// nodeContext.setPath(path);
			// 根据上下文获得节点模板
			TemplateTreeNode itemNodeTemplate = treeService.analyzeNodeTemplate(nodeContext);
			// 获得查询池
			EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
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

	@RequestMapping("/ask_for/{queryKey}")
	public ResponseJSON askFor(@PathVariable String queryKey, PageInfo pageInfo, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		EntityQueryPool pool = EntityQueryPoolUtils.getEntityQueryPool(user);
		EntityQuery query = pool.getQuery(queryKey);
		query.setPageSize(pageInfo.getPageSize());
		PagedEntityList el = query.pageList(pageInfo.getPageNo());

		List<EntityItem> entities = entityService.convertEntityItems(el);
		jRes.put("entities", entities);
		jRes.put("isEndList", el.getIsEndList());
		jRes.put("queryKey", query.getKey());
		JSONObject jPageInfo = new JSONObject();

		jPageInfo.put("pageSize", query.getPageSize());
		jPageInfo.put("pageNo", query.getPageNo());
		jPageInfo.put("virtualEndPageNo", query.getVirtualEndPageNo());
		jRes.put("pageInfo", jPageInfo);

		return jRes;
	}

	@ResponseBody
	@RequestMapping("/get_entities_count/{queryKey}")
	public ResponseJSON getEntitiesCount(@PathVariable String queryKey, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		EntityQueryPool pool = EntityQueryPoolUtils.getEntityQueryPool(user);
		EntityQuery query = pool.getQuery(queryKey);
		jRes.put("count", query.getCount());
		jRes.setStatus("suc");
		return jRes;
	}

	@RequestMapping({ "/remove/{menuId}", "/remove/{menuId}/{ratmplId}" })
	public ResponseJSON remove(@PathVariable Long menuId, @PathVariable(required = false) Long ratmplId, String codes,
			ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		Set<String> entityCodes = TextUtils.split(codes, ",");
		String modi;
		if (ratmplId != null) {
			modi = tmplGroupService.getTemplate(ratmplService.getTemplate(ratmplId).getGroupId()).getModule();
		} else {
			modi = menu.getTemplateModule();
		}
		EntitiesQueryParameter param = new EntitiesQueryParameter(modi, user);
		param.setEntityCodes(entityCodes);
		try {
			entityService.remove(param);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("删除实体失败", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	@RequestMapping({ "/save/{contextType:normal}/{validateSign:user|\\d+}",
			"/save/{contextType:normal}/{validateSign:user|\\d+}/*",
			"/save/{contextType:rabc}/{validateSign:user|\\d+}/{fieldGroupId}",
			"/save/{contextType:node}/{validateSign:user|\\d+}/{nodeId}",
			"/save/{contextType:relation}/{validateSign:user|\\d+}/{ratmplId}/{rootCode}" })
	public ResponseJSON save(@PathVariable String contextType, @PathVariable String validateSign,
			@PathVariable(required = false) Long fieldGroupId, @PathVariable(required = false) Long nodeId,
			@PathVariable(required = false) Long ratmplId, @PathVariable(required = false) Long rootCode, Long dtmplId,
			@RequestParam(value = Api2Constants.KEY_FUSE_MODE, required = false) Boolean fuseMode,
			@RequestParam(value = Api2Constants.KEY_ACTION_ID, required = false) Long actionId,
			RequestParameterMapComposite composite, ApiUser user) {
		ValidateDetailParamter vparam = new ValidateDetailParamter(validateSign, user);
		vparam.setNodeId(nodeId).setDetailTemplateId(dtmplId).setFieldGroupId(fieldGroupId).setRatmplId(ratmplId);
		ValidateDetailResult validateResult = authService.validateDetailAuth(vparam);

		JSONObjectResponse jRes = new JSONObjectResponse();
		Map<String, Object> entityMap = composite.getMap();
		if (actionId != null) {
			ArrayEntityProxy.setLocalUser(user);
			TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
			authService.validateGroupAction(groupAction, validateResult.getTmplGroup(), "");
			entityMap = atmplService.coverActionFields(groupAction, entityMap);
		}
		try {
			entityMap.remove(Api2Constants.KEY_FUSE_MODE);
			entityMap.remove(Api2Constants.KEY_ACTION_ID);

			EntityQueryParameter param = new EntityQueryParameter(validateResult.getDetailTemplate().getModule(), user);
			param.setArrayItemCriterias(arrayItemFilterService
					.getArrayItemFilterCriterias(validateResult.getDetailTemplate().getId(), user));
			
			if(ratmplId!=null) {//添加一个关系吧
				TemplateRActionTemplate ratmpl = ratmplService.getTemplate(ratmplId);
				
				String compName=dictService.getComposite(tmplGroupService.getTemplate(ratmpl.getGroupId()).getModule(), ratmpl.getCompositeId()).getName();
				entityMap.put(compName+".$$flag$$", true);
				entityMap.put(compName+"[0].$$label$$", ratmpl.getRelationName());
				entityMap.put(compName+"[0].唯一编码", rootCode);		
			}
			
			EntityFusionRunner.running(fuseMode, jRes, entityMap, param, entityService);
		} catch (Exception e) {
			logger.error("保存实体时出现异常", e);
			jRes.setStatus("error");
		}
		return jRes;
	}

	@RequestMapping("/do_action/{menuId}/{actionId}")
	public ResponseJSON doAction(@PathVariable Long menuId, @PathVariable Long actionId, String codes, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		authService.validateUserL2MenuAccessable(user, menuId);
		Set<String> entityCodes = TextUtils.split(codes, ",");
		if (entityCodes.isEmpty()) {
			jRes.setStatus("error");
			jRes.put("error", "没有传入codes参数");
		} else {
			ArrayEntityProxy.setLocalUser(user);
			TemplateGroupAction groupAction = tmplGroupService.getTempateGroupAction(actionId);
			TemplateActionTemplate atmpl = atmplService.getTemplate(groupAction.getAtmplId());
			if (atmpl != null) {
				if (entityCodes.size() > 1) {
					if (TemplateGroupAction.ACTION_MULTIPLE_SINGLE.equals(groupAction.getMultiple())
							|| TemplateGroupAction.ACTION_FACE_DETAIL.equals(groupAction.getFace())) {
						// 操作要单选，那么不能处理多个code
						jRes.setStatus("error");
						jRes.put("message", "该操作只能处理一个编码");
						return jRes;
					}
				}
				try {
					int sucs = atmplService.doAction(atmpl, entityCodes,
							TemplateGroupAction.ACTION_MULTIPLE_TRANSACTION.equals(groupAction.getMultiple()), user);
					jRes.setStatus("suc");
					jRes.put("sucsCount", sucs);
				} catch (Exception e) {
					logger.error("执行失败", e);
					jRes.setStatus("操作执行失败");
				}
			} else {
				jRes.setStatus("not found action");
			}
		}
		return jRes;
	}

	@RequestMapping("/do_jump/{menuId}/{jumpId}")
	public ResponseJSON doJump(@PathVariable Long menuId, @PathVariable Long jumpId, String codes, ApiUser user) {
		authService.validateUserL2MenuAccessable(user, menuId);
		TemplateGroupJump groupJump = tmplGroupService.getTempateGroupJump(jumpId);
		Object vRes = validateGroupJump(groupJump, menuId, codes);
		JSONObjectResponse jRes = new JSONObjectResponse();

		if (vRes instanceof AjaxPageResponse) {
			jRes.put("error", "跳转失败");
			return jRes;
		}

		Set<String> cs = (Set<String>) vRes;
		TemplateJumpTemplate jtmpl = jtmplService.getTemplate(groupJump.getJtmplId());

		if (jtmpl != null) {
			try {
				TemplateGroup tmplGroup = tmplGroupService.getTemplate(groupJump.getGroupId());
				ModuleMeta moduleMeta = mService.getModule(tmplGroup.getModule());
				EntityQueryParameter queryParam = new EntityQueryParameter(moduleMeta.getName(), cs.iterator().next(),
						user);
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

	public Object validateGroupJump(TemplateGroupJump groupJump, Long menuId, String codes) {

		SideMenuLevel2Menu menu = menuService.getLevel2Menu(menuId);

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

	@RequestMapping({ "/detail/{validateSign:\\d+}/{code}", "/detail/{validateSign:user}/*",
			"/detail/{validateSign:\\d+}/{ratmplId}/{code}" })
	public ResponseJSON detail(@PathVariable String validateSign, @PathVariable(required = false) String code,
			@PathVariable(required = false) Long ratmplId, Long versionCode, Long nodeId, Long fieldGroupId,
			Long dtmplId, ApiUser user) {
		ValidateDetailParamter vparam = new ValidateDetailParamter(validateSign, user);
		vparam.setCode(code).setNodeId(nodeId).setFieldGroupId(fieldGroupId).setRatmplId(ratmplId)
				.setDetailTemplateId(dtmplId);
		// 检测用户的权限
		ValidateDetailResult vResult = authService.validateDetailAuth(vparam);
		TemplateDetailTemplate dtmpl = vResult.getDetailTemplate();
		JSONObjectResponse jRes = new JSONObjectResponse();
		// 获得实体对象
		EntityQueryParameter queryParam = new EntityQueryParameter(dtmpl.getModule(), vResult.getEntityCode(), user);
		queryParam.setArrayItemCriterias(arrayItemFilterService.getArrayItemFilterCriterias(dtmpl.getId(), user));
		ModuleEntityPropertyParser entity = entityService.getEntityParser(queryParam);

		EntityVersionItem lastHistory = entityService.getLastHistoryItem(queryParam);
		if (versionCode != null && lastHistory != null && !versionCode.equals(lastHistory.getCode())) {
			entity = entityService.getHistoryEntityParser(queryParam, versionCode, null);
		}
		if (entity == null) {
			entity = entityService.getEntityParser(queryParam);
		}

		if (entity == null) {
			jRes.setStatus("notFoundEntity");
			jRes.put("message", "没有找到实体");
		} else {
			// 用模板组合解析，并返回可以解析为json的对象
			EntityDetail detail = entityConvertService.convertEntityDetail(entity,
					dtmplService.getTemplate(dtmpl.getId()));
			jRes.put("entity", detail);
			jRes.put("errors", new byte[0]);
			// jRes.put("errors", entityConvertService.toErrorItems(entity.getErrors()));
			jRes.put("versionCode", versionCode);
			jRes.setStatus("suc");
		}
		return jRes;
	}

	@RequestMapping({ "/history/{validateSign:\\d+}/{code}/{pageNo}", "/history/{validateSign:user}/*/{pageNo}",
			"/history/{validateSign:user}/{pageNo}" })
	public ResponseJSON entityHistory(@PathVariable String validateSign, @PathVariable(required = false) String code,
			Long fieldGroupId, Long nodeId, String versionCode, @PathVariable Integer pageNo, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		ValidateDetailParamter vParam = new ValidateDetailParamter(validateSign, user);
		vParam.setNodeId(nodeId).setFieldGroupId(fieldGroupId).setCode(code);
		// 检测用户的权限
		ValidateDetailResult vResult = authService.validateDetailAuth(vParam);

		EntityQueryParameter queryParam = new EntityQueryParameter(vResult.getDetailTemplate().getModule(),
				vResult.getEntityCode(), user);
		List<EntityVersionItem> historyItems = entityService.queryHistory(queryParam, pageNo, 100);
		JSONArray aHistoryItems = entityConvertService.toHistoryItems(historyItems, versionCode);
		jRes.put("history", aHistoryItems);
		return jRes;
	}

	@RequestMapping({ "/query_select_entities/{validateSign:user|\\d+}/{groupId}" })
	public ResponseJSON querySelectEntities(@PathVariable String validateSign, @PathVariable Long groupId,
			String excepts, HttpServletRequest request, ApiUser user) {
		TemplateDetailFieldGroup fieldGroup = authService.validateSelectionAuth(validateSign, groupId, user);
		JSONObjectResponse jRes = new JSONObjectResponse();
		EntityQueryPool qPool = EntityQueryPoolUtils.getEntityQueryPool(user);
		EntityQuery query = qPool.regist();
		query.addExcludeEntityCodes(TextUtils.split(excepts, ","));
		entityService.wrapSelectEntityQuery(query, fieldGroup, lcriteriFacrory.exractTemplateCriteriaMap(request));
		jRes.put("queryKey", query.getKey());
		return jRes;
	}

	@RequestMapping({ "/load_entities/{validateSign:user|\\d+}/{groupId}" })
	public ResponseJSON loadSelectedEntities(@PathVariable String validateSign, @PathVariable Long groupId,
			@RequestParam String codes, String fieldNames, String dfieldIds, ApiUser user) {
		TemplateDetailFieldGroup fieldGroup = authService.validateSelectionAuth(validateSign, groupId, user);
		Set<String> codeSet = TextUtils.split(codes, ",");
		codeSet.remove("");

		Set<String> fieldNameSet = null;
		Map<Long, String> dfieldIdNameMap = null;

		if (fieldNames != null && fieldNames.isEmpty()) {
			fieldNameSet = TextUtils.split(fieldNames, ",");
			fieldNameSet.remove("");
		} else {
			if (dfieldIds != null && !dfieldIds.isEmpty()) {
				dfieldIdNameMap = new HashMap<>();
				Set<Long> dfieldIdSet = TextUtils.split(dfieldIds, ",", HashSet::new, FormatUtils::toLong);
				Map<Long, TemplateDetailField> dfieldMap = CollectionUtils.toMap(fieldGroup.getFields(),
						TemplateDetailField::getId);
				for (Long dfieldId : dfieldIdSet) {
					TemplateDetailField dfield = dfieldMap.get(dfieldId);
					if (dfield != null) {
						dfieldIdNameMap.put(dfieldId, dfield.getFieldName());
					}
				}
			}
		}

		if (fieldNameSet != null && fieldNameSet.isEmpty() || dfieldIdNameMap != null && !dfieldIdNameMap.isEmpty()) {
			Map<String, RelSelectionEntityPropertyParser> entityMap = entityService.loadEntities(codeSet, fieldGroup,
					user);
			JSONObject jEntities = entityConvertService.toEntitiesJson(entityMap, fieldNameSet, dfieldIdNameMap);
			JSONObjectResponse jRes = new JSONObjectResponse();
			jRes.setJsonObject(jEntities);
			jRes.setStatus("suc");
			return jRes;
		} else {
			throw new RuntimeException("Must set unempty parameter one of \"fieldNames\" or \"dfieldIds\"");
		}

	}

	@RequestMapping("/recalc/{menuId}")
	public ResponseJSON recalc(@PathVariable Long menuId, ApiUser user) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		SideMenuLevel2Menu menu = authService.validateUserL2MenuAccessable(user, menuId);
		if (menu.getStatViewId() != null) {
			try {
				statViewService.recalc(menu.getTemplateModule(), user);
				jRes.setStatus("suc");
			} catch (Exception e) {
				jRes.setStatus("error");
				jRes.put("errorMsg", e.getMessage());
				logger.error("统计数据时发生错误", e);
			}
		}
		return jRes;
	}

}
