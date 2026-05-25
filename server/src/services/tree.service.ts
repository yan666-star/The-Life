import { prisma } from '../lib/prisma.js'
import { getSessionOrThrow } from './session.service.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import { buildChildrenMap, mapTreeNodeToApi } from '../lib/tree-map.js'
import { pruneInvalidPendingDescendants } from '../lib/tree-prune.js'

export async function getTree(sessionId: string) {
  await getSessionOrThrow(sessionId)
  await pruneInvalidPendingDescendants(sessionId)
  const nodes = await prisma.destinyTreeNode.findMany({
    where: { sessionId },
    orderBy: [{ depth: 'asc' }, { createdAt: 'asc' }],
  })
  const childrenMap = buildChildrenMap(nodes)
  return {
    nodes: nodes.map((n) => mapTreeNodeToApi(n, childrenMap)),
  }
}

export async function getActivePath(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const ordered = await prisma.chosenPathNode.findMany({
    where: { sessionId },
    orderBy: { orderIndex: 'asc' },
  })
  const nodeIds = ordered.map((p) => p.treeNodeId)
  const nodes = await prisma.destinyTreeNode.findMany({
    where: { id: { in: nodeIds } },
  })
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  return {
    path: ordered.map((p) => {
      const n = nodeMap.get(p.treeNodeId)
      return {
        treeNodeId: p.treeNodeId,
        orderIndex: p.orderIndex,
        summary: p.summary,
        title: n?.title,
        action: n?.action,
        result: n?.result,
        story: n?.story,
      }
    }),
  }
}

export async function deleteTreeNode(sessionId: string, nodeId: string) {
  await getSessionOrThrow(sessionId)
  const node = await prisma.destinyTreeNode.findFirst({
    where: { id: nodeId, sessionId },
  })
  if (!node) {
    throw new AppError(ErrorCodes.NODE_NOT_FOUND, 'Node not found', 404)
  }
  if (!node.parentId) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED, 'Cannot delete root node', 409)
  }
  if (node.isOnActivePath) {
    throw new AppError(
      ErrorCodes.VALIDATION_FAILED,
      'Cannot delete node on active path',
      409
    )
  }
  const all = await prisma.destinyTreeNode.findMany({ where: { sessionId } })
  const toDelete = new Set<string>()
  const collect = (id: string) => {
    toDelete.add(id)
    for (const n of all) {
      if (n.parentId === id) collect(n.id)
    }
  }
  collect(nodeId)
  await prisma.destinyTreeNode.deleteMany({
    where: { id: { in: [...toDelete] } },
  })
  return { deleted: [...toDelete] }
}
