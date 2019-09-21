package cho.carbon.hc.hydrocarbon.common.jstl.render;

import java.util.HashSet;
import java.util.Set;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;
import cho.carbon.hc.hydrocarbon.common.jstl.CriteriaInputRenderer;

public class UnknowInputRenderer<CRI extends AbstractListCriteria> implements CriteriaInputRenderer<CRI> {
	
//	private Set<String> inputTypeSet=new HashSet<>();
//	
//	public UnknowInputRenderer() {
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//		inputTypeSet.add("text");
//	}

	@Override
	public boolean match(CRI tCriteria) {
//		String inputType = tCriteria.getInputType();
//		if(inputTypeSet.contains(inputType)) {
//			
//		}
		return true;
	}

	@Override
	public HTMLTag render(CRI tCriteria, ViewListCriteria<CRI> viewCriteia) {
		HTMLTag $input = new HTMLTag("input");
		$input
			.attribute("type", "text")
			.attribute("disabled", "disabled")
			.attribute("placeholder", "没有配置对应的控件" + tCriteria.getInputType());
		return $input;
	}

}
