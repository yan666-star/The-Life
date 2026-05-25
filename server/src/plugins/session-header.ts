import type { FastifyRequest } from 'fastify'
import { AppError, ErrorCodes } from '../lib/errors.js'

export function getSessionId(request: FastifyRequest): string {
  const header = request.headers['x-session-id']
  const fromHeader = Array.isArray(header) ? header[0] : header
  const body = request.body as { sessionId?: string } | undefined
  const id = fromHeader || body?.sessionId || (request.params as { sessionId?: string })?.sessionId
  if (!id) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED, 'X-Session-Id header required', 400)
  }
  return id
}
