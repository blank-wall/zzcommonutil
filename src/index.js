// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { createModule } = require('./createModule');
const { base64 } = require('./base64');
const { Type } = require('./constant')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate (context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "zzcommonutil" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(vscode.commands.registerCommand('zzcommonUtil', (uri) => createModule(Type.Util, uri)));
  context.subscriptions.push(vscode.commands.registerCommand('zzcommonModule', (uri) => createModule(Type.Template, uri)));
  context.subscriptions.push(vscode.commands.registerCommand('zzcommonBase64', base64));
}

// this method is called when your extension is deactivated
function deactivate () { }

module.exports = {
  activate,
  deactivate
}
