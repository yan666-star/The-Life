import type { ZodSchema } from 'zod'
import { config } from '../config.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import type {
  GenerateJsonInput,
  GenerateTextInput,
  ModelProvider,
} from './model-provider.js'

/** Stub: not configured in v1; explicit error when selected without credentials */
export class DifyProvider implements ModelProvider {
  name = 'dify'

  private ensureConfigured() {
    if (!config.dify.baseUrl || !config.dify.apiKey) {
      throw new AppError(
        ErrorCodes.DIFY_NOT_CONFIGURED,
        'Dify provider is not configured. Set DIFY_BASE_URL and DIFY_API_KEY or use AI_PROVIDER=ollama.',
        501
      )
    }
  }

  async healthCheck() {
    if (!config.dify.baseUrl || !config.dify.apiKey) {
      return { ok: false, error: 'Dify not configured' }
    }
    return { ok: true, model: 'dify-workflow' }
  }

  async generateJson<T>(_input: GenerateJsonInput<T>): Promise<T> {
    this.ensureConfigured()
    throw new AppError(
      ErrorCodes.DIFY_NOT_CONFIGURED,
      'DifyProvider.generateJson not implemented in v1',
      501
    )
  }

  async generateText(_input: GenerateTextInput): Promise<string> {
    this.ensureConfigured()
    throw new AppError(
      ErrorCodes.DIFY_NOT_CONFIGURED,
      'DifyProvider.generateText not implemented in v1',
      501
    )
  }
}
