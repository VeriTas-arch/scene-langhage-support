import * as vscode from 'vscode';
import { formatter } from './formatting';
import { NumObjectsCodeActionProvider } from './codeActions';
import { registerDiagnostics } from './diagnostics';
import { SceneMaterialHoverProvider } from './hover';
import { SceneMaterialDefinitionProvider } from './definition';

let diagnosticCollection: vscode.DiagnosticCollection;

function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== 'scene') return;
    const diagnostics: vscode.Diagnostic[] = [];
    // Group 检查
    const objectTypes = ['Plane', 'Sphere', 'Triangle'];
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const numObjectsMatch = line.text.match(/numObjects\s+(\d+)/);
        if (numObjectsMatch) {
            let groupStart = -1;
            for (let j = i; j >= 0; j--) {
                if (/^\s*Group\s*\{/.test(document.lineAt(j).text)) {
                    groupStart = j;
                    break;
                }
            }
            if (groupStart === -1) continue;
            let groupEnd = -1;
            let depth = 0;
            for (let j = groupStart; j < document.lineCount; j++) {
                const text = document.lineAt(j).text;
                if (text.includes('{')) depth++;
                if (text.includes('}')) depth--;
                if (depth === 0) {
                    groupEnd = j;
                    break;
                }
            }
            if (groupEnd === -1) continue;
            let count = 0;
            for (let j = groupStart + 1; j < groupEnd; j++) {
                const text = document.lineAt(j).text;
                if (/^\s*\/\//.test(text)) continue;
                for (const type of objectTypes) {
                    if (new RegExp('^\\s*' + type + '\\s*\{').test(text)) {
                        count++;
                        break;
                    }
                }
            }
            const currentValue = parseInt(numObjectsMatch[1], 10);
            if (currentValue !== count) {
                const range = new vscode.Range(line.range.start, line.range.end);
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `numObjects 应为 ${count}，当前为 ${currentValue}`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
        // numMaterials 检查
        const numMaterialsMatch = line.text.match(/numMaterials\s+(\d+)/);
        if (numMaterialsMatch) {
            let matStart = -1;
            for (let j = i; j >= 0; j--) {
                if (/^\s*Materials\s*\{/.test(document.lineAt(j).text)) {
                    matStart = j;
                    break;
                }
            }
            if (matStart === -1) continue;
            let matEnd = -1;
            let depth = 0;
            for (let j = matStart; j < document.lineCount; j++) {
                const text = document.lineAt(j).text;
                if (text.includes('{')) depth++;
                if (text.includes('}')) depth--;
                if (depth === 0) {
                    matEnd = j;
                    break;
                }
            }
            if (matEnd === -1) continue;
            let count = 0;
            for (let j = matStart + 1; j < matEnd; j++) {
                const text = document.lineAt(j).text;
                if (/^\s*\/\//.test(text)) continue;
                if (/^\s*\w*Material\s*\{/.test(text)) count++;
            }
            const currentValue = parseInt(numMaterialsMatch[1], 10);
            if (currentValue !== count) {
                const range = new vscode.Range(line.range.start, line.range.end);
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `numMaterials 应为 ${count}，当前为 ${currentValue}`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
        // numLights 检查
        const numLightsMatch = line.text.match(/numLights\s+(\d+)/);
        if (numLightsMatch) {
            let lightStart = -1;
            for (let j = i; j >= 0; j--) {
                if (/^\s*Lights\s*\{/.test(document.lineAt(j).text)) {
                    lightStart = j;
                    break;
                }
            }
            if (lightStart === -1) continue;
            let lightEnd = -1;
            let depth = 0;
            for (let j = lightStart; j < document.lineCount; j++) {
                const text = document.lineAt(j).text;
                if (text.includes('{')) depth++;
                if (text.includes('}')) depth--;
                if (depth === 0) {
                    lightEnd = j;
                    break;
                }
            }
            if (lightEnd === -1) continue;
            let count = 0;
            for (let j = lightStart + 1; j < lightEnd; j++) {
                const text = document.lineAt(j).text;
                if (/^\s*\/\//.test(text)) continue;
                if (/^\s*\w*Light\s*\{/.test(text)) count++;
            }
            const currentValue = parseInt(numLightsMatch[1], 10);
            if (currentValue !== count) {
                const range = new vscode.Range(line.range.start, line.range.end);
                diagnostics.push(new vscode.Diagnostic(
                    range,
                    `numLights 应为 ${count}，当前为 ${currentValue}`,
                    vscode.DiagnosticSeverity.Warning
                ));
            }
        }
    }
    if (diagnosticCollection) {
        diagnosticCollection.set(document.uri, diagnostics);
    }
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(formatter);
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('scene', new NumObjectsCodeActionProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        })
    );
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('scene', new SceneMaterialHoverProvider())
    );
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('scene', new SceneMaterialDefinitionProvider())
    );
    diagnosticCollection = registerDiagnostics(context, updateDiagnostics);
}
