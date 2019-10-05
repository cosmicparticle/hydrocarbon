<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<fmt:setBundle basename="jspPage" var="logo"/>
<style>
.box {
	width: 100%;
	height: 100%;
	justify-content: center;
	align-items: center;
	padding-top:120px;
}
.box .logo{
	width: 100px;
	height: 100px;
}

.box .carbon {
	text-align: center;
	font-weight: 700;
	font-size: 40px;
}

.box .a {
	text-align: center;
	font-weight: 600;
	font-size: 70px;
	padding-top:20px;
}
</style>

<div class='box'>

	<div align="center" >
		<img class='logo' src="media/admin/main/image/carbonlogo.png" />
	</div>
	<div class='carbon'>CARBON</div>
	<div class='a'>比想象的更强大</div>
</div>

