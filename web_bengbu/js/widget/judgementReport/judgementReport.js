/**
 * 研判报告
 */
define(["jquery", "common"], function($, common) {

	function loadWidget(content) {
		//加载html
		loadHtmlDom("widget_judgementReport", content);
		//拖动窗体
		moveFormByHeader("judgementReportHeader");
		//初始查询
		//由于合肥丁香服务器挂了, 现在为了演示录屏, 只能用本地pdf代替
//		$("#pdfContent").prop("src", "http://10.10.2.151:8090/base64test/Report?date=");
		$("#pdfContent").prop("src", "data/研判报告.pdf");
		//绑定事件
		bindEvent();
	}

	/**
	 * 绑定事件
	 */
	function bindEvent() {
		//点击查询
		$("#query").on("click", function() {
			$("#pdfContent").prop("src", "");
			setTimeout(function() {
				var url = "http://10.10.8.60:8090/base64test/Report?date=" + $("#date").val();
				$("#pdfContent").prop("src", url);
			}, 500);
		})
		//关闭按钮
		$("#judgementReportClose").on("click", function() {
			$("#container-judgementReport").hide();
		});
	}

	function removeWidget() {
		$("#widget_judgementReport").remove();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	}
})