import type { FastifyInstance } from 'fastify'
import { getSessionId } from '../plugins/session-header.js'
import * as treeService from '../services/tree.service.js'
import * as candidateService from '../services/candidate.service.js'
import * as pathService from '../services/path.service.js'

export async function treeRoutes(app: FastifyInstance) {
  app.get('/tree', async (req) => {
    const sessionId = getSessionId(req)
    return treeService.getTree(sessionId)
  })

  app.get('/tree/active-path', async (req) => {
    const sessionId = getSessionId(req)
    return treeService.getActivePath(sessionId)
  })

  app.delete('/tree/nodes/:id', async (req) => {
    const sessionId = getSessionId(req)
    const nodeId = (req.params as { id: string }).id
    return treeService.deleteTreeNode(sessionId, nodeId)
  })

  app.post('/nodes/candidates', async (req) => {
    const sessionId = getSessionId(req)
    const body = req.body as { parentTreeNodeId?: string }
    return candidateService.generateCandidates(sessionId, body.parentTreeNodeId)
  })

  app.get('/nodes/candidates/latest', async (req) => {
    const sessionId = getSessionId(req)
    const q = req.query as { parentTreeNodeId?: string }
    return candidateService.getLatestCandidates(sessionId, q.parentTreeNodeId)
  })

  app.post('/path/choose', async (req) => {
    const sessionId = getSessionId(req)
    const body = req.body as { candidateNodeId: string }
    return pathService.choosePath(sessionId, body.candidateNodeId)
  })

  app.get('/path/current', async (req) => {
    const sessionId = getSessionId(req)
    return pathService.getCurrentPath(sessionId)
  })

  app.get('/attributes/current', async (req) => {
    const sessionId = getSessionId(req)
    return pathService.getCurrentAttributes(sessionId)
  })
}
