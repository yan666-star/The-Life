import type { FastifyInstance } from 'fastify'
import { getSessionId } from '../plugins/session-header.js'
import * as mentorshipService from '../services/mentorship.service.js'

export async function aiRoutes(app: FastifyInstance) {
  app.get('/ai/roles', async () => mentorshipService.listMentorRoles())

  app.post('/ai/chat', async (req) => {
    const sessionId = getSessionId(req)
    const body = req.body as {
      mentorRole: string
      message: string
      includeComparison?: boolean
    }
    return mentorshipService.sendMentorMessage(
      sessionId,
      body.mentorRole || '人生规划师',
      body.message,
      body.includeComparison
    )
  })

  app.get('/ai/chat/history', async (req) => {
    const sessionId = getSessionId(req)
    const q = req.query as { mentorRole?: string }
    return mentorshipService.getChatHistory(sessionId, q.mentorRole)
  })

  app.delete('/ai/chat/history', async (req) => {
    const sessionId = getSessionId(req)
    const q = req.query as { mentorRole?: string }
    return mentorshipService.clearChatHistory(sessionId, q.mentorRole)
  })
}
