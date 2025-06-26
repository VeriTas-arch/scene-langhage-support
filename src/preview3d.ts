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
            // 自动解析 scene 文件内容，提取 camera/group/materials 信息
            const sceneText = editor.document.getText();
            // 简单正则/分块解析（仅示例，建议后续优化为更健壮的解析器）
            function parseScene(text: string) {
                const cameraMatch = text.match(/PerspectiveCamera\s*{([\s\S]*?)}/);
                let camera = null;
                if (cameraMatch) {
                    const cbody = cameraMatch[1];
                    const get = (key: string) => {
                        const m = cbody.match(new RegExp(key + '\\s+([\d\-\.eE ]+)', 'i'));
                        return m ? m[1].trim().split(/\s+/).map(Number) : undefined;
                    };
                    camera = {
                        center: get('center'),
                        direction: get('direction'),
                        up: get('up'),
                        angle: (cbody.match(/angle\\s+([\d\.eE\-]+)/) || [])[1],
                        width: (cbody.match(/width\\s+(\d+)/) || [])[1],
                        height: (cbody.match(/height\\s+(\d+)/) || [])[1]
                    };
                }
                // 解析 materials
                const materials: any[] = [];
                const matBlock = text.match(/Materials\s*{([\s\S]*?)}/);
                if (matBlock) {
                    const mats = matBlock[1].split(/LambertianMaterial\s*{/).slice(1);
                    for (const m of mats) {
                        const color = (m.match(/color\\s+([\d\.eE\- ]+)/) || [])[1];
                        materials.push({
                            color: color ? color.trim().split(/\s+/).map(Number) : [1,1,1]
                        });
                    }
                }
                // 解析 group
                const groupBlock = text.match(/Group\s*{([\s\S]*?)}/);
                const objects: any[] = [];
                if (groupBlock) {
                    const lines = groupBlock[1].split(/\n/).map(l=>l.trim()).filter(Boolean);
                    let curMat = 0;
                    for (let i=0; i<lines.length; ++i) {
                        if (lines[i].startsWith('MaterialIndex')) {
                            curMat = Number(lines[i].split(/\s+/)[1]);
                        } else if (lines[i].startsWith('Plane')) {
                            // Plane { normal x y z offset v }
                            const normal = (lines[i+1]?.match(/normal\s+([\d\.eE\- ]+)/)||[])[1];
                            const offset = (lines[i+2]?.match(/offset\s+([\d\.eE\-]+)/)||[])[1];
                            if (normal && offset) {
                                objects.push({type:'plane', material:curMat, normal:normal.trim().split(/\s+/).map(Number), offset:Number(offset)});
                            }
                            i+=2;
                        } else if (lines[i].startsWith('Sphere')) {
                            const center = (lines[i+1]?.match(/center\s+([\d\.eE\- ]+)/)||[])[1];
                            const radius = (lines[i+2]?.match(/radius\s+([\d\.eE\-]+)/)||[])[1];
                            if (center && radius) {
                                objects.push({type:'sphere', material:curMat, center:center.trim().split(/\s+/).map(Number), radius:Number(radius)});
                            }
                            i+=2;
                        } else if (lines[i].startsWith('Triangle')) {
                            const v0 = (lines[i+1]?.match(/v0\s+([\d\.eE\- ]+)/)||[])[1];
                            const v1 = (lines[i+2]?.match(/v1\s+([\d\.eE\- ]+)/)||[])[1];
                            const v2 = (lines[i+3]?.match(/v2\s+([\d\.eE\- ]+)/)||[])[1];
                            if (v0 && v1 && v2) {
                                objects.push({type:'triangle', material:curMat, v0:v0.trim().split(/\s+/).map(Number), v1:v1.trim().split(/\s+/).map(Number), v2:v2.trim().split(/\s+/).map(Number)});
                            }
                            i+=3;
                        }
                    }
                }
                return {camera, materials, objects};
            }
            const parsedScene = parseScene(sceneText);
            // 注入到 webview
            html = html.replace('window.__SCENE_PARSED__ = undefined;', `window.__SCENE_PARSED__ = ${JSON.stringify(parsedScene)};`);
            panel.webview.html = html;
        })
    );
}
