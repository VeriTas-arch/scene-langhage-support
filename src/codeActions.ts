import * as vscode from 'vscode';

export class NumObjectsCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range,
        _context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.CodeAction[] | undefined {
        const line = document.lineAt(range.start.line);
        // numObjects
        const numObjectsMatch = line.text.match(/numObjects\s+(\d+)/);
        if (numObjectsMatch) {
            let groupStart = -1;
            for (let i = line.lineNumber; i >= 0; i--) {
                if (/^\s*Group\s*\{/.test(document.lineAt(i).text)) {
                    groupStart = i;
                    break;
                }
            }
            if (groupStart === -1) return;
            let groupEnd = -1;
            let depth = 0;
            for (let i = groupStart; i < document.lineCount; i++) {
                const text = document.lineAt(i).text;
                if (text.includes('{')) depth++;
                if (text.includes('}')) depth--;
                if (depth === 0) {
                    groupEnd = i;
                    break;
                }
            }
            if (groupEnd === -1) return;
            const objectTypes = ['Plane', 'Sphere', 'Triangle'];
            let count = 0;
            for (let i = groupStart + 1; i < groupEnd; i++) {
                const text = document.lineAt(i).text;
                if (/^\s*\/\//.test(text)) continue;
                for (const type of objectTypes) {
                    if (new RegExp('^\\s*' + type + '\\s*\{').test(text)) {
                        count++;
                        break;
                    }
                }
            }
            const currentValue = parseInt(numObjectsMatch[1], 10);
            if (currentValue === count) return;
            const fix = new vscode.CodeAction(`将 numObjects 修正为 ${count}`, vscode.CodeActionKind.QuickFix);
            fix.edit = new vscode.WorkspaceEdit();
            const numRange = new vscode.Range(line.range.start, line.range.end);
            fix.edit.replace(document.uri, numRange, line.text.replace(/numObjects\s+\d+/, `numObjects ${count}`));
            fix.isPreferred = true;
            return [fix];
        }
        // numMaterials
        const numMaterialsMatch = line.text.match(/numMaterials\s+(\d+)/);
        if (numMaterialsMatch) {
            let matStart = -1;
            for (let i = line.lineNumber; i >= 0; i--) {
                if (/^\s*Materials\s*\{/.test(document.lineAt(i).text)) {
                    matStart = i;
                    break;
                }
            }
            if (matStart === -1) return;
            let matEnd = -1;
            let depth = 0;
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
            let count = 0;
            for (let i = matStart + 1; i < matEnd; i++) {
                const text = document.lineAt(i).text;
                if (/^\s*\/\//.test(text)) continue;
                if (/^\s*\w*Material\s*\{/.test(text)) count++;
            }
            const currentValue = parseInt(numMaterialsMatch[1], 10);
            if (currentValue === count) return;
            const fix = new vscode.CodeAction(`将 numMaterials 修正为 ${count}`, vscode.CodeActionKind.QuickFix);
            fix.edit = new vscode.WorkspaceEdit();
            const numRange = new vscode.Range(line.range.start, line.range.end);
            fix.edit.replace(document.uri, numRange, line.text.replace(/numMaterials\s+\d+/, `numMaterials ${count}`));
            fix.isPreferred = true;
            return [fix];
        }
        // numLights
        const numLightsMatch = line.text.match(/numLights\s+(\d+)/);
        if (numLightsMatch) {
            let lightStart = -1;
            for (let i = line.lineNumber; i >= 0; i--) {
                if (/^\s*Lights\s*\{/.test(document.lineAt(i).text)) {
                    lightStart = i;
                    break;
                }
            }
            if (lightStart === -1) return;
            let lightEnd = -1;
            let depth = 0;
            for (let i = lightStart; i < document.lineCount; i++) {
                const text = document.lineAt(i).text;
                if (text.includes('{')) depth++;
                if (text.includes('}')) depth--;
                if (depth === 0) {
                    lightEnd = i;
                    break;
                }
            }
            if (lightEnd === -1) return;
            let count = 0;
            for (let i = lightStart + 1; i < lightEnd; i++) {
                const text = document.lineAt(i).text;
                if (/^\s*\/\//.test(text)) continue;
                if (/^\s*\w*Light\s*\{/.test(text)) count++;
            }
            const currentValue = parseInt(numLightsMatch[1], 10);
            if (currentValue === count) return;
            const fix = new vscode.CodeAction(`将 numLights 修正为 ${count}`, vscode.CodeActionKind.QuickFix);
            fix.edit = new vscode.WorkspaceEdit();
            const numRange = new vscode.Range(line.range.start, line.range.end);
            fix.edit.replace(document.uri, numRange, line.text.replace(/numLights\s+\d+/, `numLights ${count}`));
            fix.isPreferred = true;
            return [fix];
        }
        return;
    }
}
