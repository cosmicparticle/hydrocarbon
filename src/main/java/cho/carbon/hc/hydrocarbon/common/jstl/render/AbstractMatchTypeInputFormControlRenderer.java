package cho.carbon.hc.hydrocarbon.common.jstl.render;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

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
