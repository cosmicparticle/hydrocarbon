package cn.sowell.datacenter.model.config.service;

import java.util.Set;

public class NonAuthorityException extends RuntimeException {

	public NonAuthorityException(String msg) {
		super(msg);
	}


	public NonAuthorityException(Set<String> authoritySet, Set<String> userAuthorities) {
		super("用户权限[" + userAuthorities + "]内不包含权限[" + authoritySet + "]的任一权限");
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = -4301304732233028320L;

}
