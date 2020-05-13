/**
 * 综合查询
 */
define(["jquery", "bootstrap", "pagination", "datetimepicker", "bootstrapSwitch", "common", "config", "echarts",
	"echarts-dark"
], function($, bootstrap, pagination, datetimepicker, bootstrapSwitch, common, config, echarts, dark) {

	var scene = viewer.scene;
	var buildingLayer = null;

	function loadWidget(content) {
		//加载html元素
		loadHtmlDom("widget_huanjing", content);
		//绑定事件
		bindEvent();
		loadCircle();
	}

	function loadCircle() {
		var ring1 = echarts.init(document.getElementById('main1'));
		var option1 = {
			series: [{
				type: 'pie',
				radius: ['65%', '80%'],
				center: ['50%', '50%'],
				data: [{
						value: 30,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							// formatter: '{d}%',
							formatter: '20.8优良',
							textStyle: {
								fontSize: 15,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'

							}
						}
					},
					{
						value: 70,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring1.setOption(option1);
		
		var ring2 = echarts.init(document.getElementById('main2'));
		var option2 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 55,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '34.7炎热',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 45,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring2.setOption(option2);
		
		var ring3 = echarts.init(document.getElementById('main3'));
		var option3 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 80,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '69.1吵闹',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 20,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring3.setOption(option3);
		
		var ring4 = echarts.init(document.getElementById('main4'));
		var option4 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 93,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '80.8防潮',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 7,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring4.setOption(option4);
		
		var ring5 = echarts.init(document.getElementById('main5'));
		var option5 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 7,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '1.5轻风',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 93,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring5.setOption(option5);
		
		var ring6 = echarts.init(document.getElementById('main6'));
		var option6 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 10,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '24优良',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 90,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring6.setOption(option6);
		
		var ring7 = echarts.init(document.getElementById('main7'));
		var option7 = {
			series: [{
				type: 'pie',
				hoverAnimation:false,
				radius: ['65%', '80%'],
				center: ['50%', '40%'],
				data: [{
						value: 100,
						itemStyle: {
							color: {
								type: 'linear',
								x: 0,
								y: 1,
								x2: 0,
								y2: 0,
								colorStops: [{
									offset: 0,
									color: '#356eff' // 0% 处的颜色
								}, {
									offset: 1,
									color: '#9bfcaf' // 100% 处的颜色
								}],
								global: false // 缺省为 false
							},
						},
						label: {
							show: true, //单独显示该数据项
							formatter: '西南',
							textStyle: {
								fontSize: 12,
								// color:'#e9e9e9'//浅灰色
								color: '#1E90FF'
		
							}
						}
					},
					{
						value: 0,
						itemStyle: {
							color: '#F4F4F4',
						},
					}
				],
				label: {
					normal: { //默认不显示数据
						show: false,
						position: 'center',
					},
				},
			}]
		};
		ring7.setOption(option7);
	}
	/**
	 * 移除模块的html
	 */
	function removeHtmlDom() {
		var container = document.getElementById('widget_huanjing');
		if (container) {
			document.body.removeChild(container);
		}
	}

	/**
	 * 绑定鼠标事件
	 */
	function bindEvent() {
		//一键搜按钮
		$("#yijiansouSearch").on("click", function() {
			searchInits();
			requestData();

		});

		//关闭窗体
		$("#searchClose").on("click", function() {
			$("#container-searchContent").hide();
		});

		//人员查询
		$("#searchPerson").on("click", function() {
			searchPerson();
		});

		//房屋查询
		$("#hsSearch").on("click", function() {
			searchHouse();
			$("#code_img").show();
		});

		//企业查询
		$('#houseRentTable td').on('click', function() {
			console.log('执行了>>>' + $(this).text())
			companySearch($(this).text());
		});

		//查看户型图
		$('#checkHuxingtu').on('click', function() {
			$("#huxingtu").attr("src", './img/yijiansou/C1.jpg');

			//调整尺寸,位置
			$("#huxingtuContent").css("top", "");
			$("#huxingtuContent").css("height", "500px");
			$("#huxingtuContent").css("width", "460px");
			$("#huxingtuContent").css("bottom", "10px");
			$("#huxingtuContent").css("left", "1300px");
			//显示
			var v = document.getElementById('huxingtuContent');
			v.style.display = "block";
		})

		//关闭户型图
		$('#photoClose').on('click', function() {
			$('#huxingtuContent').hide();
		})

		//查看用电量
		$('#yongdianliang').on('click', function() {

			//调整尺寸,位置
			$("#yongdianliangContent").css("top", "");
			$("#yongdianliangContent").css("height", "500px");
			$("#yongdianliangContent").css("width", "460px");
			$("#yongdianliangContent").css("bottom", "10px");
			$("#yongdianliangContent").css("left", "820px");

			//生成用电量演示数据

			var option1 = {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: ['用电量(kW·h)']
				},
				toolbox: {
					show: true,
					feature: {
						//          mark : {show: true},
						//          dataView : {show: true, readOnly: false},
						magicType: { show: true, type: ['line', 'bar'] },
						//          restore : {show: true},
						saveAsImage: { show: true }
					}
				},
				calculable: true,
				xAxis: [{
					type: 'category',
					boundaryGap: false,
					data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
				}],
				yAxis: {},
				series: [{
					name: '用电量(kW·h)',
					type: 'line',
					stack: '总量',
					data: [53, 47, 41, 43, 42, 52, 76, 78, 67, 48, 43, 51],
				}]
			};


			/*	var option1 = {
					title: {
						text: '用电量折线图',
						subtext: ''
					},
					tooltip: {
						trigger: 'axis'
					},
					legend: {
						data: ['用电量']
					},
					toolbox: {
						show: true,
						feature: {
							mark: {
								show: true
							},
							dataView: {
								show: true,
								readOnly: false
							},
							magicType: {
								show: true,
								type: ['line', 'bar']
							},
							restore: {
								show: true
							},
							saveAsImage: {
								show: true
							}
						}
					},
					calculable: true,
					xAxis: [{
						type: 'category',
						boundaryGap: false,
						data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
					}],
					yAxis: [{
						type: 'value',
						axisLabel: {
							formatter: '{value} kW·h'
						}
					}],
					series: [{
						name: '用电量',
						type: 'line',
						data: [53, 47, 41, 43, 42, 52, 76, 78, 67, 48, 43, 51],
						markPoint: {
							data: [{
								type: 'kW·h',
								name: '用电量'
							}, ]
						},
						markLine: {
							data: [{
								type: 'average',
								name: '平均值'
							}]
						}
					}, ]
				};*/
			echarts.init(document.getElementById('yongdianliangChart'), 'dark').setOption(option1);

			//显示
			var v = document.getElementById('yongdianliangContent');
			v.style.display = "block";
		});

		//关闭用电量
		$('#yongdianliangClose').on('click', function() {
			$('#yongdianliangContent').hide();
		})

		//选项卡
		$("#carTraceTab li").on("click", function() {

			var name = $(this).attr("name");

			if (name == "mYijiansou") {
				//一键搜
				$("#searchItem").hide();
				$("#searchPage").hide();
				$("#searchHead").css("padding-top", "120px");
				$("#searchTitle").css("display", "block");

			} else if (name == "personSearch") {

			} else if (name == "houseSearch") {

			} else if (name == "houseRent") {

			}
		});
	}

	/**
	 * 解绑事件
	 */
	function unBindEvent() {
		$("#search").off("click");
		$("#searchClose").off("click");
	}

	function removeWidget() {
		//解绑事件
		unBindEvent();
		//清除地图选中元素
		//		buildingLayer.removeAllObjsColor();
		//清除html
		removeHtmlDom();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});
