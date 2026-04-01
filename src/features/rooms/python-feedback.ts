export type PythonRuntimeErrorDetails = {
  type: string;
  message: string;
  traceback: string;
  line: number | null;
};

export type PythonRoomFeedbackRequest = {
  trigger: 'runtime_error';
  task: string;
  code: string;
  stdout: string;
  stderr: string;
  error: PythonRuntimeErrorDetails;
};

export type PythonRoomFeedbackResponse = {
  reply: string;
  provider?: string;
  modelUsed?: string | null;
};

function normalizeSegment(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function createPythonFeedbackCacheKey(request: PythonRoomFeedbackRequest) {
  return JSON.stringify({
    task: normalizeSegment(request.task),
    code: request.code,
    errorType: normalizeSegment(request.error.type),
    errorMessage: normalizeSegment(request.error.message),
    errorLine: request.error.line,
  });
}

export function buildPythonRoomTranscriptLabel(error: PythonRuntimeErrorDetails) {
  if (error.line) {
    return `Run Python detected ${error.type} on line ${error.line}.`;
  }

  return `Run Python detected ${error.type}.`;
}

