import { ATTR_KEYS, type Attributes, type AttrKey } from '../config.js'

export function clampAttr(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function parseAttributes(raw: unknown): Attributes {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, number>
  const out = {} as Attributes
  for (const k of ATTR_KEYS) {
    out[k] = clampAttr(Number(o[k] ?? 50))
  }
  return out
}

export function addDelta(base: Attributes, delta: Partial<Attributes>): Attributes {
  const out = {} as Attributes
  for (const k of ATTR_KEYS) {
    out[k] = clampAttr((base[k] ?? 0) + (delta[k] ?? 0))
  }
  return out
}

export function attributeGaps(
  target: Attributes,
  current: Attributes
): Record<AttrKey, number> {
  const gaps = {} as Record<AttrKey, number>
  for (const k of ATTR_KEYS) {
    gaps[k] = target[k] - current[k]
  }
  return gaps
}

export function computeRegretBaseScore(
  target: Attributes,
  current: Attributes,
  volatility = 0
): number {
  let weightedGap = 0
  let weightSum = 0
  for (const k of ATTR_KEYS) {
    const gap = Math.max(0, target[k] - current[k])
    weightedGap += gap
    weightSum += 1
  }
  const avgGap = weightSum ? weightedGap / weightSum : 0
  const avgNow =
    ATTR_KEYS.reduce((s, k) => s + current[k], 0) / ATTR_KEYS.length
  const base = Math.max(0, 100 - avgNow)
  return clampAttr(Math.min(100, Math.round(base * 0.4 + avgGap * 0.5 + volatility * 0.3)))
}
