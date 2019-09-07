package cn.sowell.datacenter.jv.controller.entity;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.ExceptionHandler;

import cn.sowell.datacenter.model.config.service.NonAuthorityException;

public class JvBaseController { 
    @ExceptionHandler  
    public String exp(HttpServletRequest req, NonAuthorityException ex) {
		return "redirect:/jv/main/login";
    }
}
