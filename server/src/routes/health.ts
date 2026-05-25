import type { FastifyInstance } from 'fastify'
import { getModelProvider } from '../providers/registry.js'
import { config } from '../config.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const provider = getModelProvider()
    const ollama = await provider.healthCheck()
    return {
      ok: true,
      aiProvider: config.aiProvider,
      ollama,
    }
  })
}
