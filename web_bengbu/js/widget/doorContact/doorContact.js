/**
 * 门磁报警
 */
define(["jquery", "bootstrap", "common", "config"], function($, bootstrap, mCommon, config) {
	//门磁id数组
	var doorContactArray = null;
	var handler = null;
	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		//加载html
		loadHtmlDom("widget_doorContact", content);
		//请求门磁数据
		requestDoorContactData();
		//加载标注点击事件
		loadScreenHandler();
	}

	/**
	 * 获取门磁数据
	 */
	function requestDoorContactData() {
		var mUrl = "dcs/7a8165d2980f4b2f960cc4a8e09c33ee/select";
		ajaxRequest({}, ipPort, mUrl, function(result) {
			//请求结果处理
			console.log("门磁数据", result);
			doorContactArray = new Array();
			if(result.code == 200) {
				//获取成功
				var data = result.data;
				if(data == null) {
					return;
				}
				//将门磁数据添加到map上 只有经纬度缺少高度 在页面中显示的时候会悬空不合理
				for(var i in data) {
					if(data[i].longitude == "" || data[i].latitude == "") {
						continue;
					}
					//将id添加进数组
					var mImmageUrl = undefined;
					if(data[i].battery_state == "故障" || data[i].key_state == "故障" || data[i].demolition == "故障"){
						mImmageUrl = "./img/doorContact/门禁-断链.png";
					}else{
						mImmageUrl = "./img/doorContact/门禁-正常.png";
					}
					
					doorContactArray.push(data[i].device_id);
					
					var point = viewer.entities.add({
						id: data[i].device_id,
						//将以度为单位的经、纬度数值转换为笛卡尔坐标
						position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 0),
						label: {
							//标签的属性
							text: data[i].device_name,
							font: '14px sans-serif',
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							// fillColor: Cesium.Color.DEEPSKYBLUE,
							fillColor: Cesium.Color.YELLOW,
							outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
							outlineWidth: 1.0,
							pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
							scale: 1.0,
							//一种近标量属性，用于根据与摄像机的距离设置半透明度。
							translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
							// 获取或设置要禁用深度测试以防止对地形进行裁剪的相机的距离
							disableDepthTestDistance: 1000000000,
							//依附地形  
							heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
							// 指定将显示此标签的相机距离
							distanceDisplayCondition: new Cesium.DistanceDisplayCondition(2.0, 1000.0)
						},
						billboard: {
							//图标
//							image: "./img/doorContact/doorContact.png",
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
						position_desc: data[i].position_desc,
						//电池状态
						battery_state: data[i].battery_state,
						//按键状态
						key_state: data[i].key_state,
						//防拆状态
						demolition: data[i].demolition,
						//门磁状态
						state: data[i].state,
						//更新时间
						update_time: data[i].time,
					});
					//定位
					viewer.camera.flyTo({
						destination: Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude), 1000.0),
						duration: 2
					});
				}
			}
		});
	}

	/**
	 * 加载鼠标事件
	 */
	function loadScreenHandler() {
		//获取屏幕空间事件处理程序
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		var clickPosition = undefined;

		//LEFT_DOWN
		handler.setInputAction(function(movement) {
			clickPosition = movement.position;
			//如果门磁box正在显示, 则移除
			removeDoorContactBox();
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

		//LEFT_UP
		handler.setInputAction(function(movement) {
			if((clickPosition.x - movement.position.x > 3) || (clickPosition.x - movement.position.x < -3) ||
				(clickPosition.y - movement.position.y > 3) || (clickPosition.y - movement.position.y < -3)) {
				clickPosition = undefined;
				return;
			}

			//获取点击的门磁图标
			var pick = viewer.scene.pick(movement.position);
			//点击的不是标注
			// if(pick.collection == undefined){
			if(pick== undefined){
				return;
			}
			
			if(Cesium.defined(pick)) {
				/*点击标注*/
				if(pick.id) {
					var oDiv = document.createElement('div');
					oDiv.id = "doorContactBox";
					// 指定创建的DIV在文档中距离左侧的位置
					oDiv.style.left = (movement.position.x - 130) + 'px';
					// 指定创建的DIV在文档中距离顶部的位置
					oDiv.style.top = (movement.position.y - 160) + 'px';
					// 设置边框
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
					oDiv.style.height = '150px';

					var content = '<div id="menciContent" style="padding: 15px;color: #FFF;font-size: 10px;">' +
						'<div style="width:100%;height:120px;overflow:auto;">' +
						'<table style="float:top;width:100%;height:100%;">' +
						'<tr><td style="width:60px;">门磁编号:</td><td>' + pick.id.id + '</td></tr>' +
						'<tr><td style="width:60px;">门磁位置:</td><td>' + pick.id.position_desc + '</td></tr>' +
						'<tr><td style="width:60px;">电池状态:</td><td>' + pick.id.battery_state + '</td></tr>' +

						'<tr><td style="width:60px;">案件状态:</td><td>' + pick.id.key_state + '</td></tr>' +
						'<tr><td style="width:60px;">防拆状态:</td><td>' + pick.id.demolition + '</td></tr>' +
						'<tr><td style="width:60px;">门磁状态:</td><td>' + pick.id.state + '</td></tr>' +
						'<tr><td style="width:60px;">更新时间:</td><td>' + formatDateTime(pick.id.update_time) + '</td></tr>' +
						'</table>' +
						'</div>' +
						'</div>';
					oDiv.innerHTML = content;
					document.body.appendChild(oDiv);
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
		handler.setInputAction(function(movement) {
			//如果门磁box正在显示, 则移除
			removeDoorContactBox();
		}, Cesium.ScreenSpaceEventType.WHEEL);

		handler.setInputAction(function(movement) {
			//如果门磁box正在显示, 则移除
			removeDoorContactBox();
		}, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
		handler.setInputAction(function(movement) {
			//如果门磁box正在显示, 则移除
			removeDoorContactBox();
		}, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
		
	}

	/**
	 * 移除Box
	 */
	function removeDoorContactBox() {
		var mDiv = document.getElementById('doorContactBox');
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
		//删除地图上已经存在的门磁图标
		for(var i in doorContactArray) {
			//移除集合中指定id的实体对象。
			viewer.entities.removeById(doorContactArray[i]);
		}
		doorContactArray = undefined;
		//如果Box正在显示, 则移除
		removeDoorContactBox();
		//移除html
		removeHtmlDom("widget_doorContact");
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});