/**
 * 车小丫
 */
define(["jquery", "bootstrap", "common", "config"], function($, bootstrap, mCommon, config) {
	var scene = viewer.scene;
	//警车id数组
	var carIdArray = null;
	var carHtArray = null;
	var handler = null;
	var mInterval;
	var lastPoint = null;

	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		loadHtmlDom("widget_chexiaoya", content)
		viewer.scene.globe.depthTestAgainstTerrain = false;
		lastPoint = null;
		carIdArray = new Array();
		carHtArray = new Array();
		init();
		loadScreenHandler();
		bindEvent();
		loadWeilan();
		moveFormByHeader("chexiaoyaHeader");
	}

	/**
	 * 初始化
	 */
	function init() {
		//清空搜索框
		$("#chexiaoyaSearchInput").val("");
	}

	/**
	 * 绑定事件
	 */
	function bindEvent() {
		//关闭窗口按钮
		$("#chexiaoyaClose").on("click", function() {
			$("#chexiaoyaContent").hide();
		});
		//查询按钮
		$("#chexiaoyaSearchBtn").on("click", function() {
			//获取输入的关键词
			var keyWord = $("#chexiaoyaSearchInput").val().trim();
			if(keyWord === ""){
				return;
			}
			//关键词检查
			if(checkValue("关键词", keyWord, 10, false, true)) {
				//showTip();
			}
			//			getCarByNum(keyWord);
			var count = 20;
			var startTime = "2017-11-23 16:04:00";
			var endTime = "2017-11-23 16:04:20";
			mInterval = setInterval(function() {
				if(count <= 0) {
					clearInterval(mInterval);
				} else {
					getCarRoute(keyWord, startTime, endTime);
					startTime = dateAddSeconds(startTime, 20);
					endTime = dateAddSeconds(endTime, 20);
				}
				count--;

			}, 1000 * 3);

		});
		
		//查询全部
		$("#chexiaoyaSearchAllBtn").on("click", function() {
			getCarByNum("");
		});

		//清空围栏
		$("#clearWeilan").on("click", function() {
			//移除围栏矢量面
			viewer.entities.removeById("weilan_polygon");
		});

	}

	/**
	 * 加载围栏数据
	 */
	function loadWeilan() {
		var mData = {};
		mData = JSON.stringify(mData);
		$.ajax({
			type: "post",
			url: cxyZfyPort + "cxy/dw/select",
			contentType: "application/json",
			data: mData,
			success: function(result) {
				var mResult = $.parseJSON(result);
				var data = mResult.data;
				console.log("围栏信息", data);
				var content = "";
				for(var i in data) {
					//围栏类型
					var mType = "";
					if(data[i].railtype == 1) {
						mType = "多边形";
					}
					//围栏范围
					//console.log("初始数据", data[i].polygonpath);

					//var range = {};
					content = content +
						'<tr>' +
						'<td>' + data[i].railname + '</td>' +
						'<td>' + data[i].orgname + '</td>' +
						'<td>' + data[i].hphmhpzl + '</td>' +
						'<td>每天循环</td>' +
						'<td>' +
						'<a onClick="getWeilanOnMap(\'' + data[i].polygonpath + '\')">围栏范围</a>' +
						'</td>' +
						'<td>' + mType + '</td>' +
						'<td>进入时触发</td>' +
						'</tr>';
				}
				$("#chexiaoyaContent table tbody").empty().append(content);
			},
			error: function(error) {
				//请求出错, 弹出错误
				alert("请求出错:" + error.responseText);
			}
		});
	}

	//获取围栏范围
	getWeilanOnMap = function(rangeStr) {
		var rangeStrArray = rangeStr.trim().split(";");
		var rangeArray = new Array();
		for(var m in rangeStrArray) {
			rangeArray.push(rangeStrArray[m].trim().split(","));
		}

		var positionArray = [];
		for(var i in rangeArray) {
			var longitude = parseFloat(rangeArray[i][0]);
			var latitude = parseFloat(rangeArray[i][1]);
			positionArray.push(new Cesium.Cartesian3.fromDegrees(longitude, latitude, 0));
		}

		//移除围栏矢量面
		viewer.entities.removeById("weilan_polygon");
		//添加围栏矢量面
		var polygon = viewer.entities.add({
			id: "weilan_polygon",
			polygon: {
				hierarchy: {
					positions: positionArray
				},
				material: Cesium.Color.YELLOW.withAlpha(0.3),
				outline: true,
				outlineColor: Cesium.Color.WHITE,
				outlineWidth: 5.0

			}
		});
		viewer.zoomTo(polygon);
	}

	/**
	 * 获取车辆路径
	 * @param {Object} carNum 车牌号
	 * @param {Object} startTime 开始时间
	 * @param {Object} endTime 结束时间
	 */
	function getCarRoute(carNum, startTime, endTime) {
		console.log("执行了--->");
		var mData = {
			"carNum": carNum,
			"startTime": startTime,
			"endTime": endTime
		};
		mData = JSON.stringify(mData);
		$.ajax({
			type: "post",
			url: cxyZfyPort + "cxy/history/select",
			contentType: "application/json",
			data: mData,
			success: function(result) {
				var mResult = $.parseJSON(result);
				var data = mResult.data;
				//				console.log("获取车小丫数据", result);
				removeCarBox();
				//将车辆数据作为标注放到地图上
				for(var i in data) {
					//删除点
					viewer.entities.removeById("carPoint");
					//重绘点
					var currentPoint = [parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0];
					var point = viewer.entities.add({
						id: "carPoint",
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							text: data[i].sbei,
							font: '15px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							fillColor: Cesium.Color.DEEPSKYBLUE,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 3.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000
						},
						billboard: { //图标
							image: "./img/chexiaoya/car.png",
							width: 32,
							height: 32,
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000
						},
						carNum: data[i].sbei,
						carLocation: data[i].location,
						carTime: data[i].time,
						videoNum: data[i].video_sim_num,
						videoType: data[i].video_sim_type
					});

//					viewer.camera.setView({
//						destination: Cesium.Cartesian3.fromDegrees(data[i].longitude, data[i].latitude, 3000.0)
//					});

					if(lastPoint != null) {
						carHtArray.push(data[i].time);
						var polyline = viewer.entities.add({
							id: data[i].time,
							polyline: {
								positions: Cesium.Cartesian3.fromDegreesArray([lastPoint[0], lastPoint[1], currentPoint[0], currentPoint[1]]),
								material: Cesium.Color.LIME,
								width: 3
							}
						});
					}
				}
				//记录上一点
				lastPoint = currentPoint;

			},
			error: function(error) {
				//请求出错, 弹出错误
				alert("请求出错:" + error.responseText);
			}
		});
	}

	/**
	 * 根据车牌号获取车辆数据
	 */
	function getCarByNum(keyWord) {
		removeCarIcon();
		var mData = {
			"carNum": ""
		};
		mData = JSON.stringify(mData);
		$.ajax({
			type: "post",
			url: cxyZfyPort + "cxy/position/select",
			async: true,
			contentType: "application/json",
			//dataType: "json",
			data: mData,
			success: function(result) {
				console.log("数据" + result);
				var mResult = $.parseJSON(result);
				var data = mResult.data;
				//删除地图上已经存在的图标
				removeCarIcon();
//				if(carIdArray.length > 0) {
//					carIdArray.splice(0, carIdArray.length);
//				}
				carIdArray = new Array();
				//将车辆数据作为标注放到地图上
				for(var i = 0; i < data.length; i++) {
					//将id添加进数组, 作为删除管理
					carIdArray.push(data[i].sbei);
					var point = viewer.entities.add({
						id: data[i].sbei, //将车牌号作为id
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							text: data[i].sbei,
							font: '15px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							fillColor: Cesium.Color.DEEPSKYBLUE,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 3.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000
						},
						billboard: { //图标
							image: "./img/chexiaoya/car.png",
							width: 32,
							height: 32,
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000
						},
						carNum: data[i].sbei,
						carLocation: data[i].location,
						carTime: data[i].time,
						videoNum: data[i].video_sim_num,
						videoType: data[i].video_sim_type
					});
					viewer.zoomTo(point);
				}

			},
			error: function(error) {
				alert("请求出错:" + error.responseText);
			}
		});
	}

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
			//如果carBox正在显示, 则移除
			removeCarBox();

			//获取点击的警车
			var pick = viewer.scene.pick(movement.position);
			//点击的不是标注
			if(pick.collection == undefined){
				return;
			}

			if(Cesium.defined(pick)) {
				/*点击标注*/
				if(pick.id) {
					
					var oDiv = document.createElement('div');
					oDiv.id = "chexiaoyaBox";
					// 指定创建的DIV在文档中距离左侧的位置
					oDiv.style.left = (movement.position.x - 130) + 'px';
					// 指定创建的DIV在文档中距离顶部的位置
					oDiv.style.top = (movement.position.y - 135) + 'px';
					// 设置边框
					//						oDiv.style.border = '1px solid #0000FF';
					oDiv.style.boxShadow = '-10px 0px 15px #034c6a inset, 0px -10px 15px #034c6a inset, 10px 0px 15px #034c6a inset, 0px 10px 15px #034c6a inset';
					oDiv.style.border = '1px solid #034c6a'; // 设置边框
					oDiv.style.boxSizing = 'border-box';
					oDiv.style.borderRadius = '25px';
					oDiv.style.background = 'rgba(8,24,50,0.7)';
					oDiv.style.position = 'absolute'; // 为新创建的DIV指定绝对定位
					oDiv.style.width = '260px'; // 指定宽度
					oDiv.style.height = '135px'; // 指定高度

					var content = '<div id="coverContent" style="padding: 10px;color: #FFF;">' +
						'<div style="width:100%;height:100px;" class="nui-scroll">' +
						'<table style="float:top;width:100%;height:100%;">' +
						'<tr><td style="width:70px;">设备号:</td><td>' + pick.id.carNum + '</td></tr>' +
						'<tr><td style="width:70px;">当前位置:</td><td>' + pick.id.carLocation + '</td></tr>' +
						'<tr><td style="width:70px;">更新时间:</td><td>' + pick.id.carTime + '</td></tr>' +
						'</table>' +
						'</div>' +
						'<div style="float:bottom;width:100%;">' +
						'<a href="javascript:void(0);" style="float:left;margin-left:30px;">历史轨迹</a>' +
						'<a href="javascript:void(0);" style="float:right;margin-right:30px;">视频查看</a>' +
						'</div>' +
						'</div>';
					oDiv.innerHTML = content;
					document.body.appendChild(oDiv);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
	}

	/**
	 * 解绑事件
	 */
	function unBindEvent() {
		//关闭按钮解绑
		$("#chexiaoyaClose").off("click");
		//搜索按钮
		$("#chexiaoyaSearchBtn").off("click");
		//搜索全部按钮
		$("#chexiaoyaSearchAllBtn").off("click");
	}

	/**
	 * 移除carBox
	 */
	function removeCarBox() {
		var mDiv = document.getElementById('chexiaoyaBox');
		if(mDiv) {
			document.body.removeChild(mDiv);
		}
	}

	/**
	 * 移除carIcon
	 */
	function removeCarIcon() {
		//删除地图上已经存在的警车图标
		for(var i in carIdArray) {
			viewer.entities.removeById(carIdArray[i]);
		}
		carIdArray = null;
	}

	/**
	 * 移除车辆路径
	 */
	function removeCarRoute() {
		for(var i in carHtArray) {
			viewer.entities.removeById(carHtArray[i]);
		}
		carHtArray = null;
	}

	/**
	 * 移除地图数据
	 */
	function clearMapData() {
		//移除动态车辆图标
		viewer.entities.removeById("carPoint");
		//移除动态车辆路径
		removeCarRoute();
		//移除车辆box
		removeCarBox();
		//移除车辆图标
		removeCarIcon();
		//移除电子围栏
		viewer.entities.removeById("weilan_polygon");
	}

	/**
	 * 移除模块
	 */
	function removeWidget() {
		//取消interval
		clearInterval(mInterval);
		//移除地图事件
		if(handler != undefined) {
			handler.destroy();
		}
		//解绑事件
		unBindEvent();
		//移除地图数据
		clearMapData();
		//移除html元素
		removeHtmlDom("widget_chexiaoya");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});