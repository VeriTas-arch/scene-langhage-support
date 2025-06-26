import * as vscode from 'vscode';
import * as path from 'path';

export class SceneTextureHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const line = document.lineAt(position.line).text;
        // 匹配 texture 路径
        const regex = /texture\s+([\w\-./\\]+)/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(line)) !== null) {
            const texPath = match[1];
            const start = line.indexOf(texPath);
            const end = start + texPath.length;
            if (position.character >= start && position.character <= end) {
                // 只以 workspace 根目录为基准查找图片
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) {
                    return undefined;
                }
                const workspaceRoot = workspaceFolders[0].uri.fsPath;
                const absPath = path.join(workspaceRoot, texPath.replace(/^[\\/]+/, ''));
                const imgUri = vscode.Uri.file(absPath);
                // 直接用 file 协议，VS Code hover 支持本地图片
                const md = new vscode.MarkdownString(`![texture](${imgUri.toString()}|width=256)`);
                md.isTrusted = true;
                return new vscode.Hover(md, new vscode.Range(position.line, start, position.line, end));
            }
        }
        return undefined;
    }
}
