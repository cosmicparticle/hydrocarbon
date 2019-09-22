package cho.carbon.hy.hydrocarbon.test.abc;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import cho.carbon.hc.copframe.utils.TextUtils;

/*@ContextConfiguration(locations = "classpath*:spring-config/spring-junit.xml")
@RunWith(SpringJUnit4ClassRunner.class)*/
public class TestLocalDBModuleConfigMediator {

	
	//@Test
	public void test() {
		try {
			//UserInfo user = UserInfoService.getInstance().getUserInfoByUserName("admin");
			System.out.println(TextUtils.md5Encode("asc", null));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public static void main(String[] args) {
		System.out.println(TextUtils.md5Encode("123456", null));
	}
	
}
