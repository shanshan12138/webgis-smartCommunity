/**
 * 人脸识别
 */
define(["jquery", "bootstrap", "datetimepicker", "common", "config"], function($, bootstrap, datetimepicker, common, config) {
	var handler = null;
	//人脸设备id数组
	var faceDeviceArray = null;

	function loadWidget(content) {
		loadHtmlDom("widget_faceRecognition", content);
		init();
		bindEvent();
		requestFaceDevice();
		loadScreenHandler();

	}

	/**
	 * 初始化
	 */
	function init() {
		//时间初始化
//		var timeStrat = getNowFormatDateStart();
		var timeStrat = '2018-01-01 00:00:00';
		var timeEnd = getNowFormatDateEnd();
		$("#deviceTimeStart").val(timeStrat);
		$("#deviceTimeEnd").val(timeEnd);
		$("#personTimeStart").val(timeStrat);
		$("#personTimeEnd").val(timeEnd);

		//窗体拖拽
		moveFormByHeader("faceHeader");
		moveFormByHeader("faceDetailHeader");

		faceDeviceArray = new Array();
	}

	function bindEvent() {
		//窗体关闭
		$("#faceClose").on("click", function() {
			$("#container-faceContent").hide();
		});

		//数据详情关闭(对比)
		$("#faceDetailClose").on("click", function() {
			$("#faceDetail").hide();
		});

		//查询某人时间段内的数据
		$("#personSearch").on("click", function() {
			//获取查询条件
			var startTime = transDateTime($("#personTimeStart").val().trim());
			var endTime = transDateTime($("#personTimeEnd").val().trim());
			var personName = $("#personName").val().trim();
			//查询
			requestPersonData(startTime, endTime, personName);
		});

		//跳转到个人识别结果
		$("#toPersonFacePage").on("click", function() {
			//查询条件

			var startTime = transDateTime("2012-01-01 00:00:00");
			var endTime = transDateTime(getNowFormatDateStart());
			var personName = $("#toPersonName").text().trim();
			//查询
			requestPersonData(startTime, endTime, personName);
			//切换页卡
			$('#myTab a:last').tab('show');
			$("#faceDetail").hide();
		});

	}

	/**
	 * 请求人脸设备
	 */
	function requestFaceDevice() {
		var startTime = transDateTime("2012-01-01 00:00:00");
		var endTime = transDateTime(getNowFormatDateStart());
		var mData = {
			"startTime": startTime,
			"endTime": endTime
		};
		var mUrl = "dcs/2701e199a0ce431aa980691c359e5a8b/statistics";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			console.log("人脸设备", result);
			if(result.code == 200) {
				//请求成功
				var data = result.data;
				if(data == null) {
					return;
				}
				//删除地图上已经存在的图标
				for(var i in faceDeviceArray) {
					viewer.entities.removeById(faceDeviceArray[i]);
				}
				faceDeviceArray.splice(0, faceDeviceArray.length);
				//将人脸设备数据作为标注放到地图上
				for(var i in data) {
					//将id添加进数组, 作为删除管理
					faceDeviceArray.push(data[i].device_id);
					var point = viewer.entities.add({
						id: data[i].device_id, //将车牌号作为id
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							text: data[i].device_name + "(" + data[i].count + "条数据)",
							font: '15px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							fillColor: Cesium.Color.YELLOW,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 3.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
//							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							translucencyByDistance: new Cesium.NearFarScalar(1.5e3, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
						},
						billboard: { //图标
							image: "./img/faceRecognition/faceDevice.png",
							width: 32,
							height: 32,
							scale: 1.0,
//							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							translucencyByDistance: new Cesium.NearFarScalar(1.5e3, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
						},
						desc: data[i].position_desc
					});
//					viewer.zoomTo(point);
					//定位
					viewer.camera.flyTo({
						destination: Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 10000.0),
						duration: 2
					});
				}
			} else if(result.code == 0 && result.msg == "登录过期!") {
				//登录过期
				window.location = "login.html";
			}

		});
	}

	/**
	 * 加载地图标注点击事件
	 */
	function loadScreenHandler() {
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		var clickPosition = undefined;
		//LEFT_DOWN
		handler.setInputAction(function(movement) {
			clickPosition = movement.position;
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		//LEFT_UP
		handler.setInputAction(function(movement) {
			if((clickPosition.x - movement.position.x > 3) || (clickPosition.x - movement.position.x < -3) ||
				(clickPosition.y - movement.position.y > 3) || (clickPosition.y - movement.position.y < -3)) {
				clickPosition = undefined;
				return;
			}

			//获取点击的人脸设备
			var pick = viewer.scene.pick(movement.position);
			//点击的不是标注
			if(!pick.collection){
				return;
			}

			if(Cesium.defined(pick)) {
				/*点击标注*/
				if(pick.id) {
					console.log("设备信息", pick.id);
					var id = pick.id.id;
					var desc = pick.id._desc;
					//根据人脸设备id请求人脸数据
					requestFaceDataById(id, desc);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
	}

	/**
	 * 根据人脸设备请求人脸数据
	 */
	function requestFaceDataById(deviceId, desc) {
		var startTime = transDateTime("2012-01-01 00:00:00");
		var endTime = transDateTime(getNowFormatDateStart());
		var mData = {
			"cameraId": deviceId,
			"startTime": startTime,
			"endTime": endTime
		};
		var mUrl = "dcs/c2b08256352940a78093f9a316a1623e/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			console.log("人脸数据", result);
			var data = result.data.list;
			var mContent = "";
			for(var i in data) {
				//属性信息
				//大图
				var bigPhoto = data[i].big_photo;
				// var bigPhoto="http://localhost:8090/web_s_community/img/faceRecognition/face.png"
				//采集时间
				var collectTime = data[i].collect_time;
				//设备id
				var deviceId = data[i].device_id;
				//设备名称
				var deviceName = data[i].device_name;
				//小图
				var smallPhoto = data[i].small_photo;
				mContent = mContent + '<div class="faceItem" >' +
					'<div class="imgBox"><img style="width:100%;height:100%;" src="' + bigPhoto + '" /></div>' +
					'<table style="width:200px;text-align: left;margin: 10px 5px">' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">姓名: </td><td>' +''+ '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">身份证号: </td><td>' +''+ '</td></tr>' +
					'<tr> <td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">相似度: </td><td>' +''+ '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">发现时间: </td><td>' + formatDateTime(collectTime) + '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">拍摄位置: </td><td>' + deviceName + '</td></tr>' +
					'</table></div>';
			}
			$("#faceData").empty();
			$("#faceData").append(mContent);
			$("#container-faceContent").show();

		});
	}

	/**
	 * 请求某人某时间段内的数据
	 */
	function requestPersonData(startTime, endTime, personName) {
		var mData = {
			"startTime": startTime,
			"endTime": endTime,
			"personName": personName
		};
		mData = JSON.stringify(mData);
		//发送查询请求
		$.ajax({
			type: "post",
			url: ipPort + "dcs/3592031cc2484c51b864b8bfd85527bf/select",
			async: true,
			dataType: "json",
			contentType: "application/json",
			data: mData,
			xhrFields: {
				withCredentials: true
			},
			success: function(result) {
				console.log("个人数据", result);
				var data = result.data.list;
				var mContent = "";
				for(var i in data) {
					//属性信息
					var name = data[i].suspicion_name;
					var identityNumber = data[i].suspicion_paper_number;
					var time = data[i].candid_time;
					var similary = data[i].similary;
					// var bigPhoto = data[i].big_photo;
					var smallPhoto = data[i].small_photo;
					var basePhone = data[i].base_phone_address;
					var desc = "";
					
					mContent = mContent + '<div class="faceItem" onClick=showFaceCompareData(\"' + name + '\",\"' +
						identityNumber + '\",\"' + time + '\",\"' + similary +
						'\",\"' + desc + '\",\"' + time + '\",\"' + bigPhoto + '\",\"' + smallPhoto + '\",\"' + basePhone +'\")>' +
					'<div class="imgBox"><img style="width:100%;height:100%;" src="' + smallPhoto + '" /></div>' +
					'<table style="width:200px;text-align: left;margin: 10px 5px">' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">姓名: </td><td>' + name + '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">身份证号: </td><td>' + identityNumber + '</td></tr>' +
					'<tr> <td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">相似度: </td><td>' + similary + '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">发现时间: </td><td>' + formatDateTime(time) + '</td></tr>' +
					'<tr><td style="width: 65px;font:12px arial,sans-serif;letter-spacing:1px;">拍摄位置: </td><td>' + desc + '</td></tr>' +
					'</table></div>';

				}
				$("#personFaceData").empty();
				$("#personFaceData").append(mContent);
			},
			error: function(error) {
				alert("请求出错");
			}
		});
	}

	/**
	 * 请求人脸对比数据
	 */
	showFaceCompareData = function(name, paper_number, candid_time, similary, desc, candid_time2, big_photo, small_photo, basePhone) {
		$("#faceCompareCatchImg").attr("src", small_photo);
		$("#faceCompareSaveImg").attr("src", basePhone);
		$("#faceCompareOriginImg").attr("src", big_photo);
		$("#faceCompareName").text(name);
		$("#faceCompareIdentityNumber").text(paper_number);
		$("#faceCompareTime").text(formatDateTime(candid_time));
		$("#faceCompareAddress").text(desc);
		$("#faceCompareTime2").text(formatDateTime(candid_time2));
		$("#toPersonName").text(name);
		$("#faceDetail").show();
	}

	/**
	 * 解绑事件
	 */
	function unBindEvent() {
		$("#faceClose").off("click");
		$("#faceDetailClose").off("click");
	}

	/**
	 * 移除模块
	 */
	function removeWidget() {
		unBindEvent();
		if(handler != undefined) {
			handler.destroy();
		}
		//删除地图上已经存在的执法员图标
		for(var i in faceDeviceArray) {
			viewer.entities.removeById(faceDeviceArray[i]);
		}
		faceDeviceArray = null;
		removeHtmlDom("widget_faceRecognition");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
});