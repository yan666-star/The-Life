import type { FastifyInstance } from 'fastify'
import { getSessionId } from '../plugins/session-header.js'
import * as reportService from '../services/report.service.js'

export async function reportRoutes(app: FastifyInstance) {
  app.post('/reports/final/generate', async (req) => {
    const sessionId = getSessionId(req)
    return reportService.generateFinalReport(sessionId)
  })

  app.get('/reports/final/current', async (req) => {
    const sessionId = getSessionId(req)
    return reportService.getCurrentReport(sessionId)
  })

  app.get('/reports/final/export', async (req) => {
    const sessionId = getSessionId(req)
    return reportService.exportReport(sessionId)
  })
}
