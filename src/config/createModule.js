const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { util, baseTemplate, h5Template, project } = require('./module.js')
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
    placeHolder: '请输入文件名称: ',
    ignoreFocusOut: true,
    prompt: '输入文件名称后，按回车键'
  })
  if (!moduleName.length) {
    vscode.window.showInformationMessage('您没有输入文件名称，请重新输入');
    return null
  }
  await replaceModule(moduleName, tempType)
  const filesType = await vscode.window.showQuickPick(['生成项目文件', '生成js文件'])
  const _path = uri.path.substring(1)
  const newPath = removeNonFolderPaths(_path) + '/' + moduleName
  const filePath = newPath + '/' + moduleName + '.js'
  const isExistMoudle = fs.existsSync(newPath)
  if (isExistMoudle) {
    vscode.window.showErrorMessage('您创建的文件已存在，请重新创建');
    return null
  }
  if (filesType === '生成js文件') {
    await writeFile(newPath + '.js', template)
    vscode.window.showInformationMessage(moduleName + '文件创建成功，请继续开发您的脚本');
    return
  }
  await createMkdir(newPath)
  await writeFile(filePath, template)
  await writeFile(newPath + '/project.json', projectText)
  vscode.window.showInformationMessage(moduleName + '文件创建成功，请继续开发您的脚本');
};

const replaceModule = async (moduleName, tempType) => {
  let h5Link = ''
  template = template.replace('pendingPkgName', moduleName)
  projectText = projectText.replace('pendingPkgName', moduleName)
  if (tempType === 'H5模板') {
    h5Link = await vscode.window.showInputBox({
      password: false,
      placeHolder: '请输入H5链接: ',
      ignoreFocusOut: true,
      prompt: '输入H5链接后，按回车键'
    }) || ''
    template = template.replace('pendingH5Url', h5Link)
  }
}

async function createModule (type, uri) {
  let tempType = ''
  projectText = project
  if (type === Type.Template) {
    tempType = await vscode.window.showQuickPick(['通用模板', 'H5模板'])
  }
  if (tempType === 'H5模板') {
    template = h5Template
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