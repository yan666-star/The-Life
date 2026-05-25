import { config } from '../config.js'
import { DifyProvider } from './dify-provider.js'
import { OllamaProvider } from './ollama-provider.js'
import type { ModelProvider } from './model-provider.js'

let instance: ModelProvider | null = null

export function getModelProvider(): ModelProvider {
  if (instance) return instance
  if (config.aiProvider === 'dify') {
    instance = new DifyProvider()
  } else {
    instance = new OllamaProvider()
  }
  return instance
}

export function resetModelProvider() {
  instance = null
}
