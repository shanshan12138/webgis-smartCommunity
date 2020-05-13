/*量测工具*/
define(["common"], function() {
	var distance, heightMeasure, areaMeasure;
	var distanceArray = [];
	var heightMeasureArray = [];
	var areaMeasureArray = [];

	var tempDataSource;
	var isCoordinate = false;
	var promise = viewer.dataSources.add(new Cesium.GeoJsonDataSource("measure_tempDataSource"));

	promise.then(function(dataSource) {
		tempDataSource = dataSource;
	}).otherwise(function(error) {

	});
	var clickPosition = undefined;
	var handler;
	
	/**
	 * 加载模块
	 */
	function loadWidget(content){
		loadHtmlDom("widget_measure", content);
	}

	/**插入坐标测量**/
	function insertCoordinate(oPos) {

		var oLabelEntity = {
			name: "坐标测量",
			position: Cesium.Cartesian3.fromDegrees(oPos.x, oPos.y, oPos.z),
			clampToGround: true,
			attachPolygon: true,
			label: {
				text: "经度：" + ("   " + oPos.x.toFixed(6)).slice(-10) + "\u00B0\n纬度：" + ("   " + oPos.y.toFixed(6)).slice(-10) + "\u00B0\n高度：" + ("   " + oPos.z.toFixed(6)).slice(-10) + "m ",
				translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				font: '35px 楷体',
				fillColor: Cesium.Color.WHITE,
				outlineColor: Cesium.Color.BLACK,
				outlineWidth: 6,
				disableDepthTestDistance: 1000000000,
				scale: 0.5,
				pixelOffset: new Cesium.Cartesian2(0, -10),
				showBackground: true,
				backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
				backgroundPadding: new Cesium.Cartesian2(10, 10),
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM
			},
			point: {
				color: Cesium.Color.fromCssColorString("#FF0000"),
				pixelSize: 10,
				perPositionHeight: false,
				disableDepthTestDistance: 1000000000
			}
		};
		tempDataSource.entities.add(oLabelEntity);

	}

	//清除测量效果
	function clearMeasure() {
		for(var i = 0; i < distanceArray.length; i++) {
			distanceArray[i].clear();
		}
		for(var i = 0; i < heightMeasureArray.length; i++) {
			heightMeasureArray[i].clear();
		}
		for(var i = 0; i < areaMeasureArray.length; i++) {
			areaMeasureArray[i].clear();
		}
		//		$("#monomer-content .monomer-item").removeClass("active");
		isCoordinate = false;
		tempDataSource.entities.removeAll();
	}

	//取消点击事件
	function unbindEvent() {
		$("#monomer-content .monomer-item").unbind();
		$("#cleanMeasure").unbind();
		$("canvas").unbind();
	}

	function loadWidget(content) {
		//加载html
		loadHtmlDom("widget_measure", content);
		//拖动窗体
		moveFormByHeader("measureHeader");

		//鼠标左键按下事件(获取鼠标的位置)
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
		handler.setInputAction(function(movement) {
			clickPosition = movement.position;
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		//鼠标左键松开事件
		handler.setInputAction(function(movement) {
			//clickPosition  movement.position;
			//如果按下鼠标后拖动了,且距离大于3,就退出
			if((clickPosition.x - movement.position.x > 3) || (clickPosition.x - movement.position.x < -3) ||
				(clickPosition.y - movement.position.y > 3) || (clickPosition.y - movement.position.y < -3)) {
				clickPosition = undefined;
				return;
			}
			//如果是坐标测量
			if(isCoordinate) {
				console.log("坐标测量");
				var posit = viewer.scene.pickPosition(movement.position); //获取鼠标所在的位置
				var cartographic = Cesium.Cartographic.fromCartesian(posit); //获取3D笛卡尔坐标
				var currentClickLon = Cesium.Math.toDegrees(cartographic.longitude); //获取坐标的经度
				var currentClickLat = Cesium.Math.toDegrees(cartographic.latitude); //获取坐标的纬度
				var currentClickHei = cartographic.height; //获取坐标的高度
				var oCoordinate = {};
				oCoordinate.x = currentClickLon;
				oCoordinate.y = currentClickLat;
				oCoordinate.z = currentClickHei;
				//插入坐标测量
				insertCoordinate(oCoordinate);
				//关闭坐标测量
				isCoordinate = false;
				//关闭坐标测量选项的选中状态
				$("#MeasureCoordinate").removeClass("active");
			} else if(heightMeasure && heightMeasure.enable) {
				//如果是三角测量
				console.log("三角测量");
				if(heightMeasure.eMeasureStatus == 2) {
					$("#MeasureTriangle").removeClass("active");
				}
				heightMeasure.addPoint3D(movement);
			} else if(distance && distance.enable) {
				//如果是空间距离测量
				console.log("空间距离测量");
				distance.addPoint3D(movement);
			} else if(areaMeasure && areaMeasure.enable) {
				//如果是空间面积测量
				console.log("空间面积测量");
				areaMeasure.addPoint3D(movement);
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);

		//鼠标移动事件
		handler.setInputAction(function(movement) {

			if(heightMeasure && heightMeasure.enable) { //如果是三角测量
				heightMeasure.addPointTemp(movement);
			} else if(distance && distance.enable) { //如果是空间距离测量
				distance.addPointTemp(movement);

			} else if(areaMeasure && areaMeasure.enable) { //如果是空间面积测量
				areaMeasure.addPointTemp(movement);

			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		//鼠标左键双击事件
		handler.setInputAction(function(movement) {
			if(distance && distance.enable) { //如果是空间距离测量
				distance.finish();
				$("#MeasureDistance").removeClass("active"); //空间测量选项去除焦点
			}
			if(areaMeasure && areaMeasure.enable) { //如果是空间面积测量
				//areaMeasure.addPoint3D(movement);
				//areaMeasure.addPointTemp(movement);
				areaMeasure.finish(movement);
				$("#MeasureArea").removeClass("active");
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

		/*点击量测标签改变 */
		//各个测量选项的点击事件
		$("#measure-content .measure-item").on("click", function() {
			var sThis = $(this);
			//清理
			if(distance) { //空间距离测量
				distance = undefined;
			}
			if(heightMeasure) { //三角测量
				heightMeasure = undefined;
			}
			if(areaMeasure) { //空间面积测量
				areaMeasure = undefined;
			}

			//测量选项一处焦点
			$("#measure-content .measure-item").removeClass("active");

			if(sThis.hasClass("active")) {

			} else {
				var sId = sThis.attr("id");
				sThis.addClass("active");
				if(sId == "MeasureDistance") { //空间距离测量
					distance = new Cesium.LSDistanceMeasure(viewer);
					distance.enable = true;
					distanceArray.push(distance);
					isCoordinate = false;
				} else if(sId == "MeasureArea") { //空间面积测量
					areaMeasure = new Cesium.LSAreaMeasure(viewer);
					areaMeasure.enable = true;
					areaMeasureArray.push(areaMeasure);
					isCoordinate = false;
				} else if(sId == "MeasureTriangle") { //三角测量
					heightMeasure = new Cesium.LSHeightMeasure(viewer);
					heightMeasure.enable = true;
					heightMeasureArray.push(heightMeasure);
					isCoordinate = false;
				} else if(sId == "MeasureCoordinate") { //坐标测量
					heightMeasure ? heightMeasure.enable = false : null;
					areaMeasure ? areaMeasure.enable = false : null;
					distance ? distance.enable = false : null;

					isCoordinate = true;
				}
			}
		});

		//清除测量点击事件
		$("#cleanMeasure").click(function() {
			clearMeasure();
		});

		$("canvas").mousemove(function(e) {
			var floatTip = $("#float-tip");
			if(isCoordinate) {
				floatTip.html("左击测量").css({
					left: e.clientX + 15 + "px",
					top: e.clientY + "px"
				});
				floatTip.show();
			} else if(heightMeasure && heightMeasure.enable) {
				floatTip.html("左击测量，再次左击结束").css({
					left: e.clientX + 15 + "px",
					top: e.clientY + "px"
				});
				floatTip.show();
			} else if((distance && distance.enable) || (areaMeasure && areaMeasure.enable)) {
				floatTip.html("左击测量，双击结束").css({
					left: e.clientX + 15 + "px",
					top: e.clientY + "px"
				});
				floatTip.show();
			} else {
				floatTip.hide();
			}
		}).click(function() {
			var floatTip = $("#float-tip");
			floatTip.hide();
		});
	}

	/**
	 * 移除html元素
	 */
	function removeHtmlDom() {
		var container = document.getElementById('widget_measure');
		if(container) {
			document.body.removeChild(container);
		}
	}

	function removeWidget() {
		if(handler != undefined) {
			handler.destroy();
		}
		var id;
		var index = 0;
		while(index < viewer.scene.primitives.length) {
			id = viewer.scene.primitives.get(index).id;
			if(id == "measure-tileset") {
				viewer.scene.primitives.remove(viewer.scene.primitives.get(index));
				continue;
			}
			index++;
		}
		clearMeasure();
		unbindEvent();
		removeHtmlDom();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});