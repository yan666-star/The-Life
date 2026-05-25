import type { FastifyInstance } from 'fastify'
import { getSessionId } from '../plugins/session-header.js'
import * as comparisonService from '../services/comparison.service.js'

export async function comparisonRoutes(app: FastifyInstance) {
  app.put('/comparison/slots/:side', async (req) => {
    const sessionId = getSessionId(req)
    const side = (req.params as { side: string }).side as 'left' | 'right'
    const body = req.body as { treeNodeId?: string; packetSnapshot?: unknown }
    return comparisonService.setComparisonSlot(sessionId, side, body)
  })

  app.get('/comparison', async (req) => {
    const sessionId = getSessionId(req)
    return comparisonService.getComparison(sessionId)
  })

  app.delete('/comparison/slots/:side', async (req) => {
    const sessionId = getSessionId(req)
    const side = (req.params as { side: string }).side
    return comparisonService.clearComparisonSlot(sessionId, side)
  })

  app.post('/comparison/videos/generate', async (req) => {
    const sessionId = getSessionId(req)
    return comparisonService.generateComparisonVideos(sessionId)
  })

  app.get('/comparison/videos/:side', async (req) => {
    const sessionId = getSessionId(req)
    const side = (req.params as { side: string }).side
    return comparisonService.getComparisonVideo(sessionId, side)
  })
}
