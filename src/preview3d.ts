import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function registerPreview3DCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('sceneLanguageSupport.preview3D', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'scene') {
                vscode.window.showErrorMessage('请先打开一个 .scene 文件');
                return;
            }
            const panel = vscode.window.createWebviewPanel(
                'scenePreview3D',
                'Scene 3D 预览',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );
            const htmlPath = path.join(context.extensionPath, 'media', 'webview.html');
            let html = fs.readFileSync(htmlPath, 'utf8');
            const threeUri = panel.webview.asWebviewUri(
                vscode.Uri.joinPath(context.extensionUri, 'media', 'js', 'three.min.js')
            );
            html = html.replace('src="js/three.min.js"', `src="${threeUri}"`);
            panel.webview.html = html;
        })
    );
}
