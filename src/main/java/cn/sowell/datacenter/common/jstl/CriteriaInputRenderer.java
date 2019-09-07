package cn.sowell.datacenter.common.jstl;

import cn.sowell.datacenter.common.choose.HTMLTag;
import cn.sowell.dataserver.model.modules.service.view.ViewListCriteria;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public interface CriteriaInputRenderer<CRI extends AbstractListCriteria> {
	
	boolean match(CRI tCriteria);

	HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia);
	
	default String getCriteriaName(AbstractListCriteria tCriteria) {
		return "criteria_" + tCriteria.getId();
	}

}
