import type { FastifyInstance } from 'fastify'
import * as sessionService from '../services/session.service.js'
import * as profileService from '../services/profile.service.js'
import { getSessionId } from '../plugins/session-header.js'

export async function sessionRoutes(app: FastifyInstance) {
  app.post('/sessions', async () => {
    const s = await sessionService.createSession()
    return { sessionId: s.id, status: s.status }
  })

  app.get('/sessions/:id', async (req) => {
    const id = (req.params as { id: string }).id
    return sessionService.getSessionState(id)
  })

  app.delete('/sessions/:id', async (req) => {
    const id = (req.params as { id: string }).id
    return sessionService.deleteSession(id)
  })

  app.post('/profile/model', async (req) => {
    const sessionId = getSessionId(req)
    const body = req.body as { userInfo?: unknown }
    return profileService.modelProfile(sessionId, body.userInfo ?? body)
  })
}
