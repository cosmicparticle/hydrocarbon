package cho.carbon.hc.hydrocarbon.common.jstl.render;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

public class DateRangeInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputRender<CRI>{

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"daterange"};
	}
	
	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $span = new HTMLTag("span");
		$span
			.addClass("cpf-daterangepicker format-submit-value")
			.attribute("data-name", getCriteriaName(tCriteria))
			.attribute("data-value", viewCriteia.getValue())
			;
		return $span;
	}
}
