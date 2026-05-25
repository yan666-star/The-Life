export function safeJsonParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T
  } catch {
    return fallback
  }
}

export function toJson(v: unknown): string {
  return JSON.stringify(v)
}
