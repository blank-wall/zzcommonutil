const vscode = require('vscode');
// const path = require("path");
const fs = require("fs");
const { util, template, newTemplate, calculatorTemplate } = require('./module.js')
const { Type } = require('./constant')

let _module = util

const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) {
        vscode.window.showErrorMessage('生成报错' + error.message);
        reject(error);
        return;
      }
      resolve('write success');
    });
  });
};

const virtualFileCreator = async (path) => {
  await writeFile(path, _module)
  vscode.window.showInformationMessage('脚本创建成功，请继续开发您的脚本');
};

async function createModule (type, uri) {
  if (type === Type.Template) {
    const tempType = await vscode.window.showQuickPick(['新版本号模板', '通用工具包模板', '积分墙模板'])
    _module = tempType === '新版本号模板' ? newTemplate : tempType === '积分墙模板' ? calculatorTemplate : template
  } else {
    _module = util
  }
  const _moduleName = await vscode.window.showInputBox({
    password: false,
    placeHolder: '请输入脚本名称: ',
    ignoreFocusOut: true,
    prompt: '输入脚本名称后，按回车键'
  })
  if (!_moduleName.length) {
    vscode.window.showInformationMessage('您没有输入脚本名称，请重新输入');
    return null
  }
  const _path = uri.path.substring(1)
  const newPath = _path + '/' + _moduleName + '.js'
  const isExistMoudle = fs.existsSync(newPath)
  if (isExistMoudle) {
    vscode.window.showErrorMessage('您输入的脚本已存在，请重新输入');
    return null
  }
  virtualFileCreator(newPath)
}

module.exports = {
  createModule
}