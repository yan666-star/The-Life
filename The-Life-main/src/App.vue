<template>
  <div class="app" :data-view="currentView === 'command' ? 'command' : 'main'">
    <div class="fui-global-grid" aria-hidden="true"></div>
    <div class="fui-global-scan" aria-hidden="true"></div>
    <CommandCenterView
      v-if="currentView === 'command'"
      :userInfo="userInfo"
      :attributes="attributes"
      :nodeCount="nodeCount"
      :leafCount="leafCount"
      :selectedDepth="selectedDepth"
      :routeCount="aiRoutes.length + customRoutes.length"
      @navigate="navigateFromCommand"
    />
    <div v-else class="main-content">
      <header class="app-hero glass-container">
        <h1 class="app-hero-title">LIFE DIVERGENCE OS</h1>
        <p class="app-hero-sub">人生分岔路 · 平行时空推演系统</p>
      </header>
      <ViewNav :currentView="currentView" />

      <div v-if="statusMessage" class="status-toast" role="status" aria-live="polite">{{ statusMessage }}</div>

      <InputDialog
        :show="showInputDialog"
        :title="inputDialog.title"
        :message="inputDialog.message"
        :placeholder="inputDialog.placeholder"
        :defaultValue="inputDialog.defaultValue"
        :inputType="inputDialog.inputType || 'text'"
        @confirm="handleInputConfirm"
        @cancel="showInputDialog = false"
      />

      <div v-if="currentView === 'genesis'">
        <GenesisView
          :userInfo="userInfo"
          :isCardFlipped="isCardFlipped"
          :currentScenario="currentScenario"
          :statusMessage="statusMessage"
          @update:userInfo="(v) => userInfo = v"
          @fetch-scenario="fetchScenario"
          @flip-card="flipCard"
          @select-option="selectOption"
          @skip-scenario="skipScenario"
          @mark-edit="markDataEditable"
          @backup="backupLocalData"
          @clear="clearLocalData"
          @start-destiny="goToDestinyTree"
        />
      </div>

      <div v-else-if="currentView === 'destiny'">
        <DestinyView
          :treeNodes="treeNodes"
          :selectedNode="selectedNode"
          :selectedNodeData="selectedNodeData"
          :selectedPathIds="selectedPathIds"
          :committedNodeId="committedNodeId"
          :nodeCount="nodeCount"
          :leafCount="leafCount"
          :selectedDepth="selectedDepth"
          :is-tree-loading="isApiLoading"
          @select-node="selectNode"
          @commit-node="commitNodeSelection"
          @delete-node="deleteNode"
          @go-to-genesis="goToGenesis"
          @go-to-divergence="goToDivergence"
          @start-divergence="startDivergenceFromNode"
          @go-to-conclusion="goToConclusion"
        />
      </div>

      <div v-else-if="currentView === 'divergence'">
        <DivergenceView
          :aiRoutes="aiRoutes"
          :isGenerating="isGenerating"
          :compareRoutes="compareRoutes"
          :customRoutes="customRoutes"
          :selectedRoute="selectedRoute"
          :generatedMedia="generatedMedia"
          :mode="mode"
          @generate-ai-routes="generateAIRoutes"
          @refine-route="refineRoute"
          @replace-route="replaceRoute"
          @toggle-compare="toggleCompare"
          @select-route="selectRoute"
          @add-custom-route="addCustomRoute"
          @remove-custom-route="removeCustomRoute"
          @file-upload="handleFileUpload"
          @generate-comic="generateComic"
          @generate-video="generateVideo"
          @generate-poster="generatePoster"
          @go-to-destiny="goToDestinyTree"
          @go-to-comparison="goToComparison"
          @go-to-reflection="goToReflection"
          @toggle-mode="toggleMode"
        />
      </div>

      <div v-else-if="currentView === 'comparison'">
        <ComparisonView
          :routes="compareRoutes"
          :left-video="comparisonVideos.left"
          :right-video="comparisonVideos.right"
          :attributes="attributes"
          :radar-axes="radarAxes"
          :radar-axis-points="radarAxisPoints"
          :radar-polygon="radarPolygon"
          :attribute-history="attributeHistory"
          @go-back="returnToPreviousView"
          @confirm-selection="goToReflection"
        />
      </div>

      <div v-else-if="currentView === 'reflection'">
        <ReflectionView
          :attributes="attributes"
          :attributeHistory="attributeHistory"
          :impactHistory="impactHistory"
          :currentChart="currentChart"
          :radarAxes="radarAxes"
          :radarAxisPoints="radarAxisPoints"
          :radarPolygon="radarPolygon"
          :axisLabelMap="axisLabelMap"
          :socialFeed="socialFeed"
          @show-radar="showRadarChart"
          @show-trend="showTrendChart"
          @show-impact="showImpactTrace"
          @refresh-social="refreshSocialData"
          @go-to-divergence="returnToPreviousView"
          @go-to-mentorship="goToMentorship"
        />
      </div>

      <div v-else-if="currentView === 'mentorship'">
        <MentorshipView
          :chatMessages="chatMessages"
          :isGeneratingAIResponse="isGenerating"
          :chatInput="chatInput"
          :currentAI角色="currentAIRole"
          :currentAIDescription="currentAIDescription"
          :isListening="isListening"
          @send-message="sendMessage"
          @select-ai-role="selectAIRole"
          @toggle-voice="toggleVoiceInput"
          @go-to-reflection="returnToPreviousView"
          @go-to-conclusion="goToConclusion"
        />
      </div>

      <div v-else-if="currentView === 'conclusion'">
        <ConclusionView
          :savedPaths="savedPaths"
          :regretLevel="regretLevel"
          :regretText="regretText"
          :regretAnalysis="regretAnalysis"
          :aiAdvice="aiAdvice"
          @restart="goToGenesis"
          @regenerate-report="goToConclusion"
          @exit-game="exitGame"
        />
      </div>

    </div>

    <div v-if="currentView !== 'command'" class="ai-console-actions" aria-label="快捷导航">
      <button v-if="currentView !== 'reflection'" type="button" class="ai-console-btn" @click="openReflectionFromCurrent">
        <strong>开启观心</strong>
        <span>REFLECTION</span>
      </button>
      <button v-if="currentView !== 'mentorship'" type="button" class="ai-console-btn" @click="openMentorshipFromCurrent">
        <strong>开启论道</strong>
        <span>MENTOR</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CommandCenterView from './components/CommandCenterView.vue'
import ViewNav from './components/ViewNav.vue'
import GenesisView from './components/GenesisView.vue'
import DestinyView from './components/DestinyView.vue'
import DivergenceView from './components/DivergenceView.vue'
import ComparisonView from './components/ComparisonView.vue'
import ReflectionView from './components/ReflectionView.vue'
import MentorshipView from './components/MentorshipView.vue'
import ConclusionView from './components/ConclusionView.vue'
import InputDialog from './components/InputDialog.vue'
import { generateScenario } from './services/ollamaService'
import * as gameApi from './services/gameApi'
import {
  getActivePathLeaf as getActivePathLeafFromNodes,
  getAncestorIds,
  getRootNode as getRootNodeFromNodes,
} from './services/treeState.js'

// Minimal reactive state to keep components running
const currentView = ref('command')
const statusMessage = ref('')
const returnView = ref(null)
const sessionId = ref(gameApi.getStoredSessionId())
const apiReady = ref(false)
const isApiLoading = ref(false)
let childrenGenLock = false

// Dialog state
const showInputDialog = ref(false)
const inputDialog = ref({
  title: '输入信息',
  message: '请输入',
  placeholder: '',
  defaultValue: '',
  onConfirm: null
})

const userInfo = ref({
  age: '28',
  education: 'bachelor',
  occupation: '互联网产品经理',
  city: '北京',
  income: '15000',
  family: 'single',
  skills: '产品设计、数据分析、团队管理',
  investment: '50000',
  riskPreference: 'moderate',
  delayGratification: 'high',
  stressResistance: 'medium',
  decisionStyle: 'analytical',
  lifeGoals: '在5年内成为资深产品负责人，建立个人品牌；长期实现财务自由和生活灵活性'
})
const isCardFlipped = ref(false)
const currentScenario = ref({
  scenario: '你收到一个外地高薪 offer，但当前城市已有稳定生活基础，你会怎么选？',
  options: [
    { text: '立即转岗追求更高成长', style: '风险偏好型' },
    { text: '暂时不动，优先稳住基本盘', style: '风险规避型' },
    { text: '先谈远程或试用期再决定', style: '平衡型' }
  ]
})

const createInitialDestinyNodes = () => [
  {
    id: 'current',
    parentId: null,
    title: '当前人生节点',
    description: '从你的基础建模出发，等待系统推演三条关键分岔。',
    depth: 1,
    timeline: new Date().toISOString(),
    children: ['branch-stay', 'branch-jump', 'branch-independent']
  },
  {
    id: 'branch-stay',
    parentId: 'current',
    title: '稳定深耕',
    description: '保留现有城市与职业基本盘，通过项目、晋升与长期积累提升确定性。',
    depth: 2,
    timeline: new Date().toISOString(),
    children: []
  },
  {
    id: 'branch-jump',
    parentId: 'current',
    title: '平台跃迁',
    description: '进入更高强度平台或高速增长组织，用风险换取更高职业斜率。',
    depth: 2,
    timeline: new Date().toISOString(),
    children: []
  },
  {
    id: 'branch-independent',
    parentId: 'current',
    title: '独立路线',
    description: '发展个人品牌、副业或创业项目，将职业资产转化为更自由的路径。',
    depth: 2,
    timeline: new Date().toISOString(),
    children: []
  }
]

const treeNodes = ref([])
const selectedNode = ref(null)
const selectedPathIds = ref([])
const committedNodeId = ref(null)
const selectedNodeData = computed(() => treeNodes.value.find(n => n.id === selectedNode.value))
const nodeCount = computed(() => treeNodes.value.length)
const leafCount = computed(() => treeNodes.value.filter(n => !n.children || n.children.length === 0).length)
const selectedDepth = computed(() => {
  const n = selectedNodeData.value
  return n?.depth || 1
})

const aiRoutes = ref([])
const isGenerating = ref(false)
const compareRoutes = ref([])
const customRoutes = ref([])
const selectedRoute = ref(null)
const generatedMedia = ref([])
const mode = ref('ai')
const uploadedDocText = ref('')

const attributes = ref({ career: 50, finance: 50, relationship: 50, health: 50, growth: 50 })
const attributeHistory = ref([])
const impactHistory = ref([])
const currentChart = ref('radar')
const radarAxes = ref([
  { key: 'career', label: '职业发展' },
  { key: 'finance', label: '财务状况' },
  { key: 'relationship', label: '人际关系' },
  { key: 'health', label: '健康状态' },
  { key: 'growth', label: '个人成长' }
])
const radarAxisPoints = computed(() => {
  const centerX = 120
  const centerY = 120
  const r = 90
  const total = radarAxes.value.length
  return radarAxes.value.map((_, i) => {
    const angle = (Math.PI * 2 * i) / total - Math.PI / 2
    return {
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
      lx: centerX + Math.cos(angle) * (r + 18),
      ly: centerY + Math.sin(angle) * (r + 18)
    }
  })
})
const radarPolygon = computed(() => {
  const centerX = 120
  const centerY = 120
  const maxR = 90
  const total = radarAxes.value.length
  return radarAxes.value
    .map((axis, i) => {
      const ratio = Math.max(0, Math.min(100, attributes.value[axis.key] || 0)) / 100
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2
      const r = maxR * ratio
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      return `${x},${y}`
    })
    .join(' ')
})
const axisLabelMap = ref({ career: '职业发展', finance: '财务状况', relationship: '人际关系', health: '健康状态', growth: '个人成长' })
const socialFeed = ref([
  { id: 'feed_1', source: '国家统计局', text: '青年就业市场回暖，数字服务类岗位增长明显。', date: new Date().toLocaleDateString() },
  { id: 'feed_2', source: '人社公开数据', text: '一线城市生活成本继续上升，择业需同步评估净收益。', date: new Date().toLocaleDateString() },
  { id: 'feed_3', source: '行业观察', text: 'AI 应用岗位对跨学科能力需求增强。', date: new Date().toLocaleDateString() }
])

const chatMessages = ref([])
const comparisonVideos = ref({ left: null, right: null })
const chatInput = ref('')
const isListening = ref(false)
const currentAIRole = ref('人生规划师')
const currentAIDescription = ref('擅长把你的现实约束和长期目标转成可执行建议。')

const savedPaths = ref([])
const regretLevel = ref(20)
const regretText = ref('暂无')
const regretAnalysis = ref('暂无')
const aiAdvice = ref('')

const roleDescMap = {
  '职场导师': '聚焦职业路径、能力成长和岗位决策。',
  '情感顾问': '关注关系边界、沟通方式与情绪支持。',
  '创业前辈': '强调资源配置、风险管理和验证节奏。',
  '人生规划师': '平衡职业、财务、关系、健康与成长。'
}

// Simple helpers
const setStatusMessage = (msg) => {
  statusMessage.value = msg
  if (msg) setTimeout(() => statusMessage.value = '', 2500)
}

const recordAttributeHistory = () => {
  // snapshot current attributes with timestamp
  attributeHistory.value.push({ ...attributes.value, time: new Date().toISOString() })
  // keep a bounded history for charts
  if (attributeHistory.value.length > 24) attributeHistory.value.shift()
  // recompute lightweight regret after attribute change
  computeRegret()
}

const recordImpact = (title, changes) => {
  impactHistory.value.unshift({ id: `impact_${Date.now()}`, title, changes, time: new Date().toLocaleString() })
  if (impactHistory.value.length > 12) impactHistory.value.pop()
}

// compute simple trend points for a given attribute key from history
const getTrendPath = (key) => {
  const records = attributeHistory.value
  if (!records.length) return ''
  const width = 400
  const height = 180
  const xStep = records.length > 1 ? width / (records.length - 1) : width
  const pairs = records.map((h, idx) => {
    const v = Math.max(0, Math.min(100, h[key] != null ? h[key] : 0))
    const x = 20 + idx * xStep
    const y = 200 - (v / 100) * height
    return `${idx === 0 ? 'M' : 'L'}${x},${y}`
  })
  return pairs.join(' ')
}

// Handle dialog input
const handleInputConfirm = (value) => {
  showInputDialog.value = false
  if (inputDialog.value.onConfirm) {
    inputDialog.value.onConfirm(value)
  }
}

// simple heuristic regret computation
const computeRegret = () => {
  if (!attributeHistory.value.length) {
    regretLevel.value = 5
    regretText.value = '未开始模拟'
    regretAnalysis.value = '无历史数据'
    return
  }
  // measure recent volatility across attributes
  const latest = attributeHistory.value[attributeHistory.value.length - 1]
  const prev = attributeHistory.value[attributeHistory.value.length - 2] || latest
  let vol = 0
  Object.keys(attributes.value).forEach(k => {
    const d = Math.abs((latest[k] || 0) - (prev[k] || 0))
    vol += d
  })
  // base regret on volatility and dropped averages
  const avgNow = Object.values(latest).filter(v => typeof v === 'number').reduce((a,b)=>a+b,0) / Object.keys(attributes.value).length
  const base = Math.max(0, 100 - Math.round(avgNow))
  const computed = Math.min(100, Math.round(base + vol))
  regretLevel.value = computed
  regretText.value = computed > 60 ? '存在较高后悔风险' : '后悔风险可控'
  regretAnalysis.value = `最近波动总和 ${Math.round(vol)}, 属性平均值 ${Math.round(avgNow)}。建议关注降低短期波动，平衡长期目标。`
  aiAdvice.value = regretLevel.value > 60 ? '建议分散投入、提升抗压能力与延迟满足训练。' : '保持当前节奏，逐步验证小规模决策。'
}

const findNode = (id) => treeNodes.value.find(n => n.id === id)

const collectSubtreeIds = (startId, acc = []) => {
  acc.push(startId)
  const node = findNode(startId)
  ;(node?.children || []).forEach((cid) => collectSubtreeIds(cid, acc))
  return acc
}

const applyAttributeChanges = (title, impacts = {}) => {
  const changes = {}
  Object.keys(impacts).forEach((k) => {
    const delta = Number(impacts[k]) || 0
    const before = attributes.value[k] || 0
    const after = Math.max(0, Math.min(100, before + delta))
    attributes.value[k] = after
    changes[k] = delta
  })
  if (Object.keys(changes).length) {
    recordImpact(title, changes)
    recordAttributeHistory()
  }
}

// Navigation
const ensureSession = async () => {
  if (!sessionId.value) {
    const s = await gameApi.createSession()
    sessionId.value = s.sessionId
  }
  return sessionId.value
}

const pickExistingNodeId = (id) =>
  id && treeNodes.value.some((n) => n.id === id) ? id : null

const applyTreeNodes = (
  nodes,
  { inspectorNodeId = null, pathLeafId = null, preserveUI = false } = {}
) => {
  if (!nodes?.length) return
  const prevInspector = selectedNode.value
  treeNodes.value = gameApi.mapTreeNodesToFrontend(nodes)

  const leaf =
    pickExistingNodeId(pathLeafId) ||
    pickExistingNodeId(getActivePathLeafFromNodes(treeNodes.value)?.id) ||
    pickExistingNodeId(getRootNodeFromNodes(treeNodes.value)?.id)

  const inspector = preserveUI
    ? pickExistingNodeId(prevInspector) || pickExistingNodeId(inspectorNodeId)
    : pickExistingNodeId(inspectorNodeId) ||
      pickExistingNodeId(prevInspector) ||
      pickExistingNodeId(getRootNodeFromNodes(treeNodes.value)?.id)

  if (leaf) {
    committedNodeId.value = leaf
    selectedPathIds.value = getAncestorIds(treeNodes.value, leaf)
  }
  if (inspector) selectedNode.value = inspector
  else if (leaf) selectedNode.value = leaf
}

const syncFromServer = async (options = {}) => {
  if (!sessionId.value) return false
  try {
    const [state, tree] = await Promise.all([
      gameApi.getSession(sessionId.value),
      gameApi.getTree(sessionId.value),
    ])
    if (state.currentAttributes) {
      attributes.value = { ...state.currentAttributes }
    }
    if (state.attributeHistory?.length) {
      attributeHistory.value = state.attributeHistory.map((h) => ({
        career: h.career,
        finance: h.finance,
        relationship: h.relationship,
        health: h.health,
        growth: h.growth,
        time: h.time,
      }))
      computeRegret()
    }
    apiReady.value = !!state.hasProfile
    const rawNodes = tree.nodes?.length ? tree.nodes : state.tree?.nodes
    if (rawNodes?.length) {
      applyTreeNodes(rawNodes, {
        preserveUI: options.preserveUI,
        inspectorNodeId: options.inspectorNodeId,
        pathLeafId: options.pathLeafId ?? state.activePathLeafId,
      })
    }
    return true
  } catch (e) {
    if (e.response?.status === 404) {
      gameApi.setStoredSessionId(null)
      sessionId.value = null
      apiReady.value = false
      treeNodes.value = []
      setStatusMessage('会话已失效，请重新入局')
    } else {
      setStatusMessage(e.displayMessage || e.response?.data?.message || '同步失败')
    }
    return false
  }
}

const getActivePathLeafNode = () => getActivePathLeafFromNodes(treeNodes.value)

const countPendingChildren = (parentId) => {
  const parent = findNode(parentId)
  if (!parent) return 0
  return (parent.children || [])
    .map((cid) => findNode(cid))
    .filter((n) => n && n.branchStatus === 'pending').length
}

/** 主路径自动延伸：仅在 activePath 叶节点（chosen）下生成下一批 3 候选 */
const getActivePathLeafIdForGeneration = () => {
  const leaf = getActivePathLeafNode()
  if (!leaf?.id || leaf.branchStatus === 'pending') return null
  if (!leaf.isOnActivePath && leaf.branchStatus !== 'chosen') return null
  return leaf.id
}

const ensureChildrenForParent = async (parentId, { silent = false } = {}) => {
  const leafId = getActivePathLeafIdForGeneration()
  if (!apiReady.value || !leafId || childrenGenLock) return 0
  if (parentId && parentId !== leafId) return countPendingChildren(leafId)
  const parentNode = findNode(leafId)
  if (!parentNode || parentNode.branchStatus === 'pending') return 0

  if (countPendingChildren(leafId) >= 3) {
    await syncFromServer({
      preserveUI: true,
      pathLeafId: leafId,
      inspectorNodeId: selectedNode.value,
    })
    return 3
  }

  childrenGenLock = true
  if (!silent) isApiLoading.value = true
  try {
    await ensureSession()
    let batch = await gameApi.getLatestCandidates(leafId, sessionId.value)
    if ((batch.candidates || []).length < 3) {
      batch = await gameApi.generateCandidates(leafId, sessionId.value)
    }
    await syncFromServer({
      preserveUI: true,
      pathLeafId: leafId,
      inspectorNodeId: selectedNode.value,
    })
    const n = (batch.candidates || []).length
    if (!silent) setStatusMessage(n >= 3 ? `已生成 ${n} 条分岔` : `分岔已更新（${n} 条）`)
    return n
  } catch (e) {
    if (!silent) setStatusMessage(e.displayMessage || e.response?.data?.message || '分岔生成失败')
    throw e
  } finally {
    childrenGenLock = false
    if (!silent) isApiLoading.value = false
  }
}

const prepareDestinyTree = async () => {
  if (!sessionId.value || !apiReady.value) return
  isApiLoading.value = true
  try {
    const ok = await syncFromServer()
    if (!ok) return

    const root = getRootNodeFromNodes(treeNodes.value)
    const leaf = getActivePathLeafNode()
    const leafId = leaf?.id || root?.id
    if (!leafId) {
      setStatusMessage('命轨为空，请重新入局建模')
      return
    }

    selectedNode.value = root?.id || leafId
    committedNodeId.value = leafId
    selectedPathIds.value = getAncestorIds(treeNodes.value, leafId)

    await ensureChildrenForParent(leafId, { silent: true })
    await syncFromServer({
      preserveUI: true,
      pathLeafId: leafId,
      inspectorNodeId: root?.id || selectedNode.value,
    })

    const n = countPendingChildren(leafId)
    setStatusMessage(
      n >= 3
        ? `命轨就绪：起点 + ${n} 条分岔（点击分岔看剧情与属性变化，右侧点「选择」）`
        : '命轨已加载'
    )
  } catch (e) {
    setStatusMessage(e.displayMessage || e.response?.data?.message || '命轨加载失败')
  } finally {
    isApiLoading.value = false
  }
}

const confirmPathChoice = async (candidateNodeId) => {
  const clicked = findNode(candidateNodeId)
  isApiLoading.value = true
  try {
    await ensureSession()
    const res = await gameApi.choosePath(candidateNodeId, sessionId.value)
    if (res.currentAttributes) {
      attributes.value = { ...res.currentAttributes }
    }
    if (res.attributeDelta && Object.keys(res.attributeDelta).length) {
      recordImpact(`已选「${clicked?.title || '路线'}」`, res.attributeDelta)
    }
    const leafId = res.activePathLeafId || candidateNodeId
    await syncFromServer({
      preserveUI: true,
      pathLeafId: leafId,
      inspectorNodeId: candidateNodeId,
    })
    await ensureChildrenForParent(leafId, { silent: true })
    await syncFromServer({
      preserveUI: true,
      pathLeafId: leafId,
      inspectorNodeId: candidateNodeId,
    })
    setStatusMessage(`已选「${clicked?.title || '路线'}」，下一层分岔已展开`)
  } catch (e) {
    setStatusMessage(e.displayMessage || e.response?.data?.message || '选路失败')
  } finally {
    isApiLoading.value = false
  }
}

const startGameWithProfile = async () => {
  isApiLoading.value = true
  try {
    await ensureSession()
    const result = await gameApi.modelProfile(userInfo.value, sessionId.value)
    if (result.initialAttributes) {
      attributes.value = { ...result.initialAttributes }
      attributeHistory.value = [{
        ...result.initialAttributes,
        time: new Date().toISOString(),
      }]
    }
    apiReady.value = true
    const tree = await gameApi.getTree(sessionId.value)
    if (tree.nodes?.length) {
      applyTreeNodes(tree.nodes, {
        pathLeafId: result.rootNodeId,
        inspectorNodeId: result.rootNodeId,
      })
    }
    setStatusMessage('人物建模完成，正在生成首层分岔…')
    currentView.value = 'destiny'
    await prepareDestinyTree()
  } catch (e) {
    const msg =
      e?.displayMessage ||
      e?.response?.data?.message ||
      (e?.code === 'ECONNABORTED' ? '建模超时，请检查 Ollama 是否在运行' : null) ||
      (e?.message?.includes?.('Network') || e?.code === 'ERR_NETWORK'
        ? '无法连接后端，请确认 server 与前端 dev 均已启动'
        : null) ||
      '建模失败，请查看控制台错误信息'
    setStatusMessage(msg)
    console.error('[startGameWithProfile]', e?.response?.data || e)
  } finally {
    isApiLoading.value = false
  }
}

const goToDestinyTree = async () => {
  if (!apiReady.value) {
    await startGameWithProfile()
    return
  }
  currentView.value = 'destiny'
  await prepareDestinyTree()
}
const goToDivergence = () => startDivergenceFromNode(selectedNode.value)
const syncComparisonFromServer = async () => {
  if (!apiReady.value || !sessionId.value) return
  try {
    const comp = await gameApi.getComparison(sessionId.value)
    const routes = []
    if (comp.left?.packet) {
      routes.push(gameApi.mapCandidateToRoute({ id: comp.left.treeNodeId, ...comp.left.packet }))
    }
    if (comp.right?.packet) {
      routes.push(gameApi.mapCandidateToRoute({ id: comp.right.treeNodeId, ...comp.right.packet }))
    }
    if (routes.length) compareRoutes.value = routes
    comparisonVideos.value = {
      left: comp.videos?.left || comparisonVideos.value.left,
      right: comp.videos?.right || comparisonVideos.value.right,
    }
  } catch {
    // keep local compareRoutes
  }
}

const navigateFromCommand = async (view) => {
  if (view === 'genesis') {
    currentView.value = 'genesis'
    return
  }
  if (!apiReady.value) {
    setStatusMessage('请先在「入局」点击 INITIALIZE DESTINY GRAPH 完成人物建模')
    currentView.value = 'genesis'
    return
  }
  if (view === 'destiny') {
    currentView.value = 'destiny'
    await prepareDestinyTree()
    return
  }
  if (view === 'divergence') {
    await startDivergenceFromNode(selectedNode.value)
    return
  }
  if (view === 'mentorship') {
    returnView.value = 'command'
    currentView.value = 'mentorship'
    return
  }
  currentView.value = view
}

const goToComparison = async () => {
  if (compareRoutes.value.length < 2) {
    setStatusMessage('请先「加入对比」两个候选路线')
    return
  }
  rememberReturnView()
  await syncComparisonFromServer()
  if (apiReady.value && compareRoutes.value.length >= 2) {
    try {
      await ensureSession()
      await gameApi.generateComparisonVideos(sessionId.value)
      const [leftV, rightV] = await Promise.all([
        gameApi.getComparisonVideo('left', sessionId.value),
        gameApi.getComparisonVideo('right', sessionId.value),
      ])
      comparisonVideos.value = { left: leftV, right: rightV }
    } catch {
      // ignore video errors
    }
  }
  currentView.value = 'comparison'
}
const goToReflection = async () => {
  rememberReturnView()
  if (sessionId.value && apiReady.value) {
    await syncFromServer({ preserveUI: true })
    computeRegret()
  }
  currentView.value = 'reflection'
}
const goToMentorship = () => {
  rememberReturnView()
  currentView.value = 'mentorship'
}
const goToConclusion = async () => {
  isApiLoading.value = true
  try {
    await ensureSession()
    const report = await gameApi.generateFinalReport(sessionId.value)
    regretLevel.value = report.regretLevel ?? regretLevel.value
    regretText.value = report.regretText ?? regretText.value
    regretAnalysis.value = report.finalAnalysis ?? report.pathSummary ?? regretAnalysis.value
    aiAdvice.value = report.lifeAdvice ?? aiAdvice.value
    currentView.value = 'conclusion'
    setStatusMessage('终局报告已生成')
  } catch (e) {
    setStatusMessage(e?.response?.data?.message || '终局报告生成失败')
    currentView.value = 'conclusion'
  } finally {
    isApiLoading.value = false
  }
}
const goToGenesis = () => currentView.value = 'genesis'

const rememberReturnView = () => {
  const v = currentView.value
  if (v && !['reflection', 'mentorship'].includes(v)) {
    returnView.value = v
  }
}

const openReflectionFromCurrent = () => {
  rememberReturnView()
  currentView.value = 'reflection'
}

const openMentorshipFromCurrent = () => {
  rememberReturnView()
  currentView.value = 'mentorship'
}

const returnToPreviousView = () => {
  const target = returnView.value || 'destiny'
  returnView.value = null
  currentView.value = target
}

// Genesis handlers
const fetchScenario = async () => {
  const generated = await generateScenario(userInfo.value)
  if (generated?.scenario && Array.isArray(generated?.options)) {
    currentScenario.value = generated
  }
}
const flipCard = () => isCardFlipped.value = !isCardFlipped.value
const selectOption = (opt) => {
  userInfo.value.decisionStyle = opt
  isCardFlipped.value = false
  
  // Apply attribute changes based on selected style
  const styleImpacts = {
    '风险偏好型': { career: 10, finance: 5, growth: 15, health: -5 },
    '风险规避型': { career: 0, finance: 5, health: 10, relationship: 5 },
    '平衡型': { career: 5, finance: 8, relationship: 5, growth: 5, health: 5 }
  }
  
  const impacts = styleImpacts[opt] || {}
  recordImpact(`选择决策风格：${opt}`, impacts)
  recordAttributeHistory()
  
  setStatusMessage(`决策风格已记录：${opt}`)
}
const skipScenario = () => setStatusMessage('已跳过场景')
const markDataEditable = () => setStatusMessage('可以修改信息')
const backupLocalData = () => { localStorage.setItem('life_local_backup', JSON.stringify({ userInfo: userInfo.value })); setStatusMessage('已备份') }
const clearLocalData = async () => {
  localStorage.removeItem('life_local_backup')
  await exitGame()
}

// Simple chat
const sendMessage = async (text) => {
  if (!text) return
  chatMessages.value.push({ role: 'user', content: text, mentorRole: currentAIRole.value, time: new Date().toISOString() })
  isGenerating.value = true
  try {
    await ensureSession()
    const res = await gameApi.sendMentorMessage(
      { mentorRole: currentAIRole.value, message: text },
      sessionId.value
    )
    chatMessages.value.push({
      role: 'assistant',
      content: res.reply || '建议暂不可用',
      mentorRole: currentAIRole.value,
      time: new Date().toISOString(),
    })
  } catch {
    chatMessages.value.push({
      role: 'assistant',
      content: `AI(${currentAIRole.value})：建议暂不可用，请稍后重试。`,
      mentorRole: currentAIRole.value,
      time: new Date().toISOString(),
    })
  } finally {
    isGenerating.value = false
  }
}

const selectAIRole = async (role) => {
  currentAIRole.value = role
  currentAIDescription.value = roleDescMap[role] || '为你提供基于当前节点的决策建议。'
  if (sessionId.value) {
    try {
      const hist = await gameApi.getChatHistory(role, sessionId.value)
      const msgs = hist.sessions?.[0]?.messages || []
      if (msgs.length) {
        chatMessages.value = msgs.map((m) => ({
          role: m.role,
          content: m.content,
          mentorRole: m.mentorRole,
          time: m.time,
        }))
      }
    } catch {
      // ignore
    }
  }
}
const toggleVoiceInput = () => { isListening.value = !isListening.value; setStatusMessage(isListening.value ? '开始语音' : '停止语音') }

// Destiny graph helpers — 点击节点仅切换右侧剧情展示
const selectNode = (id) => {
  if (!id) return
  selectedNode.value = id
}

const getAncestorPath = (id) => getAncestorIds(treeNodes.value, id)

const nodeSeedScore = (node, offset = 0) => {
  const seed = Array.from(`${node?.id || ''}${node?.title || ''}${node?.description || ''}`)
    .reduce((sum, char) => sum + char.charCodeAt(0), offset)
  return seed
}

const nodeToRoutePacket = (parent, child, index) => {
  const seed = nodeSeedScore(child, index * 17)
  const feasibility = 58 + (seed % 31)
  const difficulty = feasibility >= 78 ? '中等' : feasibility >= 66 ? '高' : '极高'
  const benefit = (parent.depth || 1) >= 3 ? '极高' : index === 1 ? '高' : '中高'
  const impacts = {
    career: 4 + (seed % 12),
    finance: (seed % 9) - 2,
    relationship: ((seed + 3) % 8) - 2,
    health: ((seed + 5) % 7) - 3,
    growth: 6 + ((seed + 7) % 13)
  }

  return {
    id: `route-${child.id}`,
    sourceNodeId: child.id,
    parentNodeId: parent.id,
    title: child.title,
    description: child.description,
    feasibility,
    difficulty,
    benefit,
    tag: 'NODE EXTENSION',
    tagColor: feasibility >= 78 ? 'high' : feasibility >= 66 ? 'mid' : 'low',
    impacts,
    impactFactors: impacts,
    requiredCapital: `${10000 + (seed % 9) * 5000}-${40000 + (seed % 10) * 8000}`,
    keyMilestones: [
      `阶段 1：锁定「${child.title}」的现实约束`,
      '阶段 2：完成资源验证与风险复盘',
      '阶段 3：进入下一命轨节点'
    ]
  }
}

const startDivergenceFromNode = async (id = selectedNode.value) => {
  if (!apiReady.value) {
    setStatusMessage('请先完成入局人物建模')
    currentView.value = 'genesis'
    return
  }
  const clicked = id ? findNode(id) : null
  if (clicked?.branchStatus === 'pending') {
    setStatusMessage('请先在右侧「选择」确认该分岔，再在已选节点上衍化')
    return
  }
  const parentId =
    clicked?.id ||
    getActivePathLeafIdForGeneration() ||
    getRootNodeFromNodes(treeNodes.value)?.id
  if (!parentId) {
    setStatusMessage('请先完成入局并生成命轨')
    return
  }
  if (clicked?.id) selectedNode.value = clicked.id
  isGenerating.value = true
  try {
    await ensureSession()
    let batch = await gameApi.getLatestCandidates(parentId, sessionId.value)
    if ((batch.candidates || []).length < 3) {
      batch = await gameApi.generateCandidates(parentId, sessionId.value)
    }
    const routes = (batch.candidates || []).map(gameApi.mapCandidateToRoute)
    if (!routes.length) {
      setStatusMessage('未生成候选，请稍后重试')
      return
    }
    aiRoutes.value = routes
    await syncFromServer({
      preserveUI: true,
      pathLeafId: parentId,
      inspectorNodeId: selectedNode.value,
    })
    setStatusMessage(`已生成 ${routes.length} 条衍化路线`)
  } catch (e) {
    setStatusMessage(e.displayMessage || e.response?.data?.message || '候选生成失败，请确认 Ollama 已启动')
    return
  } finally {
    isGenerating.value = false
  }
  compareRoutes.value = []
  selectedRoute.value = null
  mode.value = 'ai'
  currentView.value = 'divergence'
}

const commitNodeSelection = async (id) => {
  const node = findNode(id)
  if (!node) return
  selectedNode.value = id

  if (!node.parentId) {
    setStatusMessage('起点节点已在路径上，请在其三个分岔中选择一条继续')
    return
  }

  if (node.branchStatus === 'pending' && apiReady.value) {
    await confirmPathChoice(id)
    return
  }

  if (!apiReady.value) {
    setStatusMessage('请先完成入局人物建模')
    return
  }

  if (node.branchStatus === 'discarded') {
    setStatusMessage('枯枝平行探索：可「开启衍化」预览假设分支（不改变主路径直至确认选路）')
    return
  }

  const leafId = getActivePathLeafIdForGeneration()
  if (leafId === id && node.branchStatus === 'chosen') {
    await ensureChildrenForParent(leafId)
  }
  setStatusMessage(`当前节点：${node.title}`)
}

const deleteNode = async (id) => {
  if (id === 'current') {
    setStatusMessage('根节点不可删除')
    return
  }
  const node = findNode(id)
  if (!node) return
  if (apiReady.value && sessionId.value) {
    try {
      await gameApi.deleteTreeNode(id, sessionId.value)
      await syncFromServer()
      setStatusMessage('节点及其子分支已删除')
      return
    } catch (e) {
      setStatusMessage(e?.response?.data?.message || '删除失败')
      return
    }
  }
  const idsToRemove = collectSubtreeIds(id)
  treeNodes.value = treeNodes.value.filter(n => !idsToRemove.includes(n.id))
  const parent = findNode(node.parentId)
  if (parent) parent.children = (parent.children || []).filter(cid => cid !== id)
  const rootId = treeNodes.value.find((n) => !n.parentId)?.id
  if (idsToRemove.includes(selectedNode.value)) selectedNode.value = parent?.id || rootId
  if (idsToRemove.includes(committedNodeId.value)) {
    committedNodeId.value = parent?.id || rootId
    selectedPathIds.value = getAncestorPath(committedNodeId.value)
  } else {
    selectedPathIds.value = selectedPathIds.value.filter(pathId => !idsToRemove.includes(pathId))
  }
  setStatusMessage('节点及其子分支已删除')
}

// divergence implementations (lightweight but functional)
const generateAIRoutes = async () => {
  const parentId =
    selectedNode.value ||
    getActivePathLeafIdForGeneration() ||
    committedNodeId.value
  const node = findNode(parentId)
  if (!parentId || !node || node.branchStatus === 'pending') {
    setStatusMessage('请选择已选路径节点或枯枝父节点后再生成')
    return
  }
  isGenerating.value = true
  try {
    await ensureSession()
    let batch = await gameApi.getLatestCandidates(parentId, sessionId.value)
    if ((batch.candidates || []).length < 3) {
      batch = await gameApi.generateCandidates(parentId, sessionId.value)
    }
    const routes = (batch.candidates || []).map(gameApi.mapCandidateToRoute)
    aiRoutes.value = routes
    await syncFromServer({
      preserveUI: true,
      pathLeafId: parentId,
      inspectorNodeId: selectedNode.value,
    })
    setStatusMessage(routes.length ? `AI 已生成 ${routes.length} 条候选` : '未生成候选')
  } catch (e) {
    setStatusMessage(e?.response?.data?.message || '生成失败')
  } finally {
    isGenerating.value = false
  }
}

const selectRoute = async (route) => {
  if (!route) return
  selectedRoute.value = route
  let choseOk = false
  if (route.id && apiReady.value) {
    try {
      await ensureSession()
      const res = await gameApi.choosePath(route.id, sessionId.value)
      if (res.currentAttributes) {
        attributes.value = { ...res.currentAttributes }
      }
      if (res.attributeDelta && Object.keys(res.attributeDelta).length) {
        recordImpact(`选择路线：${route.title}`, res.attributeDelta)
      }
      await syncFromServer({
        preserveUI: true,
        pathLeafId: res.activePathLeafId || route.id,
        inspectorNodeId: route.id,
      })
      const leafId = res.activePathLeafId || route.id
      selectedNode.value = leafId
      committedNodeId.value = leafId
      selectedPathIds.value = getAncestorPath(leafId)
      choseOk = true
      await ensureChildrenForParent(leafId, { silent: true })
      setStatusMessage(`已确认选路：${route.title}，下一层分岔已展开`)
    } catch (e) {
      setStatusMessage(e?.response?.data?.message || '选路失败')
      return
    }
  }
  savedPaths.value.unshift({ id: route.id || `path_${Date.now()}`, title: route.title, route })
  if (savedPaths.value.length > 12) savedPaths.value.pop()

  if (!choseOk) {
    const delta = route.attributeDelta || route.impacts || route.impactFactors || {}
    applyAttributeChanges(`选择路线：${route.title}`, delta)
    setStatusMessage(`已选择路线：${route.title}`)
  }

  currentView.value = 'destiny'
}

const refineRoute = (index) => {
  const route = aiRoutes.value[index]
  if (!route) return
  route.description = `${route.description}（细化：拆解为季度行动里程碑，并设置可验证指标。）`
  route.feasibility = Math.min(100, Number(route.feasibility || 60) + 5)
  setStatusMessage(`已细化路线：${route.title}`)
}
const replaceRoute = (index) => {
  const route = aiRoutes.value[index]
  if (!route) return
  const replacement = {
    id: `ai_route_replace_${Date.now()}`,
    title: `${route.title}-替代方案`,
    description: '以更低风险执行同类目标，分阶段验证后再扩大投入。',
    feasibility: Math.max(45, Number(route.feasibility || 60) - 8),
    difficulty: '中等',
    benefit: route.benefit || '中',
    tag: '替代',
    tagColor: 'mid',
    impacts: {
      career: Math.round((Math.random() * 12) - 2),
      finance: Math.round((Math.random() * 10) - 2),
      relationship: Math.round((Math.random() * 10) - 2),
      health: Math.round((Math.random() * 10) - 2),
      growth: Math.round((Math.random() * 12) - 2)
    }
  }
  aiRoutes.value.splice(index, 1, replacement)
  setStatusMessage('路线已替换')
}
const toggleCompare = async (route) => {
  const idx = compareRoutes.value.findIndex((r) => r.id === route.id)
  if (idx >= 0) {
    const side = idx === 0 ? 'left' : 'right'
    compareRoutes.value.splice(idx, 1)
    if (apiReady.value && sessionId.value) {
      try {
        await gameApi.clearComparisonSlot(side, sessionId.value)
      } catch {
        // local state updated
      }
    }
    setStatusMessage('已移出对比')
    return
  }

  let side
  if (compareRoutes.value.length === 0) {
    side = 'left'
    compareRoutes.value.push(route)
  } else if (compareRoutes.value.length === 1) {
    side = 'right'
    compareRoutes.value.push(route)
  } else {
    compareRoutes.value.shift()
    compareRoutes.value.push(route)
    side = 'right'
    if (apiReady.value && sessionId.value) {
      try {
        await ensureSession()
        const leftRoute = compareRoutes.value[0]
        if (leftRoute?.id) {
          await gameApi.setComparisonSlot('left', { treeNodeId: leftRoute.id }, sessionId.value)
        }
      } catch {
        // keep local
      }
    }
  }

  if (apiReady.value && route.id) {
    try {
      await ensureSession()
      await gameApi.setComparisonSlot(side, { treeNodeId: route.id }, sessionId.value)
    } catch {
      // local compare still works
    }
  }

  if (compareRoutes.value.length === 2) {
    const [a, b] = compareRoutes.value
    const deltas = Object.keys(attributes.value).map((k) => {
      const va = Number(a.impacts?.[k] || 0)
      const vb = Number(b.impacts?.[k] || 0)
      return `${axisLabelMap.value[k]}:${va >= vb ? `${a.title}优(+${va - vb})` : `${b.title}优(+${vb - va})`}`
    })
    setStatusMessage(`双路径对比：${deltas.join(' / ')}`)
  }
}
const addCustomRoute = (route) => {
  const title = String(route?.title || '').trim()
  if (!title) {
    setStatusMessage('请先填写路线名称')
    return
  }
  const desc = String(route?.description || '').trim()
  const feasibility = Math.max(0, Math.min(100, Number(route?.feasibility || 50)))
  const custom = {
    id: `custom_${Date.now()}`,
    title,
    description: desc || (uploadedDocText.value ? `文档摘要：${uploadedDocText.value.slice(0, 80)}...` : '自定义路线'),
    feasibility,
    difficulty: route?.difficulty || '中等',
    benefit: route?.benefit || '中等',
    impacts: {
      career: Math.round((feasibility - 50) / 8),
      finance: Math.round((feasibility - 50) / 10),
      relationship: Math.round((Math.random() * 10) - 3),
      health: Math.round((Math.random() * 8) - 2),
      growth: Math.round((Math.random() * 14) - 3)
    }
  }
  customRoutes.value.unshift(custom)
  setStatusMessage('自定义路线已添加')
}
const removeCustomRoute = (index) => {
  customRoutes.value.splice(index, 1)
  setStatusMessage('已删除自定义路线')
}
const handleFileUpload = (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedDocText.value = String(e.target?.result || '').replace(/\s+/g, ' ').trim()
    setStatusMessage(`已读取文档：${file.name}`)
  }
  reader.readAsText(file, 'utf-8')
}
const buildMedia = (type, title) => ({
  id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type,
  title,
  description: `基于「${selectedRoute.value?.title || '当前路线'}」生成`,
  time: new Date().toLocaleString()
})
const generateComic = () => {
  generatedMedia.value.unshift(buildMedia('comic', '人生分支漫画'))
  setStatusMessage('漫画素材已生成')
}
const generateVideo = () => {
  generatedMedia.value.unshift(buildMedia('video', '15秒分支短视频'))
  setStatusMessage('短视频素材已生成')
}
const generatePoster = () => {
  generatedMedia.value.unshift(buildMedia('poster', '时间轴海报'))
  setStatusMessage('海报素材已生成')
}
const toggleMode = () => { mode.value = mode.value === 'ai' ? 'custom' : 'ai' }

const showRadarChart = () => { currentChart.value = 'radar' }
const showTrendChart = () => { currentChart.value = 'trend' }
const showImpactTrace = () => { currentChart.value = 'impact' }

const refreshSocialData = () => {
  const samples = [
    { source: '教育部公开数据', text: '研究生招生结构持续调整，应用型方向名额增加。' },
    { source: '招聘平台样本', text: 'AI 产品、数据分析、复合型岗位需求增加。' },
    { source: '城市发展动态', text: `${userInfo.value.city || '目标城市'} 新增人才补贴政策，适合长期规划。` }
  ]
  socialFeed.value = samples.map((item, idx) => ({
    id: `feed_refresh_${Date.now()}_${idx}`,
    ...item,
    date: new Date().toLocaleDateString()
  }))
  setStatusMessage('社会数据已刷新')
}

const exitGame = async () => {
  if (sessionId.value) {
    try {
      await gameApi.deleteSession(sessionId.value)
    } catch {
      gameApi.setStoredSessionId(null)
    }
    sessionId.value = null
    apiReady.value = false
  }
  treeNodes.value = []
  selectedNode.value = null
  committedNodeId.value = null
  selectedPathIds.value = []
  aiRoutes.value = []
  setStatusMessage('已退出本局，缓存已清除')
  currentView.value = 'command'
}

onMounted(async () => {
  const backup = localStorage.getItem('life_local_backup')
  if (backup) {
    try {
      const parsed = JSON.parse(backup)
      if (parsed?.userInfo) userInfo.value = { ...userInfo.value, ...parsed.userInfo }
    } catch {
      // ignore invalid backup
    }
  }
  if (sessionId.value) {
    await syncFromServer()
    if (apiReady.value) {
      currentView.value = 'destiny'
      await prepareDestinyTree()
      setStatusMessage('已恢复本局进度')
      computeRegret()
    }
  }
})
</script>

<style scoped>
.main-content {
  padding: var(--space-lg);
  max-width: 1680px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.app-hero {
  text-align: center;
  padding: 1rem 1.25rem 1.1rem;
  margin-bottom: var(--space-lg);
  border-radius: 20px;
}

.app-hero-title {
  font-size: clamp(1.35rem, 2.8vw, 1.85rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  background: linear-gradient(105deg, #4f46e5, #6366f1, #818cf8, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.35rem;
}

.app-hero-sub {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.18em;
  opacity: 0.92;
}

.dna-helix {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
}

.dna-svg {
  width: min(42vw, 520px);
  height: 100%;
  margin: 0 auto;
  display: block;
  filter: blur(0.3px);
}

.dna-strand {
  stroke-linecap: round;
  stroke-dasharray: 28 14;
  animation: dna-dash 20s linear infinite;
}

.dna-strand.b {
  animation-duration: 26s;
  animation-direction: reverse;
}

@keyframes dna-dash {
  to {
    stroke-dashoffset: -420;
  }
}

.path-tags {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.path-tag {
  position: absolute;
  padding: 6px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #3730a3;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(224, 231, 255, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  box-shadow: 0 0 22px rgba(99, 102, 241, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  animation: tag-drift 10s ease-in-out infinite;
}

.path-tag:nth-child(2) {
  animation-delay: -2.5s;
}
.path-tag:nth-child(3) {
  animation-delay: -5s;
}
.path-tag:nth-child(4) {
  animation-delay: -7.5s;
}

@keyframes tag-drift {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

.ai-console-actions {
  position: fixed;
  right: max(16px, 2vw);
  bottom: max(16px, 2vh);
  z-index: 50;
  display: grid;
  gap: 8px;
}

.ai-console-btn {
  min-width: 132px;
  padding: 10px 14px;
  color: var(--fui-text);
  text-align: left;
  background: rgba(5, 4, 3, 0.92);
  border: 1px solid var(--fui-line);
  backdrop-filter: blur(14px);
  box-shadow: 0 0 20px var(--fui-glow), inset 0 0 18px rgba(212, 175, 55, 0.05);
  cursor: pointer;
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.ai-console-btn strong,
.ai-console-btn span {
  display: block;
}

.ai-console-btn strong {
  font-size: 0.88rem;
  letter-spacing: 0.08em;
}

.ai-console-btn span {
  margin-top: 3px;
  color: var(--fui-muted);
  font: 0.68rem "Share Tech Mono", monospace;
  letter-spacing: 0.14em;
}

.ai-console-btn:hover {
  border-color: var(--fui-hot);
  box-shadow: 0 0 24px var(--fui-glow), inset 0 0 18px rgba(212, 175, 55, 0.1);
}

.ai-console-btn:focus-visible {
  outline: 2px solid var(--fui-hot);
  outline-offset: 2px;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}
</style>
