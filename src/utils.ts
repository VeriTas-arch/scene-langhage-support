export function stripLineComment(line: string): string {
    const idx = line.indexOf('//');
    return idx === -1 ? line : line.slice(0, idx);
}
