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
            // 用 __SCENE_TEXT__ 占位符注入 scene 内容
            html = html.replace('__SCENE_TEXT__', encodeURIComponent(editor.document.getText()));
            panel.webview.html = html;
        })
    );
}
