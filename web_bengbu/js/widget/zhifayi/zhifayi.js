/**
 * 执法仪
 */
define(["jquery", "bootstrap", "common", "config"], function($, bootstrap, mCommon, config) {
	var scene = viewer.scene;
	//执法人员id数组
	var policeIdArray = null;
	var handler = null;
	var lastPoint = null; //上一个位置点
	var mInterval;
	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		//加载html元素
		loadHtmlDom("widget_zhifayi", content);
		//关闭地形
		viewer.scene.globe.depthTestAgainstTerrain = false;
		lastPoint = null;
		policeIdArray = new Array();
		var count = 28;
		//设置获取元素的起止时间
		var startTime = "2018-02-02 10:14:00";
		var endTime = "2018-02-02 10:14:59";
		//开启Interval
		mInterval = setInterval(function() {
			//数量小于0, 取消定时器
			if(count <= 0) {
				clearInterval(mInterval);
			} else {
				//根据起止时间, 获得执法仪信息
				getZhifayi(startTime, endTime);
				//起止时间向后增加
				startTime = dateAddSeconds(startTime, 60);
				endTime = dateAddSeconds(endTime, 60);
			}
			count--;
		}, 1000 * 3);

		loadScreenHandler();
	}

	/**
	 * 获取执法仪数据
	 */
	function getZhifayi(startTime, endTime) {
		var mData = {
			"carNum": "15",
			"startTime": startTime,
			"endTime": endTime
		};
		mData = JSON.stringify(mData);
		$.ajax({
			type: "post",
			url: cxyZfyPort + "zfy/history/select",
			contentType: "application/json",
			data: mData,
			success: function(result) {
				console.log("获取执法仪数据", result);
				var mResult = $.parseJSON(result);
				var data = mResult.data;
				removePoliceBox();
				//将车辆数据作为标注放到地图上
				for(var i in data) {
					//删除点
					viewer.entities.removeById("policePoint");
					//重绘点
					var currentPoint = [parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0];
					var point = viewer.entities.add({
						id: "policePoint",
						position: new Cesium.Cartesian3.fromDegrees(data[i].longitude, data[i].latitude, 0),
						label: {
							text: data[i].name, //姓名+电话
							font: '15px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							fillColor: Cesium.Color.DEEPSKYBLUE,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 3.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
						},
						billboard: {
							//图标
							image: "./img/zhifayi/police.png",
							width: 32,
							height: 32,
							scale: 1.0,
							//translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
						},
						policeName: data[i].name,
						policeId: data[i].policeId,
						time: data[i].time,
						videoIp: data[i].videoip,
						videoPort: data[i].videoport
					});
//					viewer.camera.setView({
//						destination: Cesium.Cartesian3.fromDegrees(data[i].longitude, data[i].latitude, 3000.0)
//					});

					if(lastPoint != null) {
						policeIdArray.push(data[i].time);
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
			removePoliceBox();

			//获取点击的警车
			var pick = viewer.scene.pick(movement.position);
			//点击的不是标注
			if(pick.collection == undefined){
				return;
			}

			if(Cesium.defined(pick)) {
				/*点击标注*/
				if(pick.id) {
					if("policePoint" != pick.id.id) {
						return;
					}
					
/*					var oDiv = document.createElement('div');
					oDiv.id = "policeBox";
					oDiv.style.left = (movement.position.x - 130) + 'px'; // 指定创建的DIV在文档中距离左侧的位置
					oDiv.style.top = (movement.position.y - 135) + 'px'; // 指定创建的DIV在文档中距离顶部的位置
					oDiv.style.border = '1px solid #0000FF'; // 设置边框
					oDiv.style.borderRadius = '25px';
					oDiv.style.background = 'rgba(0,0,0,0.5)';
					oDiv.style.position = 'absolute'; // 为新创建的DIV指定绝对定位
					oDiv.style.width = '260px'; // 指定宽度
					oDiv.style.height = '135px'; // 指定高度
					var content = '<div id="carBox" style="padding: 10px;color: #FFF;font-size: 10px;">' +
						'<div style="width:100%;height:100px;overflow:auto;">' +
						'<table style="float:top;width:100%;height:100%;">' +
						'<tr><td style="width:60px;">姓名+电话:</td><td>' + pick.id.policeName + '</td></tr>' +
						'<tr><td style="width:60px;">警员编号:</td><td>' + pick.id.policeId + '</td></tr>' +
						'<tr><td style="width:60px;">更新时间:</td><td>' + pick.id.time + '</td></tr>' +
						'</table>' +
						'</div>' +
						'<div style="float:bottom;width:100%;">' +
						'<a href="javascript:void(0);" style="float:right;margin-right:30px;">视频查看</a>' +
						'</div>' +
						'</div>';
					oDiv.innerHTML = content;
					document.body.appendChild(oDiv);*/
					
					
					
					var oDiv = document.createElement('div');
					oDiv.id = "policeBox";
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
						'<tr><td style="width:60px;">姓名+电话:</td><td>' + pick.id.policeName + '</td></tr>' +
						'<tr><td style="width:60px;">安保编号:</td><td>' + pick.id.policeId + '</td></tr>' +
						'<tr><td style="width:60px;">更新时间:</td><td>' + pick.id.time + '</td></tr>' +
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
	 * 移除人员box
	 */
	function removePoliceBox() {
		var mDiv = document.getElementById('policeBox');
		if(mDiv) {
			document.body.removeChild(mDiv);
		}
	}
	
	/**
	 * 移除动态人员路径
	 */
	function removePoliceRoute(){
		for(var i in policeIdArray) {
			viewer.entities.removeById(policeIdArray[i]);
		}
		policeIdArray = null;	
	}
	
	/**
	 * 移除地图数据
	 */
	function clearMapData(){
		//移除动态人员图标
		viewer.entities.removeById("policePoint");
		//移除动态人员路径
		removePoliceRoute();
		//移除人员box
		removePoliceBox();
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
		//移除地图数据
		clearMapData();
		//移除html
		removeHtmlDom("widget_zhifayi");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});