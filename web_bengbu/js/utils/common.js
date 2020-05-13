//var common = {
//	//设置语言。参数："zh_CN"，"en"
//	setLanguage: null,
//	//获取当前语言。默认从cookie读取，没有则读取浏览器默认语言
//	getLanguage: null,
//	//设置cookie
//	setCookie: null,
//	//获取cookie
//	getCookie: null,
//
//	//获取给定key在当前语言环境下对应的key所对应的值。如读取name字段的值在英语环境下应该变为读取name_en字段的值
//	getLocalPairs: null,
//	//加载模板文件，依赖art-template库
//	loadTemplate: null
//};
//(function(common) {
var cKey = "userLanguage";

//设置语言。参数："zh_CN"，"en"
function setLanguage(language) {
	//默认设置过期时间为1个小时
	setCookie(cKey, language, 60 * 60 * 1000);
}

//获取当前语言。默认从cookie读取，没有则读取浏览器默认语言
function getLanguage() {
	var lang = getCookie(cKey);
	if(lang) {
		return lang;
	}
	if(navigator.appName === 'Netscape') {
		return navigator.language;
	} else {
		return navigator.browserLanguage;
	}
}

//设置cookie,参数分别为：key,value,过期时间（单位:ms）,域
function setCookie(cKey, cValue, exp, domain) {
	var cookie = cKey + "=" + cValue;
	if(exp) {
		var d = new Date();
		d.setTime(d.getTime() + exp);
		cookie += ";expires=" + d.toUTCString();
	}
	cookie += domain ? ";path=" + domain : ";path=/";
	document.cookie = cookie;
}

function getCookie(cKey) {
	var name = cKey + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while(c.charAt(0) === ' ') c = c.substring(1);
		if(c.indexOf(name) !== -1) return c.substring(name.length, c.length);
	}
	return "";
}

//清除cookie
function clearCookie(name) {
	setCookie(name, "", -1);
}

function getLocalKey(key) {
	var lang = getLanguage();
	var localKey = key;
	if(lang === "en") {
		localKey = key + "_" + lang;
	}
	return localKey;
}

function getLocalPairs(obj, key) {
	if(!obj) {
		return;
	}
	var localKey = getLocalKey(key);
	return obj[localKey] != null ? obj[localKey] : obj[key];
}

function loadTemplate(element, templateFilePath, data) {
	if(!window.$ || !window.jQuery) {
		throw new Error("jQuery is required")
	}
	if(!window.template) {
		throw new Error("art-template.js is required")
	}
	if(!element) {
		throw new Error("element is required")
	}
	$.get(templateFilePath, function(html) {
		$(element).html(window.template.compile(html)(data));
	});

}

//获取当前网址 http://localhost:8090/projectName/page.html
function getRootPath() {
	var currentPath = window.document.location.href;
	return currentPath;

	var pos = currentPath.indexOf(pathName);
	// 获取主机地址，如：http://localhost:8090
	var localhostPaht = currentPath.substring(0, pos);
	return localhostPaht + "/";
}

//获取主机地址 http://localhost:8090/
function getHostPath() {
	var currentPath = window.document.location.href;
	var pathName = window.document.location.pathname;
	var pos = currentPath.indexOf(pathName);
	var hostPath = currentPath.substring(0, pos + 1);
	return hostPath;
}

//获取工程路径 /projectName/page.html
function getProjectPath() {
	var pathName = window.document.location.pathname;
	// 获取主机地址之后的目录，如： ShanghaiControl/index.jsp
	var projectPath = window.document.location.pathname;
	return projectPath;
}

//获取工程名 projectName
function getProjectName() {
	var projectPath = window.document.location.pathname;
	var projectName = projectPath.substring(1, projectPath.substr(1).indexOf(
		'/') + 1);
	return projectName;
}

//获取地址栏get参数
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return unescape(r[2]);
	return null;
}

/**
 * 检查输入的值
 * @param {Object} name 值的名称
 * @param {Object} value 值
 * @param {Object} len 最大长度
 * @param {Object} flag1 是否检查为空
 * @param {Object} flag2 是否检查特殊字符
 */
function checkValue(name, value, len, flag1, flag2) {
	var content = null;
	if(flag1) {
		if(value == null || value == "") {
			content = name + "不能为空";
			return content;
		}
	}
	if(value.length > len) {
		content = name + "长度不能超过" + len;
		return content;
	}
	if(flag2) {
		var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
		if(pattern.test(value)) {
			content = name + "不能包含特殊字符";
			return content;
		}
	}
	return content;
}

/**
 * 打印object内容
 * @param {Object} obj
 */
function getObjContent(obj) {
	var temp = "";
	for(var i in obj) {
		temp += i + ":" + obj[i] + "\n";
	}
	console.log("the content of obj is:\n" + temp);
}

/**
 * 加载模块的html
 * @param {Object} content
 */
function loadHtmlDom(id, content) {
	var container = document.createElement('div');
	container.id = id;
	container.innerHTML = content;
	document.body.appendChild(container);
}

/**
 * 移除模块的html
 */
function removeHtmlDom(id) {
	var container = document.getElementById(id);
	if(container) {
		document.body.removeChild(container);
	}
}

/**
 * 将当前的起始时间转为时间戳
 * 函数调用传参格式为 2018-6-6或者2018.6.6
 * 如：startUnix(2018-6-6) 返回的时间戳格式‘1528300799’
 * @param {Object} $date
 */
function startUnix($date) {
	return(new Date(Date.parse($date.replace(/-/g, "/")))).getTime() / 1000;
}

/**
 * 将当天的结束时间转为时间戳
 * @param {Object} $date
 */
function endUnix($date) {
	return new Date().setTime(Date.parse($date.replace(/-/g, "/")) / 1000 + 24 * 60 * 60 - 1);
}

/**
 * 将时间戳转换为时间(yyyy-MM-dd hh:mm:ss)
 * 参数: 1545959492000
 * @param {Object} inputTime
 */
function formatDateTime(inputTime) {
	var date = new Date(parseInt(inputTime));
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};

/**
 * 日期转时间戳
 * @param {Object} endTime
 */
function transDateTime(endTime) {
	var date = new Date();
	date.setFullYear(endTime.substring(0, 4));
	date.setMonth(endTime.substring(5, 7) - 1);
	date.setDate(endTime.substring(8, 10));
	date.setHours(endTime.substring(11, 13));
	date.setMinutes(endTime.substring(14, 16));
	date.setSeconds(endTime.substring(17, 19));
	return Date.parse(date);
}

/**
 * 返回传入日期的yyyy-MM-dd hh:mm:ss格式
 */
function getFormatDate(date) {
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}

/**
 * 获取当前时间
 */
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}

/**
 * 获取当天开始时间
 */
function getNowFormatDateStart() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + "00" + seperator2 + "00" +
		seperator2 + "00";
	return currentdate;
}

/**
 * 获取当天结束时间
 */
function getNowFormatDateEnd() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + "23" + seperator2 + "59" +
		seperator2 + "59";
	return currentdate;
}

/*
 * 注册 根据窗体header id拖动窗体
 */
function moveFormByHeader(headerId) {
	var sWidth = document.documentElement.clientWidth || document.body.clientWidth;
	var sHeight = document.documentElement.clientHeight || document.body.clientHeight;

	var oDiv = document.getElementById(headerId);
	oDiv.onmousedown = function(ev) {

		//鼠标在父控件中距离左上角的距离
		var disX = ev.clientX - oDiv.parentElement.offsetLeft
		var disY = ev.clientY - oDiv.parentElement.offsetTop

		document.onmousemove = function(ev) {
			//拖动之后的left, top
			var l = ev.clientX - disX
			var t = ev.clientY - disY

			t = (t < 60 ? 60 : (t > sHeight - 40 ? sHeight - 40 : t));
			l = (l < 0 ? 0 : (l > sWidth - oDiv.parentElement.offsetWidth ? sWidth - oDiv.parentElement.offsetWidth : l));

			oDiv.parentElement.style.left = l + 'px'
			oDiv.parentElement.style.top = t + 'px'
		}
		document.onmouseup = function() {
			document.onmousemove = null;
			document.onmouseup = null
		}
	}
}

/**
 * ajax请求
 * @param {Object} params-->{"deviceId": "xxx", "number":123}
 * @param {Object} ipPort-->"http://10.10.2.151:8090/dsjh_hyweb/"
 * @param {Object} url-->"dcs/1672ac21e7944b049d2a8969c50d8556/select"
 * @param {Object} callback-->成功回调
 */
function ajaxRequest(params, ipPort, url, callback) {
	var mData = params;
	mData = JSON.stringify(mData);
	$.ajax({
		type: "post",
		url: ipPort + url,
		async: true,
		dataType: "json",
		contentType: "application/json",
		data: mData,
		xhrFields: {
			withCredentials: true
		},
		success: function(result) {
			callback(result);
		},
		error: function(error) {
			alert("请求出错");
		}
	});
}

/**
 * dateStr : 字符串时间，格式为 yyyy-MM-dd HH:mm:ss
 * s : 秒
 * return : 返回 字符串 ，格式跟传入的相同
 */
function dateAddSeconds(dateStr, s) {
	var dateTime = transDateTime(dateStr);
	dateTime += 1000 * s;

	return formatDateTime(dateTime);
};

/**
 * 根据出生年月日获取年龄
 * @param {Object} strBirthday:20051020
 */
function getAge(strBirthday) {
	var returnAge;
	//以下五行是为了获取出生年月日，如果是从身份证上获取需要稍微改变一下
	var birthYear = strBirthday.substring(0, 4);
	var birthMonth = strBirthday.substring(4, 6);
	var birthDay = strBirthday.substring(6, 8);

	d = new Date();
	var nowYear = d.getFullYear();
	var nowMonth = d.getMonth() + 1;
	var nowDay = d.getDate();

	if(nowYear == birthYear) {
		returnAge = 0; //同年 则为0岁
	} else {
		var ageDiff = nowYear - birthYear; //年之差
		if(ageDiff > 0) {
			if(nowMonth == birthMonth) {
				var dayDiff = nowDay - birthDay; //日之差
				if(dayDiff < 0) {
					returnAge = ageDiff - 1;
				} else {
					returnAge = ageDiff;
				}
			} else {
				var monthDiff = nowMonth - birthMonth; //月之差
				if(monthDiff < 0) {
					returnAge = ageDiff - 1;
				} else {
					returnAge = ageDiff;
				}
			}
		} else {
			returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天
		}
	}

	return returnAge; //返回周岁年龄

}

//获取相机当前的位置
function getCameraPosition() {
	console.log("相机的位置position, direction, up\n" + viewer.camera.position.x + "," + viewer.camera.position.y + "," + viewer.camera.position.z +
		"," + viewer.camera.direction.x + "," + viewer.camera.direction.y + "," + viewer.camera.direction.z +
		"," + viewer.camera.up.x + "," + viewer.camera.up.y + "," + viewer.camera.up.z);
}

function getHomePosition(){
	console.log('{"position":{"x":'+viewer.camera.position.x+',"y":'+viewer.camera.position.y+',"z":'+viewer.camera.position.z
	+'},"up":{"x":'+viewer.camera.up.x+',"y":'+viewer.camera.up.y+',"z":'+viewer.camera.up.z
	+'},"direction":{"x":'+viewer.camera.direction.x+',"y":'+viewer.camera.direction.y+',"z":'+viewer.camera.direction.z+'}}');
}

//	common.setLanguage =s setLanguage;
//	common.getLanguage = getLanguage;
//	common.setCookie = setCookie;
//	common.getCookie = getCookie;
//	common.clearCookie = clearCookie;
//	common.getLocalPairs = getLocalPairs;
//	common.loadTemplate = loadTemplate;
//	common.getRootPath = getRootPath;
//	common.getHostPath = getHostPath;
//	common.getProjectPath = getProjectPath;
//	common.getProjectName = getProjectName;
//	common.getQueryString = getQueryString;
//	common.checkValue = checkValue;
//	common.getObjContent = getObjContent;
//
//})(common);