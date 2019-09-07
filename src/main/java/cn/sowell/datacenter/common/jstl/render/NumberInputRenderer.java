package cn.sowell.datacenter.common.jstl.render;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

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
