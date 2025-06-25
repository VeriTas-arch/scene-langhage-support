import * as vscode from 'vscode';

export function registerDiagnostics(context: vscode.ExtensionContext, updateDiagnostics: (doc: vscode.TextDocument) => void) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('scene');
    context.subscriptions.push(diagnosticCollection);

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document)),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
    vscode.workspace.textDocuments.forEach(updateDiagnostics);
    return diagnosticCollection;
}
