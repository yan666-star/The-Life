import { prisma } from './prisma.js'
import { deleteAllDescendantsOfParents } from './branch-extension.js'

/**
 * pending 节点绝不应有子节点（非法状态清理）。
 * discarded 枯枝在 plan 下默认无子节点；用户从枯枝「探索」生成的 pending 子节点不删。
 */
export async function pruneInvalidPendingDescendants(sessionId: string) {
  const pending = await prisma.destinyTreeNode.findMany({
    where: { sessionId, branchStatus: 'pending' },
    select: { id: true },
  })
  const pendingIds = pending.map((n) => n.id)
  const deleted = await deleteAllDescendantsOfParents(sessionId, pendingIds)
  return { deleted }
}
