package cho.carbon.hy.hydrocarbon.test.cachable;

import java.util.List;

import javax.annotation.Resource;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import cho.carbon.hc.dataserver.model.tmpl.manager.DetailTemplateManager;
import cho.carbon.hc.dataserver.model.tmpl.manager.ListTemplateManager;
import cho.carbon.hc.dataserver.model.tmpl.manager.TemplateGroupManager;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateDetailTemplate;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroup;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateGroupAction;
import cho.carbon.hc.dataserver.model.tmpl.pojo.TemplateListTemplate;

/*@ContextConfiguration(locations = "classpath*:spring-config/spring-junit.xml")
@RunWith(SpringJUnit4ClassRunner.class)*/
public class TestCachableManager {
	@Resource
	TemplateGroupManager tmplGroupManager;
	
	@Resource
	DetailTemplateManager dtmplManager;
	
	@Resource
	ListTemplateManager ltmplManager;
	
	//@Test
	@Transactional
	public void test() {
		TemplateGroup tmplGroup = tmplGroupManager.get(30022l);
		TemplateDetailTemplate dtmpl = dtmplManager.get(tmplGroup.getDetailTemplateId());
		TemplateListTemplate ltmpl = ltmplManager.get(tmplGroup.getListTemplateId());
		List<TemplateGroupAction> actions = tmplGroup.getActions();
		System.out.println(tmplGroup);
		System.out.println(dtmpl);
		System.out.println(ltmpl);
		System.out.println(actions);
	}
	
}
