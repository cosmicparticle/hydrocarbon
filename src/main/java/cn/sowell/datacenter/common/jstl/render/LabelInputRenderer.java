package cn.sowell.datacenter.common.jstl.render;

import java.util.List;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public class LabelInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputRender<CRI>{

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"label"};
	}
	
	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $container = new HTMLTag("span");
		$container.addClass("cpf-select2-container");
		HTMLTag $select = new HTMLTag("select");
		$select
			.addClass("cpf-select2 format-submit-value")
			.attribute("multiple", "multiple")
			.attribute("name", getCriteriaName(tCriteria))
			.attribute("data-value", viewCriteia.getValue())
			;
		$container.append($select);
		
		List<String> labels = viewCriteia.getSelectLabels();
		for (String label : labels) {
			HTMLTag $option = new HTMLTag("option");
			$option
				.attribute("value", label)
				.text(label)
				;
			$select.append($option);
		}
		
		HTMLTag $signSpan = new HTMLTag("span");
		$signSpan.addClass("cpf-select2-sign");
		if("l1".equals(tCriteria.getComparator())) {
			$signSpan.addClass("cpf-select2-sign-or");
		}else if("l2".equals(tCriteria.getComparator())) {
			$signSpan.addClass("cpf-select2-sign-and");
		}
		$container.append($signSpan);
		return $container;
	}

	

}
