import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('scene', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const config = vscode.workspace.getConfiguration('sceneFormatter');
            const indentSize = config.get<number>('indentSize', 4);
            const useTabs = config.get<boolean>('useTabs', false);

            const indentUnit = useTabs ? '\t' : ' '.repeat(indentSize);
            let indentLevel = 0;

            const lines: string[] = [];
            for (let i = 0; i < document.lineCount; i++) {
                lines.push(document.lineAt(i).text);
            }

            // 去除首尾空行
            while (lines.length > 0 && lines[0].trim() === '') lines.shift();
            while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

            const formattedLines: string[] = [];
            let lastLineWasBlockEnd = false;

            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();

                if (trimmed === '') continue;

                // 如果当前行是闭括号，则提前减少缩进
                if (trimmed.startsWith('}')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }

                // 添加空行：前一行是闭括号，当前不是闭括号
                if (lastLineWasBlockEnd && !trimmed.startsWith('}')) {
                    formattedLines.push('');
                }

                // 添加当前格式化行
                formattedLines.push(indentUnit.repeat(indentLevel) + trimmed);

                // 如果当前行是开括号，则增加缩进
                if (trimmed.endsWith('{')) {
                    indentLevel++;
                }

                // 更新闭括号状态
                lastLineWasBlockEnd = trimmed.startsWith('}');
            }

            // 文件末尾空行
            if (formattedLines.length === 0 || formattedLines[formattedLines.length - 1].trim() !== '') {
                formattedLines.push('');
            }

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            return [vscode.TextEdit.replace(fullRange, formattedLines.join('\n'))];
        }
    });

    context.subscriptions.push(formatter);
}
