// main.js

require.config({

	baseUrl: "js/",
	paths: {
		//------------------------公共------------------------------
		//Cesium
		"Cesium": "Build/Cesium/Cesium",
		//
		"Zlib": "Build/Cesium/Workers/zlib.min",
		//jquery　
		"jquery": "jquery.min.3.2.1",
		//bootstrap
		"bootstrap": "bootstrap-3.3.7/js/bootstrap.min",

		//pagination分页
		"pagination": "pagination/jquery.pagination",

		//select控件
		"bootstrap-select": "bootstrap-select/bootstrap-select.min",

		//switch控件
		"bootstrapSwitch": "bootstrap-switch/bootstrapSwitch",

		//时间选择控件
		"datetimepicker": "my97datepicker/WdatePicker",

		//导航栏
		//		"navigator": "AdminLTE-2.3.8/js/app.min",

		//视频
		"videojs": "video-js-5.19.2/video",

		//统计图表
		"echarts": "echart/echarts.min",
		//echart主题
		"echarts-dark": "echart/dark",

		//热力图
		"heatmap": "heatmap/heatmap",
		//------------------------自定义----------------------------
		//common
		"common": "utils/common",
		"config": "utils/config",
		//------------------------功能模块--------------------------

		//三维模型
		"model": "widget/model/model",
		//影像数据
		"imagery": "widget/imagery/imagery",
		//路面数据
		"road": "widget/road/road",
		//单体化
		// "testMonomer": "widget/testMonomer/testMonomer",
		// "monomer": "widget/monomer/monomer",
		//测量工具
		"measure": "widget/measure/measure",
		//标注聚合
		"clustering": "widget/clustering/clustering",
		//多屏浏览
		"comparison": "widget/comparison/comparison",
		//飞行浏览
		"fly": "widget/fly/fly",
		//压平
		"flat": "widget/flat/flat",
		//标绘
		"plotting": "widget/plotting/plotting",
		//水面特效
		"water": "widget/water/water",
		//日照分析
		"sunAnalysis": "widget/sunAnalysis/sunAnalysis",
		//方量分析
		"volumeAnalysis": "widget/volumeAnalysis/volumeAnalysis",
		//可视域分析
		"viewAnalysis": "widget/viewAnalysis/viewAnalysis",


		//门磁
		"menci": "widget/menci/menci",
		//门禁
		"doorContact": "widget/doorContact/doorContact",
		//车辆轨迹
		"carTrace": "widget/carTrace/carTrace",
		//井盖
		"cover": "widget/cover/cover",
		//无线烟感
		"smokeDetector": "widget/smokeDetector/smokeDetector",
		//一键搜
		"yijiansou": "widget/yijiansou/yijiansou",
		//环境监测
		"huanjing": "widget/huanjing/huanjing",
		//车小丫
		"chexiaoya": "widget/chexiaoya/chexiaoya",
		//执法仪
		"zhifayi": "widget/zhifayi/zhifayi",
		//人脸识别
		"faceRecognition": "widget/faceRecognition/faceRecognition",
		//消防栓
		"fireHydrant": "widget/fireHydrant/fireHydrant",

		//统计图表
		"chart": "widget/chart/chart",
		//热力图
		"heat": "widget/heat/heat",

		//研判报告
		"judgementReport": "widget/judgementReport/judgementReport",

		//动态轨迹
		"dynamicTrajectory": "widget/dynamicTrajectory/dynamicTrajectory",
		//设备报警
		"deviceAlert": "widget/deviceAlert/deviceAlert",

		//燃气监测
		"gasMonitor": "widget/gasMonitor/gasMonitor"

	},
	shim: {
		//		'datetimepicker': {
		//			deps: ['jquery', 'bootstrap']	
		//		},
		//      'moment': {
		//          deps: ['jquery']
		//      },
		//      'moment-zh-CN': {
		//      	deps: ['jquery']
		//      }

	},
	waitSeconds: 60


});

require(["jquery", "Cesium", "Zlib", "bootstrap", "config", "common"], function($, mCesium, mZlib, mBootstrap, config,common) {

	var viewer = null;
	var scene = null;
	var widget = null;
	var imageryLayers = null;

	init();
	loadMapData();
	bindEvent();

	/**
	 * 初始化
	 */
	function init() {

		//初始化三维球体
		viewer = new Cesium.Viewer('cesiumContainer', {
			infoBox: false,
			//地理编码搜索栏
			geocoder: true
		});
		scene = viewer.scene;
		widget = viewer.cesiumWidget;
		imageryLayers = viewer.imageryLayers;

		//初始化谷歌地图
		viewer.imageryLayers.removeAll();
		var google = new Cesium.UrlTemplateImageryProvider({
			url: 'http://mt0.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}',
			tilingScheme: new Cesium.WebMercatorTilingScheme(),
			maximumLevel: 20
		});
		viewer.imageryLayers.addImageryProvider(google, 0);
		try {
			var promise = scene.open('http://localhost:8091/iserver/services/3D-nanshanlidu_new/rest/realspace');
			Cesium.when(promise, function(layer) {
					// var style3D = new Cesium.Style3D();
					// layer.style3D = style3D;
					// style3D.bottomAltitude = 2000;				
				},
				function(e) {
					if (widget._showRenderLoopErrors) {
						var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？';
						widget.showErrorPanel(title, undefined, e);
					}
				});
		} catch (e) {
			if (widget._showRenderLoopErrors) {
				var title = '渲染时发生错误，已停止渲染。';
				widget.showErrorPanel(title, undefined, e);
			}
		}

		//调整球体尺寸
		setGlobalSize();
		$(window).resize(function() {
			setGlobalSize();
		});

		window.viewer = viewer;

		$("#loadingbar").hide();
	}

	/**
	 * 加载地图数据
	 */
	function loadMapData() {
		
		//**************************************J加载3D-FaBuHuanCun的部分区域
		//不通过supermap的形式加载边界(为了不显示logo)
		// loadKmlData('./data/kml/area1.kml', false);
		// loadKmlData('./data/kml/area2.kml', false);
		// loadKmlData('./data/kml/area3.kml', false);
		// loadKmlData('./data/kml/area4.kml', false);
		// //滨江怡畅园小区边界
		// loadKmlData('./data/kml/滨江怡畅园.kml', true, function(entity) {
		// 	viewer.flyTo(entity, {
		// 		'duration': 5
		// 	});
		// });

		//加载天地图中文注记服务
		loadChineseMarkingData();

		//加载三维模型
		// load3DModelData(function() {
		// 	//加载单体化模型
		// 	requestMonomerData();
		// });
	}

	/**
	 * 绑定事件
	 */
	function bindEvent() {
		//点击单体化
		viewer.pickEvent.addEventListener(function(feature) {
			var table = document.getElementById("tab");
			var mInfo = feature.CNAME + feature.BUILDING + "栋" + feature.UNIT + "单元" + feature.FLOOR + "楼" + "0" + feature.NO +
				"号";
			var mData = {
				communityId: 373,
				doorNo: mInfo
			};
			console.log("绑定"+mData);
			$.ajax({
				url: "http://10.10.8.60:8088/DataCenterServer/House/getInfoByDoorNo",
				type: "GET",
				async: true,
				data: mData,
				success: function(data) {
					console.log("8.60的服务:" + data);
					var result = $.parseJSON(data);
					console.log("result:" + result);

					$("#bubble").show();
					for (var i = table.rows.length - 1; i > -1; i--) {
						table.deleteRow(i);
					}
					var proData = null;
					if (result.data === null) {
						proData = {
							"地址": "空",
							"户主": "空",
							"性别": "空",
							"手机": "空",
							"身份证": "空"
						};
					} else {
						proData = {
							"地址": result.data.connectionAddress,
							"户主": result.data.owner,
							"性别": result.data.ownerSex,
							"手机": result.data.ownerPhone,
							"身份证": result.data.ownerIdcard
						};
					}

					for (var cell in proData) {
						var newRow = table.insertRow();
						var cell1 = newRow.insertCell();
						var cell2 = newRow.insertCell();
						cell1.width = "60px";
						cell2.width = "200px";
						cell1.innerHTML = cell;
						cell2.innerHTML = proData[cell];
					}

				}
			});

		});

		//悬浮, 停靠按钮
		$("#bubblePosition").click(function() {

			if ($("#bubblePosition").hasClass("fui-export")) {
				//停靠-->悬浮
				viewer.customInfobox = undefined;
				$("#bubble").removeClass("bubble").addClass("float");
				$("#bubblePosition").removeClass("fui-export").addClass("fui-bubble");
				$("#bubblePosition")[0].title = "悬浮";
				$("#bubble").css({
					'left': '82%',
					'bottom': '45%'
				});
				$("#tableContainer").css({
					'height': '150px'
				});

			} else if ($("#bubblePosition").hasClass("fui-bubble")) {
				//悬浮-->停靠
				$("#bubble").removeClass("float").addClass("bubble");
				$("#bubblePosition").removeClass("fui-bubble").addClass("fui-export");
				$("#bubblePosition")[0].title = "停靠";
				$("#tableContainer").css({
					'height': '150px'
				});
				viewer.customInfobox = infoboxContainer;

			}

		});

		$("#close").click(function() {
			$("#bubble").hide();
		});
	}

	/**
	 * 加载卫星影像
	 */
	function loadImageryData(url) {
		var imageProvider = new Cesium.SuperMapImageryProvider({
			url: url
		});
		var imageLayer = imageryLayers.addImageryProvider(imageProvider);
		imageLayer.transperantBackColorTolerance = 0.05;
		viewer.flyTo(imageLayer);
	}

	/**
	 * 加载道路标注数据
	 */
	function loadRoadMarkingData(url) {
		var vectorProvider = new Cesium.SuperMapImageryProvider({
			url: url
		});
		imageryLayers.addImageryProvider(vectorProvider);
	}

	/**
	 * 加载天地图中文注记服务
	 */
	function loadChineseMarkingData() {
		var labelImagery = new Cesium.TiandituImageryProvider({
			//天地图全球中文注记服务（经纬度投影）
			mapStyle: Cesium.TiandituMapsStyle.CIA_C,
			token: "f9a02b2ed2e6fa0dfa365d649d6002ae"
			//			token: "4a00a1dc5387b8ed8adba3374bd87e5e"
		});
		imageryLayers.addImageryProvider(labelImagery, 1);
	}

	/**
	 * 加载三维模型数据
	 */
	function load3DModelData(callback) {

		console.log("测试：加载三维模型数据")
		var data = {};
		data = JSON.stringify(data);

		$.ajax({
			type: "post",
			url: ipPort + "u/map/select",
			async: true,
			xhrFields: {
				withCredentials: true
			},
			contentType: "application/json",
			data: data,
			dataType: "json",
			success: function(mResult) {
				console.log("三维服务", mResult);

				if (mResult.msg == "登录过期!") {
					window.location = "login.html";
					return;
				}
				var data = mResult.data;
				for (var i in data) {
					//					console.log(data);
					//加载请求的模型数据
					scene.addS3MTilesLayerByScp(data[i].mapdata_url, {
						name: data[i].mapdata_name
					});

				}
				callback();
			},
			error: function(error) {
				alert("请求出错");
			}
		});
	}

	/**
	 * 请求单体化服务
	 */
	function requestMonomerData() {

		scene.screenSpaceCameraController.enableIndoorColliDetection = true;
		var infoboxContainer = document.getElementById("bubble");
		viewer.customInfobox = infoboxContainer;

		//ajax请求, 获取服务地址(for循环, 加载)

		//单体化模型
		// var mapUrl = "http://localhost:8091/iserver/services/3D-shpall-HYzt/rest/realspace/datas/shpall@HYzt/config";//半透明
		// var mapUrl = "http://localhost:8091/iserver/services/3D-shpall-HYzt2/rest/realspace/datas/shpall@HYzt/config" //透明
		// var mapUrl = "http://10.10.2.151:8091/iserver/services/3D-test-monomer-new/rest/realspace/datas/shpall@HYzt/config"; //透明
		// var mapUrl = "http://10.10.2.151:8091/iserver/services/3D-test-monomer-new2/rest/realspace/datas/shpall@HYzt/config"; //半透明

		//单体化数据(属性)
		// var dataUrl = "http://localhost:8091/iserver/services/data-shpall-HYzt/rest/data";//半透明
		// var dataUrl = "http://localhost:8091/iserver/services/data-shpall-HYzt2/rest/data"; //透明
		// var dataUrl = "http://10.10.2.151:8091/iserver/services/data-test-monomer-new/rest/data"; //透明
		// var dataUrl = "http://localhost:8091/iserver/services/data-test-monomer-new2/rest/data"; //半透明

		// loadMonomerData(mapUrl, dataUrl);
	}

	/**
	 * 加载单体化数据
	 * @param {Object} mapUrl 模型地址
	 * @param {Object} dataUrl 服务地址
	 */
	function loadMonomerData(mapUrl, dataUrl) {
		try {

			//添加S3M图层服务
			var monomerPromise = scene.addS3MTilesLayerByScp(mapUrl, {
				name: 'test-monomer',
				// name:'shpall-HYzt',
			});

			Cesium.when(monomerPromise, function(layer) {
				//设置相机视角
								// viewer.flyTo(layer);

				layer.cullEnabled = false;
				layer.style3D._fillForeColor.alpha = 1.0; //初始值为0, 此处为了可见, 改为1
				layer.selectionFiltrateByTransparency = 0; // 不过滤透明度为0的物体，当前图层就不会被过滤
				layer.selectColorType = 1.0;
				layer.selectedColor = Cesium.Color.RED;
				layer.selectedColor.alpha = 0.2;

				//设置属性查询参数
				layer.setQueryParameter({
					url: dataUrl,
					dataSourceName: 'HYzt',
					dataSetName: 'shpall',
					keyWord: 'SmID'
				});

			}, function(e) {

				if (widget._showRenderLoopErrors) {
					var title = '渲染时发生错误，已停止渲染。';
					widget.showErrorPanel(title, undefined, e);
				}

			});

		} catch (e) {

			if (widget._showRenderLoopErrors) {
				var title = '渲染时发生错误，已停止渲染。';
				widget.showErrorPanel(title, undefined, e);
			}

		}
	}

	/**
	 * 加载区域边界服务
	 */
	function loadBoundaryData() {

		ajaxRequest({}, ipPort, "u/map/select", function(result) {
			console.log("区域边界", result);
			if (result.code == 200) {
				var data = result.data;
				if (data == null) {
					return;
				}
				for (var i in data) {
					console.log(data[i].mapdata_url);
					if (data[i].mapdata_url.indexOf("3D-FaBuHuanCun") != -1) {
						continue;
					}
					var imageProvider = new Cesium.SuperMapImageryProvider({
						url: data[i].mapdata_url
					});
					imageryLayers.addImageryProvider(imageProvider);
				}
			}
		});

	}

	/**
	 * 调整三维球体的尺寸
	 */
	function setGlobalSize() {

		// 获取屏幕的宽高
		var mWidth = document.documentElement.clientWidth || document.body.clientWidth;
		var mHeight = document.documentElement.clientHeight || document.body.clientHeight;

		// 根据屏幕宽高设置三维球
		document.getElementById("cesiumContainer").style.width = (mWidth - 0) + 'px';
		document.getElementById("cesiumContainer").style.height = (mHeight - 50) + 'px';
	}

	/**
	 * 加载kml数据(一般用于加载边界数据)
	 * @param {Object} url kml数据url地址
	 * @param {Object} flag 是否填充面
	 */
// 	function loadKmlData(url, flag, callback) {
// 		var kmlOptions = {
// 			camera: viewer.scene.camera,
// 			canvas: viewer.scene.canvas,
// 			clampToGround: true
// 		};
// 		var geocachePromise = Cesium.KmlDataSource.load(url, kmlOptions);
// 
// 		var mArea = viewer.dataSources.add(geocachePromise, kmlOptions);
// 		var entities = undefined;
// 		mArea.then(function(dataSource) {
// 			entities = dataSource.entities.values;
// 			for (var i = 0; i < entities.length; i++) {
// 				var entity = entities[i];
// 				//去掉地形遮挡　
// 				entity.polygon.disableDepthTestDistance = Number.POSITIVE_INFINITY;
// 				entity.polygon.material = Cesium.Color.fromRandom({
// 					alpha: 0.2
// 				});
// 				entity.polygon.fill = flag;
// 			}
// 			//回调
// 			callback(entities);
// 		});
// 	}

});
