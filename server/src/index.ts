import Fastify from 'fastify'
import cors from '@fastify/cors'
import { config } from './config.js'
import { AppError } from './lib/errors.js'
import { healthRoutes } from './routes/health.js'
import { sessionRoutes } from './routes/sessions.js'
import { treeRoutes } from './routes/tree.js'
import { comparisonRoutes } from './routes/comparison.js'
import { aiRoutes } from './routes/ai.js'
import { reportRoutes } from './routes/reports.js'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  await mkdir(path.join(__dirname, '..', 'data'), { recursive: true })

  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({
        code: err.code,
        message: err.message,
        details: err.details,
      })
    }
    app.log.error(err)
    return reply.status(500).send({
      code: 'INTERNAL_ERROR',
      message: err instanceof Error ? err.message : 'Internal error',
    })
  })

  await app.register(async (api) => {
    await healthRoutes(api)
    await sessionRoutes(api)
    await treeRoutes(api)
    await comparisonRoutes(api)
    await aiRoutes(api)
    await reportRoutes(api)
  }, { prefix: '/api' })

  await app.listen({ port: config.port, host: '0.0.0.0' })
  console.log(`Life Divergence API http://localhost:${config.port}/api`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
