/**
 * 设备报警
 */
define(["jquery", "common", "config", "echarts", "echarts-dark"], function($, mCommon, config, echarts, dark) {

	function loadWidget(content) {
		loadHtmlDom("widget_deviceAlert", content);
		// loadData();
		bindEvent();
	}

	function bindEvent() {
		//关闭窗体
		$("#chartClose").on("click", function() {
			$("#container-chart").hide();
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

	
	function removeWidget() {
		$("#widget_deviceAlert").remove();
		// var container = document.getElementById('widget_deviceAlert');
		// if (container) {
		// 	document.body.removeChild(container);
		// }
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
});
