const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { util, baseTemplate, calculatorTemplate, project } = require('./module.js')
const { Type } = require('../../constant')

let template = util
let projectText = project

const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) {
        vscode.window.showErrorMessage('文件生成报错：' + error.message);
        reject(error);
        return;
      }
      resolve('write success');
    });
  });
};

const createMkdir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (error) => {
      if (error) {
        vscode.window.showErrorMessage('文件夹生成报错：' + error.message);
        reject(error);
        return;
      }
      resolve('mkdir success');
    });
  });
};

const removeNonFolderPaths = (inputPath) => {
  if (!fs.existsSync(inputPath)) {
    return inputPath;
  }
  const stats = fs.statSync(inputPath);
  if (stats.isDirectory()) {
    return inputPath;
  }
  const parentDir = path.dirname(inputPath);
  const folderPath = removeNonFolderPaths(parentDir);
  return folderPath;
}

const virtualFileCreator = async (uri, tempType) => {
  const moduleName = await vscode.window.showInputBox({
    password: false,
    placeHolder: '请输入脚本名称: ',
    ignoreFocusOut: true,
    prompt: '输入脚本名称后，按回车键'
  })
  if (!moduleName.length) {
    vscode.window.showInformationMessage('您没有输入脚本名称，请重新输入');
    return null
  }
  await replaceModule(moduleName, tempType)
  const _path = uri.path.substring(1)
  const newPath = removeNonFolderPaths(_path) + '/' + moduleName
  const filePath = newPath + '/' + moduleName + '.js'
  const isExistMoudle = fs.existsSync(newPath)
  if (isExistMoudle) {
    vscode.window.showErrorMessage('您创建的脚本已存在，请重新创建');
    return null
  }
  await createMkdir(newPath)
  await writeFile(filePath, template)
  await writeFile(newPath + '/project.json', projectText)
  vscode.window.showInformationMessage(moduleName + '脚本创建成功，请继续开发您的脚本');
};

const replaceModule = async (moduleName, tempType) => {
  let appName = ''
  let moduleVersion = ''
  template = template.replace('pendingPkgName', moduleName)
  projectText = projectText.replace('pendingPkgName', moduleName)
  if (tempType === '积分墙模板') {
    appName = await vscode.window.showInputBox({
      password: false,
      placeHolder: '请输入应用名称: ',
      ignoreFocusOut: true,
      prompt: '输入应用名称后，按回车键'
    }) || ''
    template = template.replace('pendingAppName', appName)
  }
  moduleVersion = await vscode.window.showInputBox({
    password: false,
    placeHolder: '请输入工具包版本: ',
    ignoreFocusOut: true,
    prompt: '输入工具包版本，类似于：v1.1.1 后缀不需要带，也可以直接回车不用输入为默认'
  })
  if (moduleVersion) {
    template = template.replace('v1.1.7-release', moduleVersion + '-release')
  }
}

async function createModule (type, uri) {
  let tempType = ''
  projectText = project
  if (type === Type.Template) {
    tempType = await vscode.window.showQuickPick(['通用模板', '积分墙模板'])
  }
  if (tempType === '积分墙模板') {
    template = calculatorTemplate
  }
  if (tempType === '通用模板') {
    template = baseTemplate
  }
  if (type === Type.Template && !tempType) {
    return
  }
  virtualFileCreator(uri, tempType)
}

module.exports = {
  createModule
}