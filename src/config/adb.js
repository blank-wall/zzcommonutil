const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const adb = require('adbkit')
const adbClient = adb.createClient()

/** 获取设备列表 */
async function getDeviceList () {
  let deviceList = []
  await adbClient
    .listDevices()
    .then(function (devices) {
      devices.forEach(function (device) {
        device.id && !deviceList.includes(device.id) && deviceList.push(device.id)
      })
    })
    .catch(function (err) {
      console.error('zz获取设备Something went wrong:', err.stack)
    })
  return deviceList
}

/** adb执行shell命令 */
async function adbShell (device, command) {
  await adbClient.shell(device, command)
    .then(function (output) {
      console.log('zz截图', device, output.toString().trim())
    }).catch(function (err) {
      console.log('zz错误', err);
    })
}

/** 从设备拉取文件 */
async function adbPull (device, devicePath, localPath) {
  await adbClient.pull(device, devicePath, localPath)
    .then(function (transfer) {
      return new Promise(function (resolve, reject) {
        transfer.on('progress', function (stats) {
          console.log('zz[%s] Pulled %d bytes so far',
            device,
            stats.bytesTransferred)
        })
        transfer.on('end', function () {
          // console.log('zz提取文件', device)
          resolve(device)
        })
        transfer.on('error', reject)
        transfer.pipe(fs.createWriteStream(localPath))
      })
    })
}

/** 连接adb */
async function connectADB (context) {
  const imagePath = path.join(context.extensionPath, 'media', 'screenshot.png')
  const device = await vscode.window.showQuickPick(await getDeviceList())
  setTimeout(async () => {
    if (!device) return
    await vscode.window.showInformationMessage(`${device}设备连接成功`)
    await adbShell(device, 'screencap -p /sdcard/screenshot.png')
    await adbPull(device, '/sdcard/screenshot.png', imagePath)
  }, 0)
  return device
}

module.exports = { connectADB, adbShell, adbPull, getDeviceList }
