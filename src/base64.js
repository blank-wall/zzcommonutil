const vscode = require('vscode');
const fs = require('fs');

function imgToBase64 (url) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, 'binary', (err, data) => {
      if (err) {
        reject(err)
      }
      // new Buffer 已被弃用
      // 转换成base64格式
      let base64Img = Buffer.from(data, 'binary').toString('base64')
      resolve(`data:image/png;base64,${base64Img}`)
    })
  })
}

// 将图片链接写入编辑器
function addImageUrlToEditor (url) {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  // 替换内容
  const selection = editor.selection;
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, url);
  });
}

async function base64 () {
  const uri = await vscode.window.showOpenDialog({
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      images: ['png', 'jpg', 'gif', 'jpeg', 'svg'],
    },
  });
  if (!uri) {
    vscode.window.showErrorMessage('未选择图片')
  }
  const loaclFile = uri[0].fsPath;
  const base64 = await imgToBase64(loaclFile)
  await addImageUrlToEditor(base64)
  vscode.window.showInformationMessage('转换成功')
}

module.exports = { base64 }