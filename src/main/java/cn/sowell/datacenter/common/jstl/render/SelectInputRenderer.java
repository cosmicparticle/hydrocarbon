package cn.sowell.datacenter.common.jstl.render;

import java.util.List;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.dict.pojo.OptionItem;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public class SelectInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputFormControlRenderer<CRI>{

	
	private static final String MULTISELECT = "multiselect";

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"select", MULTISELECT};
	}
	
	@Override
	protected HTMLTag createInputTag(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $select = new HTMLTag("select");
		$select
			.addClass("cpf-select2")
			.attribute("data-value", viewCriteia.getValue())
			;
		
		if(MULTISELECT.equals(tCriteria.getInputType())) {
			$select
				.addClass("format-submit-value")
				.attribute("multiple", "multiple")
				;
		}
		
		List<OptionItem> options = viewCriteia.getSelectOptions();
		HTMLTag $defOption = new HTMLTag("option");
		$defOption
			.attribute("value", "")
			.text("--请选择--")
			;
		$select.append($defOption);
		for (OptionItem option : options) {
			HTMLTag $option = new HTMLTag("option");
			$option
				.attribute("value", option.getValue())
				.text(option.getTitle());
			$select.append($option);
		}
		return $select;
	}
}
