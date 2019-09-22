package cho.carbon.hc.hydrocarbon.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.log4j.Logger;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartResolver;

import cho.carbon.hc.copframe.spring.file.FileHaunt;

public class RequestParameterMapCompositeResolver implements HandlerMethodArgumentResolver{

	Logger logger = Logger.getLogger(RequestParameterMapCompositeResolver.class);
	
	
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		Class<?> paramClass = parameter.getParameterType();
		if(RequestParameterMapComposite.class.isAssignableFrom(paramClass)){
			return true;
		}
		return false;
	}

	@Override
	public RequestParameterMapComposite resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
		RequestParameterMapComposite composite = new RequestParameterMapComposite();
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, String[]> pMap = webRequest.getParameterMap();
		logger.info("提交请求数据");
		logger.info(pMap);
		if(pMap != null) {
			pMap.forEach((name, val)->{
				if(val != null) {
					if(val.length == 1) {
						map.put(name, val[0]);
					}else if(val.length > 1) {
						map.put(name, val);
					}else {
						map.put(name, null);
					}
				}else {
					map.put(name, null);
				}
			});
		}
		try {
			Map<String, FileHaunt> fileMap = exactFileMap(webRequest.getNativeRequest(HttpServletRequest.class));
			map.putAll(fileMap);
		} catch (Exception e) {
			logger.error("解析上传文件时发生错误", e);
		}
		composite.setMap(map);
		return composite;
	}
	
	@Resource
	MultipartResolver resolver;
	
	private Map<String, FileHaunt> exactFileMap(HttpServletRequest request) throws FileUploadException {
		Map<String, FileHaunt> result = new HashMap<>();
		if(request instanceof MultipartHttpServletRequest) {
			MultipartHttpServletRequest mreq = (MultipartHttpServletRequest) request;
			Map<String, MultipartFile> fileMap = mreq.getFileMap();
			fileMap.forEach((key, file)->{
				result.put(key, new FileHaunt() {
					
					@Override
					public InputStream getInputStream() throws IOException {
						return file.getInputStream();
					}
					
					@Override
					public boolean isEmpty() {
						return file.isEmpty();
					}
					
					@Override
					public long getSize() {
						return file.getSize();
					}
					
					@Override
					public String getFileName() {
						return file.getOriginalFilename();
					}
					
					@Override
					public byte[] getBytes() throws IOException {
						return file.getBytes();
					}
				});
			});
		}
		return result;
	}

}
