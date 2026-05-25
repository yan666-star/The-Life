import { prisma } from '../lib/prisma.js'
import { AppError, ErrorCodes } from './errors.js'

/** pending 候选不能作为父节点挂子节点 */
export async function validateGenerationParent(sessionId: string, parentId: string) {
  const parent = await prisma.destinyTreeNode.findFirst({
    where: { id: parentId, sessionId },
  })
  if (!parent) {
    throw new AppError(ErrorCodes.NODE_NOT_FOUND, 'Parent node not found', 404)
  }
  if (parent.branchStatus === 'pending') {
    throw new AppError(
      ErrorCodes.INVALID_CHOICE,
      'Pending candidates cannot be a parent for new branches',
      400
    )
  }
  return parent
}

/** 删除挂在指定父节点下的全部子节点（及其后代） */
export async function deleteAllDescendantsOfParents(
  sessionId: string,
  parentIds: string[]
): Promise<string[]> {
  if (!parentIds.length) return []
  const all = await prisma.destinyTreeNode.findMany({
    where: { sessionId },
    select: { id: true, parentId: true },
  })
  const childrenByParent = new Map<string, string[]>()
  for (const n of all) {
    if (!n.parentId) continue
    const arr = childrenByParent.get(n.parentId) ?? []
    arr.push(n.id)
    childrenByParent.set(n.parentId, arr)
  }
  const toDelete = new Set<string>()
  const collect = (id: string) => {
    for (const childId of childrenByParent.get(id) ?? []) {
      toDelete.add(childId)
      collect(childId)
    }
  }
  for (const pid of parentIds) collect(pid)
  if (!toDelete.size) return []
  const ids = [...toDelete]
  await prisma.chosenPathNode.deleteMany({
    where: { sessionId, treeNodeId: { in: ids } },
  })
  await prisma.attributeSnapshot.deleteMany({
    where: { sessionId, treeNodeId: { in: ids } },
  })
  await prisma.destinyTreeNode.deleteMany({
    where: { sessionId, id: { in: ids } },
  })
  return ids
}
