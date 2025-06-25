import * as vscode from 'vscode';

export class SceneMaterialDefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition> {
        const wordRange = document.getWordRangeAtPosition(position, /MaterialIndex/);
        if (!wordRange) return;
        const line = document.lineAt(position.line).text;
        const matIdxMatch = line.match(/MaterialIndex\s+(\d+)/);
        if (!matIdxMatch) return;
        const idx = parseInt(matIdxMatch[1], 10);
        // 找到 Materials 块
        let matStart = -1, matEnd = -1, depth = 0;
        for (let i = 0; i < document.lineCount; i++) {
            if (/^\s*Materials\s*\{/.test(document.lineAt(i).text)) {
                matStart = i;
                break;
            }
        }
        if (matStart === -1) return;
        for (let i = matStart; i < document.lineCount; i++) {
            const text = document.lineAt(i).text;
            if (text.includes('{')) depth++;
            if (text.includes('}')) depth--;
            if (depth === 0) {
                matEnd = i;
                break;
            }
        }
        if (matEnd === -1) return;
        // 收集所有 Material 块
        let matIdx = -1;
        for (let i = matStart + 1; i < matEnd; i++) {
            const text = document.lineAt(i).text;
            if (/^\s*\/\//.test(text)) continue;
            if (/^\s*\w*Material\s*\{/.test(text)) {
                matIdx++;
                if (matIdx === idx) {
                    // 跳转到该 Material 块的起始位置
                    return new vscode.Location(document.uri, new vscode.Position(i, 0));
                }
            }
        }
        return;
    }
}
