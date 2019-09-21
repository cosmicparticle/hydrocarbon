package cho.carbon.hc.hydrocarbon.common.jstl.render;

import java.util.Set;

import com.google.common.collect.Sets;

import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.jstl.CriteriaInputRenderer;

public abstract class AbstractMatchTypeInputRender<CRI extends AbstractListCriteria> implements CriteriaInputRenderer<CRI>{

	@Override
	public boolean match(CRI tCriteria) {
		String[] types = getMatchInputTypes();
		Set<String> set = Sets.newHashSet(types);
		return set.contains(tCriteria.getInputType());
	}

	protected abstract String[] getMatchInputTypes();

}