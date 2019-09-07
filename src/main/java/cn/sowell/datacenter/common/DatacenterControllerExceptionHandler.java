package cn.sowell.datacenter.common;

import org.apache.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import cn.sowell.datacenter.api.controller.APiDataNotFoundException;
import cn.sowell.datacenter.model.config.service.NonAuthorityException;

@ControllerAdvice
public class DatacenterControllerExceptionHandler {
	
	
	Logger logger = Logger.getLogger(DatacenterControllerExceptionHandler.class);
	
	@ResponseBody
    @ExceptionHandler(NonAuthorityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAuthorityException(NonAuthorityException ex) {
		logger.error("访问权限不足", ex);
		return "Forbidden";
    }
	
	@ResponseBody
	@ExceptionHandler(AccessDeniedException.class)
	@ResponseStatus(HttpStatus.FORBIDDEN)
	public String handleAccessDeniedException(AccessDeniedException ex) {
		logger.error("访问权限不足", ex);
		return "AccessDenied";
	}
	
	
	@ResponseBody
	@ExceptionHandler(APiDataNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public String handleAPiNotFoundException(APiDataNotFoundException ex) {
		logger.error("接口请求数据不存在", ex);
		return "APiNotFound";
	}
	
	
	
	
	
}
