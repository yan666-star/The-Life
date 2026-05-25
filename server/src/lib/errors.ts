export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  OLLAMA_UNAVAILABLE: 'OLLAMA_UNAVAILABLE',
  AI_PARSE_FAILED: 'AI_PARSE_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  GENERATION_EXHAUSTED: 'GENERATION_EXHAUSTED',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  INVALID_CHOICE: 'INVALID_CHOICE',
  GENERATING_IN_PROGRESS: 'GENERATING_IN_PROGRESS',
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND',
  DIFY_NOT_CONFIGURED: 'DIFY_NOT_CONFIGURED',
} as const
