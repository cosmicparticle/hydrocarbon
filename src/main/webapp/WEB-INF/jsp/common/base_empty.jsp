<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ taglib prefix="Entity" uri="/tld/EntityTag" %>


<c:set var="cpfVersion" value="1.3" />

<fmt:setBundle basename="jspPage" var="logo"/>

<c:set var="ajaxHost" value="${basePath }" />