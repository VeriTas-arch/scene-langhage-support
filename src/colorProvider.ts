import * as vscode from 'vscode';

export class SceneColorProvider implements vscode.DocumentColorProvider {
    provideDocumentColors(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorInformation[]> {
        const colorInfos: vscode.ColorInformation[] = [];
        const colorRegex = /color\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g;
        for (let line = 0; line < document.lineCount; line++) {
            const textLine = document.lineAt(line);
            let match: RegExpExecArray | null;
            colorRegex.lastIndex = 0;
            while ((match = colorRegex.exec(textLine.text)) !== null) {
                const r = parseFloat(match[1]);
                const g = parseFloat(match[2]);
                const b = parseFloat(match[3]);
                let color: vscode.Color;
                if (r > 1 || g > 1 || b > 1) {
                    color = new vscode.Color(1, 1, 1, 1); // 超过1的显示为白色
                } else {
                    color = new vscode.Color(r, g, b, 1);
                }
                // 让 range 覆盖整个 color r g b
                const start = textLine.text.indexOf(match[0]);
                const end = start + match[0].length;
                const range = new vscode.Range(line, start, line, end);
                colorInfos.push(new vscode.ColorInformation(range, color));
            }
        }
        return colorInfos;
    }

    provideColorPresentations(color: vscode.Color, context: { range: vscode.Range }, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ColorPresentation[]> {
        // 输出为 color r g b 格式，优先 0-1 小数
        const r = +(color.red.toFixed(3));
        const g = +(color.green.toFixed(3));
        const b = +(color.blue.toFixed(3));
        const label = `color ${r} ${g} ${b}`;
        const presentation = new vscode.ColorPresentation(label);
        return [presentation];
    }
}
