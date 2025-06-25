import * as vscode from 'vscode';

export class SceneMaterialHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position, /MaterialIndex|\w*Material/);
        if (!wordRange) return;
        const word = document.getText(wordRange);
        const line = document.lineAt(position.line).text;

        // 1. 悬停在 MaterialIndex N 上，显示对应 Material 定义
        const matIdxMatch = line.match(/MaterialIndex\s+(\d+)/);
        if (word === 'MaterialIndex' && matIdxMatch) {
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
                        // 收集该 Material 块内容
                        let matLines = [document.lineAt(i).text];
                        let d = 0;
                        for (let j = i; j < matEnd; j++) {
                            const t = document.lineAt(j).text;
                            if (t.includes('{')) d++;
                            if (t.includes('}')) d--;
                            if (j !== i) matLines.push(t);
                            if (d === 0) break;
                        }
                        return new vscode.Hover(`### MaterialIndex ${idx}\n\n\`\`\`scene\n${matLines.join('\n')}\n\`\`\``);
                    }
                }
            }
        }

        // 2. 悬停在 Material 定义上，显示所有引用该 index 的 MaterialIndex
        if (/\w*Material/.test(word) && /\w*Material\s*\{/.test(line)) {
            // 找到 Materials 块和当前 Material 的 index
            let matStart = -1, matEnd = -1, depth = 0, matIdx = -1, thisMatIdx = -1;
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
            for (let i = matStart + 1; i < matEnd; i++) {
                const text = document.lineAt(i).text;
                if (/^\s*\/\//.test(text)) continue;
                if (/^\s*\w*Material\s*\{/.test(text)) {
                    matIdx++;
                    if (i === position.line) {
                        thisMatIdx = matIdx;
                        break;
                    }
                }
            }
            if (thisMatIdx === -1) return;
            // 在 Group 块中查找所有 MaterialIndex thisMatIdx
            let usages: number[] = [];
            for (let i = 0; i < document.lineCount; i++) {
                const text = document.lineAt(i).text;
                const match = text.match(/MaterialIndex\s+(\d+)/);
                if (match && parseInt(match[1], 10) === thisMatIdx) {
                    usages.push(i + 1);
                }
            }
            let hoverText = `### MaterialIndex ${thisMatIdx}\n`;
            if (usages.length === 0) {
                hoverText += '\n未被任何行引用';
            } else {
                hoverText += '\n被第 ' + usages.map(l => `${l} 行`).join('、') + '使用';
            }
            return new vscode.Hover(hoverText);
        }
        return;
    }
}
