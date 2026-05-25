import type { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { toJson, safeJsonParse } from '../lib/json.js'
import { parseAttributes, addDelta } from '../lib/attributes.js'
import { normalizeCandidatesResponse } from '../lib/ai-json-normalize.js'
import { validateGenerationParent } from '../lib/branch-extension.js'
import { pruneInvalidPendingDescendants } from '../lib/tree-prune.js'
import { getModelProvider } from '../providers/registry.js'
import { candidatesResponseSchema } from '../schemas/attributes.js'
import { candidatesSystemPrompt, candidatesUserPrompt } from '../prompts/candidates.js'
import {
  buildPathContext,
  buildPathContextForParent,
  pathContextToPromptText,
} from '../builders/path-context.builder.js'
import { getSessionOrThrow } from './session.service.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import { config } from '../config.js'
import { randomUUID } from 'node:crypto'

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '')
}

function validateCandidates(
  candidates: Array<{ title: string; action: string; attributeDelta: Record<string, number>; attributeAfter: Record<string, number> }>,
  current: ReturnType<typeof parseAttributes>,
  existingActions: string[]
) {
  const titles = new Set<string>()
  const actions = new Set<string>()
  for (const c of candidates) {
    const t = normalize(c.title)
    const a = normalize(c.action)
    if (titles.has(t)) return 'duplicate title in batch'
    if (actions.has(a)) return 'duplicate action in batch'
    titles.add(t)
    actions.add(a)
    if (existingActions.some((e) => normalize(e) === a)) return 'action repeats path history'
    const expected = addDelta(current, c.attributeDelta as never)
    for (const k of Object.keys(expected) as (keyof typeof expected)[]) {
      if (Math.abs((c.attributeAfter as Record<string, number>)[k] - expected[k]) > 1) {
        return `attributeAfter mismatch on ${k}`
      }
    }
  }
  return null
}

function fallbackCandidates(
  parentTitle: string,
  current: ReturnType<typeof parseAttributes>
) {
  const templates = [
    { title: '稳健推进', action: '按现有节奏巩固成果', story: `在「${parentTitle}」基础上稳步前行`, result: '风险可控的小幅进展' },
    { title: '积极突破', action: '接受更高挑战换取成长', story: `从「${parentTitle}」出发寻求突破`, result: '短期压力换取长期机会' },
    { title: '迂回验证', action: '小规模试点再决定方向', story: `围绕「${parentTitle}」做低成本验证`, result: '获得关键反馈再投入' },
  ]
  return templates.map((t, i) => {
    const delta = { career: 3 + i, finance: i - 1, relationship: 1, health: -1, growth: 4 - i }
    const after = addDelta(current, delta as never)
    return {
      ...t,
      risk: { level: 'medium' as const, score: 40 + i * 10, factors: ['执行不确定性'] },
      attributeDelta: delta,
      attributeAfter: after,
      feasibility: 65 + i * 5,
      difficulty: i === 1 ? '高' : '中等',
      benefit: '中高',
      keyMilestones: ['阶段验证', '复盘调整'],
    }
  })
}

export async function generateCandidates(
  sessionId: string,
  parentTreeNodeId?: string
) {
  const session = await getSessionOrThrow(sessionId)
  if (session.generatingLock) {
    throw new AppError(
      ErrorCodes.GENERATING_IN_PROGRESS,
      'Generation already in progress',
      409
    )
  }
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { generatingLock: true },
  })

  try {
    await pruneInvalidPendingDescendants(sessionId)

    let parentId = parentTreeNodeId
    if (!parentId) {
      const baseCtx = await buildPathContext(sessionId)
      parentId =
        baseCtx?.activePathLeafId ?? baseCtx?.lastChosenNode?.id ?? undefined
    }
    if (!parentId) {
      const root = await prisma.destinyTreeNode.findFirst({
        where: { sessionId, parentId: null },
      })
      parentId = root?.id
    }
    if (!parentId) {
      throw new AppError(ErrorCodes.VALIDATION_FAILED, 'No parent node', 400)
    }

    const parent = await validateGenerationParent(sessionId, parentId)
    const activeLeafId = session.activePathLeafId
    const onActivePath =
      parent.isOnActivePath && parent.branchStatus === 'chosen'

    const ctx = onActivePath
      ? await buildPathContext(sessionId)
      : await buildPathContextForParent(sessionId, parentId)
    if (!ctx) throw new AppError(ErrorCodes.SESSION_NOT_FOUND, 'No context', 404)

  const hasResolvedChild = await prisma.destinyTreeNode.findFirst({
    where: {
      sessionId,
      parentId,
      branchStatus: { in: ['chosen', 'discarded'] },
    },
  })

  const existingPending = await prisma.destinyTreeNode.findMany({
    where: { sessionId, parentId, branchStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
  })
  if (existingPending.length > 3) {
    const extras = existingPending.slice(3)
    await prisma.destinyTreeNode.deleteMany({
      where: { id: { in: extras.map((n) => n.id) }, sessionId },
    })
    await pruneInvalidPendingDescendants(sessionId)
  }
  if (existingPending.length >= 3) {
    return formatCandidateBatch(existingPending.slice(0, 3))
  }

  // 同父已走完一轮选择（chosen+discarded）：仅返回已有 pending，或拒绝重复生成
  if (hasResolvedChild) {
    if (existingPending.length) {
      return formatCandidateBatch(existingPending.slice(0, 3))
    }
    throw new AppError(
      ErrorCodes.INVALID_CHOICE,
      'This parent already resolved a branch batch; pick a leaf or explore another parent',
      400
    )
  }

  // 残缺批次（1～2 条）且无已选兄弟时，清理后重生成
  if (existingPending.length > 0) {
    await prisma.destinyTreeNode.deleteMany({
      where: {
        id: { in: existingPending.map((n) => n.id) },
        sessionId,
        branchStatus: 'pending',
      },
    })
  }

  const round = (parent.round ?? 0) + 1
  const provider = getModelProvider()
  const contextText = pathContextToPromptText(ctx)
  const existingActions = ctx.pathSummaries.map((p) => p.action).filter(Boolean)

  let candidates: z.infer<typeof candidatesResponseSchema>['candidates'] | null = null
  let lastError = ''

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const hint =
        attempt > 0 ? `\nPrevious attempt failed: ${lastError}. Fix and return valid JSON.` : ''
      const raw = await provider.generateJson({
        systemPrompt: candidatesSystemPrompt,
        userPrompt: candidatesUserPrompt(contextText, parent.title) + hint,
        schema: candidatesResponseSchema,
        normalize: (r) =>
          normalizeCandidatesResponse(r, ctx.currentAttributes) as z.infer<
            typeof candidatesResponseSchema
          >,
      })
      const err = validateCandidates(raw.candidates, ctx.currentAttributes, existingActions)
      if (err) {
        lastError = err
        continue
      }
      candidates = raw.candidates
      break
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'parse failed'
    }
  }

  if (!candidates) {
    if (lastError) {
      // use fallback when ollama fails entirely
      candidates = fallbackCandidates(parent.title, ctx.currentAttributes)
    } else {
      throw new AppError(
        ErrorCodes.GENERATION_EXHAUSTED,
        `Failed to generate valid candidates: ${lastError}`,
        422
      )
    }
  }

  const batch = await prisma.nodeGenerationBatch.create({
    data: {
      sessionId,
      parentTreeNodeId: parentId,
      round,
      promptVersion: config.promptVersion,
      provider: provider.name,
      model: config.ollama.model,
    },
  })

  const created = []
  for (const c of candidates) {
    const after = parseAttributes(c.attributeAfter)
    const node = await prisma.destinyTreeNode.create({
      data: {
        sessionId,
        parentId,
        depth: parent.depth + 1,
        round,
        title: c.title,
        action: c.action,
        story: c.story,
        result: c.result,
        summary: `${c.title}: ${c.action}`.slice(0, 200),
        branchStatus: 'pending',
        isOnActivePath: false,
        batchId: batch.id,
        payloadJson: toJson({
          risk: c.risk,
          attributeDelta: c.attributeDelta,
          attributeAfter: after,
          feasibility: c.feasibility,
          difficulty: c.difficulty,
          benefit: c.benefit,
          requiredCapital: c.requiredCapital,
          keyMilestones: c.keyMilestones,
        }),
      },
    })
    created.push(node)
  }

  return formatCandidateBatch(created)
  } finally {
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { generatingLock: false },
    })
  }
}

function formatCandidateBatch(nodes: { id: string; parentId: string | null; round: number; title: string; action: string; story: string; result: string; payloadJson: string }[]) {
  return {
    batchId: nodes[0] ? undefined : null,
    candidates: nodes.map((n) => {
      const p = safeJsonParse(n.payloadJson, {}) as Record<string, unknown>
      return {
        id: n.id,
        parentNodeId: n.parentId,
        round: n.round,
        title: n.title,
        action: n.action,
        story: n.story,
        result: n.result,
        ...p,
        impacts: (p as { attributeDelta?: unknown }).attributeDelta,
        description: `${n.story}\n${n.result}`,
      }
    }),
  }
}

export async function getLatestCandidates(
  sessionId: string,
  parentTreeNodeId?: string
) {
  await getSessionOrThrow(sessionId)
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
  const parentId =
    parentTreeNodeId ?? session?.activePathLeafId ?? undefined
  if (!parentId) return { candidates: [] }

  const pending = await prisma.destinyTreeNode.findMany({
    where: { sessionId, parentId, branchStatus: 'pending' },
    orderBy: { createdAt: 'asc' },
  })
  return formatCandidateBatch(pending)
}
