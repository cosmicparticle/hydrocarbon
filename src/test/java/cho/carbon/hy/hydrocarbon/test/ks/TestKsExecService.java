package cho.carbon.hy.hydrocarbon.test.ks;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.converter.HttpMessageConverter;

import cho.carbon.auth.pojo.UserInfo;
import cho.carbon.hc.dataserver.model.karuiserv.match.KaruiServMatcher;
import cho.carbon.hc.hydrocarbon.common.ApiUser;
import cho.carbon.hc.hydrocarbon.common.UserWithToken;
import cho.carbon.hc.hydrocarbon.model.ks.service.KaruiServExecService;

/*@ContextConfiguration(locations = "classpath*:spring-config/spring-junit.xml")
@RunWith(SpringJUnit4ClassRunner.class)*/
public class TestKsExecService {
	KaruiServExecService ksExecService;
	
	//@Test
	public void test() {
		
		String path = "/get_people/123456138009021234";
		Map<String, String> parameters = new HashMap<>();
		KaruiServMatcher matcher = ksExecService.match(path, parameters,"");
		UserInfo u = new UserInfo();
		u.setCode("codecode");
		u.setUserName("admin");
		ApiUser user = new UserWithToken("123456", u);
		ksExecService.executeKaruiServ(matcher, user);
		System.out.println(matcher);
	}
	
	
}
