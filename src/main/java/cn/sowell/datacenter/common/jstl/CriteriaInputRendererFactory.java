package cn.sowell.datacenter.common.jstl;

import java.util.LinkedHashSet;
import java.util.Set;

import org.springframework.stereotype.Repository;

import cn.sowell.datacenter.common.jstl.render.UnknowInputRenderer;
import cn.sowell.dataserver.model.tmpl.pojo.AbstractListCriteria;


public class CriteriaInputRendererFactory {

	private Set<CriteriaInputRenderer<AbstractListCriteria>> renderers = new LinkedHashSet<>();
	private CriteriaInputRenderer<AbstractListCriteria> unknownInputRenderer = new UnknowInputRenderer<AbstractListCriteria>();
	
	public CriteriaInputRenderer<AbstractListCriteria> getRender(AbstractListCriteria tCriteria) {
		for (CriteriaInputRenderer<AbstractListCriteria> render : this.renderers) {
			if(render.match(tCriteria)) {
				return render;
			}
		}
		return unknownInputRenderer;
	}

	public Set<CriteriaInputRenderer<AbstractListCriteria>> getRenderers() {
		return renderers;
	}

	public void setRenderers(Set<CriteriaInputRenderer<AbstractListCriteria>> renderers) {
		this.renderers = renderers;
	}

}
