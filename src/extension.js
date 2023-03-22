const vscode = require('vscode');
const _ = require('lodash');
const path = require('path');
const { createModule } = require('./config/createModule');
const { base64 } = require('./config/base64');
const { phoneView, receiveMessage } = require('./config/phoneView');
const { connectADB, adbShell, adbPull, getDeviceList } = require('./config/adb');
const { Type } = require('../constant');
const localImg = require('./config/localImg');


function extension () {
  this.extension = {}
  this.device = ''
  this.currentPanel = null
  this.isRecord = false
  this.recordContent = []
  this.pointList = []
  this.startTime = new Date().getTime()
  this.currentTime = 0
  this.isLocalImg = false
}

extension.prototype.commonUtil = function (uri, context) {
  createModule(Type.Util, uri)
}

extension.prototype.commonModule = function (uri, context) {
  createModule(Type.Template, uri)
}

extension.prototype.phoneView = function (uri, context) {
  if (!this.device && !this.isLocalImg) {
    vscode.window.showErrorMessage('还没连接设备 ==！')
    return
  }
  this.currentPanel = phoneView(context)
  receiveMessage(this.currentPanel, (data) => {
    if (data.type === 'keyup') {
      this.pointList = []
      return
    }
    if (data.type === 'gesture') {
      this.pointList.push(data.x, data.y)
      vscode.env.clipboard.writeText(_.join(this.pointList, ','))
      return
    }
    if (data.type !== 'click') return
    if (!this.isRecord) {
      vscode.env.clipboard.writeText(data.text)
      return
    }
    this.currentTime = new Date().getTime()
    this.recordContent.push(data.text)
    if (this.startTime) {
      this.recordContent.push(`sleep(${this.currentTime - this.startTime})`)
    }
    this.startTime = new Date().getTime()
  })
}

extension.prototype.connectADB = async function (uri, context) {
  let list = []
  const imagePath = path.join(context.extensionPath, 'media', 'screenshot.png')
  this.device = await connectADB(context)
  await adbShell(this.device, 'screencap -p /sdcard/screenshot.png')
  await adbPull(this.device, '/sdcard/screenshot.png', imagePath)
  let timers = setInterval(async () => {
    list = await getDeviceList()
    if (!this.device || !list.includes(this.device)) {
      this.device = ''
      clearInterval(timers)
      vscode.window.showErrorMessage('该设备已断开')
      return
    }
    await adbShell(this.device, 'screencap -p /sdcard/screenshot.png')
    await adbPull(this.device, '/sdcard/screenshot.png', imagePath)
  }, 3000)
}

extension.prototype.openRecord = function () {
  if (!this.device) {
    vscode.window.showErrorMessage('还没连接设备 ==！')
    return
  }
  !this.isRecord && vscode.window.showInformationMessage('开启录制，注意每一次的点击都会记录。')
  this.isRecord = true
  this.startTime = new Date().getTime()
}

extension.prototype.closeRecord = function () {
  if (!this.device) {
    vscode.window.showErrorMessage('还没连接设备 ==！')
    return
  }
  if (!this.isRecord) {
    vscode.window.showErrorMessage('还没开始录制 ==！')
    return
  }
  vscode.window.showInformationMessage('关闭录制，录制好的步骤复制成功')
  this.isRecord = false
  vscode.env.clipboard.writeText(_.join(this.recordContent, ';'))
  this.recordContent = []
}

extension.prototype.stopRecord = function () {
  if (!this.device) {
    vscode.window.showErrorMessage('还没连接设备 ==！')
    return
  }
  if (!this.isRecord) {
    vscode.window.showErrorMessage('还没开始录制 ==！')
    return
  }
  vscode.window.showInformationMessage('暂停录制，点击不会进行录制，需要继续录制请开始录制')
  this.startTime = 0
  this.isRecord = false
}

extension.prototype.localImg = async function (uri, context) {
  this.isLocalImg = true
  await localImg(context)
  vscode.window.showInformationMessage('加载成功')
  await this.phoneView(uri, context)
  this.isLocalImg = false
}

extension.prototype.commonBase64 = base64


module.exports = extension
