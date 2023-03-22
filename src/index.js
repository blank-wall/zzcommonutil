// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { Commands } = require('../constant');
const Extension = require('./extension');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate (context) {
  const extension = new Extension()
  console.log('Congratulations, your extension "zzcommonutil" is now active!');
  Commands.forEach(command => {
    let action = extension[command]
    context.subscriptions.push(vscode.commands.registerCommand('zz' + command, (uri) => action.call(extension, uri, context)));
  })
}

// this method is called when your extension is deactivated
function deactivate () { }

module.exports = { activate, deactivate }
