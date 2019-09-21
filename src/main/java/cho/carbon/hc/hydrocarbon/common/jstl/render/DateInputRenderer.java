package cho.carbon.hc.hydrocarbon.common.jstl.render;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

public class DateInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputFormControlRenderer<CRI>{

	
	private static final String DATE = "date";
	private static final String DATETIME = "datetime";
	private static final String TIME = "time";
	private static final String YEARMONTH = "yearmonth";
	private static final String YMRANGE = "ymrange";

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {DATE, DATETIME, TIME, YEARMONTH, YMRANGE};
	}

	@Override
	protected HTMLTag createInputTag(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $input = new HTMLTag("input");
		$input
			.addClass(tCriteria.getInputType() + "picker")
			.attribute("type", "text")
			.attribute("autocomplete", "off")
			.attribute("value", viewCriteia.getValue())
		;
		return $input;
	}

}
