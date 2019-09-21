package cho.carbon.hc.hydrocarbon.common.jstl.render;

import java.util.Set;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.SuperTemplateListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;
import cho.carbon.hc.hydrocarbon.common.jstl.CriteriaInputRenderer;

public class RelationExistionInputRenderer<CRI extends AbstractListCriteria> implements CriteriaInputRenderer<CRI>{

	@Override
	public boolean match(CRI tCriteria) {
		if(tCriteria instanceof SuperTemplateListCriteria) {
			SuperTemplateListCriteria listCriteria = (SuperTemplateListCriteria) tCriteria;
			return "relation_existion".equals(listCriteria.getInputType())
					&& listCriteria.getComposite() != null;
		}
		return false;
	}

	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		SuperTemplateListCriteria listCriteria = (SuperTemplateListCriteria) tCriteria;
		HTMLTag $container = new HTMLTag("span");
		$container.addClass("cpf-select2-container");
		HTMLTag $select = new HTMLTag("select");
		$select.addClass("cpf-select2 format-submit-value")
				.attribute("name", getCriteriaName(listCriteria))
				.attribute("multiple", "multiple")
				.attribute("data-value", viewCriteia.getValue())
			;
		$container.append($select);
		
		Set<String> labels = listCriteria.getComposite().getRelationSubdomain();
		for (String label : labels) {
			HTMLTag $option = new HTMLTag("option");
			$option
				.attribute("value", label)
				.text(label);
			$select.append($option);
		}
		return $container;
		
	}
}
