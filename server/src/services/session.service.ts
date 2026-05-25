import { prisma } from '../lib/prisma.js'
import { safeJsonParse } from '../lib/json.js'
import { parseAttributes } from '../lib/attributes.js'
import { buildPathContext } from '../builders/path-context.builder.js'
import { buildChildrenMap, mapTreeNodeToApi } from '../lib/tree-map.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import type { characterModelSchema } from '../schemas/attributes.js'
import type { z } from 'zod'

type CharacterModel = z.infer<typeof characterModelSchema>

export async function createSession() {
  return prisma.gameSession.create({ data: { status: 'active' } })
}

export async function getSessionOrThrow(sessionId: string) {
  const s = await prisma.gameSession.findUnique({ where: { id: sessionId } })
  if (!s) {
    throw new AppError(ErrorCodes.SESSION_NOT_FOUND, 'Session not found', 404)
  }
  return s
}

export async function getSessionState(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const ctx = await buildPathContext(sessionId)
  const character = ctx?.character ?? null
  const latest = ctx?.currentAttributes ?? parseAttributes({})
  const target = ctx?.targetAttributes ?? latest

  const treeNodes = await prisma.destinyTreeNode.findMany({
    where: { sessionId },
    orderBy: [{ depth: 'asc' }, { createdAt: 'asc' }],
  })

  const childrenMap = buildChildrenMap(treeNodes)
  const nodes = treeNodes.map((n) => mapTreeNodeToApi(n, childrenMap))

  const history = await prisma.attributeSnapshot.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    take: 24,
  })

  return {
    sessionId,
    status: ctx?.session.status ?? 'active',
    activePathLeafId: ctx?.activePathLeafId,
    characterModel: character,
    initialAttributes: character?.initialAttributes ?? latest,
    targetAttributes: target,
    currentAttributes: latest,
    attributeHistory: history.map((h) => ({
      career: h.career,
      finance: h.finance,
      relationship: h.relationship,
      health: h.health,
      growth: h.growth,
      time: h.createdAt.toISOString(),
      source: h.source,
    })),
    tree: { nodes },
    hasProfile: !!character,
  }
}

export async function deleteSession(sessionId: string) {
  await getSessionOrThrow(sessionId)
  await prisma.gameSession.delete({ where: { id: sessionId } })
  return { ok: true }
}

export function parseCharacterModel(
  dataJson: string | null | undefined
): CharacterModel | null {
  if (!dataJson) return null
  return safeJsonParse(dataJson, null) as CharacterModel | null
}
