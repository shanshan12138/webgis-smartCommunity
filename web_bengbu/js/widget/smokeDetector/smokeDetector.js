/**
 * 烟感报警
 */
define(["jquery", "bootstrap", "common", "config"], function($, bootstrap, mCommon, config) {
	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		loadHtmlDom(content);
		loadSmokeDetectorData(function() {
			moveFormByHeader("smokeDetectorHeader");
			bindEvent();
		});

	}

	/**
	 * 加载html元素
	 */
	function loadHtmlDom(content) {
		var container = document.createElement('div');
		container.id = "widget_smokeDetector";
		container.innerHTML = content;
		document.body.appendChild(container);
	}

	/**
	 * 加载无线烟感数据
	 */
	function loadSmokeDetectorData(callback) {
		var mUrl = "dcs/5d12d1df62fc4ae59c404dd1a9ecda1a/select";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			//请求结果处理
			console.log("烟感数据-->", result);
			if(result.code == 200) {
				//请求成功
				var content = "";
				var data = result.data;
				for(var i in data) {
					content = content + '<tr>' +
						'<td class="smoke_code">' + data[i].device_code + '</td>' +
						'<td class="smoke_id">' + data[i].community_id + '</td>' +
						'<td class="smoke_desc" onClick="getMonomer(this.desc)">' + data[i].position_desc + '</td>';
					if(data[i].battery_state == "正常") {
						content += '<td>' + data[i].battery_state + '</td>';
					} else {
						content += '<td style="color:red;">' + data[i].battery_state + '</td>';
					}
					if((data[i].smoke_state == "" ? "正常" : "不正常") == "正常") {
						content += '<td>' + "正常" + '</td>';
					} else {
						content += '<td style="color:red;">' + "不正常" + '</td>';
					}
					if((data[i].fault_state == "0" ? "正常" : "不正常") == "正常") {
						content += '<td>' + (data[i].fault_state == "0" ? "正常" : "不正常") + '</td>';
					} else {
						content += '<td style="color:red;">' + (data[i].fault_state == "0" ? "正常" : "不正常") + '</td>';
					}
					content += '</tr>';
				}
				$("#container-smokeDetectorContent table tbody").empty().append(content);
				callback();
			}
		});

	}

	/**
	 * 绑定鼠标事件
	 */
	function bindEvent() {
		//关闭窗体
		$("#smokeClose").on("click", function() {
			$("#container-smokeDetectorContent").hide();
		})
		//表格行点击
		$("#smokeTable>tbody>tr").on("click", function() {
			$(this).parent().find("tr").css("background", "");
			$(this).css("background","rgba(34,34,34,0.5)");
		});
	}

	/**
	 * 解绑鼠标事件
	 */
	function ubBindEvent() {
		//关闭窗体解绑
		$("#smokeClose").off("click");
		//解绑表格点击
		$("#smokeTable>tbody>tr").off("click");
	}

	/**
	 * 移除html元素
	 */
	function removeHtmlDom() {
		var container = document.getElementById('widget_smokeDetector');
		if(container) {
			document.body.removeChild(container);
		}
	}

	/**
	 * 移除模块
	 */
	function removeWidget() {
		//解绑事件
		ubBindEvent();
		//移除html元素
		removeHtmlDom();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
	
	
	// //获取当前用户的房屋模型
	// getMonomer = function(desc) {
	// 	var mId = id.replace(/[^0-9]/ig, "");
	// 	// console.log(mId);
	// 
	// 	var biulding = houseArray[mId].building_name.replace(/[^0-9]/ig, "");
	// 	var unit = houseArray[mId].unit_name.replace(/[^0-9]/ig, "");
	// 	var floor = houseArray[mId].floor.replace(/[^0-9]/ig, "");
	// 	var no = houseArray[mId].room_number.replace(/[^0-9]/ig, "");
	// 	if (no.substr(0, 1) == "0") {
	// 		no = no.substring(1);
	// 	}
	// 	//		console.log(biulding + "..." + unit + "..." + floor + "..." + no);
	// 	var sqlStr = "CNAME=\"滨江怡畅园\" AND BUILDING=" + biulding + " AND UNIT=" + unit + " AND FLOOR=" + floor + " AND NO=" +
	// 		no;
	// 	doSqlQuery(sqlStr);
	// }
	// //请求房屋数据
	// function doSqlQuery(SQL) {
	// 	var getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;
	// 	getFeatureParam = new SuperMap.REST.FilterParameter({
	// 		attributeFilter: SQL
	// 	});
	// 	getFeatureBySQLParams = new SuperMap.REST.GetFeaturesBySQLParameters({
	// 		queryParameter: getFeatureParam,
	// 		toIndex: -1,
	// 		datasetNames: ["HYzt:" + "shpall"]
	// 	});
	// 	var url = 'http://10.10.2.151:8091/iserver/services/data-test-monomer-new2/rest/data';
	// 	getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(url, {
	// 		eventListeners: {
	// 			"processCompleted": onQueryComplete,
	// 			"processFailed": processFailed
	// 		}
	// 	});
	// 	getFeatureBySQLService.processAsync(getFeatureBySQLParams);
	// }
	// 
	// function processFailed(queryEventArgs) {
	// 	alert('查询失败！');
	// }
	// 
	// function onQueryComplete(queryEventArgs) {
	// 	console.log(queryEventArgs);
	// 
	// 	var selectedFeatures = queryEventArgs.originResult.features;
	// 
	// 	var id = null;
	// 	var feature = null;
	// 
	// 	for (var i = 0; i < selectedFeatures.length; i++) {
	// 		//			console.log(selectedFeatures);
	// 		id = selectedFeatures[i].fieldValues["0"];
	// 		lastId = id;
	// 		feature = selectedFeatures[i];
	// 	}
	// 
	// 	buildingLayer.setSelection(id);
	// 
	// 	//跳转到当前模型的位置
	// 	viewer.camera.setView({
	// 		destination: buildingLayer.layerBounds,
	// 		orientation: {
	// 			heading: Cesium.Math.toRadians(0.0), //水平方向旋转
	// 			pitch: Cesium.Math.toRadians(-75.0), // default value (looking down)
	// 			roll: 0.0 // default value
	// 		}
	// 
	// 	});
	// 
	// }
	// 
	
	
});