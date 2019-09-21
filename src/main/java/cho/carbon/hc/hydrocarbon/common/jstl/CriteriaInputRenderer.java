package cho.carbon.hc.hydrocarbon.common.jstl;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

public interface CriteriaInputRenderer<CRI extends AbstractListCriteria> {
	
	boolean match(CRI tCriteria);

	HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia);
	
	default String getCriteriaName(AbstractListCriteria tCriteria) {
		return "criteria_" + tCriteria.getId();
	}

}
