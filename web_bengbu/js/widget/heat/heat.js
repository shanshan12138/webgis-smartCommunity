/**
 * 热力图
 */
define(["jquery", "common", "heatmap"], function($, common, h337) {

	var projectionImage;

	function loadWidget(content) {

		getHeatmap();

	}

	/**
	 * 获取heatmap
	 */
	function getHeatmap() {

		$("#heatmap").append('<div class="heatmap-canvas" width="50%" height="25%"></div>');

		var heatmapInstance = h337.create({
			container: document.querySelector('#heatmap'),
		});

		var points = new Array();
		var len = 300;
		var width = 282;
		var height = 873;
		var max = 0;
		while(len--) {
			var val = Math.floor(Math.random() * 100);
			max = Math.max(max, val);

			var point = {
				"x": Math.floor(Math.random() * width),
				"y": Math.floor(Math.random() * height),
				"value": val
			}
			points.push(point);
		};

		var data = {
			"max": max,
			"data": points
		};
		heatmapInstance.setData(data);

		heatmapRender();

	}

	function heatmapRender() {

		var scene = viewer.scene;

		if(!scene.pickPositionSupported) {
			alert('不支持深度纹理,热力图功能无法使用！');
		}
		$("#projectionImage").show();
		scene.viewFlag = true;
		//var pointHandler = new Cesium.PointHandler(viewer);
		//创建投放对象
		//		var projectionImage = new Cesium.ProjectionImage(scene);
		projectionImage = new Cesium.ProjectionImage(scene);
		var widget = viewer.cesiumWidget;
		try {

			scene.camera.setView({
				//图层加载完成,设置相机位置
				destination: Cesium.Cartesian3.fromDegrees(116.44829499568006, 39.9038584836946, 200.729171148720404),
				orientation: {
					heading: 5.462824916628415,
					pitch: -1.5695598976662626,
					roll: 6.2831853071570976
				}
			});

			//图像投放的长度和宽度
			projectionImage.horizontalFov = 90;
			projectionImage.verticalFov = 60;
			if(scene.viewFlag) {
				//设置视口位置
				projectionImage.viewPosition = [116.44851837931506, 39.90370978216693, 288.1624044906759];
				//将热力图canvas转换为image
				var mycanvas = document.getElementsByClassName("heatmap-canvas");
				var imgData = mycanvas[1].toDataURL("image/png");
				projectionImage.setImage({
					url: imgData
				});
				projectionImage.build();
				scene.viewFlag = false;
			}
			//设置投放线不可见
			projectionImage.hintLineVisible = false;
			//通过该点设置视频投放对象的距离及方向
			projectionImage.setDistDirByPoint([116.44851010288106, 39.9041325613246, 14.916258936093001]);
			projectionImage.distance = 300;

		} catch(e) {
			if(widget._showRenderLoopErrors) {
				var title = '渲染时发生错误，已停止渲染。';
				widget.showErrorPanel(title, undefined, e);
			}
		}
	}

	function removeWidget() {
		$("#heatmap").empty();
		$("#projectionImage").hide();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}

});