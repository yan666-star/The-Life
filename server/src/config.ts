import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: Number(process.env.PORT || 3001),
  databaseUrl:
    process.env.DATABASE_URL ||
    `file:${path.join(__dirname, '..', 'data', 'life.db')}`,
  aiProvider: process.env.AI_PROVIDER || 'ollama',
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'gpt-oss:120b-cloud',
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 180000),
  },
  videoProvider: process.env.VIDEO_PROVIDER || 'stub',
  dify: {
    baseUrl: process.env.DIFY_BASE_URL || '',
    apiKey: process.env.DIFY_API_KEY || '',
    appId: process.env.DIFY_APP_ID || '',
  },
  promptVersion: 'v1',
}

export const ATTR_KEYS = ['career', 'finance', 'relationship', 'health', 'growth'] as const
export type AttrKey = (typeof ATTR_KEYS)[number]
export type Attributes = Record<AttrKey, number>
