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
    return widget.visibleToUser() && click(random(widget.bounds().centerX() - 3, widget.bounds().centerX() + 3), random(widget.bounds().centerY() - 3, widget.bounds().centerY() + 3))
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
  var arr = str.replace(/[\`:_.~!@#$%^&*() + =<>?"{}|, / ;' \ [ ] ·~！@#￥%……&*（）—— + ={}|《》？：“”【】、；‘’，。、]/g,
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

/**
 * 
 * @param {*} count 次数
 * @param {*} taskid 任务id
 * @param {*} advid 
 * @param {*} type 类型1.展示，2.点击，3.转化
 * @param {*} pkg_name 包名
 */
zzCommonFunc.getPostOfferState = function (count, taskid, advid, type, pkg_name, tag, businessType) {
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
`

const baseTemplate = `// 用于 文件下载
importClass(java.io.InputStream);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass("java.net.InetAddress");
importClass("java.net.NetworkInterface");
importClass("java.net.Inet6Address");
const version = 'v1.1.7-release'
const localPath = "/sdcard/Download/zzCommonUtil"
const utilPath = "/sdcard/Download/zzCommonUtil-" + version + '.zip'
const ftpPath = "/cloudcontrol/prod/commonutil/zzCommonUtil-" + version + ".zip"

void (() => {
  const storage = storages.create("expires")
  toastLog('该设备是否有工具包：' + files.exists(utilPath))
  if (files.exists(utilPath) && files.exists(localPath) && storage.get('expires') > new Date().getTime()) return
  files.exists(utilPath) && files.remove(utilPath)
  let errMsg, prg = 0, rootStatus = 1
  try { java.lang.Runtime.getRuntime().exec('su') } catch (error) { rootStatus = 0 }
  const res = http.get(encodeURI('http://apicc.motayun.net/api/v1/ftpAccount/random/' + rootStatus), { headers: { "Connection": "close" } })
  const ipInfo = res ? res.body.json().data : {}
  let createTask = com.stardust.sdk.zzftp.FTPManager.createTask(ipInfo.host, 'ftpuser', 'ftppasswd', ftpPath, utilPath, true, 1024 * 1024);
  com.stardust.sdk.zzftp.FTPManager.stopDownload(createTask, {})
  com.stardust.sdk.zzftp.FTPManager.load(createTask, {
    onProgress: (progress) => prg = progress,
    onFailure: (code, errorMsg) => errMsg = errorMsg
  })
  for (let sleepCount = 0; sleepCount < 10 && !errMsg; sleepCount++) {
    if (+prg === 100) break
    sleep(1000)
  }
  if (!ipInfo.host) throw '获取ftp地址失败'
  if (!files.exists(utilPath)) throw '工具包下载失败，请检查网络或下载链接'
  $zip.unzip(utilPath, '/sdcard/Download/');
  if (!files.exists(localPath)) throw '工具包解压失败，请检查解压文件夹是否zzCommonUtil命名'
  toastLog('工具包已准备好')
  storage.put('expires', (new Date(+new Date() + 24 * 60 * 60 * 1000)).getTime())
})()

var zzCommonFunc = require(localPath + '/zzCommonUtil.js')
var { timeout, tempImag } = require(localPath + '/constant.js')
var pkgName = "pendingPkgName"
var apkType = 'apk'

function gameAction () {
  // 行为操作 zzCommonFunc.clickAction 广告第四个参数需要设为true
  zzCommonFunc.setScreenshot(tempImag)
}

zzCommonFunc.taskMainThread(pkgName, () => {}, () => {
  // zzCommonFunc.appCommonAction 第三个参数为是否循环，第四个参数是否IAA
  zzCommonFunc.newThread(() => zzCommonFunc.appCommonAction(pkgName, gameAction, true, true), false, timeout, () => { })
}, () => { }, apkType, version)


`

const calculatorTemplate = `// 用于 文件下载
importClass(java.io.InputStream);
importClass(java.io.File);
importClass(java.io.FileOutputStream);
importClass("java.net.InetAddress");
importClass("java.net.NetworkInterface");
importClass("java.net.Inet6Address");
const version = 'v1.1.7-release'
const localPath = "/sdcard/Download/zzCommonUtil"
const utilPath = "/sdcard/Download/zzCommonUtil-" + version + '.zip'
const ftpPath = "/cloudcontrol/prod/commonutil/zzCommonUtil-" + version + ".zip"

void (() => {
  const storage = storages.create("expires")
  toastLog('该设备是否有工具包：' + files.exists(utilPath))
  if (files.exists(utilPath) && files.exists(localPath) && storage.get('expires') > new Date().getTime()) return
  files.exists(utilPath) && files.remove(utilPath)
  let errMsg, prg = 0, rootStatus = 1
  try { java.lang.Runtime.getRuntime().exec('su') } catch (error) { rootStatus = 0 }
  const res = http.get(encodeURI('http://apicc.motayun.net/api/v1/ftpAccount/random/' + rootStatus), { headers: { "Connection": "close" } })
  const ipInfo = res ? res.body.json().data : {}
  let createTask = com.stardust.sdk.zzftp.FTPManager.createTask(ipInfo.host, 'ftpuser', 'ftppasswd', ftpPath, utilPath, true, 1024 * 1024);
  com.stardust.sdk.zzftp.FTPManager.stopDownload(createTask, {})
  com.stardust.sdk.zzftp.FTPManager.load(createTask, {
    onProgress: (progress) => prg = progress,
    onFailure: (code, errorMsg) => errMsg = errorMsg
  })
  for (let sleepCount = 0; sleepCount < 10 && !errMsg; sleepCount++) {
    if (+prg === 100) break
    sleep(1000)
  }
  if (!ipInfo.host) throw '获取ftp地址失败'
  if (!files.exists(utilPath)) throw '工具包下载失败，请检查网络或下载链接'
  $zip.unzip(utilPath, '/sdcard/Download/');
  if (!files.exists(localPath)) throw '工具包解压失败，请检查解压文件夹是否zzCommonUtil命名'
  toastLog('工具包已准备好')
  storage.put('expires', (new Date(+new Date() + 24 * 60 * 60 * 1000)).getTime())
})()

function getCalculatorUtil () {
  if (files.exists('/sdcard/Download/calculatorCommonUtil.js')) {
    return require('/sdcard/Download/calculatorCommonUtil.js')
  }
  zzCommonFunc.downloadBigFile('/cloudcontrol/prod/commonutil/calculatorCommonUtil.js', '/sdcard/Download/', 'calculatorCommonUtil.js')
  return require('/sdcard/Download/calculatorCommonUtil.js')
}

var zzCommonFunc = require(localPath + '/zzCommonUtil.js')
var { taskInfo, businessType, businessType, timeout, tempImag } = require(localPath + '/constant.js')
var { initApp } = getCalculatorUtil()
var pkgName = "pendingPkgName"
var appName = "pendingAppName"
var apkType = 'apk'

function gameAction () {
  // 行为操作 zzCommonFunc.clickAction 广告第四个参数需要设为true
  zzCommonFunc.setScreenshot(tempImag)
}

zzCommonFunc.taskMainThread(pkgName, () => {}, () => {
  // zzCommonFunc.appCommonAction 第三个参数为是否循环，第四个参数是否IAA
  zzCommonFunc.newThread(function () {
    if (businessType === '留存' || !taskInfo) {
      zzCommonFunc.appCommonAction(pkgName, gameAction, true, true)
      return
    }
    if (app.launch(pkgName)) throw "设备中已存在:" + pkgName
    initApp(() => zzCommonFunc.appCommonAction(pkgName, gameAction, true, true), apkType, true, appName)
  }, false, timeout, () => { })
}, () => { }, apkType, version)


`

const project = `{
  "name": "zzap",
  "main": "pendingPkgName.js",
  "ignore": [
  ],
  "packageName": "com.script.zzad",
  "versionName": "1.0.0",
  "versionCode": 1
}`

module.exports = {
  util,
  project,
  baseTemplate,
  calculatorTemplate
}