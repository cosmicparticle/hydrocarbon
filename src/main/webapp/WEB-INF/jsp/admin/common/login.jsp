<%@ page language="java" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/common/base_empty.jsp"%>
<!DOCTYPE html>
<html>
	<head>
		<base href="${basePath }" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>登录<fmt:message key="theme.logo" bundle="${logo}"/></title>
		<meta http-equiv=X-UA-Compatible content="IE=edge,chrome=1">
		<script type="text/javascript">
			if(window.ADMIN_LOADED === true){
				location.href = '${basePath }/admin/login';
			}
		</script>
		<link href="media/admin/plugins/beyond/css/bootstrap.min.css" rel="stylesheet" />
		<script src="${basePath }media/jquery-1.11.3.js"></script>
		<style>
		@charset "utf-8";

			body,html {
			    padding:0;
			    margin:0;
			    width:100%;
			    height:100%;
			}
			* {
			    box-sizing: border-box;
			}
			form {
			    width:100%;
			    height:100%;
			}
			div.Z-login-container {
			    width:100%;
			    height:100%;
			    background-color:#EEEEEE;
			    position: relative;
			}
			
			div.Z-loginbox {
			    width: 540px;
			    position: absolute;
			    top: 50%;
			    left: 50%;
			    margin-top: -250px;
			    margin-left: -250px;
			    background:#ffffff;
			    font-size: 14px;
			    padding: 60px 80px 80px 80px;
			    text-align: center;
			    -webkit-box-shadow: 0 0 14px rgba(0, 0, 0, .1);
			    -moz-box-shadow: 0 0 14px rgba(0, 0, 0, .1);
			    box-shadow: 0 0 14px rgba(0, 0, 0, .1);
			    -webkit-transition: all 1.5s;
			    -moz-transition: all 1.5s;
			    -ms-transition: all 1.5s;
			    -o-transition: all 1.5s;
			    transition: all 1.5s;
			    opacity:0;
			}
			
			div.Z-loginbox > div.loginbox-logo {
			    text-align: center;
			}
			
			div.Z-loginbox > div.loginbox-logo >img {
			    width:25em;
			    height:5em;
			}
			div.warn-warp {
				width:100%;
				height:3em;
				margin-top:1.43em;
			}
			p.login-warn {
				font-size:16px;
			    margin:1.1em 0 1.1em 0;
			    padding:0;
			    color:#D43636;
			    line-height:2.3em;
			}
			p.login-warn > img {
			    width:1.5em;
			    height:1.5em;
			    border-radius: 50%;
			    vertical-align: text-bottom;
			}
			#userName,#userWord {
			    display: block;
			    font-size:18px;
			    height:2em;
			    width:100%;
			    outline: none;
			    background-clip: padding-box;
			    border:1px solid #197FC6;
			    border-radius: 0.21em;
			    background-color: #fbfbfb;
			    padding: 0.43em 0.86em;
			    margin-bottom:1.43em;
			}
			
			div.Z-loginbox > div.loginbox-submit {
			    margin-top:2.3em;
			}
			
			#submit {
			    display: block;
			    width:100%;
			    font-size:18px;
			    background-color:#197FC6;
			    outline: none;
			    text-align: center;
			    height:2.6em;
			    line-height: 2.6em;
			    color:#ffffff;
			    border-radius: 0.21em;
			    box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(255,255,255,.3);
			    text-shadow: 0 -1px 0 rgba(0,0,0,.1);
			    border:none;
			}
		</style>
	</head>
	<body>
		<form action="admin/doLogin" method="post">
    		<div class="Z-login-container">
    			<div class="Z-loginbox">
    	    		
        			<div class="loginbox-logo">
            			<%-- <img src="<fmt:message key='theme.logoPhoto' bundle='${logo}'/>"/> --%>
            			<h1><fmt:message key='theme.logo' bundle='${logo}'/></h1>
        			</div>
        			<div class="warn-warp">
	        			<c:if test="${error != null }">
		        			<p class="login-warn">
		            		<img src="media/common/ydd/image/login-warn.png"/>
		            		${errorMap[error] }
		       				</p>
		    	    	</c:if>  
	    	    	</div> 
        			<div class="loginbox-info">
            			<input type="text" name="ddxy-admin-username" id="userName" placeholder="用户名"/>
            			<input type="password" name="ddxy-admin-password" id="userWord" placeholder="密码"/>
        			</div>
        			<div class="loginbox-submit">
            			<input type="submit" value="登录" id="submit">
        			</div>
   			 	</div>
			</div>	
		</form>	
		
	</body>
	<script>
		$(function(){
			window.onload=function(){
				var warnInfo = $('.login-warn');
				var loginBox = $('.Z-loginbox');
				if(warnInfo.length === 0){
					loginBox.attr('style', 'margin-top:-200px;opacity:1');
				}else{
					loginBox.attr('style', 'transition:none;margin-top:-200px;opacity:1');
				}
				$(document).keypress(function(e){
					if(e.keyCode === 13){
						$('#submit').click();
					}
				});
		    }
		});
	</script>
</html>