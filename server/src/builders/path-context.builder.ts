import { prisma } from '../lib/prisma.js'
import { safeJsonParse, toJson } from '../lib/json.js'
import { parseAttributes } from '../lib/attributes.js'
import type { characterModelSchema } from '../schemas/attributes.js'
import type { z } from 'zod'

type CharacterModel = z.infer<typeof characterModelSchema>

async function loadSessionBase(sessionId: string) {
  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      characterModel: true,
      attributeSnapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  if (!session) return null

  const character = session.characterModel
    ? (safeJsonParse(session.characterModel.dataJson, {}) as CharacterModel)
    : null

  const currentAttributes = session.attributeSnapshots[0]
    ? parseAttributes({
        career: session.attributeSnapshots[0].career,
        finance: session.attributeSnapshots[0].finance,
        relationship: session.attributeSnapshots[0].relationship,
        health: session.attributeSnapshots[0].health,
        growth: session.attributeSnapshots[0].growth,
      })
    : character?.initialAttributes ?? parseAttributes({})

  return { session, character, currentAttributes }
}

function mapNodeSummaries(
  nodes: Array<{
    id: string
    title: string
    action: string
    result: string
    summary: string
    depth: number
    round: number
    story: string
    payloadJson: string
  }>
) {
  const pathSummaries = nodes.map((n) => ({
    id: n.id,
    title: n.title,
    action: n.action,
    result: n.result,
    summary: n.summary || `${n.title}: ${n.action} → ${n.result}`.slice(0, 200),
    depth: n.depth,
    round: n.round,
  }))
  const recentFull = nodes.slice(-3).map((n) => ({
    id: n.id,
    title: n.title,
    story: n.story,
    action: n.action,
    result: n.result,
    payload: safeJsonParse(n.payloadJson, {}),
  }))
  const lastChosen = nodes[nodes.length - 1] ?? null
  return { pathSummaries, recentFull, lastChosenNode: lastChosen }
}

/** 主路径上下文：仅 isOnActivePath=true（plan：AI 生成与五维结算） */
export async function buildPathContext(sessionId: string) {
  const base = await loadSessionBase(sessionId)
  if (!base) return null

  const activeNodes = await prisma.destinyTreeNode.findMany({
    where: { sessionId, isOnActivePath: true },
    orderBy: [{ depth: 'asc' }, { round: 'asc' }],
  })

  const mapped = mapNodeSummaries(activeNodes)

  return {
    session: base.session,
    character: base.character,
    currentAttributes: base.currentAttributes,
    targetAttributes: base.character?.targetAttributes ?? base.currentAttributes,
    ...mapped,
    activePathLeafId:
      base.session.activePathLeafId ?? mapped.lastChosenNode?.id ?? null,
    workParentId: null as string | null,
  }
}

/**
 * 从指定「工作父节点」生成候选时的上下文（plan §从非主路径节点再延伸）：
 * 根 → 父节点链上 chosen 祖先 + 父节点本身（含 discarded 枯枝作平行假设分支）。
 * 五维仍用主路径最新快照（探索不改动 activePath 直至 choose）。
 */
export async function buildPathContextForParent(
  sessionId: string,
  workParentId: string
) {
  const base = await loadSessionBase(sessionId)
  if (!base) return null

  const all = await prisma.destinyTreeNode.findMany({
    where: { sessionId },
  })
  const byId = new Map(all.map((n) => [n.id, n]))
  const parent = byId.get(workParentId)
  if (!parent) return null

  const chain: typeof all = []
  let cur: (typeof all)[0] | undefined = parent
  while (cur) {
    chain.unshift(cur)
    cur = cur.parentId ? byId.get(cur.parentId) : undefined
  }

  const pathNodes = chain.filter(
    (n) => n.branchStatus === 'chosen' || n.id === workParentId
  )

  const mapped = mapNodeSummaries(pathNodes)

  return {
    session: base.session,
    character: base.character,
    currentAttributes: base.currentAttributes,
    targetAttributes: base.character?.targetAttributes ?? base.currentAttributes,
    ...mapped,
    activePathLeafId: base.session.activePathLeafId ?? null,
    workParentId,
  }
}

export function pathContextToPromptText(
  ctx: Awaited<ReturnType<typeof buildPathContext>>
) {
  if (!ctx) return ''
  return toJson({
    characterSummary: ctx.character?.characterSummary,
    goals: ctx.character?.goals,
    constraints: ctx.character?.constraints,
    currentAttributes: ctx.currentAttributes,
    targetAttributes: ctx.targetAttributes,
    pathSummaries: ctx.pathSummaries,
    recentFullNodes: ctx.recentFull,
    workParentId: ctx.workParentId,
    lastChosenNode: ctx.lastChosenNode
      ? {
          title: ctx.lastChosenNode.title,
          story: ctx.lastChosenNode.story,
          action: ctx.lastChosenNode.action,
          result: ctx.lastChosenNode.result,
        }
      : null,
  })
}
