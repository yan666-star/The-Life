/**
 * 将后端命轨节点列表转为前端树结构（children 以 parentId 关系为准）
 */
export function mapTreeNodesFromApi(nodes) {
  if (!Array.isArray(nodes) || !nodes.length) return []

  const childIds = new Map()
  for (const n of nodes) {
    if (!n.parentId) continue
    const arr = childIds.get(n.parentId) || []
    arr.push(n.id)
    childIds.set(n.parentId, arr)
  }

  return nodes.map((n) => {
    const payload = n.payload || {}
    const story = n.story || payload.story || ''
    const result = n.result || payload.result || ''
    const action = n.action || payload.action || ''
    const description =
      n.description ||
      [story, result].filter(Boolean).join('\n') ||
      n.summary ||
      n.title ||
      ''

    const fromRelations = childIds.get(n.id) || []
    const fromApi = Array.isArray(n.children) ? n.children : []
    const children = fromRelations.length > 0 ? fromRelations : fromApi

    return {
      id: n.id,
      parentId: n.parentId,
      title: n.title,
      action,
      story,
      result,
      description,
      depth: n.depth,
      round: n.round,
      timeline: n.createdAt || new Date().toISOString(),
      branchStatus: n.branchStatus,
      isOnActivePath: !!n.isOnActivePath,
      children,
      generated: n.branchStatus === 'pending',
      risk: payload.risk || n.risk,
      payload,
    }
  })
}

export function getRootNode(nodes) {
  return nodes.find((n) => !n.parentId) || null
}

export function getActivePathLeaf(nodes) {
  const onPath = nodes.filter((n) => n.isOnActivePath)
  if (!onPath.length) return getRootNode(nodes)
  return onPath.sort((a, b) => (Number(b.depth) || 0) - (Number(a.depth) || 0))[0]
}

export function getAncestorIds(nodes, nodeId) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const ids = []
  let cur = byId.get(nodeId)
  while (cur) {
    ids.unshift(cur.id)
    cur = cur.parentId ? byId.get(cur.parentId) : null
  }
  return ids
}
