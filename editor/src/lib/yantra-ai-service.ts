export function getYantraAiServiceUrl() {
  return process.env.YANTRA_AI_SERVICE_URL ?? null;
}

export function getYantraAiServiceTimeoutMs() {
  return Number(process.env.YANTRA_AI_SERVICE_TIMEOUT_MS ?? 30000);
}
