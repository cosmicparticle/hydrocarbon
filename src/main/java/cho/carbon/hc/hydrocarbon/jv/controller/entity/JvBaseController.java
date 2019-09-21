package cho.carbon.hc.hydrocarbon.jv.controller.entity;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.ExceptionHandler;

import cho.carbon.hc.hydrocarbon.model.config.service.NonAuthorityException;

public class JvBaseController { 
    @ExceptionHandler  
    public String exp(HttpServletRequest req, NonAuthorityException ex) {
		return "redirect:/jv/main/login";
    }
}
