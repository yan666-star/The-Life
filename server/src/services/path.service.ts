import { prisma } from '../lib/prisma.js'
import { toJson, safeJsonParse } from '../lib/json.js'
import { parseAttributes, addDelta } from '../lib/attributes.js'
import { deleteAllDescendantsOfParents } from '../lib/branch-extension.js'
import { pruneInvalidPendingDescendants } from '../lib/tree-prune.js'
import { getSessionOrThrow } from './session.service.js'
import { AppError, ErrorCodes } from '../lib/errors.js'

async function markAncestorsOnActivePath(sessionId: string, nodeId: string) {
  let curId: string | null = nodeId
  while (curId) {
    await prisma.destinyTreeNode.update({
      where: { id: curId },
      data: { isOnActivePath: true },
    })
    const row: { parentId: string | null } | null =
      await prisma.destinyTreeNode.findFirst({
        where: { id: curId, sessionId },
        select: { parentId: true },
      })
    curId = row?.parentId ?? null
  }
}

export async function choosePath(sessionId: string, candidateNodeId: string) {
  await getSessionOrThrow(sessionId)

  const node = await prisma.destinyTreeNode.findFirst({
    where: { id: candidateNodeId, sessionId },
  })
  if (!node) {
    throw new AppError(
      ErrorCodes.INVALID_CHOICE,
      'Candidate node not found or not pending',
      400
    )
  }

  if (node.branchStatus === 'chosen' && node.isOnActivePath) {
    const latest = await prisma.attributeSnapshot.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    })
    const current = latest
      ? parseAttributes({
          career: latest.career,
          finance: latest.finance,
          relationship: latest.relationship,
          health: latest.health,
          growth: latest.growth,
        })
      : parseAttributes({})
    const payload = safeJsonParse(node.payloadJson, {}) as {
      attributeDelta?: Record<string, number>
    }
    const pathLen = await prisma.chosenPathNode.count({ where: { sessionId } })
    return {
      chosenNodeId: node.id,
      activePathLeafId: node.id,
      pathLength: pathLen,
      currentAttributes: current,
      attributeDelta: payload.attributeDelta ?? {},
    }
  }

  if (node.branchStatus !== 'pending') {
    throw new AppError(
      ErrorCodes.INVALID_CHOICE,
      'Candidate node not found or not pending',
      400
    )
  }

  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } })
  const leafId = session?.activePathLeafId
  if (leafId && node.parentId !== leafId) {
    throw new AppError(
      ErrorCodes.INVALID_CHOICE,
      'Can only choose from pending children of active path leaf',
      400
    )
  }

  const payload = safeJsonParse(node.payloadJson, {}) as {
    attributeDelta?: Record<string, number>
    attributeAfter?: Record<string, number>
  }

  const latest = await prisma.attributeSnapshot.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  })
  const base = latest
    ? parseAttributes({
        career: latest.career,
        finance: latest.finance,
        relationship: latest.relationship,
        health: latest.health,
        growth: latest.growth,
      })
    : parseAttributes({})

  const after = payload.attributeAfter
    ? parseAttributes(payload.attributeAfter)
    : addDelta(base, payload.attributeDelta ?? {})

  const siblings = await prisma.destinyTreeNode.findMany({
    where: { sessionId, parentId: node.parentId, branchStatus: 'pending' },
  })

  // plan：本批候选在确认前均不应有后继（含将入选节点，下一轮再挂 3 条）
  await deleteAllDescendantsOfParents(
    sessionId,
    siblings.map((s) => s.id)
  )

  for (const s of siblings) {
    await prisma.destinyTreeNode.update({
      where: { id: s.id },
      data: {
        branchStatus: s.id === node.id ? 'chosen' : 'discarded',
        isOnActivePath: s.id === node.id,
      },
    })
  }

  await pruneInvalidPendingDescendants(sessionId)

  await markAncestorsOnActivePath(sessionId, node.id)

  const orderIndex = await prisma.chosenPathNode.count({ where: { sessionId } })

  await prisma.chosenPathNode.upsert({
    where: {
      sessionId_treeNodeId: { sessionId, treeNodeId: node.id },
    },
    create: {
      sessionId,
      treeNodeId: node.id,
      orderIndex,
      summary: node.summary,
      fullContent: toJson({
        title: node.title,
        story: node.story,
        action: node.action,
        result: node.result,
        payload,
      }),
    },
    update: {
      summary: node.summary,
      fullContent: toJson({
        title: node.title,
        story: node.story,
        action: node.action,
        result: node.result,
        payload,
      }),
    },
  })

  await prisma.attributeSnapshot.create({
    data: {
      sessionId,
      round: node.round,
      career: after.career,
      finance: after.finance,
      relationship: after.relationship,
      health: after.health,
      growth: after.growth,
      source: 'node_choice',
      treeNodeId: node.id,
    },
  })

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { activePathLeafId: node.id },
  })

  return {
    chosenNodeId: node.id,
    activePathLeafId: node.id,
    pathLength: orderIndex + 1,
    currentAttributes: after,
    attributeDelta: payload.attributeDelta ?? {},
  }
}

export async function getCurrentPath(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const rows = await prisma.chosenPathNode.findMany({
    where: { sessionId },
    orderBy: { orderIndex: 'asc' },
  })
  return {
    path: rows.map((r) => ({
      treeNodeId: r.treeNodeId,
      orderIndex: r.orderIndex,
      summary: r.summary,
      fullContent: safeJsonParse(r.fullContent, {}),
    })),
  }
}

export async function getCurrentAttributes(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const latest = await prisma.attributeSnapshot.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  })
  const history = await prisma.attributeSnapshot.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: 24,
  })
  const current = latest
    ? parseAttributes({
        career: latest.career,
        finance: latest.finance,
        relationship: latest.relationship,
        health: latest.health,
        growth: latest.growth,
      })
    : parseAttributes({})
  return {
    current,
    history: history.map((h) => ({
      career: h.career,
      finance: h.finance,
      relationship: h.relationship,
      health: h.health,
      growth: h.growth,
      time: h.createdAt.toISOString(),
      source: h.source,
    })),
  }
}
