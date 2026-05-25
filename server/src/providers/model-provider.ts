import type { ZodSchema } from 'zod'

export interface GenerateJsonInput<T> {
  systemPrompt: string
  userPrompt: string
  schema: ZodSchema<T>
  normalize?: (raw: unknown) => unknown
  temperature?: number
  timeoutMs?: number
}

export interface GenerateTextInput {
  systemPrompt: string
  userPrompt: string
  temperature?: number
  timeoutMs?: number
}

export interface ModelProvider {
  name: string
  generateJson<T>(input: GenerateJsonInput<T>): Promise<T>
  generateText(input: GenerateTextInput): Promise<string>
  healthCheck(): Promise<{ ok: boolean; model?: string; error?: string }>
}
