/**
 * 动态轨迹
 */
define(["jquery"], function($) {

	var EARTH_RADIUS = 6378137.0; //单位M
	var PI = Math.PI;

	var url = './js/widget/dynamicTrajectory/AirPlane.s3m';
	var layer = null;
	
	var index = 1;

	var objects = null;
	
	var removeEntityArray = null;

	var points = {
		"BJ": [
			"北京",
			116.5871,
			40.078537
		],
		"SH": [
			"上海",
			121.799805,
			31.151825
		],
		"WH": [
			"武汉",
			114.209625,
			30.776598
		],
		"SZ": [
			"深圳",
			113.81084,
			22.639444
		]
	}

	function loadWidget() {
		
		objects = new Array();
		removeEntityArray = new Array();

		viewer.scene.globe.depthTestAgainstTerrain = false;

		layer = new Cesium.DynamicLayer3D(viewer.scene.context, url);
		viewer.scene.primitives.add(layer);

		Cesium.loadJson('./js/widget/dynamicTrajectory/data.json').then(function(jsonData) {

			var airportData = [];
			//jsonData长度
			for(var i = 0; i < jsonData.length; i++) {
				if(jsonData[i][0] == "BJ") {
					airportData.push(jsonData[i]);
				}
			}

			if(airportData.length <= 0) {
				return;
			}

			//创建起始点
			createPoint(airportData);

			//创建航线
			createLine(airportData);

		}).otherwise(function(error) {});
	}

	//创建点坐标
	function createPoint(arr) {

		//起点都相同, 创建一个即可
		var beginName = arr[0][0];
		var beginId = points[beginName][0];
		viewer.entities.add({
			id: beginId,
			position: Cesium.Cartesian3.fromDegrees(points[beginName][1], points[beginName][2]),
			point: {
				pixelSize: 10,
				color: new Cesium.Color(0, 1, 1)
			},
			label: {
				text: points[beginName][0]
			}
		});
		removeEntityArray.push(beginId);

		//目的地创建
		for(var i = 0; i < arr.length; i++) {
			var endName = arr[i][1];
			var endId = points[endName][0];
			viewer.entities.add({
				id: endId,
				position: Cesium.Cartesian3.fromDegrees(points[endName][1], points[endName][2]),
				point: {
					pixelSize: 10,
					color: new Cesium.Color(0, 1, 1)
				},
				label: {
					text: points[endName][0]
				}
			});
			removeEntityArray.push(endId);
		}
		
	}

	//创建线坐标
	function createLine(arr) {

		for(var i = 0; i < arr.length; i++) {
			var beginName = arr[i][0];
			var endName = arr[i][1];

			//获取起点机场和终点机场之间大圆的距离
			var dis = getGreatCircleDistance(points[beginName][2], points[beginName][1], points[endName][2], points[endName][1]);

			//生成贝塞尔曲线点数组
			var pntArray = addBezier(points[beginName], points[endName], dis / 7, 10);

			//笛卡尔坐标转地理坐标, 放入空间数组
			dynamiclayer(pntArray);

			//添加线
			//1:经度, 2:纬度
			var pointBegin = [points[beginName][1], points[beginName][2]];
			var pointEnd = [points[endName][1], points[endName][2]];
			var entity = new Cesium.Entity();
			entity.begin = pointBegin;
			entity.end = pointEnd;
			entity.bezier = new Cesium.ConstantProperty(true);
			entity.bezier = true;
//			var lineId = points[beginName][0]+"-"+points[endName][0];
			var lineId = "line"+i;
			entity.polyline = {
				id: lineId,
				positions: pntArray,
//				width: 2.0,
				width: 5.0,
				//material: new Cesium.Color(0.2, 0.9, 0.8, 0.8)
				material: new Cesium.PolylineTrailMaterialProperty({
					// 尾迹线材质
					color: Cesium.Color.fromCssColorString("rgba(118, 233, 241, 1.0)"),
//					trailLength: 0.2,
					trailLength: 1.0,
					period: 5.0
				})
			};
			viewer.entities.add(entity);
			removeEntityArray.push(lineId);
		}

	}

	//计算大圆距离
	function getGreatCircleDistance(lat1, lng1, lat2, lng2) {
		var radLat1 = getRad(lat1);
		var radLat2 = getRad(lat2);

		var a = radLat1 - radLat2;
		var b = getRad(lng1) - getRad(lng2);

		var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
		s = s * EARTH_RADIUS;
		s = Math.round(s * 10000) / 10000.0;
		return s;
	}

	function getRad(d) {
		return d * PI / 180.0;
	}

	//添加贝塞尔曲线
	function addBezier(pointA, pointB, height, num) {
		var earth = Cesium.Ellipsoid.WGS84;
		var startPoint = earth.cartographicToCartesian(Cesium.Cartographic.fromDegrees(parseFloat(pointA[1]), parseFloat(pointA[2]), 0.0));
		var endPoint = earth.cartographicToCartesian(Cesium.Cartographic.fromDegrees(parseFloat(pointB[1]), parseFloat(pointB[2]), 0.0));
		// determine the midpoint (point will be inside the earth)
		var addCartesian = startPoint.clone();
		Cesium.Cartesian3.add(startPoint, endPoint, addCartesian);
		var midpointCartesian = addCartesian.clone();
		Cesium.Cartesian3.divideByScalar(addCartesian, 2, midpointCartesian);
		// move the midpoint to the surface of the earth
		earth.scaleToGeodeticSurface(midpointCartesian);
		// add some altitude if you want (1000 km in this case)
		var midpointCartographic = earth.cartesianToCartographic(midpointCartesian);
		midpointCartographic.height = height;
		midpointCartesian = earth.cartographicToCartesian(midpointCartographic);
		var spline = new Cesium.CatmullRomSpline({
			times: [0.0, 0.5, 1.0],
			points: [
				startPoint,
				midpointCartesian,
				endPoint
			],
		});
		var polylinePoints = [];
		for(var ii = 0; ii < num; ++ii) {
			polylinePoints.push(spline.evaluate(ii / num));
		}
		return polylinePoints;
	}

	var earth = Cesium.Ellipsoid.WGS84;
	//笛卡尔坐标转地理坐标, 放入空间数组
	function dynamiclayer(data) {
		var p = data[0];
		var point = earth.cartesianToCartographic(p);
		var state = new Cesium.DynamicObjectState({
			longitude: Cesium.Math.toDegrees(point.longitude),
			latitude: Cesium.Math.toDegrees(point.latitude),
			altitude: point.height,
			scale: new Cesium.Cartesian3(1000, 1000, 1000)
		});

		objects.push(state);
	}

	function removeWidget() {
		for(var i = 0; i < removeEntityArray.length; i++){
			var id = removeEntityArray[i];
			viewer.entities.removeById(id);
		}
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
});