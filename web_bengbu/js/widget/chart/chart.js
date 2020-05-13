/**
 * 统计图表
 */
define(["jquery", "common", "config", "echarts", "echarts-dark"], function($, mCommon, config, echarts, dark) {

	function loadWidget(content) {
		loadHtmlDom("widget_chart", content);
		loadData();
		bindEvent();
	}

	function bindEvent() {
		//关闭窗体
		$("#chartClose").on("click", function() {
			$("#container-chart").hide();
		});

		//选项卡
		$("#chartTab li").on("click", function() {

			var name = $(this).attr("name");
			if (name == "ageChart") {
				loadData();
			} else if (name == "specialChart") {
				loadData2();
			} else if (name == "impChart") {
				loadData3();
			}
		});

	}

	//加载数据
	function loadData() {
		var mUrl = "dcs/699632b238524a7e86264c09eb99ae67/statistics";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			//请求结果处理
			console.log("统计图表-->人口统计", result);
			if (result.code == 200) {
				//请求成功, 获取的数据拼接option
				var data = result.data;

				var personAgeName = ['20岁以下', '20岁-35岁', '35岁-50岁', '50岁-65岁', '65岁-80岁', '80岁以上'];
				var personAgeValue = new Array();
				for (var i in data) {
					personAgeValue.push(data[i]);
				}

				var option1 = {
					title: {
						text: '小区人口年龄统计',
						left: 'center',
						textStyle: {
							fontSize: 13,
							color: '#FFFFFF'
						}
					},
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						right: 10,
						orient: 'vertical', //垂直显示
						y: 'center', //延Y轴居中
						padding: -0.5, //调节legend的位置
						data: personAgeName
					},

					series: [{
						name: '类型',
						type: 'pie',
						radius: '50%',
						center: ['35%', '50%'],
						selectedMode: 'single',
						data: [{
								value: personAgeValue[0],
								name: personAgeName[0]
							},
							{
								value: personAgeValue[1],
								name: personAgeName[1]
							},
							{
								value: personAgeValue[2],
								name: personAgeName[2]
							},
							{
								value: personAgeValue[3],
								name: personAgeName[3]
							},
							{
								value: personAgeValue[4],
								name: personAgeName[4]
							},
							{
								value: personAgeValue[5],
								name: personAgeName[5]
							}
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}]
				};
				echarts.init(document.getElementById('personAge'), 'dark').setOption(option1);
			}
		});
	}

	//人口类型统计
	function loadData2() {
		var mUrl2 = "dcs/b8943f5f2295476ea614424467c5c9da/statistics";
		ajaxRequest({}, ipPort, mUrl2, function(result) {
			//请求结果处理
			// console.log("统计图表-->人口统计", result);
			if (result.code == 200) {
				//请求成功, 获取的数据拼接option
				var data = result.data;
		
				var personTypeName = new Array();
				var personTypeValue = new Array();
				for (var i = 0; i < data.length; i++) {
					personTypeName.push(data[i].importType);
					personTypeValue.push(data[i].count);
				}
				var option1 = {
		
					title: {
						text: '人员类型统计',
						left: 'center',
						textStyle: {
							fontSize: 13,
							color: '#FFFFFF'
						}
					},
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						right: 10,
						orient: 'vertical', //垂直显示
						y: 'center', //延Y轴居中
						// padding:-0.5 ,//调节legend的位置
						data: personTypeName
					},
					series: [{
						name: '类型',
						type: 'pie',
						radius: '50%',
						center: ['%', '55%'],
						selectedMode: 'single',
						roseType: 'angle',
						data: [{
								value: personTypeValue[0],
								name: personTypeName[0]
							},
							{
								value: personTypeValue[1],
								name: personTypeName[1]
							},
							{
								value: personTypeValue[2],
								name: personTypeName[2]
							},
							{
								value: personTypeValue[3],
								name: personTypeName[3]
							},
							{
								value: personTypeValue[4],
								name: personTypeName[4]
							},
							{
								value: personTypeValue[5],
								name: personTypeName[5]
							}
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}]
				};
		
				// 绘制图表
				echarts.init(document.getElementById('specialPerson'), 'dark').setOption(option1);
			}
		});
		
	}

	//人口统计
	function loadData3() {
		var mUrl = "dcs/a9ac417f520542e380f40b5fd461d4a8/statistics";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			//请求结果处理
			console.log("统计图表-->总概述", result);
			if(result.code == 200) {
				//请求成功, 获取的数据拼接option
				var data = result.data;
		
				//房屋类型
				var roomCheck = data.roomCheckGroup;
				var checkNum = roomCheck[0].roomChecked;
				var unCheckNum = roomCheck[0].roomUnChecked;
				//人口类型
				var liveType = data.liveTypeGroup;
				var liveNum = liveType[0].count;
		
				var option1 = {
					title: {
						// text: '滨江怡畅园小区房屋统计',
						text: '智慧社区房屋统计',
						subtext: '小区总房屋: ' + (checkNum + unCheckNum),
						left: 'center'
					},
					tooltip: {
						trigger: 'item',
						formatter: "{a} <br/>{b} : {c} ({d}%)"
					},
					legend: {
						bottom: 10,
						left: 'center',
						data: ['已登记房屋', '未登记房屋']
					},
					series: [{
						name: '类型',
						type: 'pie',
						radius: '50%',
						center: ['35%', '50%'],
						selectedMode: 'single',
						data: [{
								value: checkNum,
								name: '已登记房屋'
							},
							{
								value: unCheckNum,
								name: '未登记房屋'
							}
						],
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}]
				};
		
				var option2 = {
					title: {
						text: '智慧社区人口统计',
						left: 'center'
					},
					tooltip: {},
					legend: {
						data: ['人数'],
						left: 'right'
					},
					xAxis: {
						data: ['总人口', '常住人口', '流动人口']
					},
					yAxis: {},
					series: [{
						name: '人数',
						type: 'bar',
						data: [liveNum, liveNum-500, 500]
					}]
		
				};
		
				// 绘制图表
				//房屋统计
				// echarts.init(document.getElementById('allHouse'), 'dark').setOption(option1);
				//人口统计
				echarts.init(document.getElementById('impPerson'), 'dark').setOption(option2);
			}
		});
		
	}

	function removeWidget() {
		$("#widget_chart").remove();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
});
