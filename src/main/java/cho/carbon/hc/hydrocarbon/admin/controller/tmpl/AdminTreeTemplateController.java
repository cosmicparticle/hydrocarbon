package cho.carbon.hc.hydrocarbon.admin.controller.tmpl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cho.carbon.hc.copframe.dto.ajax.AjaxPageResponse;
import cho.carbon.hc.copframe.dto.ajax.JSONObjectResponse;
import cho.carbon.hc.copframe.dto.ajax.JsonRequest;
import cho.carbon.hc.copframe.dto.ajax.ResponseJSON;
import cho.carbon.hc.copframe.utils.TextUtils;
import cho.carbon.hc.dataserver.model.modules.pojo.ModuleMeta;
import cho.carbon.hc.dataserver.model.modules.service.ModulesService;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeNode;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeNodeCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeRelation;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeRelationCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateTreeTemplate;
import cho.carbon.hc.dataserver.model.tmpl.service.TreeTemplateService;
import cho.carbon.hc.entityResolver.config.ModuleConfigStructure;
import cho.carbon.hc.hydrocarbon.admin.controller.AdminConstants;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.CommonTemplateActionConsumer.ChooseRequestParam;
import cho.carbon.hc.hydrocarbon.admin.controller.tmpl.ListTemplateFormater.Handlers;

@Controller
@RequestMapping(AdminConstants.URI_TMPL + "/tree")
public class AdminTreeTemplateController {
	
	@Resource
	ModulesService mService;

	@Resource
	TreeTemplateService treeService;
	
	@Resource
	CommonTemplateActionConsumer actionConsumer;

	static Logger logger = Logger.getLogger(AdminTreeTemplateController.class);
	
	@RequestMapping("/list/{moduleName}")
	public String list(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		List<TemplateTreeTemplate> ttmpls = treeService.queryAll(moduleName);
		model.addAttribute("ttmpls", ttmpls);
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_TREE + "/ttmpl_list.jsp";
	}
	
	@RequestMapping("/add/{moduleName}")
	public String add(@PathVariable String moduleName, Model model) {
		ModuleMeta module = mService.getModule(moduleName);
		ModuleConfigStructure configStructure = mService.getModuleConfigStructure(moduleName);
		model.addAttribute("configStructure", configStructure);
		model.addAttribute("configStructureJson", configStructure.toJson());
		model.addAttribute("module", module);
		return AdminConstants.JSP_TMPL_TREE + "/ttmpl_update.jsp";
	}
	
	@RequestMapping("/update/{ttmplId}")
	public String update(@PathVariable Long ttmplId, Model model) {
		TemplateTreeTemplate ttmpl = treeService.getTemplate(ttmplId);
		if(ttmpl != null) {
			ModuleMeta module = mService.getModule(ttmpl.getModule());
			ModuleConfigStructure configStructure = mService.getModuleConfigStructure(ttmpl.getModule());
			JSONObject ttmplJson = toTreeTemplateJson(ttmpl);
			model.addAttribute("configStructure", configStructure);
			model.addAttribute("configStructureJson", configStructure.toJson());
			model.addAttribute("ttmplJson", ttmplJson);
			model.addAttribute("ttmpl", ttmpl);
			model.addAttribute("module", module);
			return AdminConstants.JSP_TMPL_TREE + "/ttmpl_update.jsp";
		}
		return null;
	}
	
	private JSONObject toTreeTemplateJson(TemplateTreeTemplate ttmpl) {
		return (JSONObject) JSON.toJSON(ttmpl);
	}

	@ResponseBody
	@RequestMapping("/save/{moduleName}")
	public ResponseJSON save(String moduleName, @RequestBody JsonRequest jReq) {
		JSONObjectResponse jRes = new JSONObjectResponse();
		TemplateTreeTemplate ttmpl = toTreeTemplate(jReq.getJsonObject());
		try {
			Long ttmplId = treeService.merge(ttmpl);
			jRes.put("ttmplId", ttmplId);
			jRes.setStatus("suc");
		} catch (Exception e) {
			logger.error("保存树形模板时发生错误", e);
			jRes.setStatus("error");
		}
		return jRes;
	}
	
	@ResponseBody
	@RequestMapping("/remove/{ttmplId}")
	public AjaxPageResponse remove(@PathVariable Long ttmplId) {
		try {
			treeService.remove(ttmplId);
			return AjaxPageResponse.REFRESH_LOCAL("删除成功");
		} catch (Exception e) {
			logger.error("删除树形模板失败[id=" + ttmplId + "]", e);
			return AjaxPageResponse.FAILD("删除失败");
		}
	}

	
	private TemplateTreeTemplate toTreeTemplate(JSONObject jo) {
		JSONObject jTreeTempalte = jo.getJSONObject("ttmpl");
		if(jTreeTempalte != null) {
			TemplateTreeTemplate ttmpl = new TemplateTreeTemplate();
			ttmpl.setId(jTreeTempalte.getLong("id"));
			ttmpl.setTitle(jTreeTempalte.getString("title"));
			ttmpl.setModule(jTreeTempalte.getString("module"));
			Assert.hasText(ttmpl.getTitle(), "标题不能为空");
			Assert.hasText(ttmpl.getModule(), "模板不能为空");
			ttmpl.setDefaultNodeColor(jTreeTempalte.getString("defaultNodeColor"));
			ttmpl.setMaxDeep(jTreeTempalte.getInteger("maxDeep"));
			ttmpl.setNodes(new ArrayList<>());
			JSONArray jNodes = jTreeTempalte.getJSONArray("nodes");
			if(jNodes != null) {
				Handlers<?, ?, TemplateTreeNodeCriteria> nodeCriteriaHandlers = new Handlers<>();
				nodeCriteriaHandlers.setCriteriaConsumer((criteria, item)->{
					if(criteria.getFieldAvailable()) {
						criteria.setCompositeId(item.getInteger("compositeId"));
					}
				});
				Handlers<?, ?, TemplateTreeRelationCriteria> relCriteriaHandlers = new Handlers<>();
				relCriteriaHandlers.setCriteriaConsumer((criteria, item)->{
					if(criteria.getFieldAvailable()) {
						criteria.setCompositeId(item.getInteger("compositeId"));
						criteria.setFilterMode(item.getString("filterMode"));
						if(!TextUtils.hasText(criteria.getFilterMode())) {
							criteria.setFilterMode("field");
						}
						criteria.setFilterLabels(item.getString("filterLabels"));
						criteria.setIsExcludeLabel(item.getInteger("isExcludeLabel"));
					}
				});
				for (int nodeOrder = 0; nodeOrder < jNodes.size(); nodeOrder++) {
					JSONObject jNode = jNodes.getJSONObject(nodeOrder);
					TemplateTreeNode node = new TemplateTreeNode();
					node.setId(jNode.getLong("id"));
					node.setTitle(jNode.getString("title"));
					node.setModuleName(jNode.getString("moduleName"));
					node.setNodeColor(jNode.getString("nodeColor"));
					node.setSelector(jNode.getString("selector"));
					node.setOrder(nodeOrder);
					node.setText(jNode.getString("text"));
					node.setHideDetailButton(jNode.getInteger("hideDetailButton"));
					node.setHideUpdateButton(jNode.getInteger("hideUpdateButton"));
					node.setTemplateGroupId(jNode.getLong("templateGroupId"));
					ttmpl.getNodes().add(node);
					node.setIsRootNode(jNode.getInteger("isRootNode"));
					node.setIsDirect(jNode.getInteger("isDirect"));
					
					
					JSONArray jNodeCriterias = jNode.getJSONArray("criterias");
					if(jNodeCriterias != null) {
						node.setCriterias(ListTemplateFormater.getCriterias(jNodeCriterias, TemplateTreeNodeCriteria::new, nodeCriteriaHandlers));
					}
					
					node.setRelations(new ArrayList<>());
					JSONArray jRels = jNode.getJSONArray("relations");
					
					if(jRels != null) {
						for (int relOrder = 0; relOrder < jRels.size(); relOrder++) {
							JSONObject jRel = jRels.getJSONObject(relOrder);
							TemplateTreeRelation relation = new TemplateTreeRelation();
							relation.setId(jRel.getLong("id"));
							relation.setOrder(relOrder);
							relation.setRelationName(jRel.getString("relationName"));
							relation.setTitle(jRel.getString("title"));
							node.getRelations().add(relation);
							relation.setCriterias(new ArrayList<>());
							JSONArray jCriterias = jRel.getJSONArray("criterias");
							if(jCriterias != null) {
								List<TemplateTreeRelationCriteria> criterias = ListTemplateFormater.getCriterias(jCriterias, TemplateTreeRelationCriteria::new, relCriteriaHandlers);
								relation.setCriterias(criterias);
							}
						}
					}
				}
			}
			return ttmpl;
		}
		return null;
	}
	
	
	@RequestMapping("/choose/{moduleName}")
	private String choose(@PathVariable String moduleName, String except, Model model) {
		return actionConsumer.choose(
				ChooseRequestParam.create(moduleName, treeService, model)
					.setExcept(except)
					.setURI(AdminConstants.URI_TMPL + "/tree/choose/" +moduleName)
			);
	}
	
	@RequestMapping("/choose_with_node_module/{nodeModule}")
	public String chooseWithNodeModule(@PathVariable String nodeModule, String except, Model model) {
		return actionConsumer.choose(treeService.queryByNodeModule(nodeModule), 
				ChooseRequestParam.create(nodeModule, treeService, model)
					.setExcept(except)
					.setURI(AdminConstants.URI_TMPL + "/tree/choose_with_node_module/" + nodeModule)
				);
	}
	
	
}
