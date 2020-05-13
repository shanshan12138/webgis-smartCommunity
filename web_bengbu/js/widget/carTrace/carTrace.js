/**
 * 车辆轨迹
 */
define(["jquery", "bootstrap", "bootstrapSwitch", "common", "pagination", "config", "echarts", "echarts-dark"],
	function($, bootstrap, bootstrapSwitch, mCommon, pagination, config, echarts, dark) {

		var handler = null;
		//车辆设备id数组
		var carDeviceArray = null;

		function loadWidget(content) {
			loadHtmlDom("widget_carTrace", content);
			requestCarDeviceData();
			loadScreenHandler();

			carDeviceArray = new Array();
			// 查看车辆轨迹的小弹窗
			moveFormByHeader("carTraceHeader");
			// 查看大图的小弹窗
			moveFormByHeader("photoHeader");
			// 查看违章记录的小弹窗
			moveFormByHeader("breakRulesHeader");
			bindEvent();
		}

		/**
		 * 绑定事件
		 */
		function bindEvent() {
			//关闭窗体
			$("#carTraceClose").on("click", function() {
				$("#container-carTrace").hide();
			});

			//选项卡
			$("#carTraceTab li").on("click", function() {
				//清空元素
				$("#carTraceTBody").empty();
				$("#keyCarTraceTBody").empty();

				var name = $(this).attr("name");
				var id = $("#deviceId").text().trim();

				if (name == "allCar") {
					//所有车辆
					requestCarDataById(id);
				} else if (name == "keyCar") {
					//重点车辆
					requestKeyCarTrace(id);
				} else if (name == "personalCar") {
					//个人车辆历史记录
					requestPersonalCarTrace("");
				} else if (name == "calenderlCar") {
					requestCalenderlCar();
				}
			});

			//个人违章记录关闭
			$("#breakRecordReturn").on("click", function() {
				$("#breakRecord").hide();
			});

			//个人违章记录关闭
			$("#breakRulesClose").on("click", function() {
				$("#breakRecord").hide();
			});

			$("#search").on("click", function() {
				var value = $("#keyword").val().trim();
				if (value == "") {
					return;
				}
				requestPersonalCarTrace(value);
			});

		}

		/**
		 *解绑事件
		 * off() 方法通常用于移除通过 on() 方法添加的事件处理程序
		 */
		function unBindEvent() {
			$("#carTraceClose").off("click");
			$("#carTraceTab li").off("click");
			$("#personalCar tbody td a").off("click");
			$("#divCenter>div>img").off("click");
			$("#breakRecordReturn").off("click");
		}

		/**
		 * 获取车辆监控设备
		 */
		function requestCarDeviceData() {
			var mData = {
				//			important: ""
			}
			mData = JSON.stringify(mData);
			$.ajax({
				type: "post",
				url: ipPort + "dcs/37fa5fc487b746c6aec6438faf8ed21f/select",
				async: true,
				dataType: "json",
				contentType: "application/json",
				data: mData,
				xhrFields: {
					withCredentials: true
				},
				success: function(result) {
					console.log("车辆设备", result);
					if (result.code == 200) {
						var data = result.data;
						if (data == null) {
							return;
						}
						//删除地图上已经存在的图标
						for (var i in carDeviceArray) {
							viewer.entities.removeById(carDeviceArray[i]);
						}
						carDeviceArray.splice(0, carDeviceArray.length);
						//将车辆设备数据作为标注放到地图上
						for (var i in data) {
							if (data[i].longitude == "" || data[i].latitude == "") {
								continue;
							}
							carDeviceArray.push(data[i].device_code);
							var point = viewer.entities.add({
								//将车牌号作为id
								id: data[i].device_code,
								position: new Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude),
									0),
								label: {
									text: data[i].device_name,
									font: '15px sans-serif',
									style: Cesium.LabelStyle.FILL_AND_OUTLINE,
									fillColor: Cesium.Color.YELLOW,
									outlineColor: Cesium.Color.BLACK.withAlpha(1.0),
									outlineWidth: 3.0,
									pixelOffset: new Cesium.Cartesian2(0, -30), //偏移量
									scale: 1.0,
									translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
									disableDepthTestDistance: 1000000000,
									heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
								},
								billboard: { //图标
									image: "./img/carTrace/carDevice.png",
									width: 32,
									height: 32,
									scale: 1.0,
									translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.0),
									disableDepthTestDistance: 1000000000,
									heightReference: Cesium.HeightReference.CLAMP_TO_GROUND //依附地形
								}
							});
							//						viewer.zoomTo(point);
							//定位
							viewer.camera.flyTo({
								destination: Cesium.Cartesian3.fromDegrees(parseFloat(data[i].longitude), parseFloat(data[i].latitude),
									10000.0),
								duration: 2
							});
						}
					} else if (result.code == 0 && result.msg == "登录过期!") {
						window.location = "login.html";
					}
				},
				error: function(error) {
					alert("请求出错");
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
			}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

			//LEFT_UP
			handler.setInputAction(function(movement) {
				if ((clickPosition.x - movement.position.x > 3) || (clickPosition.x - movement.position.x < -3) ||
					(clickPosition.y - movement.position.y > 3) || (clickPosition.y - movement.position.y < -3)) {
					clickPosition = undefined;
					return;
				}

				//获取点击的车辆设备
				var pick = viewer.scene.pick(movement.position);

				//点击的不是标注
				if (!pick.collection) {
					return;
				}

				if (Cesium.defined(pick)) {
					/*点击标注*/
					if (pick.id) {
						console.log("车辆设备信息", pick.id);
						$("#deviceId").text(pick.id.id);
						//根据车辆设备id请求车辆数据
						requestCarDataById(pick.id.id);
						$("#container-carTrace").show();
						$('#carTraceTab a:first').tab('show');
					}
				}
			}, Cesium.ScreenSpaceEventType.LEFT_UP);
		}

		/**
		 * 根据设备id请求车辆数据
		 */
		function requestCarDataById(id) {
			var mData = {
				"deviceId": id
			}
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=1&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				if (result.code == 200) {
					//请求成功
					var data = result.data;
					//jqueryPagination分页插件
					$("#pagination").pagination(data.totalPageCount, {
						num_edge_entries: 1, //两侧显示的首尾分页的条目数
						num_display_entries: 4, //连续分页主体部分显示的分页条目数
						items_per_page: 1, //每页显示的条目数
						prev_text: "前一页",
						next_text: "下一页",
						callback: pageselectCallback
					});
					$("#allTotalCount").text(data.totalCount);
				}
			});
		}

		/**
		 * 查询
		 * @param {Object} page_index
		 * @param {Object} jq
		 */
		function pageselectCallback(page_index, jq) {
			var mData = {
				"important": "",
				"deviceId": $("#deviceId").text().trim()
			}
			//请求第几页
			var requestPageNum = page_index + 1;
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=" + requestPageNum + "&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				console.log("车辆数据", result);
				if (result.code == 200) {
					//请求成功
					var data = result.data;
					//拼接html
					var mContent = "";
					for (var i in data.list) {
						mContent = mContent + '<tr><td><p>' + data.list[i].license + '</p></td>' +
							'<td>' + formatDateTime(parseInt(data.list[i].collect_time)) + '</td>';
						if (data.list[i].car_direct == "1") {
							mContent = mContent + '<td>' + '入口' + '</td>';
						} else {
							mContent = mContent + '<td>' + '出口' + '</td>';
						}
						mContent = mContent + '<td>' + data.list[i].bayonet_id + '</td>' +
							'<td>' + '<a id="' + data.list[i].license + '" style="cursor:pointer;">查看记录</a>' + '</td>' +
							'<td>' + '<div name="' + data.list[i].license +
							'" class="switch switch-mini" data-on-label="重点" data-off-label="普通" data-on="danger" data-off="primary">'
						if (data.list[i].important == "1") {
							//重点
							mContent = mContent + '<input type="checkbox" checked="checked"/></div></td></tr>';
						} else {
							//普通
							mContent = mContent + '<input type="checkbox"/></div></td></tr>';
						}

					}

					$("#carTraceTBody").empty();
					$("#carTraceTBody").append(mContent);
					//switch button进行渲染
					$(".switch").bootstrapSwitch();
					//重点监控, 取消监控
					$('.switch').on('switch-change', function(e, data) {
						var value = data.value;
						var carNum = $(this).attr("name");
						var important = null;
						var mUrl = "dcs/87c1d0c7b1474da5828f5315edff8068/update";
						if (value) {
							//重点监控
							important = "1";
						} else {
							//取消监控
							important = "0";
						}
						var data = {
							"carNum": carNum,
							"important": important
						};
						ajaxRequest(data, ipPort, mUrl, function(result) {
							console.log(result);
							if (result.code == 0) {
								alert("修改失败");
							}
							$('#carTraceTab a:first').tab('show');
							requestCarDataById($("#deviceId").text().trim());
						})
					});

					//查看违章记录
					$("#carTraceTBody>tr>td>a").on("click", function() {
						var carNum = $(this).attr("id");
						$("#breakRecordNumber").text(carNum + ", 车辆违章信息");
						$("#breakRecord").show();
					});

					//表格行点击
					$("#cxyTable>tbody>tr").on("click", function() {
						//					$(this).parent().find("tr").css("background", "");
						//					$(this).parent().find("tr").css("color", "#000");
						//					$(this).css("background", "#555");
						//					$(this).css("color", "#fff");
						$(this).parent().find("tr").css("background", "");
						$(this).css("background", "rgba(34,34,34,0.5)");
					});
				}
			});
		}

		/**
		 * 请求重点车辆信息
		 */
		function requestKeyCarTrace(id) {
			var mData = {
				"important": "1",
				"deviceId": id
			}
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=1&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				console.log("重点车辆轨迹", result);
				if (result.code == 200) {
					var data = result.data;
					if (data == null) {
						return;
					}
					$("#pagination2").pagination(data.totalPageCount, {
						num_edge_entries: 1, //两侧显示的首尾分页的条目数
						num_display_entries: 4, //连续分页主体部分显示的分页条目数
						items_per_page: 1, //每页显示的条目数
						prev_text: "前一页",
						next_text: "下一页",
						callback: pageselectCallback2
					});
					$("#keyTotalCount").text(data.totalCount);
				}
			});
		}

		/**
		 * 重点车辆查询
		 * @param {Object} page_index
		 * @param {Object} jq
		 */
		function pageselectCallback2(page_index, jq) {
			var mData = {
				"important": "1",
				"deviceId": $("#deviceId").text()
			}
			var requestPageNum = page_index + 1;
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=" + requestPageNum + "&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				console.log("重点车辆轨迹", result);
				if (result.code == 200) {
					//请求成功
					var data = result.data;
					//拼接html
					var mContent = "";
					for (var i in data.list) {
						mContent = mContent + '<tr><td>' + data.list[i].license + '</td>' +
							'<td>' + formatDateTime(parseInt(data.list[i].collect_time)) + '</td>';
						if (data.list[i].car_direct == "1") {
							mContent = mContent + '<td>' + '入口' + '</td>';
						} else {
							mContent = mContent + '<td>' + '出口' + '</td>';
						}
						mContent = mContent + '<td>' + data.list[i].bayonet_id + '</td>' +
							'<td>' + '<a id="' + data.list[i].license + '">查看记录</a>' + '</td>' +
							'<td>' + '<div name="' + data.list[i].license +
							'" class="switch switch-mini" data-on-label="重点" data-off-label="普通" data-on="danger" data-off="primary">'
						if (data.list[i].important == "") {
							mContent = mContent + '<input type="checkbox" /></div></td></tr>';
						} else {
							mContent = mContent + '<input type="checkbox" checked="checked"/></div></td></tr>';
						}
					}
					$("#keyCarTraceTBody").empty();
					$("#keyCarTraceTBody").append(mContent);
					//switch button进行渲染
					$('.switch').bootstrapSwitch();
					//重点监控, 取消监控
					$('.switch').on('switch-change', function(e, data) {
						var value = data.value;
						var carNum = $(this).attr("name");
						var important = null;
						var mUrl = "dcs/87c1d0c7b1474da5828f5315edff8068/update";
						if (value) {
							//重点监控
							important = "1";
						} else {
							//取消监控
							important = "0";
						}
						var data = {
							"carNum": carNum,
							"important": important
						};
						ajaxRequest(data, ipPort, mUrl, function(result) {
							console.log(result);
							if (result.code == 0) {
								alert("修改失败");
							}
							$('#carTraceTab a:first').tab('show');
							requestCarDataById($("#deviceId").text().trim());
						})
					});

					//查看违章记录
					$("#keyCarTraceTBody>tr>td>a").on("click", function() {
						var carNum = $(this).attr("id");
						$("#breakRecordNumber").text(carNum + ", 车辆违章信息");
						$("#breakRecord").show();
					});

					//表格行点击
					$("#keyCarTraceTable>tbody>tr").on("click", function() {
						$(this).parent().find("tr").css("background", "");
						$(this).css("background", "rgba(34,34,34,0.5)");
					});

				}
			});
		}

		/**
		 * 个人车辆历史记录
		 */
		function requestPersonalCarTrace(value) {
			if (value == null || value.trim() == "") {
				return;
			}
			//获取总页数
			var mData = {
				"carNum": value,
				"deviceId": $("#deviceId").text()
			}
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=1&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				console.log("重点车辆轨迹", result);
				if (result.code == 200 && result.data != null) {
					//请求成功
					console.log("个人车辆历史记录", result);
					if (result.code == 200) {
						//获取总页数
						var data = result.data;
						$("#pagination3").pagination(data.totalPageCount, {
							num_edge_entries: 1, //两侧显示的首尾分页的条目数
							num_display_entries: 4, //连续分页主体部分显示的分页条目数
							items_per_page: 1, //每页显示的条目数
							prev_text: "前一页",
							next_text: "下一页",
							callback: pageselectCallback3
						});
					}
				}
			});
		}

		function pageselectCallback3(page_index, jq) {
			//请求第几页
			var requestPageNum = page_index + 1;
			//请求参数
			var mData = {
				"carNum": $("#keyword").val().trim(),
				"deviceId": $("#deviceId").text()
			}
			var mUrl = "dcs/1672ac21e7944b049d2a8969c50d8556/select?pageNum=" + requestPageNum + "&pageSize=25";
			ajaxRequest(mData, ipPort, mUrl, function(result) {
				//请求结果处理
				console.log("重点车辆轨迹", result);
				if (result.code == 200 && result.data != null) {
					//请求成功
					console.log("个人车辆历史记录", result);
					if (result.code == 200) {
						//请求成功
						var data = result.data;
						//拼接html
						var mContent = "";
						for (var i in data.list) {
							mContent = mContent + '<tr><td>' + data.list[i].license + '</td>' +
								'<td>' + formatDateTime(parseInt(data.list[i].collect_time)) + '</td>';
							if (data.list[i].car_direct == "1") {
								mContent = mContent + '<td>' + '入口' + '</td>';
							} else {
								mContent = mContent + '<td>' + '出口' + '</td>';
							}
							mContent = mContent + '<td>' + data.list[i].bayonet_id + '</td>' +
								'<td><img src="' + data.list[i].phone_address + '" alt="车牌抓拍.png" style="width:100px;"/></td>' +
								'<td>' +
								'	<a href="javascript:void(0)" id="' + data.list[i].phone_address + '&' + data.list[i].license +
								'">查看大图</a>' +
								'</td>' +
								'<td>' +
								'<a href="javascript:void(0)" id="' + data.list[i].license + '">查看记录</a>' +
								'</td>' +
								'</tr>'
						}
						$("#personalCarTraceTBody").empty();
						$("#personalCarTraceTBody").append(mContent);

						//查看大图和查看记录
						$("#personalCar tbody td a").on("click", function() {
							var name = $(this).text();
							var idStr = $(this).attr("id");
							if (name == "查看大图") {
								$("#divCenter>img").attr("src", idStr.split("&")[0]);
								//							var data = {"carNum": idStr.split("&")[1]}
								//							data = JSON.stringify(data);
								//							$.ajax({
								//								type: "post",
								//								url: ipPort + "dcs/72cfa401d536419280e7b9b2f98c7752/select",
								//								async: true,
								//								contentType: "application/json",
								//								data: data,
								//								dataType: "json",
								//								xhrFields: {
								//									withCredentials: true
								//								},
								//								success: function(result) {
								//									console.log("请求结果", result);
								//								},
								//								error: function(error) {
								//									alert("请求出错:" + error.responseText);
								//								}
								//							});

								//调整尺寸,位置
								$("#divCenter").css("top", "");
								$("#divCenter").css("height", "500px");
								$("#divCenter").css("width", "460px");
								$("#divCenter").css("bottom", "10px");
								$("#divCenter").css("left", "106px");
								//调整按钮
								$("#max").css("display", "block");
								$("#min").css("display", "none");
								//显示
								var v = document.getElementById('divCenter');
								v.style.display = "block";
							} else if (name == "查看记录") {
								var carNum = $(this).attr("id");
								$("#breakRecordNumber").text(carNum + ", 车辆违章信息");
								$("#breakRecord").show();
							}
						});

						//图片放大,还原,关闭
						$("#divCenter>div>img").on("click", function() {
							var id = $(this).attr("id");
							if (id == "max") {
								//放大图片
								//调整尺寸
								$("#divCenter").css("height", (screenHeight - 60) + "px");
								//$("#divCenter").css("width", $("#carDetailImg").width() + "px");
								$("#divCenter").css("width", "");
								$("#divCenter").css("top", "60px");
								//调整按钮
								$("#max").css("display", "none");
								$("#min").css("display", "block");
							} else if (id == "min") {
								//还原图片
								//调整按钮
								$("#max").css("display", "block");
								$("#min").css("display", "none");
								//调整尺寸,位置
								$("#divCenter").css("top", "");
								$("#divCenter").css("height", "500px");
								$("#divCenter").css("width", "460px");
								$("#divCenter").css("bottom", "10px");
								$("#divCenter").css("left", "106px");
							} else if (id == "close") {
								//关闭图片
								var v = document.getElementById('divCenter');
								v.style.display = "none";
							}
						});

						//关闭图片
						$("#photoClose").on("click", function() {
							var v = document.getElementById('divCenter');
							v.style.display = "none";
						});

						//表格行点击
						$("#personalTable>tbody>tr").on("click", function() {
							$(this).parent().find("tr").css("background", "");
							$(this).css("background", "rgba(34,34,34,0.5)");
						});
					}
				}
			});

		}

		function requestCalenderlCar() {
			var myChart = echarts.init(document.getElementById('calenderMain'));
			var hours = ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
				'7am', '8am', '9am', '10am', '11am',
				'12pm', '1pm', '2pm', '3pm', '4pm', '5pm',
				'6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
			];
			var days = ['Saturday', 'Friday', 'Thursday',
				'Wednesday', 'Tuesday', 'Monday', 'Sunday'
			];

			var data = [
				[0, 0, 15],
				[0, 1, 11],
				[0, 2, 0],
				[0, 3, 0],
				[0, 4, 0],
				[0, 5, 0],
				[0, 6, 0],
				[0, 7, 0],
				[0, 8, 0],
				[0, 9, 0],
				[0, 10, 0],
				[0, 11, 12],
				[0, 12, 24],
				[0, 13, 21],
				[0, 14, 11],
				[0, 15, 13],
				[0, 16, 14],
				[0, 17, 16],
				[0, 18, 14],
				[0, 19, 14],
				[0, 20, 13],
				[0, 21, 13],
				[0, 22, 12],
				[0, 23, 15],
				[1, 0, 7],
				[1, 1, 0],
				[1, 2, 0],
				[1, 3, 0],
				[1, 4, 0],
				[1, 5, 0],
				[1, 6, 0],
				[1, 7, 0],
				[1, 8, 0],
				[1, 9, 0],
				[1, 10, 15],
				[1, 11, 12],
				[1, 12, 22],
				[1, 13, 36],
				[1, 14, 19],
				[1, 15, 21],
				[1, 16, 16],
				[1, 17, 17],
				[1, 18, 18],
				[1, 19, 22],
				[1, 20, 15],
				[1, 21, 15],
				[1, 22, 17],
				[1, 23, 12],
				[2, 0, 11],
				[2, 1, 11],
				[2, 2, 2],
				[2, 3, 4],
				[2, 4, 6],
				[2, 5, 4],
				[2, 6, 0],
				[2, 7, 0],
				[2, 8, 0],
				[2, 9, 0],
				[2, 10, 13],
				[2, 11, 22],
				[2, 12, 21],
				[2, 13, 29],
				[2, 14, 18],
				[2, 15, 20],
				[2, 16, 16],
				[2, 17, 15],
				[2, 18, 15],
				[2, 19, 15],
				[2, 20, 17],
				[2, 21, 14],
				[2, 22, 8],
				[2, 23, 14],
				[3, 0, 17],
				[3, 1, 13],
				[3, 2, 0],
				[3, 3, 0],
				[3, 4, 0],
				[3, 5, 0],
				[3, 6, 0],
				[3, 7, 0],
				[3, 8, 1],
				[3, 9, 0],
				[3, 10, 15],
				[3, 11, 24],
				[3, 12, 37],
				[3, 13, 44],
				[3, 14, 23],
				[3, 15, 22],
				[3, 16, 29],
				[3, 17, 25],
				[3, 18, 25],
				[3, 19, 30],
				[3, 20, 16],
				[3, 21, 14],
				[3, 22, 14],
				[3, 23, 11],
				[4, 0, 8],
				[4, 1, 3],
				[4, 2, 0],
				[4, 3, 0],
				[4, 4, 0],
				[4, 5, 6],
				[4, 6, 0],
				[4, 7, 0],
				[4, 8, 0],
				[4, 9, 2],
				[4, 10, 24],
				[4, 11, 24],
				[4, 12, 22],
				[4, 13, 24],
				[4, 14, 4],
				[4, 15, 24],
				[4, 16, 22],
				[4, 17, 8],
				[4, 18, 18],
				[4, 19, 15],
				[4, 20, 3],
				[4, 21, 17],
				[4, 22, 3],
				[4, 23, 0],
				[5, 0, 2],
				[5, 1, 1],
				[5, 2, 0],
				[5, 3, 3],
				[5, 4, 0],
				[5, 5, 0],
				[5, 6, 0],
				[5, 7, 0],
				[5, 8, 2],
				[5, 9, 0],
				[5, 10, 14],
				[5, 11, 18],
				[5, 12, 35],
				[5, 13, 30],
				[5, 14, 5],
				[5, 15, 7],
				[5, 16, 11],
				[5, 17, 16],
				[5, 18, 0],
				[5, 19, 25],
				[5, 20, 3],
				[5, 21, 24],
				[5, 22, 2],
				[5, 23, 0],
				[6, 0, 1],
				[6, 1, 0],
				[6, 2, 0],
				[6, 3, 0],
				[6, 4, 0],
				[6, 5, 0],
				[6, 6, 0],
				[6, 7, 0],
				[6, 8, 0],
				[6, 9, 0],
				[6, 10, 1],
				[6, 11, 10],
				[6, 12, 22],
				[6, 13, 30],
				[6, 14, 3],
				[6, 15, 4],
				[6, 16, 0],
				[6, 17, 0],
				[6, 18, 0],
				[6, 19, 0],
				[6, 20, 1],
				[6, 21, 2],
				[6, 22, 2],
				[6, 23, 16]
			];

			data = data.map(function(item) {
				return [item[1], item[0], item[2] || '-'];
			});

			option = {
				title: {
					top: '5%',
					text: '最近一周社区(出口一)人次统计',
					left: 'center',
					textStyle: {
						color: '#ffffff'
					}
				},
				tooltip: {
					position: 'top',
				},
				animation: false,
				grid: {
					height: '50%',
					top: '15%'
				},
				xAxis: {
					type: 'category',
					data: hours,
					splitArea: {
						show: true
					},
					axisLine: {
						show: true,
						onZero: true,
						lineStyle: {
							color: '#ffffff',
						}
					} /*横轴边框色*/
					
				},
				axisLabel: {
					textStyle: {
						color: '#ffffff'
					}
				},
				yAxis: {
					type: 'category',
					data: days,
					splitArea: {
						show: true
					},
					axisLine: {
						show: true,
						lineStyle: {
							color: '#ffffff',
						}
					} /*横轴边框色*/
				},
				visualMap: {
					min: 0,
					max: 50,
					calculable: true,
					orient: 'horizontal',
					left: 'center',
					bottom: '15%',
					textStyle: {
						color: '#ffffff'
					}
				},
				series: [{
					name: '人次（出口一）',
					type: 'heatmap',
					data: data,
					label: {
						show: true
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}]
			};
			myChart.setOption(option);
		}


		function removeWidget() {
			unBindEvent();
			removeHtmlDom("widget_carTrace");
			//删除地图上已经存在的图标
			for (var i in carDeviceArray) {
				viewer.entities.removeById(carDeviceArray[i]);
			}
		}



		return {
			loadWidget: loadWidget,
			removeWidget: removeWidget
		}


	});
