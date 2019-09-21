package cho.carbon.hc.hydrocarbon.common.jstl.render;

import java.util.List;

import cho.carbon.hc.dataserver.model.dict.pojo.OptionItem;
import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

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
