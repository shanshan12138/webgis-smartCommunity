/**
 * 消防栓
 */
define(["jquery", "bootstrap", "common", "config", "videojs"], function($, bootstrap, mCommon, config, videojs) {
	var handler = null;
	//消防栓id数组
	var fireHydrantArray = null;

	function loadWidget(content) {
		//加载html
		loadHtmlDom("widget_fireHydrant", content);
		//请求消防栓数据
		requestFireHydrantData();
		//加载点击事件
		loadScreenHandler();
	}

	/**
	 * 请求消防栓数据
	 */
	function requestFireHydrantData() {
		var mUrl = "dcs/aee041172fb44beea1ee9374964e0325/select";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			console.log("消防栓数据", result);
			fireHydrantArray = new Array();
			if(result.code == 200) {
				var data = result.data;
				if(data == null) {
					return;
				}
				for(var i in data) {
					if(data[i].longitude == "" || data[i].latitude == "") {
						continue;
					}
					//添加点id到数组
					fireHydrantArray.push(data[i].device_id);
					//图标
					var mImmageUrl = undefined;
					// 在common.js中182行 加载object内容
					// getObjContent(data[i]);
					if(data[i].check_value >= 1 || data[i].check_value <= 0.1 ){
						mImmageUrl = "./img/fireHydrant/消防-报警.png";
					}else if(data[i].check_name == "正常"){
						mImmageUrl = "./img/fireHydrant/消防-正常.png";
					}else{
						mImmageUrl = "./img/fireHydrant/消防-断链.png";
					}
					//添加消防栓数据到map
					var point = viewer.entities.add({
						id: data[i].device_id,
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							//标签
							text: data[i].device_name,
							font: '14px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							//							illColor: Cesium.Color.DEEPSKYBLUE,
							fillColor: Cesium.Color.YELLOW,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 1.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							//依附地形
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
							distanceDisplayCondition: new Cesium.DistanceDisplayCondition(2.0, 1000.0)
						},
						billboard: {
							//图标
//							image: "./img/fireHydrant/fireHydrant.png",
							image: mImmageUrl,
							width: 24,
							height: 24,
							scale: 1.0,
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							disableDepthTestDistance: 1000000000,
							//依附地形
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
							distanceDisplayCondition: new Cesium.DistanceDisplayCondition(2.0, 1000.0)
						},
						//设备编号
						device_id: data[i].device_code,
						//压力值
						device_value: data[i].check_value,
						//压力单位
						device_unit: data[i].check_unit,
						//位置描述
						position_desc: data[i].position_desc,
						//更新时间
						update_time: data[i].time,
						//状态
						device_status: data[i].check_name

					});
					//定位
					viewer.camera.flyTo({
						destination: Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 1000.0),
						duration: 2
					});
				}
			} else if(result.code == 0 && result.msg == MSG_LOGIN_TIMEOUT) {
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
			//如果box正在显示, 则移除
			removeFireHydrantBox();
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		//LEFT_UP
		handler.setInputAction(function(movement) {
			if((clickPosition.x - movement.position.x > 3) || (clickPosition.x - movement.position.x < -3) ||
				(clickPosition.y - movement.position.y > 3) || (clickPosition.y - movement.position.y < -3)) {
				clickPosition = undefined;
				return;
			}
			//获取点击的图标
			var pick = viewer.scene.pick(movement.position);
			//点击的不是标注
			if(pick.collection == undefined){
				return;
			}
			if(Cesium.defined(pick)) {
				/*点击标注*/
				if(pick.id) {
					//					console.log("消防栓信息", pick.id);
					var oDiv = document.createElement('div');
					oDiv.id = "fireHydrantBox";
					// 指定创建的DIV在文档中距离左侧的位置
					oDiv.style.left = (movement.position.x - 130) + 'px';
					// 指定创建的DIV在文档中距离顶部的位置
					oDiv.style.top = (movement.position.y - 160) + 'px';
					oDiv.style.boxShadow = '-10px 0px 15px #034c6a inset, 0px -10px 15px #034c6a inset, 10px 0px 15px #034c6a inset, 0px 10px 15px #034c6a inset';
					// 设置边框
					oDiv.style.border = '1px solid #034c6a';
					oDiv.style.boxSizing = 'border-box';
					oDiv.style.borderRadius = '25px';
					oDiv.style.background = 'rgba(8,24,50,0.7)';
					// 为新创建的DIV指定绝对定位
					oDiv.style.position = 'absolute';
					// 指定宽度
					oDiv.style.width = '260px';
					// 指定高度
					oDiv.style.height = '145px';
					var content = '<div id="fireHydrantContent" style="padding: 15px;color: #FFF;">' +
						'<div style="width:100%;height:100px;overflow:auto;">' +
						'<table style="float:top;width:100%;height:100%;">' +
						'<tr><td style="width:60px;">设备编号:</td><td>' + pick.id.device_id + '</td></tr>' +
						'<tr><td style="width:60px;">压力值:</td><td>' + pick.id.device_value + pick.id.device_unit + '</td></tr>' +
						'<tr><td style="width:60px;">状态:</td><td>' + pick.id.device_status + '</td></tr>' +
						'<tr><td style="width:60px;">位置:</td><td>' + pick.id.position_desc + '</td></tr>' +
						'<tr><td style="width:60px;">更新时间:</td><td>' + formatDateTime(pick.id.update_time) + '</td></tr>' +
						'</table>' +
						'</div>' +
						'<div style="float:bottom;width:100%;">' +
						'<a href="./data/test.mp4" style="float:right;margin-right:30px;">视频查看</a>' +
						//						'<a href="rtmp://127.0.0.1:1935/live/test" style="float:right;margin-right:30px;">视频查看</a>' +
						//						'<a href="rtsp://admin:root123456@10.10.2.74:554/h264/ch1/main/av_stream" style="float:right;margin-right:30px;">视频查看</a>' +
						'</div>' +
						'</div>';
					oDiv.innerHTML = content;
					document.body.appendChild(oDiv);

					//动态显示视频
					$("#fireHydrantContent>div>a").on("click", function(evt) {
						evt.preventDefault();

						var mWidth = document.documentElement.clientWidth || document.body.clientWidth;
						var mHeight = document.documentElement.clientHeight || document.body.clientHeight;

						var mLeft = ((mWidth - 600) / 2) + 'px';
						var mTop = ((mHeight - 400) / 2) + 'px';

						window.open("video.html?url=" + this.href, "_blank",
							"resizable=1,width=600,height=400,top=" + mTop + ",left=" + mLeft);

					});

				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
		handler.setInputAction(function(movement) {
			//如果box正在显示, 则移除
			removeFireHydrantBox();
		}, Cesium.ScreenSpaceEventType.WHEEL);

		handler.setInputAction(function(movement) {
			//如果box正在显示, 则移除
			removeFireHydrantBox();
		}, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
		handler.setInputAction(function(movement) {
			//如果box正在显示, 则移除
			removeFireHydrantBox();
		}, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
	}

	/**
	 * 移除fireHydrantBox
	 */
	function removeFireHydrantBox() {
		var mDiv = document.getElementById('fireHydrantBox');
		if(mDiv) {
			document.body.removeChild(mDiv);
		}
	}

	/**
	 * 移除screenhandler
	 */
	function removeScreenHandler() {
		if(handler != undefined) {
			handler.destroy();
		}
	}

	/**
	 * 解绑事件
	 */
	function unBindEvent() {

	}

	function removeWidget() {
		//解绑事件
		unBindEvent();
		//移除screenhandler
		removeScreenHandler();
		//清除地图上的消防栓图标
		for(var i in fireHydrantArray) {
			viewer.entities.removeById(fireHydrantArray[i]);
		}
		fireHydrantArray = undefined;
		//如果box正在显示,则删除
		removeFireHydrantBox();
		//移除html
		removeHtmlDom("widget_fireHydrant");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
});