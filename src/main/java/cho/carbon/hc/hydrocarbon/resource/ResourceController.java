package cho.carbon.hc.hydrocarbon.resource;

import java.util.HashMap;
import java.util.Map;

import org.apache.activemq.spring.Utils;
import org.apache.log4j.Logger;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.mchange.v1.io.InputStreamUtils;


@Controller
@RequestMapping("/resource")
public class ResourceController {
	Map<String, String> fileLocation = new HashMap<>();
	Logger logger = Logger.getLogger(ResourceController.class);
	
	
	@ResponseBody
	@RequestMapping("/{uri:.*}")
	public ResponseEntity<byte[]> getJson(@PathVariable String uri) {
		if(fileLocation.containsKey(uri)) {
			try {
				Resource resource = Utils.resourceFromString(uri);
				HttpStatus status = HttpStatus.OK;
				return new ResponseEntity<byte[]>(InputStreamUtils.getBytes(resource.getInputStream()), status);
			} catch (Exception e) {
				logger.error("", e);
			}
		}
		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}


	public void setFileLocation(Map<String, String> fileLocation) {
		this.fileLocation = fileLocation;
	}
	
}
