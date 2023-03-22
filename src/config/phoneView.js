const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
let currentPanel, messages = {};

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent (context, templatePath) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
  });
  return html
}

/**
 * 向web发送信息
 */
function postMessage (panel, key, content) {
  if (!panel) return
  messages[key] = content
  panel.webview.postMessage(messages);
}

/** 接收web信息  */
function receiveMessage (panel, callback) {
  if (!panel) return
  panel.webview.onDidReceiveMessage(function (data) {
    callback(data)
  });
}

function phoneView (context) {
  const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
  let imagePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'screenshot.png'));
  if (currentPanel) {
    // 如果我们已经有了一个面板，那就把它显示到目标列布局中
    // @ts-ignore
    currentPanel.reveal(columnToShowIn);
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      'zz', // 只供内部使用，这个webview的标识
      'zzView', // 给用户显示的面板标题
      vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    let imageSrc = currentPanel.webview.asWebviewUri(imagePath) + "";
    currentPanel.webview.html = getWebViewContent(context, 'views/index.html')
    postMessage(currentPanel, 'imageSrc', imageSrc)
  }
  // 当前面板被关闭后重置
  currentPanel.onDidDispose(() => currentPanel = undefined, null, context.subscriptions);
  return currentPanel
}

module.exports = { phoneView, receiveMessage }