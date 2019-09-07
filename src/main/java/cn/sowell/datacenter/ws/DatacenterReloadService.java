package cn.sowell.datacenter.ws;

import javax.jws.WebService;

@WebService
public interface DatacenterReloadService {
	String syncModule();

	void syncField();

	String syncCache();
}
