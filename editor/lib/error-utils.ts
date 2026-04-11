export type ParsedEditorExecutionError = {
  lineNumber: number;
  message: string;
};

const ERROR_LINE_PATTERNS = [/line\s+(\d+)/i, /:(\d+):\d+/i, /:(\d+)\s*(?:error|warning|note)\b/i];

export function parseEditorExecutionErrors(stderr: string, maxLineNumber: number) {
  const errorMap = new Map<number, ParsedEditorExecutionError>();

  for (const rawLine of stderr.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine) {
      continue;
    }

    for (const pattern of ERROR_LINE_PATTERNS) {
      const match = pattern.exec(trimmedLine);

      if (!match) {
        continue;
      }

      const lineNumber = Number.parseInt(match[1] ?? '', 10);

      if (Number.isNaN(lineNumber) || lineNumber < 1 || lineNumber > maxLineNumber || errorMap.has(lineNumber)) {
        break;
      }

      errorMap.set(lineNumber, {
        lineNumber,
        message: trimmedLine,
      });
      break;
    }
  }

  return [...errorMap.values()].sort((left, right) => left.lineNumber - right.lineNumber);
}
