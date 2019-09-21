package cho.carbon.hc.hydrocarbon.ws;

import javax.jws.WebService;

@WebService
public interface HydrocarbonReloadService {
	String syncModule();

	void syncField();

	String syncCache();
}
