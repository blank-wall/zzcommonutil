const vscode = require('vscode')
const path = require('path')

module.exports = async (context) => {
  const options = {
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      Images: ['png', 'jpg', 'gif']
    }
  };
  const uris = await vscode.window.showOpenDialog(options);
  if (uris && uris.length > 0) {
    const fileUri = uris[0];
    const content = await vscode.workspace.fs.readFile(fileUri);
    const imageSrc = path.join(context.extensionPath, 'media', 'screenshot.png')
    await vscode.workspace.fs.writeFile(vscode.Uri.file(imageSrc), content);
    return true
  }
  return false
}