package cn.sowell.datacenter.common.jstl.render;

import java.util.Set;

import com.google.common.collect.Sets;

import cn.sowell.datacenter.common.jstl.CriteriaInputRenderer;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;

public abstract class AbstractMatchTypeInputRender<CRI extends AbstractListCriteria> implements CriteriaInputRenderer<CRI>{

	@Override
	public boolean match(CRI tCriteria) {
		String[] types = getMatchInputTypes();
		Set<String> set = Sets.newHashSet(types);
		return set.contains(tCriteria.getInputType());
	}

	protected abstract String[] getMatchInputTypes();

}