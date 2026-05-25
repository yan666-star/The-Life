import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 180000,
})

const SESSION_KEY = 'life_session_id'

export function getStoredSessionId() {
  return sessionStorage.getItem(SESSION_KEY)
}

export function setStoredSessionId(id) {
  if (id) sessionStorage.setItem(SESSION_KEY, id)
  else sessionStorage.removeItem(SESSION_KEY)
}

function headers(sessionId) {
  const id = sessionId || getStoredSessionId()
  return id ? { 'X-Session-Id': id } : {}
}

export async function createSession() {
  const { data } = await api.post('/sessions', {})
  setStoredSessionId(data.sessionId)
  return data
}

export async function getSession(sessionId) {
  const id = sessionId || getStoredSessionId()
  const { data } = await api.get(`/sessions/${id}`)
  return data
}

export async function deleteSession(sessionId) {
  const id = sessionId || getStoredSessionId()
  await api.delete(`/sessions/${id}`)
  setStoredSessionId(null)
}

export async function modelProfile(userInfo, sessionId) {
  const { data } = await api.post(
    '/profile/model',
    { userInfo },
    { headers: headers(sessionId) }
  )
  return data
}

export async function getTree(sessionId) {
  const { data } = await api.get('/tree', { headers: headers(sessionId) })
  return data
}

export async function generateCandidates(parentTreeNodeId, sessionId) {
  const { data } = await api.post(
    '/nodes/candidates',
    { parentTreeNodeId },
    { headers: headers(sessionId) }
  )
  return data
}

export async function getLatestCandidates(parentTreeNodeId, sessionId) {
  const { data } = await api.get('/nodes/candidates/latest', {
    params: { parentTreeNodeId },
    headers: headers(sessionId),
  })
  return data
}

export async function choosePath(candidateNodeId, sessionId) {
  const { data } = await api.post(
    '/path/choose',
    { candidateNodeId },
    { headers: headers(sessionId) }
  )
  return data
}

export async function getCurrentAttributes(sessionId) {
  const { data } = await api.get('/attributes/current', {
    headers: headers(sessionId),
  })
  return data
}

export async function setComparisonSlot(side, body, sessionId) {
  const { data } = await api.put(`/comparison/slots/${side}`, body, {
    headers: headers(sessionId),
  })
  return data
}

export async function getComparison(sessionId) {
  const { data } = await api.get('/comparison', { headers: headers(sessionId) })
  return data
}

export async function generateComparisonVideos(sessionId) {
  const { data } = await api.post('/comparison/videos/generate', null, {
    headers: headers(sessionId),
  })
  return data
}

export async function getComparisonVideo(side, sessionId) {
  const { data } = await api.get(`/comparison/videos/${side}`, {
    headers: headers(sessionId),
  })
  return data
}

export async function getMentorRoles() {
  const { data } = await api.get('/ai/roles')
  return data
}

export async function sendMentorMessage({ mentorRole, message, includeComparison }, sessionId) {
  const { data } = await api.post(
    '/ai/chat',
    { mentorRole, message, includeComparison },
    { headers: headers(sessionId) }
  )
  return data
}

export async function getChatHistory(mentorRole, sessionId) {
  const { data } = await api.get('/ai/chat/history', {
    params: mentorRole ? { mentorRole } : {},
    headers: headers(sessionId),
  })
  return data
}

export async function generateFinalReport(sessionId) {
  const { data } = await api.post('/reports/final/generate', null, {
    headers: headers(sessionId),
  })
  return data
}

export async function getFinalReport(sessionId) {
  const { data } = await api.get('/reports/final/current', {
    headers: headers(sessionId),
  })
  return data
}

export async function deleteTreeNode(nodeId, sessionId) {
  await api.delete(`/tree/nodes/${nodeId}`, { headers: headers(sessionId) })
}

export async function clearComparisonSlot(side, sessionId) {
  await api.delete(`/comparison/slots/${side}`, { headers: headers(sessionId) })
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message
    err.displayMessage = msg
    return Promise.reject(err)
  }
)

export function mapCandidateToRoute(c) {
  const delta = c.attributeDelta || c.impacts || {}
  return {
    id: c.id,
    sourceNodeId: c.id,
    parentNodeId: c.parentNodeId,
    title: c.title,
    description: c.description || `${c.story || ''}\n${c.result || ''}`.trim(),
    feasibility: Number(c.feasibility ?? 60),
    difficulty: c.difficulty || '中等',
    benefit: c.benefit || '中',
    tag: 'AI',
    tagColor: Number(c.feasibility ?? 60) >= 75 ? 'high' : 'medium',
    impacts: delta,
    impactFactors: delta,
    story: c.story,
    action: c.action,
    result: c.result,
    risk: c.risk,
    attributeDelta: delta,
    attributeAfter: c.attributeAfter,
    keyMilestones: c.keyMilestones,
  }
}

export function mapTreeNodesToFrontend(nodes) {
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
      attributeDelta: n.attributeDelta || payload.attributeDelta,
    }
  })
}
