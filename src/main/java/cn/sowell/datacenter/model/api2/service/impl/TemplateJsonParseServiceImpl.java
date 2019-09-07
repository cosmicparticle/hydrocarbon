package cn.sowell.datacenter.model.api2.service.impl;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import cn.sowell.datacenter.model.api2.service.MetaJsonService;
import cn.sowell.datacenter.model.api2.service.TemplateJsonParseService;
import cn.sowell.datacenter.model.config.bean.ValidateDetailResult;
import cn.sowell.dataserver.model.modules.pojo.ModuleMeta;
import cn.sowell.dataserver.model.modules.service.ModulesService;
import cn.sowell.dataserver.model.modules.service.view.EntityView;
import cn.sowell.dataserver.model.modules.service.view.EntityViewCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListColumn;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListTemplate;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailFieldGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateDetailFieldGroupTreeNode;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroup;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateStatView;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateTreeNode;
import cn.sowell.dataserver.model.tmpl.pojo.TemplateTreeTemplate;
import cn.sowell.dataserver.model.tmpl.service.DetailTemplateService;
import cn.sowell.dataserver.model.tmpl.service.ListTemplateService;
import cn.sowell.dataserver.model.tmpl.service.SelectionTemplateService;
import cn.sowell.dataserver.model.tmpl.service.TemplateGroupService;
import cn.sowell.dataserver.model.tmpl.service.TreeTemplateService;

@Service
public class TemplateJsonParseServiceImpl implements TemplateJsonParseService{

	@Resource
	SelectionTemplateService stmplService;
	
	@Resource
	TreeTemplateService treeService;
	
	@Resource
	TemplateGroupService tmplGroupService;
	
	@Resource
	ListTemplateService ltmplService;
	
	@Resource
	DetailTemplateService dtmplService;
	
	@Resource
	MetaJsonService metaService;
	
	@Resource
	ModulesService moduleService;
	
	static Pattern operatePattern = Pattern.compile("^operate[(-d)*(-u)*(-r)*]$"); 
	public JSONObject toListTemplateJson(AbstractListTemplate<? extends AbstractListColumn, ? extends AbstractListCriteria> listTemplate) {
		JSONObject jDtmpl = new JSONObject();
		jDtmpl.put("id", listTemplate.getId());
		jDtmpl.put("title", listTemplate.getTitle());
		jDtmpl.put("module", listTemplate.getModule());
		jDtmpl.put("criterias", toCriterias(listTemplate.getCriterias()));
		jDtmpl.put("columns", toColumns(listTemplate.getColumns()));
		Set<String> operates = null;
		List<? extends AbstractListColumn> columns = listTemplate.getColumns();
		for (AbstractListColumn column : columns) {
			if(column.getSpecialField() != null && operates == null && column.getSpecialField().startsWith("operate")) {
				operates = new LinkedHashSet<>();
				String specialField = column.getSpecialField();
				if(specialField.contains("-d")) {
					operates.add("detail");
				}
				if(specialField.contains("-u")) {
					operates.add("update");
				}
				break;
			}
		}
		if(operates != null) {
			jDtmpl.put("operates", operates);
		}
		return jDtmpl;
	}
	
	private JSONArray toCriterias(List<? extends AbstractListCriteria> criterias) {
		JSONArray aCriterias = new JSONArray();
		if(criterias != null) {
			for (AbstractListCriteria criteria : criterias) {
				aCriterias.add(criteria);
			}
		}
		return aCriterias;
	}

	private JSONArray toColumns(List<? extends AbstractListColumn> columns) {
		JSONArray aColumns = new JSONArray();
		if(columns != null) {
			columns.forEach(column->{
				aColumns.add(column);
			});
		}
		return aColumns;
	}


	@SuppressWarnings({ "rawtypes", "unchecked" })
	public JSONArray toCriterias(EntityView view, 
			EntityViewCriteria lcriteria) {
		JSONArray aCriterias = new JSONArray();
		AbstractListTemplate ltmpl = view.getListTemplate();
		List<? extends AbstractListCriteria> criterias = ltmpl.getCriterias();
		if(criterias != null && !criterias.isEmpty()) {
			for (AbstractListCriteria criteria : criterias) {
				if(criteria.getQueryShow() != null) {
					JSONObject jCriteria = (JSONObject) JSONObject.toJSON(criteria);
					jCriteria.put("value", lcriteria.getTemplateCriteriaMap().get(criteria.getId()));
					aCriterias.add(jCriteria);
				}
			}
		}
		return aCriterias;
		
	}

	@Override
	public JSONObject toTemplateGroupJson(TemplateGroup tmplGroup) {
		return (JSONObject) JSONObject.toJSON(tmplGroup);
	}
	
	@Override
	public JSONObject toStatViewJson(TemplateStatView statViewTemplate) {
		return (JSONObject) JSONObject.toJSON(statViewTemplate);
	}
	
	@Override
	public JSONObject toSelectConfig(TemplateDetailFieldGroup fieldGroup) {
		JSONObject jConfig = new JSONObject();
		String dialogType = fieldGroup.getDialogSelectType();
		jConfig.put("type", dialogType);
		jConfig.put("selectModuleName", fieldGroup.getComposite().getRelModuleName());
		JSONArray jCriterias = new JSONArray(); 
		AbstractListTemplate<?,?> ltmpl = null;
		if(TemplateDetailFieldGroup.DIALOG_SELECT_TYPE_STMPL.equals(dialogType)) {
			//选择模板
			ltmpl = stmplService.getTemplate(fieldGroup.getSelectionTemplateId());
		}else if(TemplateDetailFieldGroup.DIALOG_SELECT_TYPE_LTMPL.equals(dialogType)) {
			//引用列表模板
			TemplateGroup tmplGroup = tmplGroupService.getTemplate(fieldGroup.getRabcTemplateGroupId());
			if(tmplGroup != null) {
				ltmpl = ltmplService.getTemplate(tmplGroup.getListTemplateId());
			}
		}else if(TemplateDetailFieldGroup.DIALOG_SELECT_TYPE_TTMPL.equals(dialogType)) {
			//树形模板
			TemplateTreeTemplate ttmpl = treeService.getTemplate(fieldGroup.getRabcTreeTemplateId());
			jConfig.put("nodeStyle", treeService.getTreeNodeStyle(ttmpl));
			TemplateTreeNode defaultNodeTempate = treeService.getDefaultNodeTemplate(ttmpl);
			if(defaultNodeTempate != null) {
				jConfig.put("nodeTmpl", defaultNodeTempate);
				jCriterias = toCriterias(defaultNodeTempate.getCriterias());
				long[] checkableNodeIds = fieldGroup.getRabcTreeNodes().stream().mapToLong(TemplateDetailFieldGroupTreeNode::getNodeTemplateId).toArray();
				jConfig.put("checkableNodeIds", checkableNodeIds);
			}
			jConfig.put("treeId", fieldGroup.getRabcTreeTemplateId());
		}
		if(ltmpl != null) {
			jConfig.put("columns", toColumns(ltmpl.getColumns()));
			jConfig.put("defaultPageSize", ltmpl.getDefaultPageSize());
			jCriterias = toCriterias(ltmpl.getCriterias());
		}
		jConfig.put("criterias", jCriterias);
		return jConfig;
	}

	@Override
	public JSONObject toDetailTemplateConfig(ValidateDetailResult validateResult) {
		if(validateResult != null) {
			JSONObject jConfig = new JSONObject();
			TemplateGroup tmplGroup = validateResult.getTmplGroup();
			if(validateResult.getDetailTemplate() != null) {
				jConfig.put("dtmpl", validateResult.getDetailTemplate());
			}
			if(tmplGroup != null) {
				ModuleMeta module = moduleService.getModule(tmplGroup.getModule());
				jConfig.put("module", metaService.toModuleJson(module));
				jConfig.put("premises", tmplGroup.getPremises());
				jConfig.put("buttonStatus", metaService.toButtonStatus(tmplGroup));
				if(tmplGroup.getActions() != null) {
					jConfig.put("actions", tmplGroup.getActions().stream()
							.filter(action->TemplateGroupAction.ACTION_FACE_DETAIL.equals(action.getFace()))
							.collect(Collectors.toList()));
				}
			}
			return jConfig;
		}
		return null;
	}
}
