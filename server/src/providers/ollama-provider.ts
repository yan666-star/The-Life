import type { ZodSchema } from 'zod'
import { z } from 'zod'
import { config } from '../config.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import type {
  GenerateJsonInput,
  GenerateTextInput,
  ModelProvider,
} from './model-provider.js'

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  // 去掉 markdown 代码块
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = fenced ? fenced[1].trim() : trimmed

  try {
    return JSON.parse(body)
  } catch {
    const start = body.indexOf('{')
    const end = body.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(body.slice(start, end + 1))
    }
    const aStart = body.indexOf('[')
    const aEnd = body.lastIndexOf(']')
    if (aStart >= 0 && aEnd > aStart) {
      return JSON.parse(body.slice(aStart, aEnd + 1))
    }
    throw new Error('模型输出中未找到有效 JSON')
  }
}

function formatZodError(err: z.ZodError): string {
  const first = err.issues[0]
  if (!first) return 'JSON 结构与预期不符'
  const path = first.path.length ? first.path.join('.') : '根对象'
  return `${path}: ${first.message}`
}

export class OllamaProvider implements ModelProvider {
  name = 'ollama'

  async healthCheck() {
    try {
      const res = await fetch(`${config.ollama.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` }
      }
      return { ok: true, model: config.ollama.model }
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'Ollama unreachable',
      }
    }
  }

  private async callGenerate(
    prompt: string,
    formatJson: boolean,
    timeoutMs: number
  ): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.ollama.model,
          prompt,
          stream: false,
          ...(formatJson ? { format: 'json' } : {}),
        }),
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new AppError(
          ErrorCodes.OLLAMA_UNAVAILABLE,
          `Ollama 请求失败: ${res.status}`,
          503
        )
      }
      const data = (await res.json()) as { response?: string }
      return data.response ?? ''
    } catch (e) {
      if (e instanceof AppError) throw e
      throw new AppError(
        ErrorCodes.OLLAMA_UNAVAILABLE,
        e instanceof Error ? e.message : 'Ollama 不可用',
        503
      )
    } finally {
      clearTimeout(timer)
    }
  }

  async generateJson<T>(input: GenerateJsonInput<T>): Promise<T> {
    const prompt = `${input.systemPrompt}\n\n${input.userPrompt}\n\n只输出合法 JSON，不要 markdown 代码块，不要额外说明。`
    const raw = await this.callGenerate(
      prompt,
      true,
      input.timeoutMs ?? config.ollama.timeoutMs
    )
    let parsed = extractJson(raw)
    if (input.normalize) {
      parsed = input.normalize(parsed)
    }

    const result = input.schema.safeParse(parsed)
    if (!result.success) {
      throw new AppError(
        ErrorCodes.AI_PARSE_FAILED,
        `AI 返回格式不匹配：${formatZodError(result.error)}`,
        422,
        result.error.flatten()
      )
    }
    return result.data
  }

  async generateText(input: GenerateTextInput): Promise<string> {
    const prompt = `${input.systemPrompt}\n\n${input.userPrompt}`
    return this.callGenerate(
      prompt,
      false,
      input.timeoutMs ?? config.ollama.timeoutMs
    )
  }
}
