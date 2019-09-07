package cn.sowell.datacenter.common.jstl.render;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public class RangeInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputRender<CRI>{

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"range"};
	}
	
	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $span = new HTMLTag("span");
		$span
			.addClass("cpf-textrange format-submit-value")
			.attribute("data-name", getCriteriaName(tCriteria))
			.attribute("data-value", viewCriteia.getValue())
			;
		return $span;
	}

	

}
