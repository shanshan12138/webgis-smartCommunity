/**
 * 综合查询
 */
define(["jquery", "bootstrap", "pagination", "datetimepicker", "bootstrapSwitch", "common", "config", "echarts",
	"echarts-dark"
], function($, bootstrap, pagination, datetimepicker, bootstrapSwitch, common, config, echarts, dark) {

	var scene = viewer.scene;
	var buildingLayer = null;

	function loadWidget(content) {
		//加载html元素
		loadHtmlDom("widget_yijiansou", content);
		moveFormByHeader("yijiansouHeader");
		moveFormByHeader("huxingtuHeader");
		moveFormByHeader("yongdianliangHeader");
		init();
		searchInits();
		//绑定事件
		bindEvent();
		buildingLayer = scene.layers.find("danthquantou");

	}

	/**
	 * 初始化
	 */
	function init() {
		var timeStrat = getNowFormatDateStart();
		var timeEnd = getNowFormatDateEnd();
		$("#searchTimeStart").val(timeStrat);
		$("#searchTimeEnd").val(timeEnd);
		searchBuilding();
		$("#buildingSelect").on("change", buildingSelectChange);
		$("#unitSelect").on("change", unitSelectChange);
		$("#floorSelect").on("change", floorSelectChange);
		$("#roomNoSelect").on("change", roomNoSelectChange);

	}

	/**
	 * 移除模块的html
	 */
	function removeHtmlDom() {
		var container = document.getElementById('widget_yijiansou');
		if (container) {
			document.body.removeChild(container);
		}
	}

	/**
	 * 绑定鼠标事件
	 */
	function bindEvent() {
		//一键搜按钮
		$("#yijiansouSearch").on("click", function() {
			searchInits();
			requestData();

		});

		//关闭窗体
		$("#searchClose").on("click", function() {
			$("#container-searchContent").hide();
		});

		//人员查询
		$("#searchPerson").on("click", function() {
			searchPerson();
		});

		//房屋查询
		$("#hsSearch").on("click", function() {
			searchHouse();
			$("#code_img").show();
		});

		//企业查询
		$('#houseRentTable td').on('click', function() {
			console.log('执行了>>>' + $(this).text())
			companySearch($(this).text());
		});

		//查看户型图
		$('#checkHuxingtu').on('click', function() {
			$("#huxingtu").attr("src", './img/yijiansou/C1.jpg');

			//调整尺寸,位置
			$("#huxingtuContent").css("top", "");
			$("#huxingtuContent").css("height", "500px");
			$("#huxingtuContent").css("width", "460px");
			$("#huxingtuContent").css("bottom", "10px");
			$("#huxingtuContent").css("left", "1300px");
			//显示
			var v = document.getElementById('huxingtuContent');
			v.style.display = "block";
		})

		//关闭户型图
		$('#photoClose').on('click', function() {
			$('#huxingtuContent').hide();
		})

		//查看用电量
		$('#yongdianliang').on('click', function() {

			//调整尺寸,位置
			$("#yongdianliangContent").css("top", "");
			$("#yongdianliangContent").css("height", "500px");
			$("#yongdianliangContent").css("width", "460px");
			$("#yongdianliangContent").css("bottom", "10px");
			$("#yongdianliangContent").css("left", "820px");

			//生成用电量演示数据

			var option1 = {
				tooltip: {
					trigger: 'axis'
				},
				legend: {
					data: ['用电量(kW·h)']
				},
				toolbox: {
					show: true,
					feature: {
						//          mark : {show: true},
						//          dataView : {show: true, readOnly: false},
						magicType: { show: true, type: ['line', 'bar'] },
						//          restore : {show: true},
						saveAsImage: { show: true }
					}
				},
				calculable: true,
				xAxis: [{
					type: 'category',
					boundaryGap: false,
					data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
				}],
				yAxis: {},
				series: [{
					name: '用电量(kW·h)',
					type: 'line',
					stack: '总量',
					data: [53, 47, 41, 43, 42, 52, 76, 78, 67, 48, 43, 51],
				}]
			};

			echarts.init(document.getElementById('yongdianliangChart'), 'dark').setOption(option1);

			//显示
			var v = document.getElementById('yongdianliangContent');
			v.style.display = "block";
		});

		//关闭用电量
		$('#yongdianliangClose').on('click', function() {
			$('#yongdianliangContent').hide();
		})

		//选项卡
		$("#carTraceTab li").on("click", function() {

			var name = $(this).attr("name");

			if (name == "mYijiansou") {
				//一键搜
				$("#searchItem").hide();
				$("#searchPage").hide();
				$("#searchHead").css("padding-top", "120px");
				$("#searchTitle").css("display", "block");

			} else if (name == "personSearch") {

			} else if (name == "houseSearch") {

			} else if (name == "houseRent") {

			}
		});
	}

	/**
	 * 查询的初始化
	 */
	function searchInits() {
		$("#searchHead").css("padding-top", "120px");
		$("#searchItem").empty();
		$("#pagination").empty();
	}

	/**
	 * 一键搜
	 */
	function requestData() {
		var keyWord = $("#keyword").val().trim();
		var mData = {
			keyField: keyWord
		};
		var mUrl = "dcs/b38b591771884e97ae104c692dcacfdc/select?pageNum=1&pageSize=9";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			console.log(result);
			//登录过期,重新登陆
			if (result.code == 0 && MSG_LOGIN_TIMEOUT == result.msg) {
				window.location = "login.html";
				return;
			}
			//请求结果处理
			if (result.code == 200) {
				//请求成功
				var data = result.data;
				var totalPage = 0;
				if (data.totalPageCount) {
					totalPage = data.totalPageCount; //总条目数
					$("#searchHead").css("padding-top", "2px");
					$("#searchTitle").css("display", "none");
				}

				$("#pagination").pagination(totalPage, {
					num_edge_entries: 1, //两侧显示的首尾分页的条目数
					num_display_entries: 4, //连续分页主体部分显示的分页条目数
					items_per_page: 1, //每页显示的条目数
					prev_text: "前一页",
					next_text: "下一页",
					callback: pageselectCallback
				});
			}
		});
	}

	/**
	 * 查询
	 * @param {Object} page_index
	 * @param {Object} jq
	 */
	function pageselectCallback(page_index, jq) {
		var keyWord = $("#keyword").val().trim();
		var requestPageNum = page_index + 1;
		var mData = {
			keyField: keyWord,
			pageSize: 9
		};
		var mUrl = "dcs/b38b591771884e97ae104c692dcacfdc/select?pageNum=" + requestPageNum + "&pageSize=9";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			//请求结果处理
			var totalPage = result.data.totalPageCount; //总条目数
			$("#total").text(result.data.totalCount);
			setQueryContent(result);
		});

	}

	/**
	 * 根据查询的结果设置页卡内容
	 */
	var houseArray = null;

	function setQueryContent(result) {
		// console.log(result);
		var item = "";
		var dataArr = result.data.list;
		houseArray = new Array();
		for (var i = 0; i < dataArr.length; i++) {
			var personId = "person" + i;
			var cardId = "card" + i;
			var houseId = "house" + i;
			var carId = "car" + i;
			var aId = "a" + i;
			var houseObj = dataArr[i].houses[0];
			houseArray.push(houseObj);

			//FFF3F3
			item = item +
				'<div style="float: left;width: 240px;height:300px;background: none;margin: 2px;border:1px solid #AAA;border-radius: 4px;color:#fff;">' +

				//标题
				'<ul id="myTab" class="nav nav-tabs" style="background: rgba(80, 80, 80, 0.4);">' +
				'<li class="active">' +
				'<a href="#' + personId + '" data-toggle="tab">人</a>' +
				'</li>' +
				'<li>' +
				'<a href="#' + cardId + '" data-toggle="tab">卡</a>' +
				'</li>' +
				'<li>' +
				'<a href="#' + houseId + '" data-toggle="tab">房</a>' +
				'</li>' +
				'<li>' +
				'<a href="#' + carId + '" data-toggle="tab">车</a>' +
				'</li>' +
				'</ul>' +

				'<div id="myTabContent" class="tab-content">' +

				//人
				'<div class="tab-pane fade in active" id=' + personId + ' style="width:100%;height:258px;padding: 1px;">' +
				'<div style="float: top;width:100%;height:100%;margin-bottom: 1px;padding:12px">' +
				'<table style="width: 100%; height: 100%;font-size: 12px">' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">姓名:</td>' +
				'<td><tt><a>' + dataArr[i].person_name + '</a></tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">性别:</td>' +
				'<td><tt>' + dataArr[i].gender + '</tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">身份证号:</td>' +
				'<td><tt>' + dataArr[i].paper_number + '</tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">电话号码:</td>' +
				'<td><tt>' + dataArr[i].mobile_number + '</tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">文化程度:</td>' +
				'<td><tt>' + dataArr[i].agree + '</tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">政治面貌:</td>' +
				'<td><tt>' + dataArr[i].political + '</tt></td>' +
				'</tr>' +
				'<tr style="width: 100%;height:20px;">' +
				'<td style="width: 68px;">工作单位:</td>' +
				'<td><tt>' + dataArr[i].company + '</tt></td>' +
				'</tr>' +
				'</table>' +
				'</div>' +
				'</div>';

			if (dataArr[i].cards.length > 0) {
				//卡
				item = item + '<div class="tab-pane fade" id=' + cardId + ' style="width:100%;height:258px;padding: 1px;">' +
					//				'<p>无数据</p>' +
					'<div style="float: top;width:100%;height:100%;margin-bottom: 1px;padding:12px">' +
					'<table style="table-layout:fixed;width: 100%; height: 100%;font-size: 12px">' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">卡id:</td>' +
					'<td style="white-space:nowrap;overflow:hidden;text-overflow: ellipsis;"><tt>' + dataArr[i].cards[0].origin_id +
					'</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">卡编号:</td>' +
					'<td><tt><a>' + dataArr[i].cards[0].card_number + '</a></tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">卡类型:</td>' +
					'<td><tt>' + dataArr[i].cards[0].card_type + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">发卡时间:</td>' +
					// '<td><tt><a>' + formatDateTime(dataArr[i].cards[0].publish_time) + '</a></tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">激活时间:</td>' +
					'<td><tt>' + dataArr[i].cards[0].activity_time + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">过期时间:</td>' +
					'<td><tt>' + dataArr[i].cards[0].expired_time + '</tt></td>' +
					'</tr>' +
					'</table>' +
					'</div>' +
					'</div>';
			}

			if (dataArr[i].houses.length > 0) {
				//房
				item = item + '<div class="tab-pane fade" id=' + houseId + ' style="width:100%;height:258px;padding: 1px;">' +
					'<div style="float: top;width:100%;height:100%;margin-bottom: 1px;padding:12px">' +
					'<table style="width: 100%; height: 100%;font-size: 12px">' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">地址:</td>' +
					'<td><tt><a id=' + aId + ' onClick="getMonomer(this.id)">' + dataArr[i].houses[0].connection_address +
					'</a></tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">户主:</td>' +
					'<td><tt>' + dataArr[i].person_name + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">楼栋:</td>' +
					'<td><tt>' + dataArr[i].houses[0].building_name + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">单元:</td>' +
					'<td><tt>' + dataArr[i].houses[0].unit_name + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">楼层:</td>' +
					'<td><tt>' + dataArr[i].houses[0].floor + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">门号:</td>' +
					'<td><tt>' + dataArr[i].houses[0].room_number + '</tt></td>' +
					'</tr>' +
					'<tr style="width: 100%;height:20px;">' +
					'<td style="width: 68px;">更新时间:</td>' +
					'<td><tt>' + dataArr[i].houses[0].modify_time + '</tt></td>' +
					'</tr>' +
					'</table>' +
					'</div>' +
					'</div>';
			}

			//车
			item = item + '<div class="tab-pane fade" id=' + carId + ' style="width:100%;height:258px;padding: 1px;">' +
				'<p>无数据</p>' +
				'</div>' +
				'</div>' +

				'</div>';
		}
		$("#searchItem").empty().append(item);

		$("#searchItem").show();
		$("#searchPage").show();
	}

	//获取当前用户的房屋模型
	getMonomer = function(id) {
		var mId = id.replace(/[^0-9]/ig, "");
		console.log(mId);
		// console.log(houseArray);		
		var building = houseArray[mId].building_name;
		var unit = houseArray[mId].unit_name;
		var floor = houseArray[mId].floor;
		var roomNumber = houseArray[mId].room_number;
		var sqlStr = "PLACEMARKNAME='" + building + unit + floor + "层" + roomNumber + "'";
		// console.log(sqlStr);
		doSqlQuery(sqlStr);
	}
	//请求单体化数据
	function doSqlQuery(SQL) {
		var getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;
		getFeatureParam = new SuperMap.REST.FilterParameter({
			attributeFilter: SQL
		});
		getFeatureBySQLParams = new SuperMap.REST.GetFeaturesBySQLParameters({
			queryParameter: getFeatureParam,
			toIndex: -1,
			datasetNames: ["111:danth"]

		});
		var url = "http://localhost:8091/iserver/services/data-danthquantou/rest/data"; //透明

		getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(url, {
			eventListeners: {
				// 查询成功时的回调函数
				"processCompleted": onQueryComplete,
				//查询失败时的回调函数
				"processFailed": processFailed
			}
		});

		getFeatureBySQLService.processAsync(getFeatureBySQLParams);
	}

	function processFailed(queryEventArgs) {
		console.log('查询失败！' + queryEventArgs);
		// alert('查询失败！');
	}

	function onQueryComplete(queryEventArgs) {
		// console.log('查询成功！');

		var selectedFeatures = queryEventArgs.originResult.features;
		var id = null;
		var feature = null;

		for (var i = 0; i < selectedFeatures.length; i++) {
			console.log(selectedFeatures);
			id = selectedFeatures[i].fieldValues["0"];
			lastId = id;
			feature = selectedFeatures[i];
			west = selectedFeatures[i].fieldValues["1"];
			north = selectedFeatures[i].fieldValues["2"];
			east = selectedFeatures[i].fieldValues["3"];
			south = selectedFeatures[i].fieldValues["4"];
		}
		// buildingLayer.setSelection(id);
		console.log(buildingLayer.layerBounds);
		console.log(west);
		console.log(north);
		console.log(east);
		console.log(south);

		//跳转到当前模型的位置
		//setView函数设置Camera的位置和方向
		// viewer.camera.setView({
		// 	destination: buildingLayer.layerBounds,
		// 	orientation: {
		// 		heading: Cesium.Math.toRadians(0.0), //水平方向旋转
		// 		pitch: Cesium.Math.toRadians(-75.0), // default value (looking down)
		// 		roll: 0.0, // default value
		// 	},
		// });


		viewer.camera.flyTo({
			destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
			orientation: {
				heading: Cesium.Math.toRadians(0.0), //水平方向旋转
				pitch: Cesium.Math.toRadians(-45.0), // default value (looking down)
				roll: 0.0, // default value
				duration: 10,
				// heading: 4.39611370540786,
				// pitch: -0.43458664812464143,
				// roll: 2.0174972803488345e-11,
			},
		});

	}

	/**
	 * 人员查询
	 */
	function searchPerson() {
		//清空个人详细信息, 住房信息, 个人打卡记录

		$("#phMonitoring").prop("checked", false);

		//获取查询条件
		var name = $("#psName").val().trim();
		var mData = {
			"communityId": "0002",
			"name": name
		};
		var mUrl = "dcs/b0399dfd34914be0a6b8adbb444d7a08/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			console.log(result);
			//显示查询结果
			if (result.code == 200) {
				var data = result.data;
				if (data == null) {
					//没有数据123
					return;
					//个人详细信息
					$("#pdName").val(data[0].person_name);
					$("#pdSex").val(data[0].gender);
					$("#pdAge").val(getAge(formatDateTime(data[0].birthday)));
					$("#pdDoorCardCount").val(data[0].cards.length);
					$("#pdDoorCardNum").val(data[0].cards[0].card_number);
					$("#pdIdentityNum").val(data[0].paper_number);
					// $("#pdLoginTime").val(formatDateTime(data[0].modify_time));
					$("#pdAddress").val(data[0].census);
					//住房信息
					$("#phType").val(data[0].live_type);
					$("#phHouse").val(data[0].houses[0].connection_address);
					$("#phAgentName").val(data[0].houses[0].agent_name);
					$("#phPhone").val(data[0].houses[0].agent_phone);
					var mContent = '<input id="phMonitoring" type="checkbox" ' + (data[0].focus == "" ? "" : "checked=\"checked\"") +
						'" />';
					$("#phMContainer").empty();
					$("#phMContainer").append(mContent);
					$("#phIdentityNum").val(data[0].houses[0].agent_paper_number);

					$(".switch").bootstrapSwitch();
					//个人打卡记录
					var recordUrl = 'dcs/ad92d6295f714c7fa63bca37e78c994a/select';
					var personId = data[0].origin_id;
					var startTime = transDateTime($('#searchTimeStart').val());
					var endTime = transDateTime($('#searchTimeEnd').val());

					var recordData = {
						'personId': personId,
						'startTime': startTime,
						'endTime': endTime
					}

					ajaxRequest(recordData, ipPort, recordUrl, function(result) {
						console.log(result);
						//显示查询结果
						if (result.code == 200) {
							var data = result.data;
							if (data == null) {
								//没有数据
								return;
							}

							/*<tr>
								<td>00000001</td>
								<td>小区南门</td>
								<td>2018年7月13日12时43分</td>
								<td>外出</td>
								<td>门卡</td>
							</tr>*/

							var recordContent = '';
							for (var i = 0; i < data.length; i++) {
								recordContent = recordContent + '<tr><td>' + data[i].card_number + '</td><td>' + data[i].device_name +
									'</td><td>' + formatDateTime(data[i].open_time) + '</td><td>' + data[i].open_action + '</td><td>' + data[
										i].open_type + '</td></tr>';
							}

							$("#recordTBody").empty();
							$("#recordTBody").append(recordContent);
						}
					});


				}
			}
		});

	}
	/**
	 * 房屋查询
	 */

	//根据社区id获取楼栋信息
	function searchBuilding() {
		var mData = {
			"communityId": "0002"
		};
		var mUrl = "dcs/c45b330bc62144779be0859e99965c8a/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			// console.log(result);
			//请求结果处理
			if (result.code == 200) {
				//请求成功
				var data = result.data;
				// console.log(data);
				$.each(data, function(i, item) {
					if (item == null) {
						return;
					}
					$("<option></option>")
						.val(item["building_id"])
						.text(item["building_name"])
						.appendTo($("#buildingSelect"));
				});
			}
		});
	}

	var buildId;
	var unitId;
	var floorId;
	var roomNoId;
	//楼栋改变获取单元号
	function buildingSelectChange(event) {
		// console.log(event);
		// console.log(this.value);
		buildId = this.value;
		var mData = {
			"communityId": "0002",
			"buildingId": buildId,
		};
		var ipPort = "http://127.0.0.1:8080/dsjh/";
		var mUrl = "dcs/5efd334eceb94c59942f0f4e6e398994/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			if (result.code == 200) {
				//请求成功
				var data = result.data;
				// console.log(data);
				$.each(data, function(i, item) {
					if (item == null) {
						return;
					}
					$("<option></option>")
						.val(item["unit_id"])
						.text(item["unit_name"])
						.appendTo($("#unitSelect"));
				});
			}
		});
	}

	//单元、楼栋改变获取楼层
	function unitSelectChange(event) {
		unitId = this.value;
		var mData = {
			"communityId": "0002",
			"buildingId": buildId,
			"unitId": unitId
		};
		var mUrl = "dcs/8c55bb7811784e86992ff2a21dd281c6/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			if (result.code == 200) {
				//请求成功
				var data = result.data;
				// console.log(data);
				$.each(data, function(i, item) {
					if (item == null) {
						return;
					}
					$("<option></option>")
						.val(item["floor"])
						.text(item["floor"] + " 层")
						.appendTo($("#floorSelect"));
				});
			}
		});
	}


	//楼层、楼栋、单元改变获房间号
	function floorSelectChange(event) {
		// console.log(this.value);
		floorId = this.value;
		var mData = {
			"communityId": "0002",
			"buildingId": buildId,
			"unitId": unitId,
			"floor": floorId
		};
		var mUrl = "dcs/0505effd04ab4524bfa2300987268f92/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			if (result.code == 200) {
				//请求成功
				var data = result.data;
				// console.log(data);
				$.each(data, function(i, item) {
					if (item == null) {
						return;
					}
					$("<option></option>")
						.val(item["room_id"])
						.text(item["room_number"])
						.appendTo($("#roomNoSelect"));
				});
			}
		});
	}
	$("#floorSelect").on("change", floorSelectChange(this));

	//房间号改变
	function roomNoSelectChange(event) {
		console.log(this.value);
		roomNoId = this.value;
	}

	function searchHouse() {
		//清空个人详细信息, 住房信息, 个人打卡记录
		//获取查询条件
		var mData = {
			"communityId": "0002",
			"roomId": roomNoId
		};
		var mUrl = "dcs/637adaeda26941579caf689d018244a9/select";
		ajaxRequest(mData, ipPort, mUrl, function(result) {
			if (result.code == 200) {
				var data = result.data;
				console.log(data);
				if (data == null) {
					return 0;
				} else {
					//房屋权属信息
					if (data.houseRelation.length == 0) {
						$("#hdName").val("无");
						$("#hdPhone").val("无");
						$("#hdIdentityNum").val("无");
						$("#hdTime").val("无");
					} else {
						$("#hdName").val(data.houseRelation[0].person_name);
						$("#hdPhone").val(data.houseRelation[0].mobile_number);
						$("#hdIdentityNum").val(data.houseRelation[0].paper_number);
						$("#hdTime").val(data.modify_time == "" ? "" : formatDateTime(data.modify_time));
						//现流动人口数量  居住类型是自住
						var xldrk = 0;
						for (var i in data.houseRelation) {
							if (data.houseRelation[i].live_type == "自主") {
								xldrk++;
							}
						}
						console.log(xldrk);
					}

					//房屋数据统计

					//现居住人口数量
					$("#XJZRK").val(data.houseRelation.length);
					//先绑定门禁卡数量
					$("#XBDMJK").val(0);
					//退租人口数量
					$("#YTZRK").val(0);
					//现流动人口数量  居住类型是自住			
					$("#XLDRK").val(xldrk);
					//重点监控人口数量
					$("#ZDJKRK").val(0);
					//房屋住房信息
					var mContent = "";
					for (var i in data.houseRelation) {
						mContent = mContent + '<tr>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].person_name + '</td>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].gender + '</td>' +
							'<td style="overflow: hidden;">' + getAge(data.houseRelation[i].birthday) + '</td>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].card_numbers + '</td>' +
							'<td style="overflow: hidden;">' + '' + '</td>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].live_type + '</td>' +
							'<td style="overflow: hidden;">' + '' + '</td>' +
							'<td style="overflow: hidden;">' + (data.houseRelation[i].important == "" ? '普通' : '重点') + '</td>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].mobile_number + '</td>' +
							'<td style="overflow: hidden;">' + data.houseRelation[i].census + data.houseRelation[i].live_address +
							'</td>' +
							'</tr>';
					}


					$("#houseRelation").empty();
					$("#houseRelation").append(mContent);
				}
			}
		});
	}





	//企业查询
	function companySearch(name) {
		if (name == '中百超市') {
			$('#zhucehao').val('91340300348833804Y');
			$('#zhutimingcheng').val('中百超市');
			$('#farendaibiao').val('常红芬');
			$('#chengliriqi').val('20150715');
			$('#xingzhengquhua').val('湖北省武汉市汉阳区');
			$('#qiyeleixing').val('173');
			$('#qiyezhuangtai').val('营业');
			$('#jingyingfanwei').text('日常百货');

			$('#xingming').val('常红芬');
			$('#xingbie').val('女');
			$('#nianling').val('51');
			$('#lianxidianhua').val('13966057204');

		} else if (name == '链家房产中介') {
			$('#zhucehao').val('91340303MA2RWB6M8U');
			$('#zhutimingcheng').val('链家房产中介');
			$('#farendaibiao').val('施克正');
			$('#chengliriqi').val('20170310');
			$('#xingzhengquhua').val('湖北省武汉市汉阳区');
			$('#qiyeleixing').val('159');
			$('#qiyezhuangtai').val('营业');
			$('#jingyingfanwei').text('房屋租赁');

			$('#xingming').val('施克正');
			$('#xingbie').val('男');
			$('#nianling').val('43');
			$('#lianxidianhua').val('15505523203');
		}
	}

	/**
	 * 解绑事件
	 */
	function unBindEvent() {
		$("#search").off("click");
		$("#searchClose").off("click");
	}

	function removeWidget() {
		//解绑事件
		unBindEvent();
		//清除地图选中元素
		buildingLayer.removeAllObjsColor();
		//清除html
		removeHtmlDom();
	}

	return {
		loadWidget: loadWidget,
		removeWidget: removeWidget
	};
});
