import * as vscode from 'vscode';

function stripLineComment(line: string): string {
    const idx = line.indexOf('//');
    return idx === -1 ? line : line.slice(0, idx);
}

export function activate(context: vscode.ExtensionContext) {
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('scene', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const config = vscode.workspace.getConfiguration('sceneFormatter');
            const indentSize = config.get<number>('indentSize', 4);
            const useTabs = config.get<boolean>('useTabs', false);

            const indentUnit = useTabs ? '\t' : ' '.repeat(indentSize);

            // 读取所有行，去除文件开头和结尾的多余空行
            let lines: string[] = [];
            for (let i = 0; i < document.lineCount; i++) {
                lines.push(document.lineAt(i).text);
            }
            while (lines.length > 0 && lines[0].trim() === '') lines.shift();
            while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

            // 块关键字
            const topLevelKeywords = [
                'Materials', 'Group', 'Lights', 'Background', 'PerspectiveCamera'
            ];
            const materialBlockKeyword = 'Material';

            let formattedLines: string[] = [];
            let indentLevel = 0;
            let blockStack: string[] = [];
            let lastLineWasTopLevelBlockEnd = false;
            let lastLineWasMaterialBlockEnd = false;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line === '') continue;

                // 只对去除注释后的部分判断块结构
                const codePart = stripLineComment(line).trim();

                // 判断块起始
                const isTopLevelBlockStart = topLevelKeywords.some(keyword => codePart.startsWith(keyword + ' {'));
                const isMaterialBlockStart = codePart.startsWith(materialBlockKeyword + ' {');

                // 判断块结尾
                const isBlockEnd = codePart === '}';

                // 判断是否为Material块结尾
                const isMaterialBlockEnd =
                    isBlockEnd &&
                    blockStack.length > 0 &&
                    blockStack[blockStack.length - 1] === materialBlockKeyword;

                // 判断是否为顶级块结尾
                const isTopLevelBlockEnd =
                    isBlockEnd &&
                    blockStack.length > 0 &&
                    topLevelKeywords.includes(blockStack[blockStack.length - 1]);

                // 顶级块之间插入空行
                if (
                    formattedLines.length > 0 &&
                    lastLineWasTopLevelBlockEnd &&
                    isTopLevelBlockStart
                ) {
                    formattedLines.push('');
                }

                // Material块之间插入空行（仅在Materials块内）
                if (
                    formattedLines.length > 0 &&
                    lastLineWasMaterialBlockEnd &&
                    isMaterialBlockStart &&
                    blockStack.includes('Materials')
                ) {
                    formattedLines.push('');
                }

                // 如果本行是 '}'，先减少缩进并弹出块栈
                if (isBlockEnd) {
                    if (blockStack.length > 0) {
                        indentLevel = Math.max(0, indentLevel - 1);
                        blockStack.pop();
                    }
                }

                // 应用缩进
                formattedLines.push(indentUnit.repeat(indentLevel) + line);

                // 如果本行以 '{' 结尾，增加缩进并推入块栈
                if (codePart.endsWith('{')) {
                    if (isTopLevelBlockStart) {
                        blockStack.push(topLevelKeywords.find(keyword => codePart.startsWith(keyword + ' {'))!);
                    } else if (isMaterialBlockStart) {
                        blockStack.push(materialBlockKeyword);
                    } else {
                        blockStack.push('BLOCK');
                    }
                    indentLevel++;
                }

                lastLineWasTopLevelBlockEnd = isTopLevelBlockEnd;
                lastLineWasMaterialBlockEnd = isMaterialBlockEnd && blockStack.includes('Materials');
            }

            // 文件结尾加一个空行
            if (formattedLines.length === 0 || formattedLines[formattedLines.length - 1].trim() !== '') {
                formattedLines.push('');
            }

            // 用格式化后的内容替换整个文档
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            return [vscode.TextEdit.replace(fullRange, formattedLines.join('\n'))];
        }
    });

    context.subscriptions.push(formatter);
}
