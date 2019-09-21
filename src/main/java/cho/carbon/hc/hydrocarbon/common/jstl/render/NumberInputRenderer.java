package cho.carbon.hc.hydrocarbon.common.jstl.render;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

public class NumberInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputFormControlRenderer<CRI>{

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"decimal", "int"};
	}
	
	
	@Override
	protected HTMLTag createInputTag(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $input = new HTMLTag("input");
		$input
			.addClass("cpf-field-" + tCriteria.getInputType())
			.attribute("type", "text")
			.attribute("value", viewCriteia.getValue())
			;
		return $input;
	}


}
