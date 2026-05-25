import { safeJsonParse } from './json.js'

export type TreeNodeRow = {
  id: string
  parentId: string | null
  title: string
  action: string
  story: string
  result: string
  summary: string
  depth: number
  round: number
  branchStatus: string
  isOnActivePath: boolean
  payloadJson: string
  createdAt: Date
}

export function buildChildrenMap(nodes: TreeNodeRow[]) {
  const childrenMap = new Map<string, string[]>()
  for (const n of nodes) {
    if (n.parentId) {
      const arr = childrenMap.get(n.parentId) ?? []
      arr.push(n.id)
      childrenMap.set(n.parentId, arr)
    }
  }
  return childrenMap
}

export function mapTreeNodeToApi(
  n: TreeNodeRow,
  childrenMap: Map<string, string[]>
) {
  const payload = safeJsonParse(n.payloadJson, {}) as Record<string, unknown>
  const attributeDelta =
    (payload.attributeDelta as Record<string, number> | undefined) ?? {}
  return {
    id: n.id,
    parentId: n.parentId,
    title: n.title,
    action: n.action,
    story: n.story,
    result: n.result,
    summary: n.summary,
    description: n.summary || n.story,
    depth: n.depth,
    round: n.round,
    branchStatus: n.branchStatus,
    isOnActivePath: n.isOnActivePath,
    children: childrenMap.get(n.id) ?? [],
    payload,
    attributeDelta,
    risk: payload.risk,
    createdAt: n.createdAt.toISOString(),
  }
}
