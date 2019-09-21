package cho.carbon.hc.hydrocarbon.common.jstl;

import java.io.IOException;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspWriter;
import javax.servlet.jsp.tagext.SimpleTagSupport;

import org.springframework.util.Assert;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.WebApplicationContext;

import cho.carbon.hc.dataserver.model.modules.service.view.ViewListCriteria;
import cho.carbon.hc.dataserver.model.tmpl.pojo.AbstractListCriteria;
import cho.carbon.hc.hydrocarbon.common.choose.HTMLTag;

public class EntityTag extends SimpleTagSupport{

	private ViewListCriteria<AbstractListCriteria> viewCriteia;
	
	@Override
	public void doTag() throws JspException, IOException {
		Assert.notNull(viewCriteia);
		if(viewCriteia.getIsShown()) {
			AbstractListCriteria tCriteria = viewCriteia.getTemplateCriteria();
			HTMLTag $formGroup = new HTMLTag("div");
			$formGroup.addClass("form-group");
			
			HTMLTag $label = new HTMLTag("label");
			$label
				.addClass("control-label")
				.text(tCriteria.getTitle())
				;
			$formGroup.append($label);
			
			if(!tCriteria.getFieldAvailable()) {
				$formGroup
					.addClass("criteria-field-unavailable")
					.attribute("title", "无效字段");
			}else {
				WebApplicationContext context = ContextLoader.getCurrentWebApplicationContext();
				CriteriaInputRendererFactory rFactory = context.getBean(CriteriaInputRendererFactory.class);
				CriteriaInputRenderer<AbstractListCriteria> renderer = rFactory.getRender(tCriteria);
				HTMLTag $input = renderer.render(viewCriteia.getTemplateCriteria(), viewCriteia);
				$formGroup.append($input);
			}
			
			JspWriter writer = this.getJspContext().getOut();
			writer.append($formGroup.getOuterHtml());
		}
	}

	public ViewListCriteria<AbstractListCriteria> getViewCriteia() {
		return viewCriteia;
	}

	public void setViewCriteia(ViewListCriteria<AbstractListCriteria> viewCriteia) {
		this.viewCriteia = viewCriteia;
	}
}
