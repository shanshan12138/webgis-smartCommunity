/*量测工具*/
define(["common"], function() {
	var clampMode = 0;
	var scene = viewer.scene;
	var widget = viewer.cesiumWidget;
	var handlerDis, handlerArea, handlerHeight;
	var isCoordinate = false;
	var tempDataSource;
	var handler;

	/**
	 * 加载模块
	 */
	function loadWidget(content) {
		loadHtmlDom("widget_measure", content);
		init();
		bindEvent();

	}

	/**
	 * 初始化
	 */
	function init() {
		
		//初始化测量距离
		handlerDis = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.Distance, 0);
		//注册测距功能事件  measureEvt量测事件，监听当前事件以获取测量结果
		handlerDis.measureEvt.addEventListener(function(result) {
			var dis = Number(result.distance);
			var distance = dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm';
			// disLabel 当量测模式为Distance,利用此标签实体对象disLabel来显示空间距离量算结果。
			handlerDis.disLabel.text = '距离:' + distance;

		});
		// activeEvt激活事件，监听当前事件以获取处理器的状态。
		handlerDis.activeEvt.addEventListener(function(isActive) {
			if(isActive == true) {
				viewer.enableCursorStyle = false;
				viewer._element.style.cursor = '';
				$('body').removeClass('measureCur').addClass('measureCur');
			} else {
				viewer.enableCursorStyle = true;
				$('body').removeClass('measureCur');
			}
		});

		//初始化测量面积
		handlerArea = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.Area, 0);
		handlerArea.measureEvt.addEventListener(function(result) {
			var mj = Number(result.area);
			var area = mj > 1000000 ? (mj / 1000000).toFixed(2) + 'km²' : mj.toFixed(2) + '㎡'
			handlerArea.areaLabel.text = '面积:' + area;
		});
		handlerArea.activeEvt.addEventListener(function(isActive) {
			if(isActive == true) {
				viewer.enableCursorStyle = false;
				viewer._element.style.cursor = '';
				$('body').removeClass('measureCur').addClass('measureCur');
			} else {
				viewer.enableCursorStyle = true;
				$('body').removeClass('measureCur');
			}
		});

		//初始化测量高度 dataSources获取或设置将要被可视化的数据源DataSource实例集合。
		var promise = viewer.dataSources.add(new Cesium.GeoJsonDataSource("measure_tempDataSource"));

		promise.then(function(dataSource) {
			tempDataSource = dataSource;
		}).otherwise(function(error) {

		});

		handlerHeight = new Cesium.MeasureHandler(viewer, Cesium.MeasureMode.DVH);
		handlerHeight.measureEvt.addEventListener(function(result) {
			var distance = result.distance > 1000 ? (result.distance / 1000).toFixed(2) + 'km' : result.distance + 'm';
			var vHeight = result.verticalHeight > 1000 ? (result.verticalHeight / 1000).toFixed(2) + 'km' : result.verticalHeight + 'm';
			var hDistance = result.horizontalDistance > 1000 ? (result.horizontalDistance / 1000).toFixed(2) + 'km' : result.horizontalDistance + 'm';
			handlerHeight.disLabel.text = '空间距离:' + distance;
			handlerHeight.vLabel.text = '垂直高度:' + vHeight;
			handlerHeight.hLabel.text = '水平距离:' + hDistance;
		});
		handlerHeight.activeEvt.addEventListener(function(isActive) {
			if(isActive == true) {
				viewer.enableCursorStyle = false;
				viewer._element.style.cursor = '';
				$('body').removeClass('measureCur').addClass('measureCur');
			} else {
				viewer.enableCursorStyle = true;
				$('body').removeClass('measureCur');
			}
		});

	}

	/**
	 * 绑定事件
	 */
	function bindEvent() {
		//距离
		$('#distance').click(function() {
			deactiveAll();
			handlerDis && handlerDis.activate();
		});

		//面积
		$('#area').click(function() {
			deactiveAll();
			handlerArea && handlerArea.activate();
		});
		
		//高度
		$('#height').click(function() {
			deactiveAll();
			handlerHeight && handlerHeight.activate();
		});
		
		//坐标测量
		$('#coordinate').click(function() {
			isCoordinate = true;
			//鼠标左键按下事件(获取鼠标的位置)
			handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			handler.setInputAction(function(movement) {
				clickPosition = movement.position;
			}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
			//鼠标左键松开事件
			handler.setInputAction(function(movement) {
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
				}
			}, Cesium.ScreenSpaceEventType.LEFT_UP);
		});
		
		//清除
		$('#clear').click(function() {
			clearAll();
		});
		
		//关闭窗体
		$('#measureClose').click(function(){
			clearAll();
			$('#container-measure').hide();
		});
	}

	function clearAll() {
		handlerDis && handlerDis.clear();
		handlerArea && handlerArea.clear();
		handlerHeight && handlerHeight.clear();
		isCoordinate = false;
		tempDataSource.entities.removeAll();
	}
   // deactive关闭量测处理器。
	function deactiveAll() {
		handlerDis && handlerDis.deactivate();
		handlerArea && handlerArea.deactivate();
		handlerHeight && handlerHeight.deactivate();
		isCoordinate = false;
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
				outlineColor: Cesium.Color.BLUE,
				outlineWidth: 2,
//				disableDepthTestDistance: 1000000000,
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
//				disableDepthTestDistance: 1000000000
			}
		};
		tempDataSource.entities.add(oLabelEntity);

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