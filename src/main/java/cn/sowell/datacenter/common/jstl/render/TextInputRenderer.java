package cn.sowell.datacenter.common.jstl.render;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public class TextInputRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputFormControlRenderer<CRI>{

	@Override
	protected String[] getMatchInputTypes() {
		return new String[] {"text"};
	}
	
	@Override
	protected HTMLTag createInputTag(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $input = new HTMLTag("input");
		$input
			.attribute("type", "text")
			.attribute("value", viewCriteia.getValue())
			.attribute("placeholder", tCriteria.getPlaceholder())
		;
		return $input;
	}


}
