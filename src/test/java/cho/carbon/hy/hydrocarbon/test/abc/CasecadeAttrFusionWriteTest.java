package cho.carbon.hy.hydrocarbon.test.abc;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import cho.carbon.context.core.PersistentContext;
import cho.carbon.context.hc.HCFusionContext;
import cho.carbon.entity.entity.Entity;
import cho.carbon.panel.Discoverer;
import cho.carbon.panel.Integration;
import cho.carbon.panel.IntegrationMsg;
import cho.carbon.panel.PanelFactory;

@ContextConfiguration(locations = "classpath*:spring-config/spring-hydrocarbon-context.xml")
@RunWith(SpringJUnit4ClassRunner.class)
public class CasecadeAttrFusionWriteTest {

	private static final Logger logger = LoggerFactory.getLogger(CasecadeAttrFusionWriteTest.class);
	protected String strucTitle = "人口信息";


	@Test
	public void fuse() {
		// Session session = sessionFactory.getCurrentSession();
		long startTime = System.currentTimeMillis();
		HCFusionContext context = new HCFusionContext();
		context.setSource(PersistentContext.SOURCE_COMMON);
		// context.setDictionaryMappingName(dictionaryMappingName);
		Integration integration = PanelFactory.getIntegration();
		Entity entity = createEntity(strucTitle, null);
		logger.debug(entity.toJson());
		IntegrationMsg msg = integration.integrate(context, entity);
		String code = msg.getCode();
		Discoverer discoverer = PanelFactory.getDiscoverer(context);
		Entity result = discoverer.discover(code);

		logger.debug(code + " : " + result.toJson());
		long endTime = System.currentTimeMillis();// 记录结束时间
		logger.debug("用时：{}",(float) (endTime - startTime) / 1000);
	}

	

	private Entity createEntity(String strucTitle, String code) {
		Entity entity = new Entity(strucTitle);
		entity.putValue("唯一编码", code);
		entity.putValue("姓名", "1施连心121");
		entity.putValue("所属社区", "");
		
		return entity;
	}

	

}