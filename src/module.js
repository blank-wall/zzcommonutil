const util = `// 用于 文件下载
importClass(java.io.InputStream);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass("java.net.InetAddress");
importClass("java.net.NetworkInterface");
importClass("java.net.Inet6Address");
//rom服务地址
var romServerUrl = "http://127.0.0.1:8888/"

var zzCommonFunc = {};
/**
 * 通用方法
 * 1.randomSleep 随机睡眠
 * 2.clickIfWidgetExistsRandom 点击坐标随机化
 * 3.closeApp 关闭app
 * 4.oppenApp 打开app
 * 5.randomString 随机生成字符串
 * 6.titleCase 除首字母全部小写
 * 7.getPostDate POST 请求带json
 * 8.newThread 开启一个阻塞线程
 * 9.getSize 获取屏幕数据
 * 10.getPotionInImagePath 用图片路径找位置
 * 11.getPotionInImageBase64  用图片Base64找位置
 * 12.getPotionInImageImg 已经是img类型的找位置
 * 13.getPotion2Color 在一个区域内找颜色
 * 14.installApp 安装app
 * 15.downloadBigFile 下载大文件
 * 16.palindRome 去除字符串全部特殊字符
 * 17.dateStrChangeTimeTamp 日期字符串转成时间戳
 */

/**
 * randomSleep(dur1,dur2)随机睡眠单位毫秒
 * @param {*} min 随机数1
 * @param {*} max 随机数2
 * @returns 
 */
zzCommonFunc.randomSleep = function (min, max) {
  if (max) {
    sleep(random(min, max))
  } else if (min) {
    sleep(random((min + 2) * 2, (min + 2) * 3))
  }
  else {
    sleep(random(500, 1500))
  }
  return true
}

/**
 * clickIfWidgetExistsRandom 坐标点击，点击事件坐标随机化处理
 * @param {*} widget 目标节点
 * @returns 返回点击结果
 */
zzCommonFunc.clickIfWidgetExistsRandom = function (widget) {
  try {
    return widget.visibleToUser() && clickRandom(random(widget.bounds().centerX() - 3, widget.bounds().centerX() + 3), random(widget.bounds().centerY() - 3, widget.bounds().centerY() + 3))
  } catch (error) {
    log(error)
  }
  return false
}
/**
 * 关闭app
 * @param {*} pkg 包名
 */
zzCommonFunc.closeApp = function (pkg) {
  let sh = romServerUrl + "?action=authcmds&params=am force-stop " + pkg
  try {
    http.get(sh)
    log(sh)
    sleep(2000)
  } catch (error) { }
}
/**
 * 打开app
 * @param {*} pkg 
 */
zzCommonFunc.oppenApp = function (pkg) {
  launch(pkg)
}

/**
 * 随机生成字符串
 * @param {*} length 生成字符串长度
 * @returns 
 */
zzCommonFunc.randomString = function (length) {
  var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var result = ''
  for (var i = length; i > 0; --i)
    result += str[Math.floor(Math.random() * str.length)]
  return result
}
/**
 * 除第一个字母外全转小写
 * @param {*} str 字符串
 * @returns 
 */
zzCommonFunc.titleCase = function (str) {
  var arr = str.split(" ");
  var _length = arr.length;
  for (var i = 0; i < _length; i++) {
    arr[i] = arr[i][0].toUpperCase() + arr[i].substring(1, arr[i].length).toLowerCase();
    str = arr.join(" ");
  }
  return str;
}
/**
 * POST 请求带json
 * @param {*} url 请求连接
 * @param {*} postJson post的json数据
 */
zzCommonFunc.getPostDate = function (url, postJson) {
  var respone = http.postJson(url, postJson);
  return respone.body.string()
}

/**
 * newThread 开启一个阻塞线程
 * @param {Function} doBusiness 业务回调函数
 * @param {any} result 默认返回值
 * @param {Number=12000} timeout 线程超时时间（毫秒）
 * @param {Function} timeoutCall 线程超时回调
 */
zzCommonFunc.newThread = function (doBusiness, result, timeout, timeoutCall) {
  let errMsg = null
  let result = result
  let timeout = typeof (timeout) == "number" ? timeout : 120000    //  默认超时时间为 2 分钟
  let doBusiness = typeof (doBusiness) == "function" ? doBusiness : () => { }
  let timeoutCall = typeof (timeoutCall) == "function" ? timeoutCall : () => { }
  let is_timeout = true
  let thread = threads.start(function () {
    try {
      result = doBusiness()
    } catch (error) {
      errMsg = error
    }
    is_timeout = false
  })
  thread.join(timeout)
  thread.interrupt()
  if (errMsg) { throw errMsg }
  try { is_timeout && timeoutCall() } catch (error) { throw error }
  return result
}
/**
 * getSize()获取屏幕数据
 * @returns dev 
 */
zzCommonFunc.getSize = function () {
  let w = device.width
  let h = device.height
  let dev = {}
  dev.res = w + 'x' + h
  dev.w = w
  dev.h = h
  log(dev)
  return dev
}

/**
 * getPotionInImagePath 用图片路径找位置
 * @param {*} targetImage 目标路径
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImagePath = function (targetImage, screenImage, screenSize) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  var tar_img = images.read(targetImage);//targetImage是路径
  //var tar_img = targetImage;//targetImage是img类型
  // var tar_img = images.fromBase64(targetImage);//如果targetImage是base64用这句
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
  } else {
    log("无图片")
    return point
  }
  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  // if (point) {
  //     log("image found point1: " + point) 
  //     point.x = Math.round(Math.random()*30) + parseInt((point.x) * w1/img_w); //shell截图固定是854*480
  //     point.y = Math.round(Math.random()*10) + parseInt((point.y) * h1/img_h)
  //     log("image found point2: " + point) 
  // }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}
/**
 * getPotionInImageBase64 用图片Base64找位置
 * @param {*} targetImageBase64 目标图片的base64编码
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImageBase64 = function (targetImageBase64, screenImage, screenSize) {
  // var h1 = parseInt(screenSize.h)
  // var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  //var tar_img = targetImage;//targetImage是img类型
  var tar_img = images.fromBase64(targetImageBase64);//如果targetImage是base64用这句
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
    // log('坐标', point)
  } else {
    log("无图片")
    return point
  }
  // var img_h = 854;//shell截图固定是854*480或者480*854
  // var img_w = 480;
  // // var rotation = device.getRotation()//获取屏幕方向
  // var rotation = 1
  // if(rotation == 1){//正向横屏
  //     img_h = 480;
  //     img_w = 854;
  // }
  // if (point) {
  //     log("image found point1: " + point) 
  //     point.x = Math.round(Math.random()*30) + parseInt((point.x) * w1/img_w); //shell截图固定是854*480
  //     point.y = Math.round(Math.random()*10) + parseInt((point.y) * h1/img_h)
  //     log("image found point2: " + point) 
  // }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}
/**
 * getPotionInImageImg 已经是img类型的找位置
 * @param {*} targetImageBase64 目标图片已经是autojs的img类型
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImageImg = function (targetImage, screenImage, screenSize) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  var tar_img = targetImage;//targetImage是img类型
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
  } else {
    log("无图片")
    return point
  }
  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  if (point) {
    log("image found point1: " + point)
    point.x = Math.round(Math.random() * 30) + parseInt((point.x) * w1 / img_w); //shell截图固定是854*480
    point.y = Math.round(Math.random() * 10) + parseInt((point.y) * h1 / img_h)
    log("image found point2: " + point)
  }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}

/**
 * 在一个区域内找颜色
 * @param {*} color 颜色
 * @param {*} left 左
 * @param {*} top 上
 * @param {*} h 高
 * @param {*} w 宽
 * @param {*} threshold 找色时颜色相似度的临界值，范围为0~255（越小越相似，0为颜色相等，255为任何颜色都能匹配）。默认为4。threshold和浮点数相似度(0.0~1.0)的换算为 similarity = (255 - threshold) / 255.
 * @param {*} screenSize 屏幕分辨率
 * @param {*} temp_imag 图片路径
 * @returns 
 */
zzCommonFunc.getPotion2Color = function (color, left, top, h, w, threshold, screenSize, temp_imag) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  //读图片
  var img = images.read(temp_imag)
  zzCommonFunc.randomSleep(500, 1500)
  if (!img) {
    log("图片不存在")
    return null;
  }
  var point = findColor(img, color, {
    region: [left, top, w, h],
    threshold: threshold
  });

  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  if (point) {
    //shell截图需转换
    var yy = Math.round(Math.random() * 10) + parseInt((point.y) * h1 / img_h);
    var xx = Math.round(Math.random() * 30) + parseInt((point.x) * w1 / img_w);
    var pot = {}
    pot.x = xx;
    pot.y = yy;
    log("找到接收按钮附近，坐标为(" + xx + ", " + yy + ")");
    img.recycle() //回收
    return pot;
  } else {
    img.recycle() //回收
    log("没找到");
    return null;
  }
}

/**
* 去除字符串全部特殊字符
* @param {*} str 
* @returns 
*/
zzCommonFunc.palindRome = function (str) {
  var arr = str.replace(/[\`:_.~!@#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ·~！@#￥%……&*（）—— \+ ={}|《》？：“”【】、；‘’，。、]/g,
    '');
  return arr;
}

/**
 * 日期字符串转成时间戳
 * 例如'2022-05-20 17:59'
 * @param {*} dateStr 
 * @returns 
 */
zzCommonFunc.dateStrChangeTimeTamp = function (dateStr) {
  dateStr = dateStr.substring(0, 15);
  dateStr = dateStr.replace(/-/g, '/');
  var timeTamp = new Date(dateStr).getTime();
  return timeTamp;
}

/**
* 获取设备ip
* @param {string} screen 
*/
zzCommonFunc.getDeviceIp = function () {
  let networkInterfaces = NetworkInterface.getNetworkInterfaces();
  while (networkInterfaces.hasMoreElements()) {
    let networkInterface = networkInterfaces.nextElement();
    let inetAddresses = networkInterface.getInetAddresses();
    while (inetAddresses.hasMoreElements()) {
      let inetAddress = inetAddresses.nextElement();
      if (inetAddress instanceof Inet6Address) {
        continue;
      }
      let ip = inetAddress.getHostAddress();
      if (!"127.0.0.1".equals(ip)) {
        return inetAddress.getHostAddress();
      }
    }
    sleep(500)
  }
}
/**
* 截图
* @param {string} screen
*/
zzCommonFunc.setScreenshot = function (screen_img) {
  let screen = romServerUrl + "?action=authcmds&params=screencap -pp " + screen_img
  http.get(screen)
  log(screen)
  sleep(5000)
}
/**
* 设置分辨率
* @param {string} size  
*/
zzCommonFunc.setResolving = function (size) {
  let wm = romServerUrl + "?action=authcmds&params=wm size " + size
  try {
    http.get(wm)
    log(wm)
    sleep(2000)
  } catch (error) { }
}
/**
 * 
 * @param {脚本下载地址} url 
 * @param {本地保存路径} path 
 * @param {文件名称} name 
 */
zzCommonFunc.downloadBigFile = function (url, path, name) {
  var res = http.get(url)
  if (res.statusCode != 200) {
    log("请求失败,code:", res.statusCode, " url:", url)
    throw "资源下载失败 " + error
  }
  log(files.ensureDir(path))
  var a = path + name
  log(a)
  files.writeBytes(a, res.body.bytes())
}

/**
 * 
 * @returns 安装SDCRAD本地应用
 */
zzCommonFunc.installSdcradAPK = function (pkg, url, type) {
  try {
    var apk_path = "/sdcard/Download/" + pkg + "." + type //apk存放位置
    var url_name = "/sdcard/Download/"
    /** 本地使用 线上不使用这个方法，使用预下载方式运行 */
    zzCommonFunc.downloadBigFile(url, url_name, pkg + "." + type)
    sleep(5000)
    if (files.exists(apk_path)) {
      http.get(romServerUrl + "?action=installapp&params=" + apk_path)
    } else {
      log("安装文件不存在");
    }
  } catch (error) {
    log(error)
  }
}

// 包名
var pkg_name = ""
var tt = random(1000 * 60 * 100, 1000 * 60 * 120);
log(tt)
var timeout = typeof (timeout) == "number" ? timeout : tt;
var dev = zzCommonFunc.getSize()
var taskInfo = storages.create("cloudcontrol").get("task_info")
var taskid = ""
var advid = ""
var businessType = ""
var country = ""
var tag = "不需要转化任务"
if (taskInfo) {
  taskid = taskInfo.task_id
  advid = taskInfo.task_config.gaid
  businessType = ""
  country = taskInfo.task_config.country
  if (taskInfo.task_config.type == "5001") {
    businessType = "新增"
  } else if (taskInfo.task_config.type == "5002") {
    businessType = "留存"
  }
  if (taskInfo.task_config && taskInfo.task_config.pkg_name) {
    pkg_name = taskInfo.task_config.pkg_name
  }
}

`

const template = `
// 用于 文件下载
importClass(java.io.InputStream);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass("java.net.InetAddress");
importClass("java.net.NetworkInterface");
importClass("java.net.Inet6Address");
//rom服务地址
var romServerUrl = "http://127.0.0.1:8888/"

var zzCommonFunc = {};
/**
 * 通用方法
 * 1.randomSleep 随机睡眠
 * 2.clickIfWidgetExistsRandom 点击坐标随机化
 * 3.closeApp 关闭app
 * 4.oppenApp 打开app
 * 5.randomString 随机生成字符串
 * 6.titleCase 除首字母全部小写
 * 7.getPostDate POST 请求带json
 * 8.newThread 开启一个阻塞线程
 * 9.getSize 获取屏幕数据
 * 10.getPotionInImagePath 用图片路径找位置
 * 11.getPotionInImageBase64  用图片Base64找位置
 * 12.getPotionInImageImg 已经是img类型的找位置
 * 13.getPotion2Color 在一个区域内找颜色
 * 14.installApp 安装app
 * 15.downloadBigFile 下载大文件
 * 16.palindRome 去除字符串全部特殊字符
 * 17.dateStrChangeTimeTamp 日期字符串转成时间戳
 */

/**
 * randomSleep(dur1,dur2)随机睡眠单位毫秒
 * @param {*} min 随机数1
 * @param {*} max 随机数2
 * @returns 
 */
zzCommonFunc.randomSleep = function (min, max) {
  if (max) {
    sleep(random(min, max))
  } else if (min) {
    sleep(random((min + 2) * 2, (min + 2) * 3))
  }
  else {
    sleep(random(500, 1500))
  }
  return true
}

/**
 * clickIfWidgetExistsRandom 坐标点击，点击事件坐标随机化处理
 * @param {*} widget 目标节点
 * @returns 返回点击结果
 */
zzCommonFunc.clickIfWidgetExistsRandom = function (widget) {
  try {
    return widget.visibleToUser() && clickRandom(random(widget.bounds().centerX() - 3, widget.bounds().centerX() + 3), random(widget.bounds().centerY() - 3, widget.bounds().centerY() + 3))
  } catch (error) {
    log(error)
  }
  return false
}
/**
 * 关闭app
 * @param {*} pkg 包名
 */
zzCommonFunc.closeApp = function (pkg) {
  let sh = romServerUrl + "?action=authcmds&params=am force-stop " + pkg
  try {
    http.get(sh)
    log(sh)
    sleep(2000)
  } catch (error) { }
}
/**
 * 打开app
 * @param {*} pkg 
 */
zzCommonFunc.oppenApp = function (pkg) {
  launch(pkg)
}

/**
 * 随机生成字符串
 * @param {*} length 生成字符串长度
 * @returns 
 */
zzCommonFunc.randomString = function (length) {
  var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var result = ''
  for (var i = length; i > 0; --i)
    result += str[Math.floor(Math.random() * str.length)]
  return result
}
/**
 * 除第一个字母外全转小写
 * @param {*} str 字符串
 * @returns 
 */
zzCommonFunc.titleCase = function (str) {
  var arr = str.split(" ");
  var _length = arr.length;
  for (var i = 0; i < _length; i++) {
    arr[i] = arr[i][0].toUpperCase() + arr[i].substring(1, arr[i].length).toLowerCase();
    str = arr.join(" ");
  }
  return str;
}
/**
 * POST 请求带json
 * @param {*} url 请求连接
 * @param {*} postJson post的json数据
 */
zzCommonFunc.getPostDate = function (url, postJson) {
  var respone = http.postJson(url, postJson);
  return respone.body.string()
}

/**
 * newThread 开启一个阻塞线程
 * @param {Function} doBusiness 业务回调函数
 * @param {any} result 默认返回值
 * @param {Number=12000} timeout 线程超时时间（毫秒）
 * @param {Function} timeoutCall 线程超时回调
 */
zzCommonFunc.newThread = function (doBusiness, result, timeout, timeoutCall) {
  let errMsg = null
  let result = result
  let timeout = typeof (timeout) == "number" ? timeout : 120000    //  默认超时时间为 2 分钟
  let doBusiness = typeof (doBusiness) == "function" ? doBusiness : () => { }
  let timeoutCall = typeof (timeoutCall) == "function" ? timeoutCall : () => { }
  let is_timeout = true
  let thread = threads.start(function () {
    try {
      result = doBusiness()
    } catch (error) {
      errMsg = error
    }
    is_timeout = false
  })
  thread.join(timeout)
  thread.interrupt()
  if (errMsg) { throw errMsg }
  try { is_timeout && timeoutCall() } catch (error) { throw error }
  return result
}
/**
 * getSize()获取屏幕数据
 * @returns dev 
 */
zzCommonFunc.getSize = function () {
  let w = device.width
  let h = device.height
  let dev = {}
  dev.res = w + 'x' + h
  dev.w = w
  dev.h = h
  log(dev)
  return dev
}

/**
 * getPotionInImagePath 用图片路径找位置
 * @param {*} targetImage 目标路径
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImagePath = function (targetImage, screenImage, screenSize) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  var tar_img = images.read(targetImage);//targetImage是路径
  //var tar_img = targetImage;//targetImage是img类型
  // var tar_img = images.fromBase64(targetImage);//如果targetImage是base64用这句
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
  } else {
    log("无图片")
    return point
  }
  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  // if (point) {
  //     log("image found point1: " + point) 
  //     point.x = Math.round(Math.random()*30) + parseInt((point.x) * w1/img_w); //shell截图固定是854*480
  //     point.y = Math.round(Math.random()*10) + parseInt((point.y) * h1/img_h)
  //     log("image found point2: " + point) 
  // }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}
/**
 * getPotionInImageBase64 用图片Base64找位置
 * @param {*} targetImageBase64 目标图片的base64编码
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImageBase64 = function (targetImageBase64, screenImage, screenSize) {
  // var h1 = parseInt(screenSize.h)
  // var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  //var tar_img = targetImage;//targetImage是img类型
  var tar_img = images.fromBase64(targetImageBase64);//如果targetImage是base64用这句
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
    // log('坐标', point)
  } else {
    log("无图片")
    return point
  }
  // var img_h = 854;//shell截图固定是854*480或者480*854
  // var img_w = 480;
  // // var rotation = device.getRotation()//获取屏幕方向
  // var rotation = 1
  // if(rotation == 1){//正向横屏
  //     img_h = 480;
  //     img_w = 854;
  // }
  // if (point) {
  //     log("image found point1: " + point) 
  //     point.x = Math.round(Math.random()*30) + parseInt((point.x) * w1/img_w); //shell截图固定是854*480
  //     point.y = Math.round(Math.random()*10) + parseInt((point.y) * h1/img_h)
  //     log("image found point2: " + point) 
  // }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}
/**
 * getPotionInImageImg 已经是img类型的找位置
 * @param {*} targetImageBase64 目标图片已经是autojs的img类型
 * @param {*} screenImage 屏幕图片的路径
 * @param {*} screenSize 屏幕分辨率
 * @returns 位置坐标
 */
zzCommonFunc.getPotionInImageImg = function (targetImage, screenImage, screenSize) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  var screen_img = images.read(screenImage);
  var tar_img = targetImage;//targetImage是img类型
  var point = null
  if (screen_img && tar_img) {
    log("有图片")
    point = findImage(screen_img, tar_img);
  } else {
    log("无图片")
    return point
  }
  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  if (point) {
    log("image found point1: " + point)
    point.x = Math.round(Math.random() * 30) + parseInt((point.x) * w1 / img_w); //shell截图固定是854*480
    point.y = Math.round(Math.random() * 10) + parseInt((point.y) * h1 / img_h)
    log("image found point2: " + point)
  }
  screen_img.recycle()//回收图片
  tar_img.recycle()//回收图片
  return point
}

/**
 * 在一个区域内找颜色
 * @param {*} color 颜色
 * @param {*} left 左
 * @param {*} top 上
 * @param {*} h 高
 * @param {*} w 宽
 * @param {*} threshold 找色时颜色相似度的临界值，范围为0~255（越小越相似，0为颜色相等，255为任何颜色都能匹配）。默认为4。threshold和浮点数相似度(0.0~1.0)的换算为 similarity = (255 - threshold) / 255.
 * @param {*} screenSize 屏幕分辨率
 * @param {*} temp_imag 图片路径
 * @returns 
 */
zzCommonFunc.getPotion2Color = function (color, left, top, h, w, threshold, screenSize, temp_imag) {
  var h1 = parseInt(screenSize.h)
  var w1 = parseInt(screenSize.w)
  //读图片
  var img = images.read(temp_imag)
  zzCommonFunc.randomSleep(500, 1500)
  if (!img) {
    log("图片不存在")
    return null;
  }
  var point = findColor(img, color, {
    region: [left, top, w, h],
    threshold: threshold
  });

  var img_h = 854;//shell截图固定是854*480或者480*854
  var img_w = 480;
  // var rotation = device.getRotation()//获取屏幕方向
  var rotation = 1
  if (rotation == 1) {//正向横屏
    img_h = 480;
    img_w = 854;
  }
  if (point) {
    //shell截图需转换
    var yy = Math.round(Math.random() * 10) + parseInt((point.y) * h1 / img_h);
    var xx = Math.round(Math.random() * 30) + parseInt((point.x) * w1 / img_w);
    var pot = {}
    pot.x = xx;
    pot.y = yy;
    log("找到接收按钮附近，坐标为(" + xx + ", " + yy + ")");
    img.recycle() //回收
    return pot;
  } else {
    img.recycle() //回收
    log("没找到");
    return null;
  }
}

/**
* 去除字符串全部特殊字符
* @param {*} str 
* @returns 
*/
zzCommonFunc.palindRome = function (str) {
  var arr = str.replace(/[\`:_.~!@#$%^&*() \+ =<>?"{}|, \/ ;' \\ [ \] ·~！@#￥%……&*（）—— \+ ={}|《》？：“”【】、；‘’，。、]/g,
    '');
  return arr;
}

/**
 * 日期字符串转成时间戳
 * 例如'2022-05-20 17:59'
 * @param {*} dateStr 
 * @returns 
 */
zzCommonFunc.dateStrChangeTimeTamp = function (dateStr) {
  dateStr = dateStr.substring(0, 15);
  dateStr = dateStr.replace(/-/g, '/');
  var timeTamp = new Date(dateStr).getTime();
  return timeTamp;
}

/**
* 获取设备ip
* @param {string} screen 
*/
zzCommonFunc.getDeviceIp = function () {
  let networkInterfaces = NetworkInterface.getNetworkInterfaces();
  while (networkInterfaces.hasMoreElements()) {
    let networkInterface = networkInterfaces.nextElement();
    let inetAddresses = networkInterface.getInetAddresses();
    while (inetAddresses.hasMoreElements()) {
      let inetAddress = inetAddresses.nextElement();
      if (inetAddress instanceof Inet6Address) {
        continue;
      }
      let ip = inetAddress.getHostAddress();
      if (!"127.0.0.1".equals(ip)) {
        return inetAddress.getHostAddress();
      }
    }
    sleep(500)
  }
}
/**
* 截图
* @param {string} screen
*/
zzCommonFunc.setScreenshot = function (screen_img) {
  let screen = romServerUrl + "?action=authcmds&params=screencap -pp " + screen_img
  http.get(screen)
  log(screen)
  sleep(5000)
}
/**
* 设置分辨率
* @param {string} size  
*/
zzCommonFunc.setResolving = function (size) {
  let wm = romServerUrl + "?action=authcmds&params=wm size " + size
  try {
    http.get(wm)
    log(wm)
    sleep(2000)
  } catch (error) { }
}
/**
 * 
 * @param {脚本下载地址} url 
 * @param {本地保存路径} path 
 * @param {文件名称} name 
 */
zzCommonFunc.downloadBigFile = function (url, path, name) {
  var res = http.get(url)
  if (res.statusCode != 200) {
    log("请求失败,code:", res.statusCode, " url:", url)
    throw "资源下载失败 " + error
  }
  log(files.ensureDir(path))
  var a = path + name
  log(a)
  files.writeBytes(a, res.body.bytes())
}

/**
 * 
 * @returns 安装SDCRAD本地应用
 */
zzCommonFunc.installSdcradAPK = function (pkg, url, type) {
  try {
    var apk_path = "/sdcard/Download/" + pkg + "." + type //apk存放位置
    var url_name = "/sdcard/Download/"
    /** 本地使用 线上不使用这个方法，使用预下载方式运行 */
    zzCommonFunc.downloadBigFile(url, url_name, pkg + "." + type)
    sleep(5000)
    if (files.exists(apk_path)) {
      http.get(romServerUrl + "?action=installapp&params=" + apk_path)
    } else {
      log("安装文件不存在");
    }
  } catch (error) {
    log(error)
  }
}

// 包名
var pkg_name = ""
var tt = random(1000 * 60 * 100, 1000 * 60 * 120);
log(tt)
var timeout = typeof (timeout) == "number" ? timeout : tt;
var dev = zzCommonFunc.getSize()
var taskInfo = storages.create("cloudcontrol").get("task_info")
var taskid = ""
var advid = ""
var businessType = ""
var country = ""
var tag = "不需要转化任务"
if (taskInfo) {
  taskid = taskInfo.task_id
  advid = taskInfo.task_config.gaid
  businessType = ""
  country = taskInfo.task_config.country
  if (taskInfo.task_config.type == "5001") {
    businessType = "新增"
  } else if (taskInfo.task_config.type == "5002") {
    businessType = "留存"
  }
  if (taskInfo.task_config && taskInfo.task_config.pkg_name) {
    pkg_name = taskInfo.task_config.pkg_name
  }
}

function initApp () {
  var al_collect = []//已经收集的app数组
  var open_app = [];//已经打开的app的数组
  var temp_imag = "/sdcard/Download/done_screen.png"

  var index = 0
  var noinapp = 0;
  var look_ad_num = 0;//看广告数
  var look_a = 0;//在广告页
  var else_num = 0;
  var ad_play_num1 = 0;//记录打开连续打开的次数，超过3次可能是网络问题，先玩一下游戏
  var play_fail_num = 0;

  var click_rate_control = 30;
  if (businessType == "留存") {
    click_rate_control = 50
  }

  /**
  * 游戏点击行为统一使用方法
  * @param {string} image_base64 
  * @param {string} screen 
  * @param {string} unit 
  * @param {boolean} isAd 
  * @param {number} time 
  */
  function handleClick (image_base64, screen, unit, isAd, time) {
    time = time || 2000
    isAd = isAd || false
    var tags = zzCommonFunc.getPotionInImageBase64(image_base64, screen, dev)
    if (tags) {
      log('判断是否进入' + isAd)
      flag = 0
      log(unit, tags)
      click(tags.x, tags.y)
      sleep(time)
      if (isAd) getAdView()
      zzCommonFunc.setScreenshot(temp_imag)
      sleep(1000)
    }
    return !!tags
  }


  function getAdView () {
    zzCommonFunc.setScreenshot(temp_imag)
    sleep(2000)
    log("是否在游戏页1")
    if (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {

      look_ad_num = look_ad_num + 1;//观看广告次数+1
      log("广告页内 " + look_ad_num)
      try {
        sleep(3000)
        zzCommonFunc.setScreenshot(temp_imag)
        sleep(2000)
        log("是否在游戏页2")
        if (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {
          zzCommonFunc.randomSleep(60000, 70000)
        }

      } catch (error) {
        log(error)
      }
    }
  }
  // 
  while (1) {
    // Math.floor(25+Math.random()*(30-25+1))
    if (index >= Math.floor(25 + Math.random() * (30 - 25 + 1))) {
      log("结束游戏")
      return
    }
    if (packageName(pkg_name).visibleToUser().findOnce()) {
      noinapp = 0;
      zzCommonFunc.setScreenshot(temp_imag)
      sleep(1000)
      if (id("android:id/title").text("Open with Browser").visibleToUser().findOnce()) {
        play_fail_num = 0;
        ad_play_num1 = 0
        else_num = 0;
        look_a = 0;
        zzCommonFunc.clickIfWidgetExistsRandom(id("android:id/title").text("Open with Browser").visibleToUser().findOnce())
        if (id("button_always").visibleToUser().findOnce()) {
          log("选择总是")
          zzCommonFunc.clickIfWidgetExistsRandom(id("button_always").visibleToUser().findOnce())
          sleep(300)
        }
      } else if (id("android:id/text1").text("Browser").visibleToUser().findOnce()) {
        play_fail_num = 0;
        ad_play_num1 = 0
        else_num = 0;
        look_a = 0;
        zzCommonFunc.clickIfWidgetExistsRandom(id("android:id/text1").text("Browser").visibleToUser().findOnce())
        if (id("button_always").visibleToUser().findOnce()) {
          log("选择总是2")
          zzCommonFunc.clickIfWidgetExistsRandom(id("button_always").visibleToUser().findOnce())
          sleep(300)
        }
      } else if (className("android.widget.Button").textContains("Close").findOnce()) {
        play_fail_num = play_fail_num + 1;
        log("视频播放失败")
        zzCommonFunc.clickIfWidgetExistsRandom(className("android.widget.Button").textContains("Close").findOnce())
        zzCommonFunc.randomSleep(3000, 5000)
        if (play_fail_num > 10) {
          play_fail_num = 0
          zzCommonFunc.closeApp(pkg_name)
          log("重启")
          zzCommonFunc.oppenApp(pkg_name)
          zzCommonFunc.randomSleep(10000, 20000)
        }
      } else if (className("android.widget.TextView").textContains("close").findOnce()) {
        play_fail_num = play_fail_num + 1;
        log("视频播放失败")
        zzCommonFunc.clickIfWidgetExistsRandom(className("android.widget.TextView").textContains("close").findOnce())
        zzCommonFunc.randomSleep(3000, 5000)
        if (play_fail_num > 10) {
          zzCommonFunc.closeApp(pkg_name)
          log("重启")
          zzCommonFunc.oppenApp(pkg_name)
          zzCommonFunc.randomSleep(10000, 20000)
        }
      } else if (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {
        play_fail_num = 0;
        ad_play_num1 = 0
        else_num = 0;
        look_a = look_a + 1;
        if (look_a >= 3) {
          var flag = 0
          while (className("android.widget.TextView").visibleToUser().visibleToUser().findOnce()) {
            flag = flag + 1;
            back();
            zzCommonFunc.randomSleep(100, 200)
            if (flag > 10) {
              zzCommonFunc.closeApp(pkg_name)
              log("开启app3")
              zzCommonFunc.oppenApp(pkg_name)
              zzCommonFunc.randomSleep(10000, 20000)
            }
          }
        }

        var gp_flag = 1;
        var click_r = random(0, 100)//随机数

        log("click_r:" + click_r)
        while (packageName("com.android.vending").findOnce()) {//在gp页时返回到app
          log("在gp页返回1")
          back();//回退
          zzCommonFunc.randomSleep(3000, 5000)
          gp_flag = 0;
        }

        if (className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).depth(8).clickable(true).visibleToUser().findOnce()) {
          log("退1")

          className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).depth(8).clickable(true).visibleToUser().findOnce().click()
          zzCommonFunc.randomSleep(8000, 10000)
        }

        if (click_r > click_rate_control && gp_flag) {//点击率控制调整
          if (className("android.widget.TextView").visibleToUser().text("GET").findOnce()) {
            zzCommonFunc.clickIfWidgetExistsRandom(className("android.widget.TextView").visibleToUser().text("GET").findOnce())
            zzCommonFunc.randomSleep(8000, 10000)
            var other_app_name = ""
          }
        }
        while (packageName("com.android.vending").findOnce()) {//在gp页时返回到app
          log("在gp页返回2")
          back();//回退
          zzCommonFunc.randomSleep(3000, 5000)
          gp_flag = 0;
        }
        zzCommonFunc.randomSleep(100, 200)

        if (className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).clickable(true).visibleToUser().findOnce()) {
          log("退2")
          className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).clickable(true).visibleToUser().findOnce().click()
          zzCommonFunc.randomSleep(8000, 10000)
          if (!packageName("com.android.browser").visibleToUser().findOnce()) {
            index++;
            log('看完广告' + index)
            getPostOfferState(1, taskid, advid, 1, pkg_name, tag, businessType)

          }
        }
        if (click_r > click_rate_control && gp_flag) {//点击率控制调整
          if (className("android.widget.TextView").visibleToUser().text("GET").findOnce()) {
            zzCommonFunc.clickIfWidgetExistsRandom(className("android.widget.TextView").visibleToUser().text("GET").findOnce())
            zzCommonFunc.randomSleep(8000, 10000)
            var other_app_name = ""
          }
        }
        while (packageName("com.android.vending").findOnce()) {//在gp页时返回到app
          log("在gp页返回3")
          back();//回退
          zzCommonFunc.randomSleep(3000, 5000)
          gp_flag = 0;
        }
        zzCommonFunc.randomSleep(100, 200)
        if (className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).depth(9).clickable(true).visibleToUser().findOnce()) {
          log("退3")
          className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).depth(9).clickable(true).visibleToUser().findOnce().click()
          zzCommonFunc.randomSleep(8000, 10000)
        }
        if (click_r > click_rate_control && gp_flag) {//点击率控制调整
          if (className("android.widget.TextView").visibleToUser().text("GET").findOnce()) {
            zzCommonFunc.clickIfWidgetExistsRandom(className("android.widget.TextView").visibleToUser().text("GET").findOnce())
            zzCommonFunc.randomSleep(8000, 10000)
          }
        }
        while (packageName("com.android.vending").findOnce()) {//在gp页时返回到app
          log("在gp页返回4")
          back();//回退
          zzCommonFunc.randomSleep(3000, 5000)
          gp_flag = 0;
        }
        zzCommonFunc.randomSleep(100, 200)
        if (className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).clickable(true).visibleToUser().findOnce()) {
          log("退4")
          className("android.view.View").boundsInside(dev.w / 2, 0, dev.w, dev.h / 2).clickable(true).visibleToUser().findOnce().click()
          zzCommonFunc.randomSleep(8000, 10000)
          if (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {
            log(click(1321, 194))
            zzCommonFunc.randomSleep(4000, 6000)
            back()
            zzCommonFunc.randomSleep(2000, 3000)
            log(click(1372, 53))
            back()
            zzCommonFunc.randomSleep(3000, 4000)
            log(click(1372, 184))
            back()
            zzCommonFunc.randomSleep(8000, 10000)
            log(click(1367, 55))
            back()
          }
        }
        if (!gp_flag) {
          try {
            getPostOfferState(1, taskid, advid, 2, pkg_name, tag, businessType)
          } catch (error) {
            log(error)
          }
        }

        while (id("com.android.packageinstaller:id/permission_allow_button").findOnce()) {
          log("权限允许")
          zzCommonFunc.clickIfWidgetExistsRandom(id("com.android.packageinstaller:id/permission_allow_button").findOnce())
          back()
          sleep(1000)
        }
        if (packageName("com.android.browser").visibleToUser().findOnce()) {
          log("返回浏览器")
          back()
          sleep(1000)
          getPostOfferState(1, taskid, advid, 2, pkg_name, tag, businessType)
        }
        if (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {
          log(click(1321, 194))
          zzCommonFunc.randomSleep(4000, 6000)
          back()
          zzCommonFunc.randomSleep(2000, 3000)
          log(click(1372, 53))
          zzCommonFunc.randomSleep(3000, 4000)
          log(click(1372, 184))
          zzCommonFunc.randomSleep(8000, 10000)
          log(click(1367, 55))
          zzCommonFunc.randomSleep(2000, 4000)
          if (!(className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce())) {
            index++;
            log('1看完广告' + index)
            getPostOfferState(1, taskid, advid, 1, pkg_name, tag, businessType)
          }

        }
        var flag = 0
        //判断是否还在广告内
        while (className("android.widget.VideoView").visibleToUser().findOnce() || className("android.view.View").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.TextView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce() || className("android.widget.ImageView").boundsInside(0, 0, dev.w, dev.h / 2).visibleToUser().findOnce()) {
          flag = flag + 1;//一直退不出去就重启app
          back();//回退
          zzCommonFunc.randomSleep(1000, 2000)
          if (flag > 10) {
            zzCommonFunc.closeApp(pkg_name)
            log("开启app4")
            zzCommonFunc.oppenApp(pkg_name)
            zzCommonFunc.randomSleep(10000, 20000)
          }
        }

      }
      else {
        play_fail_num = 0;
        else_num = else_num + 1;
        if (else_num > 20) {
          else_num = 0;
          log("卡死重开")
          zzCommonFunc.closeApp(pkg_name)
          log("开启app5")
          zzCommonFunc.oppenApp(pkg_name)
          zzCommonFunc.randomSleep(10000, 20000)
        }
        look_a = 0;
        var flag = 1;
        // 游戏行为 统一使用方法handleClick


        if (flag) {
          else_num = else_num + 5
        }
      }
    } else {
      look_a = 0;
      if (id("android:id/title").text("Open with Browser").visibleToUser().findOnce()) {
        play_fail_num = 0;
        ad_play_num1 = 0
        else_num = 0;
        look_a = 0;
        zzCommonFunc.clickIfWidgetExistsRandom(id("android:id/title").text("Open with Browser").visibleToUser().findOnce())
        if (id("button_always").visibleToUser().findOnce()) {
          log("选择总是")
          zzCommonFunc.clickIfWidgetExistsRandom(id("button_always").visibleToUser().findOnce())
          sleep(300)
        }
      } else if (id("android:id/text1").text("Browser").visibleToUser().findOnce()) {
        play_fail_num = 0;
        ad_play_num1 = 0
        else_num = 0;
        look_a = 0;
        zzCommonFunc.clickIfWidgetExistsRandom(id("android:id/text1").text("Browser").visibleToUser().findOnce())
        if (id("button_always").visibleToUser().findOnce()) {
          log("选择总是2")
          zzCommonFunc.clickIfWidgetExistsRandom(id("button_always").visibleToUser().findOnce())
          sleep(300)
        }
      }
      if (packageName("com.android.browser").className("android.widget.EditText").visibleToUser().findOnce()) {
        sleep(random(1000, 3000))
        log("返回，返回")
        zzCommonFunc.closeApp(pkg_name)
        zzCommonFunc.randomSleep(1000, 2000)
        zzCommonFunc.oppenApp(pkg_name)
        zzCommonFunc.randomSleep(5000, 10000)
      }
      if (id("com.android.packageinstaller:id/permission_allow_button").findOnce()) {
        log("权限允许")
        zzCommonFunc.clickIfWidgetExistsRandom(id("com.android.packageinstaller:id/permission_allow_button").findOnce())
        sleep(1000)
      }
      if (packageName("com.android.vending").findOnce()) {
        zzCommonFunc.randomSleep(5000, 10000)
        log("重开2")
        back()
        sleep(2000)
        back()
        zzCommonFunc.closeApp(pkg_name)
        zzCommonFunc.randomSleep(1000, 2000)
        zzCommonFunc.oppenApp(pkg_name)
        zzCommonFunc.randomSleep(5000, 10000)
      }
      noinapp = noinapp + 1;
      if (noinapp >= 5) {
        log("崩溃重开")
        zzCommonFunc.oppenApp(pkg_name)
        sleep(5000)
      }
      if (noinapp > 20) {
        log('找不到应用包，结束脚本')
        return
      }
    }
  }

}


/**
 * 
 * @param {*} postUrl 请求连接
 * @param {*} name 第三方包名
 * @param {*} load_url 下载连接
 * @param {*} screen_img 落地页
 * @param {*} done_img gp页
 * @param {*} pkg_name 当前包名
 */
function getPostDate (postUrl, name, load_url, screen_img, done_img, pkg_name) {
  var img = images.read(screen_img);
  var img2 = images.read(done_img);
  if (!img) {
    log("没有图片1")
  }
  var base64 = "";
  base64 = images.toBase64(img)
  if (base64 == "") {
    log("空1")
  }
  if (!img2) {
    log("没有图片2")
  }
  var done_base64 = "";
  done_base64 = images.toBase64(img2)
  if (done_base64 == "") {
    log("空2")
  }
  try {
    var res = http.postMultipart(postUrl, {
      appid: pkg_name,
      name: name,
      url: load_url,
      base64data: base64,
      base64middle: done_base64
    });
    log(res.body.string());
  } catch (error) {
    log(error)
  }
}
/**
 * 
 * @param {*} count 次数
 * @param {*} taskid 任务id
 * @param {*} advid 
 * @param {*} type 类型1.展示，2.点击，3.转化
 * @param {*} pkg_name 包名
 */
function getPostOfferState (count, taskid, advid, type, pkg_name, tag, businessType) {
  var postUrl = "https://stat.motayun.net/report/v1/stat"
  var url = postUrl + "?appid=" + pkg_name + "&taskid=" + taskid + "&advid=" + advid + "&type=" + type + "&count=" + count + "&tag=" + tag + "&business=" + businessType
  log(url)
  try {
    var res = http.post(url, {});
    log(res.body.string());
  } catch (error) {
    log(error)
  }
}

zzCommonFunc.newThread(function () {
  initApp()
}, false, timeout, () => {
})
`

module.exports = {
  util,
  template
}