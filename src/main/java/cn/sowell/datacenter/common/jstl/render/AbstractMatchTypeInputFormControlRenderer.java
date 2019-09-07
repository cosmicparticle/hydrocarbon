package cn.sowell.datacenter.common.jstl.render;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public abstract class AbstractMatchTypeInputFormControlRenderer<CRI extends AbstractListCriteria> extends AbstractMatchTypeInputRender<CRI>{

	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $input = createInputTag(tCriteria, viewCriteia);
		$input
			.addClass("form-control")
			.attribute("name", getCriteriaName(tCriteria))
			;
		return $input;
	}

	protected abstract HTMLTag createInputTag(CRI tCriteria, ViewListCriteria<CRI> viewCriteia);

}
