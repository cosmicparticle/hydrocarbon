define(function(require, exports, module){
	var dialog = require('dialog');
	// 菜单对象
	var menu = {

	    // 初始化(获取数据初始化菜单栏)
	    init: function (initData) {
	        var me = this;
	        if(me.init.arguments.length<=0){
	        	initData = {};	
	        	alert("数据传输为空，有未知错误，可能导致您接下来的菜单操作无效");	
	        }
	        me.menuConstructor(initData);
	        me.subMenuConstructor(initData);
	        me.menuName();
	        console.log(" i am work");
	    },

	    // 构造菜单
	    menuConstructor: function (data) {
	        var me = this;
	        var data = data;
	        var menuWarp = $('ul.menu-preview-menu');
	        var menuHtml = "";                               //一级菜单html片段
	        if(data.button){
	            var mainMenuCount = data.button.length;          //底部一级有名菜单个数
	        }else {
	            var mainMenuCount = 0;
	        }       
	        var mainMenuWidth = "";
	        if (mainMenuCount === 0) {
	            menuHtml += "<li class='menu-add active'>" +
	                "<ul class='submenu'>" +
	                "<li class='submenu-name submenu-add'></li>" +
	                "</ul>" +
	                "<i></i>" +
	                "</li>";
	            mainMenuWidth = "100%";
	        } else if (mainMenuCount > 0 && mainMenuCount <= 3) {
	            for (var i = 0; i < mainMenuCount; i++) {
	                var menuText = data.button[i].name;                      //每个菜单的名字
	                if(data.button[i].type){
	                	 var menuType = data.button[i].type;
	                }else {
	                	 var menuType = 'view'                              //默认为view     		
	                }
	                if(data.button[i].url){
	                	var menuUrl  = data.button[i].url;	
	                }else{
	                	var menuUrl  ='';                                    //默认为空
	                }               
	                if(data.button[i].sub_button){
	                    var subMenuCount = data.button[i].sub_button.length; //当前一级菜单下的二级菜单个数                   
	                }else {
	                    var subMenuCount = 0;
	                }
	                if (subMenuCount === 0) {                            //判断当前一级菜单下的二级菜单是否为0
	                    menuHtml += "<li class='menu-name' data-type='"+menuType+"' data-url='"+menuUrl+"'><span>" + menuText +
	                                "</span><ul class='submenu'>" +
	                                "<li class='submenu-name submenu-add'></li>" +
	                                "</ul>" +
	                                "<i></i>" +
	                                "</li>"
	                } else if (subMenuCount > 0 && subMenuCount <= 5) {
	                    menuHtml += "<li class='menu-name more' data-type='"+menuType+"' data-url='"+menuUrl+"'><span>" + menuText +
	                        "</span><ul class='submenu'>" +
	                        "</ul>" +
	                        "<i></i>" +
	                        "</li>"
	                } else {
	                    alert("初始化数据不匹配");
	                }
	            };
	            if (mainMenuCount !== 3) {
	                menuHtml += "<li class='menu-add active'>" +
	                    "<ul class='submenu'>" +
	                    "<li class='submenu-name submenu-add'></li>" +
	                    "</ul>" +
	                    "<i></i>" +
	                    "</li>"
	                mainMenuWidth = this.mainMenuWidth(mainMenuCount + 1);
	            } else if (mainMenuCount === 3) {
	                mainMenuWidth = this.mainMenuWidth(mainMenuCount);
	            }

	        } else if (mainMenuCount > 3) {
	            alert("初始化数据不匹配");
	        }
	        menuWarp.html(menuHtml);
	        var menu = $('ul.menu-preview-menu>li');       //dom片段添加进去之后再找元素
	        
	        menu.css("width", mainMenuWidth);
	        menuWarp.on('click', '>li', function () {      //一级菜单绑定点击事件
	            var that = $(this);
	            me.mainMenuClick(that);
	        })
	        menuWarp.on('click', '>li>i', function () {    //一级菜单删除事件
	            var r = confirm("确定要删除吗？");
	            var that = $(this).parent('li');
	            if (r === true) {
	                console.log("delete");
	                me.deleteMainMenu(that);
	            }
	        })
	        

	    },

	    // 一级菜单宽度计算
	    mainMenuWidth: function (number) {
	        return (100 / number) + "%";
	    },

	    //二级菜单构造
	    subMenuConstructor: function (data) {
	        var me = this;
	        var data = data;
	        if(data.button){
	            var mainMenuCount = data.button.length;          //一级菜单个数
	        }else {
	            var mainMenuCount = 0;
	        }       
	        if (mainMenuCount === 0) {
	            return '';
	        } else if (mainMenuCount > 0 && mainMenuCount <= 3) {
	            for (var i = 0; i < mainMenuCount; i++) {
	                if(data.button[i].sub_button){
	                     var subMenuCount = data.button[i].sub_button.length;
	                }else {
	                    var subMenuCount = 0;
	                }     
	                var subMenuWarp = $("ul.menu-preview-menu>li:eq(" + i + ")>ul.submenu");
	                var subMenuHtml = '';
	                for (var j = 0; j < subMenuCount; j++) {
	                    var subMenuText = data.button[i].sub_button[j].name;
	                    if( data.button[i].sub_button[j].type ){
	                    	var subMenuType = data.button[i].sub_button[j].type;
	                    }else{
	                    	var subMenuType = 'view'                            //默认为view
	                    }
	                    if( data.button[i].sub_button[j].url ){
	                    	var subMenuUrl = data.button[i].sub_button[j].url;
	                    }else{
	                    	var subMenuUrl = ''                                 //默认为链接为空
	                    }
	                    subMenuHtml += "<li class='submenu-name' data-type='"+subMenuType+"' data-url='"+subMenuUrl+"'><span>" + subMenuText + "</span><i></i></li>";
	                }
	                if (subMenuCount >= 0 && subMenuCount < 5) {
	                    subMenuWarp.html(subMenuHtml).append("<li class='submenu-name submenu-add'></li>");
	                } else if (subMenuCount === 5) {
	                    subMenuWarp.html(subMenuHtml);
	                }
	            }
	        } else {
	            alert("初始化数据不匹配");
	        }
	        me.subMenuBind();       //二级菜单绑定事件
	    },

	    //一级菜单点击事件
	    mainMenuClick: function (that) {
	        var me =this;
	        var mainMenuCount = $('ul.menu-preview-menu>li').length;
	        var mainMenuType  = 'view'   // 默认添加的一级菜单type为 view
	        var mainMenuUrl   = 'http://'       //默认添加的一级菜单url为 空字符串
	        $('.menu-preview-menu li.active').removeClass('active');
	        $(that).addClass('active')
	            .addClass('expand')
	            .addClass('menu-name')
	            .removeClass('menu-add')
	            .siblings()
	            .removeClass('active')
	            .removeClass('expand');
	        if (that.text() === '') {     //add
	            that.prepend("<span>菜单名称</span>").attr("data-type",mainMenuType).attr("data-url",mainMenuUrl);
	            if (mainMenuCount <= 2) {  //创建一级菜单，并且重新计算菜单宽度
	                var menuWarp = $('ul.menu-preview-menu');
	                var MenuCount = menuWarp.children('li').length + 1;
	                if (MenuCount <= 3) {
	                    menuWarp.append(
	                        "<li class='menu-add'>" +
	                        "<ul class='submenu'>" +
	                        "<li class='submenu-name submenu-add'></li>" +
	                        "</ul>" +
	                        "<i></i>" +
	                        "</li>"
	                    );
	                    var menu = $('ul.menu-preview-menu>li')
	                    menu.css("width", this.mainMenuWidth(MenuCount));
	                }
	            }         
	        }
	        me.subMenuBind();       //二级菜单绑定事件
	        me.displayRightArea();  //右侧input框显示
	        me.inputText(that);
	        me.selectMenuBind(); //右侧下拉框绑定
	    },

	    //一级菜单删除事件
	    deleteMainMenu: function (that) {
	        var me = this;
	        var menuWarp = $('ul.menu-preview-menu');
	        var add = menuWarp.children('li.menu-add').length;
	        that.remove();
	        if (add === 0) {
	            menuWarp.append(
	                "<li class='menu-add'>" +
	                "<ul class='submenu'>" +
	                "<li class='submenu-name submenu-add'></li>" +
	                "</ul>" +
	                "<i></i>" +
	                "</li>")
	        }
	        //重新计算菜单宽度       
	        var menu = $('ul.menu-preview-menu>li')
	        var MenuCount = menuWarp.children('li').length;
	        menu.css("width", this.mainMenuWidth(MenuCount));
	        if (MenuCount === 1) {
	            menu.addClass("active");
	        }
	        me.subMenuBind();       //二级菜单绑定事件
	    },

	    //二级菜单点击事件
	    addSubname: function(that){
	        var me =this;
	        var ifAdd = that.hasClass('submenu-add');
	        if( ifAdd ){
	            var subMenuCount = that.siblings().length+1;
	            if( subMenuCount <= 5){
	            	var subMenuType = 'view' ;
	            	var subMenuUrl  = 'http://';
	                var subHtml = "<li class='submenu-name active' data-type='"+subMenuType+"' data-url='"+subMenuUrl+"'><span>菜单名称</span><i></i></li>";
	                that.siblings().removeClass('active');

	                that.before(subHtml);
	                if(subMenuCount === 5){
	                    that.remove();
	                }
	                me.subMenuBind();       //二级菜单绑定事件              
	            }   
	            //添加之后，一级菜单图标改变
	            that.parent().parent().addClass('more');
	        }else {
	            that.addClass('active')
	                .siblings().removeClass('active');

	        }
	        me.selectMenuBind(); //右侧下拉框绑定
	        
	    },

	    //二级菜单删除事件
	    deleteSubMenu:function(that){
	        var presentMenu = that.parent();
	        var addSubMenuParent  = presentMenu.parent();
	        var hasAddMenu = (presentMenu.siblings('li.submenu-add').length !== 0 )
	        var deleteSubMenu = confirm("确定要删除吗？");
	        var subMenuCount = null;
	        if( deleteSubMenu ){
	             presentMenu.remove();
	            if( !hasAddMenu ){
	                addSubMenuParent.append("<li class='submenu-name submenu-add'></li>");

	            }
	            //当没有二级菜单的时候，一级图标改变
	            subMenuCount = addSubMenuParent.children().length-1;
	            if( subMenuCount ===0 ){
	            	addSubMenuParent.parent().attr('data-url', 'http://');
	                addSubMenuParent.parent().removeClass('more');
	            }
	        }    
	    },

	    //二级菜单绑定事件方法（二级菜单多处动态加载）jjws
	    subMenuBind:function(){
	        var me = this;
	        var subMenu = $('ul.submenu>li.submenu-name');    //二级菜单(构建完成dom后再获取)
	        var deleteSub = $('ul.submenu>li.submenu-name>i') //二级菜单删除按钮
	        subMenu.unbind();
	        deleteSub.unbind();
	        subMenu.on('click',function(e){                   //二级菜单绑定点击事件
	            e.stopPropagation();
	            $('.menu-preview-menu li.active').removeClass('active');
	            var that = $(this);
	            me.addSubname(that);
	            me.inputText(that);
	        })
	        deleteSub.on("click",function(){                  //二级菜单删除按钮
	            var that =$(this);
	            me.deleteSubMenu(that);
	        })
	    },

	    //右侧input框显示,
	    displayRightArea:function(){
	        var rightArea     = $('div.operation-menuname').css("display","block");
	        var rightAreaInfo = $('div.menu-name-area>span').css("display","none");
	    },
	    
	    //文本框内容显示为当前选中项菜单文本 以及url显示
	    inputText:function(that){
	      var  text = $('.menu-preview-menu li.active>span').text();
	      var  presentUrl = $('.menu-preview-menu li.active').attr("data-url");
	      $("#menuName").val(text);
	      $("#linkUrl").val(presentUrl);
	    },
	    


	    //input输入框输入 并且绑定keyup事件
	    menuName:function(that){
	        $("#menuName").on("keyup",function(){                            //菜单名input绑定
	            var presentMenuName = $('#menuName').val();
	            //选中项菜单命名更改
	             $('.menu-preview-menu li.active>span').text(presentMenuName);
	        })
	        $("#linkUrl").on("keyup",function(){                            //菜单名url绑定
	            var presentMenuUrl = $('#linkUrl').val();
	            //选中项菜单url更改
	            $('.menu-preview-menu li.active').attr('data-url',presentMenuUrl);
	        })
	    },


	    //保存
	    save:function(){
	        var saveData = {"button":[]};
	        var mainMenuCount = $('.menu-preview-menu > li.menu-name').length;
	        saveData.button.length = mainMenuCount;
	        if( mainMenuCount !== 0){
	            for( var i = 0 ; i<mainMenuCount; i++){
	                var presentMenu = $('.menu-preview-menu>li.menu-name:eq('+i+')');  //当前一级菜单
	                var presentMenuType = presentMenu.attr('data-type');               //当前一级菜单type
	                var presentMenuUrl  = presentMenu.attr('data-url');                //当前一级菜单url
	                var mainMenuText = presentMenu.children('span').text();
	                var presentSubCount = presentMenu.children('.submenu').children('li').length;//当前一级菜单下二级菜单个数
	                if( presentMenu.children('.submenu').children('li.submenu-add').length !==0 ){
	                    presentSubCount -=1;
	                }
	                saveData.button[i] = {};
	                saveData.button[i].name = mainMenuText;
	                saveData.button[i].type = presentMenuType;
	                saveData.button[i].url =  presentMenuUrl;
	                if( presentSubCount !==0){    //有二级菜单
	                    saveData.button[i].sub_button=[];
	                    saveData.button[i].sub_button.length=presentSubCount;
	                    for( var j = 0 ; j<presentSubCount; j++){
	                    	var presentSubMenu = presentMenu.children(".submenu").children("li.submenu-name:eq("+j+")");
	                        var subMenuText = presentSubMenu.text();
	                        var subMenuType = presentSubMenu.attr('data-type');
	                        var subMenuUrl  = presentSubMenu.attr('data-url');
	                        saveData.button[i].sub_button[j] = {};
	                        saveData.button[i].sub_button[j].name =subMenuText ;
	                        saveData.button[i].sub_button[j].type = subMenuType;   
	                        saveData.button[i].sub_button[j].url  = subMenuUrl;
	                    }
	                }
	            }
	        }
	        return saveData;      
	    },
	    
	    //右侧菜单快速选择事件绑定
	    selectMenuBind	: function(){
	    	var selectContainer = $("#quick-select-menu");
	    	console.log("i am select menu");
	    	selectContainer.on('change', function(){
	    		console.log("i am change");
	    		var selectedOption = $("#quick-select-menu option:selected");
	    		//右侧区域文本框默认填写
	    		$("#menuName").val(selectedOption.text());
	  	      	$("#linkUrl").val(selectedOption.attr("data-url"));
	  	      	
	  	      	//
	  	      $('.menu-preview-menu li.active>span').text(selectedOption.text());
	  	      $('.menu-preview-menu li.active').attr('data-url',selectedOption.attr("data-url"));
	    	});
	    }
	}
	
	module.exports = menu;

});
