/**
 * 井盖监测
 */
define(["jquery", "bootstrap", "common", "config"], function($, bootstrap, mCommon, config) {
	//screenhandler
	var handler = null;
	//井盖id数组
	var coverIdArray = null;
	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		//加载html
		loadHtmlDom("widget_cover", content);
		//获取井盖数据
		requestCoverData();
		//加载标注点击事件
		loadScreenHandler();
	}

	/**
	 * 获取井盖数据
	 */
	function requestCoverData() {
		var mUrl = "dcs/c0bc6788aa85478bb6c54b318918845b/select";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			//请求结果处理
			console.log("井盖数据", result);
			coverIdArray = new Array();
			//请求成功
			if(result.code == 200) {
				var data = result.data;
				if(data == null) {
					return;
				}
				for(var i in data) {
					if(data[i].longitude == "" || data[i].latitude == "") {
						continue;
					}
					//图标
					var mImmageUrl = undefined;
					if(data[i].current_angle != "3度"){
						mImmageUrl = "./img/cover/井盖-报警.png";
					}else if(data[i].water_state != "正常"){
						mImmageUrl = "./img/cover/井盖-断链.png";	
					}else{
						mImmageUrl = "./img/cover/井盖-正常.png";
					}
					//添加点id到数组
					coverIdArray.push('cover'+i);
					//井盖数据添加到map
					var point = viewer.entities.add({
						//设备id
						id: 'cover'+i,
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							//标签
							text: data[i].device_name,
							font: '14px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							//							fillColor: Cesium.Color.DEEPSKYBLUE,
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
//							image: "./img/cover/cover.png",
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
						//井盖编号
						device_id: data[i].device_id,
						//井盖位置
						position_desc: data[i].position_desc,
						//当前角度值
						current_angle: data[i].current_angle,
						//报警角度值
						warning_angle: data[i].warning_angle,
						//当前电压值
						volition: data[i].volition,
						//更新时间
						updateTime: new Date(parseInt(data[i].time)).toLocaleString(),
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
	 * 加载鼠标事件
	 */
	function loadScreenHandler() {
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		var clickPosition = undefined;

		//LEFT_DOWN
		handler.setInputAction(function(movement) {
			clickPosition = movement.position;
			//如果coverBox正在显示, 则移除
			removeCoverBox();
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
					var oDiv = document.createElement('div');
					oDiv.id = "coverBox";
					// 指定创建的DIV在文档中距离左侧的位置
					oDiv.style.left = (movement.position.x - 130) + 'px';
					// 指定创建的DIV在文档中距离顶部的位置
					oDiv.style.top = (movement.position.y - 200) + 'px';
					// 设置边框
					//						oDiv.style.border = '1px solid #0000FF';
					oDiv.style.boxShadow = '-10px 0px 15px #034c6a inset, 0px -10px 15px #034c6a inset, 10px 0px 15px #034c6a inset, 0px 10px 15px #034c6a inset';
					oDiv.style.border = '1px solid #034c6a'; // 设置边框
					oDiv.style.boxSizing = 'border-box';
					oDiv.style.borderRadius = '25px';
					oDiv.style.background = 'rgba(8,24,50,0.7)';
					oDiv.style.position = 'absolute'; // 为新创建的DIV指定绝对定位
					oDiv.style.width = '260px'; // 指定宽度
					oDiv.style.height = '190px'; // 指定高度

					var content = '<div id="coverContent" style="padding: 15px;color: #FFF;">' +
						'<div style="width:100%;height:160px;" class="nui-scroll">' +
						'<table style="float:top;width:100%;height:100%;">' +
						'<tr><td style="width:70px;">井盖编号:</td><td>' + pick.id.device_id + '</td></tr>' +
						'<tr><td style="width:70px;">井盖位置:</td><td>' + pick.id.position_desc + '</td></tr>' +
						'<tr><td style="width:70px;">角度报警:</td><td>' + '' + '</td></tr>' +
						'<tr><td style="width:70px;">当前角度值:</td><td>' + pick.id.current_angle + '</td></tr>' +
						'<tr><td style="width:70px;">报警角度值:</td><td>' + pick.id.warning_angle + '</td></tr>' +
						'<tr><td style="width:70px;">低电压报警:</td><td>' + '' + '</td></tr>' +
						'<tr><td style="width:70px;">当前电压:</td><td>' + pick.id.volition + '</td></tr>' +
						'<tr><td style="width:70px;">雨水报警:</td><td>' + '' + '</td></tr>' +
						'<tr><td style="width:70px;">更新时间:</td><td>' + pick.id.updateTime + '</td></tr>' +
						'</table>' +
						'</div>' +
						'</div>';
					oDiv.innerHTML = content;
					document.body.appendChild(oDiv);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
		handler.setInputAction(function(movement) {
			//如果coverBox正在显示, 则移除
			removeCoverBox();
		}, Cesium.ScreenSpaceEventType.WHEEL);

		handler.setInputAction(function(movement) {
			//如果coverBox正在显示, 则移除
			removeCoverBox();
		}, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
		handler.setInputAction(function(movement) {
			//如果coverBox正在显示, 则移除
			removeCoverBox();
		}, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
	}

	//移除方法-------------------------------------------------------------------------------------------------------------

	/**
	 * 移除CoverBox
	 */
	function removeCoverBox() {
		var mDiv = document.getElementById('coverBox');
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
	 * 移除模块
	 */
	function removeWidget() {
		//移除screenhandler
		removeScreenHandler();
		//清除地图上的井盖图标
		for(var i in coverIdArray) {
			viewer.entities.removeById(coverIdArray[i]);
		}
		coverIdArray = undefined;
		//如果coverBox正在显示, 则移除
		removeCoverBox();
		//移除html
		removeHtmlDom("widget_cover");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};

});