<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<fmt:setBundle basename="jspPage" var="logo"/>
<h1><fmt:message key="theme.logo" bundle="${logo}"/></h1>

