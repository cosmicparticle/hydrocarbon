/**
 * 
 */
define(function(require, exports, module){
	var Utils = require('utils');
	var Ajax = require('ajax');
	function CustomPageHome(_param){
		this.context = _param.context;
		this.param = _param.param;
		this.tmplMapDefer = require('tmpl').load('media/jv/custompage/path/tmpl/custompage-home.tmpl');
	}
	Utils.extendClass(CustomPageHome, require('custompage'));
	CustomPageHome.prototype.render = function(){
		var that = this;
		this.tmplMapDefer.done(function(tmplMap){
			tmplMap['page'].replaceIn(that.param.$page, {
				
			}, {
				renderTaskRanking	: function(){
					var $container = $(this);
					var taskData = {
						headers	: [{title:'序号'}, {title:'社区名'}, {title:'任务总数'}, {title:'完成数'}],
						rows	: [
							{
								key	: 1,
								cells: [{title: 1}, {title: '社区A'}, {title: 30}, {title: 10}],
							},
							{
								key	: 2,
								cells: [{title: 2}, {title: '社区B'}, {title: 40}, {title: 9}],
							},
							{
								key	: 3,
								cells: [{title: 3}, {title: '社区C'}, {title: 20}, {title: 8}],
							}
						]
					};
					var Table = require('table');
					var taskRanking = new Table({
						data			: taskData,
						dataRowClass	: 'task-ranking-row'
					});
					taskRanking.render().done(function($taskRanking){
						$container.empty().append($taskRanking);
					});
				},
				renderBar	: function(){
					var myChart = echarts.init(this, 'halloween');
					
					// 指定图表的配置项和数据
			        var option = {
			            title: {
			                text: '各街道每月完成任务数',
			                textStyle: {
								color: '#fff'
							}
			            },
			            tooltip: {},
			            legend: {
			                //data:['销量']
			            },
			            xAxis: {
			                data: ["1月","2月","3月","4月","5月","6月"]
			            },
			            color: '#5ff',
			            yAxis: {},
			            series: [{
			                type: 'bar',
			                data: [5, 20, 36, 10, 10, 20]
			            }]
			        };

			        // 使用刚指定的配置项和数据显示图表。
			        myChart.setOption(option);
				},
				renderMap	: function(){
					var mapChart = echarts.init(this);
					
					
					var data = [
					];

					var geoCoordMap = {
					};
					
					Ajax.loadResource('media/jv/custompage/json/bmap-theme.json').done(function(bMapThemeJson){
						var bdary = new BMap.Boundary();
						bdary.get('杭州市拱墅区', function(boundary){
							
							function renderBorder(params, api) {
								var points = [];
								for (var i = 0; i < boundary.boundaries.length; i++) {
									var str = boundary.boundaries[i];
									var pstrs = str.split(';');
									for(var j in pstrs){
										var pointStrs = pstrs[j].split(',');
										points.push(api.coord([parseFloat(pointStrs[0]), parseFloat(pointStrs[1])]));
									}
								}
								var color = '#6CA6CD';
								
								return {
									type: 'polygon',
									shape: {
										points: echarts.graphic.clipPointsByRect(points, {
											x: params.coordSys.x,
											y: params.coordSys.y,
											width: params.coordSys.width,
											height: params.coordSys.height
										})
									},
									style: api.style({
										fill: color,
										stroke: echarts.color.lift(color)
									})
								};
							}
							
							var option = {
									title: {
										text: '拱墅区各街道人口分布',
										subtext: 'data from cxk',
										sublink: 'http://www.baidu.com',
										left: 'center',
										textStyle: {
											color: '#fff'
										}
									},
									tooltip : {
										trigger: 'item'
									},
									bmap: {
										center: [120.167415,30.358802],
										zoom: 13,
										roam: true,
										mapStyle: {
											styleJson: bMapThemeJson
										}
									},
									series : [
										{
											type: 'custom',
											coordinateSystem: 'bmap',
											renderItem: renderBorder,
											itemStyle: {
												normal: {
													opacity: 0.5
												}
											},
											animation: false,
											silent: true,
											data: [0],
											z: -10
										}
										]
							};
							
							mapChart.setOption(option, true);
						});
					});
				},
				/*
				renderMap	: function(){
					var map = new BMap.Map(this);
				    map.enableScrollWheelZoom();
				    map.clearOverlays();
				    var bdary = new BMap.Boundary();
				    bdary.get('杭州市拱墅区', function(res){
				    	var count = res.boundaries.length; //行政区域的点有多少个
	                    for (var i = 0; i < count; i++) {
	                        var ply = new BMap.Polygon(res.boundaries[i], { strokeWeight: 2, strokeColor: "#ff0000" }); //建立多边形覆盖物
	                        map.addOverlay(ply);  //添加覆盖物
	                        map.setViewport(ply.getPath());    //调整视野
	                    }
				    });
				}*/
			});
		});
	}
	
	
	
	module.exports = CustomPageHome;
	
});
