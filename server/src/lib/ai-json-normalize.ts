import { ATTR_KEYS } from '../config.js'
import { clampAttr, parseAttributes, addDelta } from './attributes.js'

function coerceNum(v: unknown, fallback = 50): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return clampAttr(v)
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/[^\d.-]/g, ''))
    if (!Number.isNaN(n)) return clampAttr(n)
  }
  return fallback
}

function coerceAttrs(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') {
    return parseAttributes({})
  }
  const o = raw as Record<string, unknown>
  const out: Record<string, number> = {}
  for (const k of ATTR_KEYS) {
    out[k] = coerceNum(o[k], 50)
  }
  return out
}

function coerceRiskLevel(v: unknown): 'low' | 'medium' | 'high' {
  const s = String(v ?? 'medium')
    .trim()
    .toLowerCase()
  if (['low', '低', 'lowrisk', '低风'].some((x) => s.includes(x))) return 'low'
  if (['high', '高', 'highrisk', '高风'].some((x) => s.includes(x))) return 'high'
  if (['medium', '中', 'mid', '中等'].some((x) => s.includes(x))) return 'medium'
  return 'medium'
}

function normalizeRisk(raw: unknown) {
  if (!raw || typeof raw !== 'object') {
    return { level: 'medium' as const, score: 40, factors: ['不确定性'] }
  }
  const r = raw as Record<string, unknown>
  let factors = r.factors
  if (typeof factors === 'string') factors = [factors]
  if (!Array.isArray(factors)) factors = ['执行不确定性']
  return {
    level: coerceRiskLevel(r.level),
    score: coerceNum(r.score, 40),
    factors: factors.map((f) => String(f)).filter(Boolean).slice(0, 5),
  }
}

function normalizeCandidate(raw: unknown, currentAttrs: Record<string, number>) {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const delta = coerceAttrs(c.attributeDelta ?? c.delta ?? c.impacts)
  const after = c.attributeAfter
    ? coerceAttrs(c.attributeAfter)
    : addDelta(parseAttributes(currentAttrs), delta)

  const story = String(c.story ?? c.description ?? c.narrative ?? '').trim()
  const title = String(c.title ?? c.name ?? '未命名分支').trim()

  return {
    title: title || '未命名分支',
    action: String(c.action ?? title).slice(0, 80),
    story: story.length >= 10 ? story : `${title}：${story || '剧情待补充'}`.slice(0, 300),
    result: String(c.result ?? '').trim(),
    risk: normalizeRisk(c.risk),
    attributeDelta: delta,
    attributeAfter: after,
    feasibility: coerceNum(c.feasibility, 65),
    difficulty: String(c.difficulty ?? '中等'),
    benefit: String(c.benefit ?? '中'),
    requiredCapital: c.requiredCapital ? String(c.requiredCapital) : undefined,
    keyMilestones: Array.isArray(c.keyMilestones)
      ? c.keyMilestones.map((m) => String(m))
      : undefined,
  }
}

/** 人物建模 JSON */
export function normalizeCharacterModel(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  let tags = o.personalityTags
  if (typeof tags === 'string') {
    tags = tags.split(/[,，、]/).map((t) => t.trim()).filter(Boolean)
  }
  if (!Array.isArray(tags)) tags = []

  const summary = String(
    o.characterSummary ?? o.summary ?? o.openingStory ?? o.story ?? ''
  ).trim()

  return {
    characterSummary:
      summary.length >= 20
        ? summary
        : `基于当前画像，你正站在人生岔路口：${summary || '前路未明，需要做出关键选择。'}`,
    goals: String(o.goals ?? o.lifeGoals ?? '成长与平衡'),
    constraints: String(o.constraints ?? o.limitations ?? '时间与资源有限'),
    personalityTags: tags,
    initialAttributes: coerceAttrs(o.initialAttributes ?? o.attributes),
    targetAttributes: coerceAttrs(o.targetAttributes ?? o.goals_attributes),
    reasoning: o.reasoning ? String(o.reasoning) : undefined,
  }
}

/** 三候选 JSON */
export function normalizeCandidatesResponse(
  raw: unknown,
  currentAttributes: Record<string, number>
): unknown {
  let list: unknown[] = []

  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.candidates)) list = o.candidates
    else if (Array.isArray(o.nodes)) list = o.nodes
    else if (Array.isArray(o.routes)) list = o.routes
    else if (o.data && typeof o.data === 'object') {
      const d = o.data as Record<string, unknown>
      if (Array.isArray(d.candidates)) list = d.candidates
    }
  }

  const normalized = list
    .map((item) => normalizeCandidate(item, currentAttributes))
    .filter(Boolean)
    .slice(0, 3)

  while (normalized.length < 3) {
    const i = normalized.length
    normalized.push({
      title: `分支方案 ${i + 1}`,
      action: `方案${i + 1}`,
      story: `在上一节点之后，你考虑第 ${i + 1} 种可能走向，需要结合现实约束做出判断。`,
      result: '',
      risk: { level: 'medium' as const, score: 45, factors: ['不确定性'] },
      attributeDelta: { career: 2, finance: 0, relationship: 1, health: 0, growth: 3 },
      attributeAfter: addDelta(parseAttributes(currentAttributes), {
        career: 2,
        finance: 0,
        relationship: 1,
        health: 0,
        growth: 3,
      }),
      feasibility: 60,
      difficulty: '中等',
      benefit: '中',
    })
  }

  return { candidates: normalized }
}

export function normalizeMentorReply(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  return {
    directAnswer: String(o.directAnswer ?? o.answer ?? o.reply ?? ''),
    rolePerspective: String(o.rolePerspective ?? o.perspective ?? ''),
    contextReasoning: o.contextReasoning ? String(o.contextReasoning) : undefined,
    suggestedActions: Array.isArray(o.suggestedActions)
      ? o.suggestedActions.map((a) => String(a))
      : undefined,
    followUpQuestion: o.followUpQuestion ? String(o.followUpQuestion) : undefined,
  }
}

export function normalizeFinalReport(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw
  const o = raw as Record<string, unknown>
  return {
    regretLevel: coerceNum(o.regretLevel, 40),
    regretText: String(o.regretText ?? '遗憾程度待评估'),
    pathSummary: String(o.pathSummary ?? o.summary ?? ''),
    finalAnalysis: String(o.finalAnalysis ?? o.analysis ?? ''),
    lifeAdvice: String(o.lifeAdvice ?? o.advice ?? ''),
    goalAlignment: o.goalAlignment,
    missedSignals: Array.isArray(o.missedSignals) ? o.missedSignals : [],
    nextActions: Array.isArray(o.nextActions) ? o.nextActions : [],
  }
}
