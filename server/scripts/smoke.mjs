/**
 * API smoke test — no Ollama required (uses fallbacks).
 * Run: node scripts/smoke.mjs
 */
const BASE = process.env.API_BASE || 'http://localhost:3001/api'

async function req(method, path, { sessionId, body } = {}) {
  const headers = { Accept: 'application/json' }
  if (sessionId) headers['X-Session-Id'] = sessionId
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT: ${msg}`)
}

async function main() {
  console.log('1. health')
  const health = await req('GET', '/health')
  assert(health.ok === true, 'health.ok')

  console.log('2. create session')
  const { sessionId } = await req('POST', '/sessions')
  assert(sessionId, 'sessionId')

  console.log('3. profile model')
  const profile = await req('POST', '/profile/model', {
    sessionId,
    body: {
      userInfo: {
        age: '28',
        occupation: '产品经理',
        lifeGoals: '职业成长与财务稳健',
      },
    },
  })
  assert(profile.characterModel || profile.initialAttributes, 'profile modeled')
  const attrs = profile.currentAttributes || profile.initialAttributes
  assert(attrs.career >= 0, 'attributes')

  console.log('4. session state')
  const state = await req('GET', `/sessions/${sessionId}`)
  assert(state.tree?.nodes?.length >= 1, 'tree has root')
  assert(state.activePathLeafId, 'activePathLeafId')

  const rootId = state.activePathLeafId

  console.log('5. generate candidates')
  const batch = await req('POST', '/nodes/candidates', {
    sessionId,
    body: { parentTreeNodeId: rootId },
  })
  const candidates = batch.candidates || batch.nodes || []
  assert(candidates.length === 3, `3 candidates, got ${candidates.length}`)

  const pick = candidates[0].id || candidates[0].treeNodeId
  assert(pick, 'candidate id')

  console.log('6. choose path')
  const chosen = await req('POST', '/path/choose', {
    sessionId,
    body: { candidateNodeId: pick },
  })
  assert(chosen.activePathLeafId === pick, 'leaf updated')

  console.log('7. tree + active path')
  const tree = await req('GET', '/tree', { sessionId })
  const discarded = (tree.nodes || []).filter((n) => n.branchStatus === 'discarded')
  assert(discarded.length >= 2, 'discarded siblings')

  const ap = await req('GET', '/tree/active-path', { sessionId })
  assert((ap.nodes || ap.path || []).length >= 1, 'active path')

  console.log('8. comparison slots')
  const c2 = candidates[1].id || candidates[1].treeNodeId
  await req('PUT', '/comparison/slots/left', {
    sessionId,
    body: { treeNodeId: pick },
  })
  await req('PUT', '/comparison/slots/right', {
    sessionId,
    body: { treeNodeId: c2 },
  })
  const cmp = await req('GET', '/comparison', { sessionId })
  assert(cmp.left && cmp.right, 'both slots')

  console.log('9. comparison videos')
  await req('POST', '/comparison/videos/generate', { sessionId })
  const vLeft = await req('GET', '/comparison/videos/left', { sessionId })
  assert(vLeft.status, 'video job status')

  console.log('10. mentorship')
  const roles = await req('GET', '/ai/roles')
  assert(Array.isArray(roles) && roles.length === 4, '4 roles')
  const chat = await req('POST', '/ai/chat', {
    sessionId,
    body: { mentorRole: roles[0].id, message: '我该如何规划下一步？' },
  })
  assert(chat.reply || chat.message, 'chat reply')

  console.log('11. final report')
  const report = await req('POST', '/reports/final/generate', { sessionId })
  assert(
    report.regretLevel !== undefined || report.regretScore !== undefined || report.report,
    'report generated'
  )
  const current = await req('GET', '/reports/final/current', { sessionId })
  assert(current, 'report current')

  console.log('12. delete session')
  await req('DELETE', `/sessions/${sessionId}`)
  try {
    await req('GET', `/sessions/${sessionId}`)
    throw new Error('session should be gone')
  } catch (e) {
    assert(e.status === 404, 'session deleted → 404')
  }

  console.log('\n✅ All smoke checks passed')
}

main().catch((e) => {
  console.error('\n❌ Smoke failed:', e.message)
  if (e.data) console.error(JSON.stringify(e.data, null, 2))
  process.exit(1)
})
