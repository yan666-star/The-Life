<template>
  <div class="destiny-view">
    <div v-if="isTreeLoading" class="destiny-loading-overlay">
      <p>AI 正在生成分岔路线…</p>
    </div>
    <div class="destiny-shell" :style="parallaxStyle" @mousemove="updateParallax" @mouseleave="resetParallax">
      <div class="destiny-noise" aria-hidden="true"></div>
      <div class="destiny-corner destiny-corner-tl" aria-hidden="true"></div>
      <div class="destiny-corner destiny-corner-tr" aria-hidden="true"></div>
      <div class="destiny-corner destiny-corner-bl" aria-hidden="true"></div>
      <div class="destiny-corner destiny-corner-br" aria-hidden="true"></div>

      <header class="destiny-header">
        <div>
          <span class="destiny-kicker">LIFE-OS / FUI-2077 / DESTINY MODULE</span>
          <h1>DESTINY GRAPH / 命轨图谱</h1>
          <p>HORIZONTAL TIMELINE TREE · 横向人生分岔网络</p>
          <p class="destiny-branch-legend">主路径：选中节点下延伸 3 条候选；同批未选变枯枝（虚化、无后继）。可点枯枝探索平行分支。</p>
          <p v-if="!treeNodes.length" class="destiny-empty-hint">尚未加载命轨。请先在「入局」完成 INITIALIZE DESTINY GRAPH。</p>
        </div>
        <div class="destiny-header-readout">
          <span>NODE {{ nodeCount }}</span>
          <span>LEAF {{ leafCount }}</span>
          <span>DEPTH {{ maxDepth }}</span>
        </div>
      </header>

      <main class="destiny-grid">
        <aside class="scan-list">
          <div class="scan-list-header">
            <span>SCAN LIST</span>
            <strong>{{ selectedNodeData?.id || '--' }}</strong>
          </div>
          <button
            v-for="(node, index) in visibleScanNodes"
            :key="node.id"
            class="scan-item"
            :class="{
              active: selectedNode === node.id,
              committed: isPathNode(node.id),
              muted: isMutedNode(node),
              'scan-discarded': node.branchStatus === 'discarded',
            }"
            @click="$emit('select-node', node.id)"
          >
            <small>AT_{{ String(index + 1).padStart(2, '0') }}</small>
            <span>{{ node.title }}</span>
            <i :style="{ width: `${nodeRiskScore(node)}%` }"></i>
          </button>
          <div class="scan-progress">
            <span>TREE SCAN</span>
            <b></b>
          </div>
        </aside>

        <section class="timeline-stage">
          <div class="stage-ruler stage-ruler-top" aria-hidden="true">
            <span v-for="tick in 10" :key="`top-${tick}`">XR_{{ String(tick).padStart(2, '0') }}</span>
          </div>

          <div
            class="timeline-canvas"
            :class="{ dragging: isTreeDragging }"
            :style="canvasDynamicStyle"
            ref="timelineCanvas"
            @wheel.prevent="handleCanvasWheel"
            @pointerdown="startTreeDrag"
            @pointermove="moveTreeDrag"
            @pointerup="endTreeDrag"
            @pointercancel="endTreeDrag"
            @pointerleave="endTreeDrag"
          >
            <div class="mechanical-gear" aria-hidden="true">
              <div class="gear-depth">
                <span class="gear-ring gear-ring-outer"></span>
                <span class="gear-ring gear-ring-mid"></span>
                <span class="gear-ring gear-ring-inner"></span>
                <span class="gear-pointer"></span>
                <span class="gear-core"></span>
              </div>
            </div>
            <div class="canvas-zoom">
              <button type="button" @click="zoomCanvas(-0.12)">ZOOM-</button>
              <span>{{ Math.round(canvasScale * 100) }}%</span>
              <button type="button" @click="zoomCanvas(0.12)">ZOOM+</button>
            </div>
            <svg class="circuit-tree-ghost" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <g class="ghost-trunk">
                <path d="M450 540 V390 M432 540 V390 M468 540 V390 M414 540 V414 M486 540 V414" />
                <path d="M360 390 H540 M334 356 H566 M300 322 H600 M266 286 H634 M228 248 H672 M190 210 H710 M152 172 H748 M118 132 H782" />
              </g>
              <g class="ghost-branches">
                <path d="M360 390 H292 V356 H246 V324 H204 V292 H172" />
                <path d="M540 390 H610 V356 H656 V324 H700 V292 H736" />
                <path d="M334 356 H292 V324 H248 V292 H206 V260 H168" />
                <path d="M566 356 H610 V324 H652 V292 H696 V260 H732" />
                <path d="M300 322 H256 V286 H214 V250 H176 V216 H134" />
                <path d="M600 322 H646 V286 H688 V250 H724 V216 H766" />
                <path d="M266 286 H230 V248 H188 V210 H148" />
                <path d="M634 286 H672 V248 H712 V210 H752" />
                <path d="M228 248 H192 V206 H154 V166 H116" />
                <path d="M672 248 H708 V206 H746 V166 H784" />
                <path d="M190 210 H156 V172 H122 V136 H86" />
                <path d="M710 210 H744 V172 H778 V136 H814" />
                <path d="M152 172 H122 V132 H92 V96 H62" />
                <path d="M748 172 H778 V132 H808 V96 H838" />
              </g>
              <g class="ghost-terminals">
                <circle v-for="dot in ghostDots" :key="dot" :cx="dot.split(',')[0]" :cy="dot.split(',')[1]" r="4" />
              </g>
            </svg>
            <div class="timeline-heatmap" aria-hidden="true"></div>
            <div class="holo-runner" aria-hidden="true">
              <svg class="runner-svg pulse-engine-svg" viewBox="0 0 280 190" role="img" aria-label="">
                <defs>
                  <linearGradient id="pulseBeam" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#e8c872" stop-opacity="0.03" />
                    <stop offset="0.38" stop-color="#e8c872" stop-opacity="0.3" />
                    <stop offset="1" stop-color="#fff4d6" stop-opacity="0.78" />
                  </linearGradient>
                  <radialGradient id="pulseCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stop-color="#fff4d6" stop-opacity="0.92" />
                    <stop offset="0.42" stop-color="#e8c872" stop-opacity="0.52" />
                    <stop offset="1" stop-color="#8b6914" stop-opacity="0" />
                  </radialGradient>
                  <linearGradient id="pulseShell" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#161008" stop-opacity="0.84" />
                    <stop offset="0.7" stop-color="#3d2e14" stop-opacity="0.55" />
                    <stop offset="1" stop-color="#e8c872" stop-opacity="0.1" />
                  </linearGradient>
                  <radialGradient id="runnerBaseGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0" stop-color="#fff4d6" stop-opacity="0.62" />
                    <stop offset="0.38" stop-color="#e8c872" stop-opacity="0.22" />
                    <stop offset="1" stop-color="#8b6914" stop-opacity="0" />
                  </radialGradient>
                  <filter id="runnerNeon" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="2.2" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.72  0 0 0 0 0.2  0 0 0 0.84 0" result="cyanBlur" />
                    <feMerge>
                      <feMergeNode in="cyanBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="runnerSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                </defs>

                <g class="engine-backwash">
                  <path d="M0 38 H86" />
                  <path d="M0 64 H112" />
                  <path d="M0 90 H96" />
                  <path d="M18 116 H86" />
                  <path d="M32 138 H72" />
                </g>

                <g class="pulse-shells">
                  <path d="M54 48 L100 36 L122 54 L122 78 L100 96 L54 84 L72 66 Z" />
                  <path d="M91 38 L144 28 L170 50 L170 86 L144 108 L91 98 L112 68 Z" />
                  <path d="M138 28 L196 20 L230 48 L230 92 L196 120 L138 112 L164 70 Z" />
                  <path d="M190 36 L236 28 L268 56 L268 84 L236 112 L190 104 L214 70 Z" />
                </g>

                <g class="engine-slice-lines">
                  <path d="M73 46 V86" />
                  <path d="M101 36 V96" />
                  <path d="M123 54 V78" />
                  <path d="M145 29 V108" />
                  <path d="M170 50 V86" />
                  <path d="M197 21 V119" />
                  <path d="M230 48 V92" />
                  <path d="M237 29 V111" />
                  <path d="M58 66 H268" />
                  <path d="M112 46 H214" />
                  <path d="M112 90 H214" />
                </g>

                <g class="pulse-rings">
                  <ellipse cx="122" cy="66" rx="32" ry="31" />
                  <ellipse cx="170" cy="68" rx="36" ry="37" />
                  <ellipse cx="224" cy="70" rx="38" ry="41" />
                  <ellipse cx="250" cy="70" rx="22" ry="25" />
                  <circle cx="250" cy="70" r="14" />
                </g>

                <g class="pulse-core" filter="url(#runnerNeon)">
                  <circle cx="250" cy="70" r="20" />
                  <circle cx="250" cy="70" r="10" />
                  <circle cx="250" cy="70" r="3.5" />
                </g>

                <g class="pulse-beam-lines">
                  <path d="M248 48 H278" />
                  <path d="M250 58 H280" />
                  <path d="M250 70 H280" />
                  <path d="M250 82 H280" />
                  <path d="M248 94 H278" />
                </g>

                <g class="pulse-dot-field">
                  <circle cx="238" cy="58" r="1.4" /><circle cx="244" cy="54" r="1.4" /><circle cx="250" cy="52" r="1.4" /><circle cx="256" cy="54" r="1.4" /><circle cx="262" cy="58" r="1.4" />
                  <circle cx="236" cy="66" r="1.4" /><circle cx="244" cy="66" r="1.4" /><circle cx="252" cy="66" r="1.4" /><circle cx="260" cy="66" r="1.4" /><circle cx="268" cy="66" r="1.4" />
                  <circle cx="238" cy="76" r="1.4" /><circle cx="244" cy="82" r="1.4" /><circle cx="250" cy="84" r="1.4" /><circle cx="256" cy="82" r="1.4" /><circle cx="262" cy="76" r="1.4" />
                  <circle cx="212" cy="54" r="1.1" /><circle cx="218" cy="64" r="1.1" /><circle cx="214" cy="78" r="1.1" />
                </g>

                <g class="runner-base" filter="url(#runnerSoftGlow)">
                  <ellipse cx="162" cy="170" rx="108" ry="20" />
                </g>
                <g class="runner-base-lines">
                  <ellipse cx="162" cy="170" rx="98" ry="16" />
                  <ellipse cx="162" cy="170" rx="64" ry="10" />
                  <path d="M48 170 H260" />
                </g>
              </svg>
              <span class="runner-shadow"></span>
            </div>
            <div class="timeline-world" ref="timelineWorld" :style="worldStyle">
              <svg class="timeline-links" :viewBox="`0 0 ${layout.width} ${layout.height}`" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="destiny-line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(139, 105, 20, 0.12)" />
                    <stop offset="50%" stop-color="rgba(232, 200, 114, 0.9)" />
                    <stop offset="100%" stop-color="rgba(139, 105, 20, 0.2)" />
                  </linearGradient>
                </defs>
                <path
                  v-for="edge in layout.edges"
                  :key="`${edge.from}-${edge.to}-tap`"
                  :d="edge.tapPath"
                  class="timeline-edge-tap"
                  :class="{ active: isActiveEdge(edge), muted: isMutedEdge(edge) }"
                />
                <path
                  v-for="edge in layout.edges"
                  :key="`${edge.from}-${edge.to}`"
                  :d="edge.path"
                  class="timeline-edge"
                  :class="[`depth-${Math.min(edge.depth, 6)}`, { active: isActiveEdge(edge), muted: isMutedEdge(edge), selected: selectedNode === edge.to }]"
                />
                <circle
                  v-for="edge in layout.edges"
                  :key="`${edge.from}-${edge.to}-terminal`"
                  :cx="edge.endX"
                  :cy="edge.endY"
                  r="4"
                  class="timeline-terminal"
                  :class="{ active: isActiveEdge(edge), muted: isMutedEdge(edge) }"
                />
              </svg>

              <button
                v-for="node in layout.nodes"
                :key="node.id"
                class="timeline-node"
                :data-node-id="node.id"
                :class="{
                  root: !node.parentId,
                  active: selectedNode === node.id,
                  committed: isPathNode(node.id),
                  muted: isMutedNode(node),
                  risk: isHighRiskNode(node),
                  fresh: node.branchStatus === 'pending',
                  'branch-pending': node.branchStatus === 'pending',
                  'branch-discarded': node.branchStatus === 'discarded',
                  'branch-chosen':
                    node.branchStatus === 'chosen' && node.isOnActivePath,
                  [`depth-${Math.min(node.depth, 6)}`]: true
                }"
                :style="{ left: `${node.x}px`, top: `${node.y}px` }"
                @click="$emit('select-node', node.id)"
              >
                <span class="node-pin"></span>
                <span class="node-reticle" aria-hidden="true"></span>
                <span class="node-card-code">NODE-{{ String(node.depth).padStart(2, '0') }}</span>
                <strong>{{ node.title }}</strong>
                <small>{{ node.parentTitle || 'LIFE CORE' }}</small>
                <em v-if="node.branchStatus === 'discarded'" class="node-ghost-tag">枯枝</em>
                <em v-else-if="isHighRiskNode(node)">SPX</em>
              </button>
            </div>
          </div>

          <div class="stage-footer">
            <span><i></i> PATH_SYNC</span>
            <span><i></i> SPX_0.048</span>
            <span><i></i> SIGNAL_STABLE</span>
            <button class="stage-nav" @click="$emit('go-to-genesis')">BACK GENESIS</button>
            <button class="stage-nav primary" @click="$emit('start-divergence', selectedNode)">开启衍化</button>
            <button class="stage-nav primary" @click="$emit('go-to-conclusion')">归途 / REPORT</button>
          </div>
        </section>

        <aside class="node-inspector">
          <div class="inspector-head">
            <span>NODE INSPECTOR</span>
            <b>{{ selectedNodeData ? 'LOCKED' : 'IDLE' }}</b>
          </div>
          <div class="inspector-scroll">
          <div class="inspector-title">
            <small>{{ selectedNodeData?.id || 'NO_NODE' }}</small>
            <h2>{{ selectedNodeData?.title || '未选择节点' }}</h2>
            <div v-if="displayStory" class="inspector-story-block">
              <span class="inspector-label">剧情</span>
              <p class="inspector-story-text">{{ displayStory }}</p>
            </div>
            <p v-else-if="selectedNodeData" class="inspector-fallback">该节点暂无 AI 剧情，请重新生成分岔。</p>
            <p v-else class="inspector-fallback">点击命轨树上的节点，在此查看对应剧情。</p>
          </div>
          <div v-if="selectedNodeData" class="attr-delta-panel">
            <span class="attr-delta-label">五维属性变化</span>
            <div class="attr-delta-grid">
              <div
                v-for="row in selectedAttributeRows"
                :key="row.key"
                class="attr-delta-item"
                :class="{ positive: row.positive, negative: row.negative, zero: row.zero }"
              >
                <span class="attr-delta-name">{{ row.label }}</span>
                <strong class="attr-delta-value">{{ row.text }}</strong>
              </div>
            </div>
          </div>
          <div class="inspector-metrics">
            <div>
              <span>STATUS</span>
              <strong>{{ selectedNodeData ? nodeStatus(selectedNodeData) : '--' }}</strong>
            </div>
            <div>
              <span>DEPTH</span>
              <strong>{{ selectedDepth }}</strong>
            </div>
            <div>
              <span>PARENT</span>
              <strong>{{ selectedParentTitle }}</strong>
            </div>
            <div>
              <span>CREATED</span>
              <strong>{{ selectedNodeData ? formatNodeDate(selectedNodeData.timeline) : '--' }}</strong>
            </div>
          </div>
          <div class="risk-panel">
            <div class="risk-row">
              <span>RISK VECTOR</span>
              <strong>{{ selectedNodeData ? nodeRiskScore(selectedNodeData) : '--' }}%</strong>
            </div>
            <div class="risk-bar"><i :style="{ width: `${selectedNodeData ? nodeRiskScore(selectedNodeData) : 0}%` }"></i></div>
            <div class="risk-row">
              <span>REGRET INDEX</span>
              <strong>{{ selectedNodeData ? regretScore(selectedNodeData) : '--' }}%</strong>
            </div>
            <div class="risk-bar regret"><i :style="{ width: `${selectedNodeData ? regretScore(selectedNodeData) : 0}%` }"></i></div>
          </div>
          <div class="inspector-log">
            <span>REALITY COST</span>
            <p>{{ selectedNodeData ? realityCost(selectedNodeData) : '等待节点接入...' }}</p>
          </div>
          </div>
          <div class="node-actions">
            <button
              v-if="selectedNodeData?.branchStatus === 'pending'"
              class="btn btn-primary"
              :disabled="isTreeLoading"
              @click="$emit('commit-node', selectedNode)"
            >
              选择
            </button>
            <button
              class="btn btn-secondary btn-danger"
              :class="{ 'node-action-solo': selectedNodeData?.branchStatus !== 'pending' }"
              :disabled="!selectedNodeData || !selectedNodeData.parentId"
              @click="$emit('delete-node', selectedNode)"
            >
              DELETE NODE
            </button>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  treeNodes: { type: Array, required: true },
  selectedNode: { type: [String, Number], required: true },
  selectedNodeData: { type: Object, required: false },
  selectedPathIds: { type: Array, default: () => [] },
  committedNodeId: { type: [String, Number], default: null },
  nodeCount: { type: Number, required: true },
  leafCount: { type: Number, required: true },
  selectedDepth: { type: Number, required: true },
  isTreeLoading: { type: Boolean, default: false },
})

defineEmits(['select-node', 'commit-node', 'delete-node', 'go-to-genesis', 'go-to-divergence', 'start-divergence', 'go-to-conclusion'])

const NODE_WIDTH = 156
const NODE_HEIGHT = 76
const START_X = 130
const START_Y = 230
const H_GAP = 260
const V_GAP = 128

const pointer = ref({ x: 0, y: 0 })
const timelineCanvas = ref(null)
const canvasScrollLeft = ref(0)
const canvasClientWidth = ref(0)
let canvasViewportObserver = null
const canvasScale = ref(1)
const isTreeDragging = ref(false)
const treeDragStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
const ghostDots = [
  '62,96', '86,136', '116,166', '134,216', '148,210', '168,260', '172,292', '176,216',
  '206,260', '204,292', '246,324', '248,292', '736,292', '732,260', '766,216', '752,210',
  '784,166', '814,136', '838,96', '724,216', '700,292', '696,260', '656,324'
]

const nodeMap = computed(() => new Map(props.treeNodes.map((node) => [node.id, node])))
const pathSet = computed(() => new Set(props.selectedPathIds))
const maxDepth = computed(() => {
  if (!props.treeNodes.length) return 1
  return Math.max(1, ...props.treeNodes.map((node) => Number(node.depth) || 1))
})

const selectedParentTitle = computed(() => {
  const parentId = props.selectedNodeData?.parentId
  if (!parentId) return 'ROOT'
  return nodeMap.value.get(parentId)?.title || parentId
})

/** 仅展示 API 生成的剧情正文 */
const displayStory = computed(() => {
  const n = props.selectedNodeData
  if (!n) return ''
  const story = String(n.story || '').trim()
  if (story.length >= 10) return story
  return ''
})

const activePathLeafId = computed(() => {
  const onPath = props.treeNodes.filter((n) => n.isOnActivePath)
  if (!onPath.length) return props.committedNodeId
  return onPath.sort((a, b) => (Number(b.depth) || 0) - (Number(a.depth) || 0))[0]?.id
})

const visibleScanNodes = computed(() => {
  const leaf = activePathLeafId.value ? nodeMap.value.get(activePathLeafId.value) : null
  const branchSiblings = (leaf?.children || [])
    .map((id) => nodeMap.value.get(id))
    .filter(
      (n) =>
        n &&
        (n.branchStatus === 'pending' || n.branchStatus === 'discarded')
    )
  if (branchSiblings.length) return branchSiblings

  const root = props.treeNodes.find((n) => !n.parentId)
  if (leaf?.id === root?.id) {
    return (root.children || [])
      .map((id) => nodeMap.value.get(id))
      .filter(
        (n) =>
          n &&
          (n.branchStatus === 'pending' || n.branchStatus === 'discarded')
      )
  }
  return []
})

const ATTR_KEYS = ['career', 'finance', 'relationship', 'health', 'growth']
const ATTR_LABELS = {
  career: '职业',
  finance: '财务',
  relationship: '人际',
  health: '健康',
  growth: '成长',
}

const selectedAttributeRows = computed(() => {
  const node = props.selectedNodeData
  if (!node) return []
  const delta = node.attributeDelta || node.payload?.attributeDelta || {}
  return ATTR_KEYS.map((key) => {
    const n = Number(delta[key])
    const value = Number.isFinite(n) ? Math.round(n) : null
    const text = value === null ? '—' : value > 0 ? `+${value}` : `${value}`
    return {
      key,
      label: ATTR_LABELS[key],
      text,
      positive: value > 0,
      negative: value < 0,
      zero: value === 0,
    }
  })
})

const parallaxStyle = computed(() => ({
  '--px': `${pointer.value.x}px`,
  '--py': `${pointer.value.y}px`
}))

const lastPathNodeId = computed(() => props.selectedPathIds.at(-1) || props.selectedNode)

const worldStyle = computed(() => ({
  width: `${layout.value.width}px`,
  height: `${layout.value.height}px`,
  transform: `scale(${canvasScale.value})`
}))

const syncCanvasViewport = () => {
  const el = timelineCanvas.value
  if (!el) return
  canvasScrollLeft.value = el.scrollLeft
  canvasClientWidth.value = el.clientWidth
}

const canvasDynamicStyle = computed(() => ({
  '--world-width': `${layout.value.width}px`,
  '--world-height': `${layout.value.height}px`,
  '--canvas-scroll-left': `${canvasScrollLeft.value}px`,
  '--canvas-viewport-width': `${Math.max(1, canvasClientWidth.value)}px`
}))

const updateParallax = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  pointer.value = {
    x: ((event.clientX - rect.left) / rect.width - 0.5) * 22,
    y: ((event.clientY - rect.top) / rect.height - 0.5) * 22
  }
}

const resetParallax = () => {
  pointer.value = { x: 0, y: 0 }
}

const clampScale = (value) => Math.max(0.55, Math.min(1.85, Number(value.toFixed(2))))

const zoomCanvas = (delta) => {
  canvasScale.value = clampScale(canvasScale.value + delta)
}

const handleCanvasWheel = (event) => {
  const delta = event.deltaY > 0 ? -0.08 : 0.08
  zoomCanvas(delta)
}

const startTreeDrag = (event) => {
  if (event.button !== 0 || event.target?.closest('button, .canvas-zoom')) return
  const canvas = timelineCanvas.value
  if (!canvas) return
  isTreeDragging.value = true
  treeDragStart.value = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: canvas.scrollLeft,
    scrollTop: canvas.scrollTop
  }
  canvas.setPointerCapture?.(event.pointerId)
}

const moveTreeDrag = (event) => {
  if (!isTreeDragging.value) return
  const canvas = timelineCanvas.value
  if (!canvas) return
  const dx = event.clientX - treeDragStart.value.x
  const dy = event.clientY - treeDragStart.value.y
  canvas.scrollLeft = treeDragStart.value.scrollLeft - dx
  canvas.scrollTop = treeDragStart.value.scrollTop - dy
}

const endTreeDrag = (event) => {
  if (!isTreeDragging.value) return
  timelineCanvas.value?.releasePointerCapture?.(event.pointerId)
  isTreeDragging.value = false
  syncCanvasViewport()
}

const scrollToNode = async (nodeId) => {
  if (!nodeId) return
  await nextTick()
  window.setTimeout(() => {
    const canvas = timelineCanvas.value
    const target = canvas?.querySelector(`[data-node-id="${nodeId}"]`)
    target?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
  }, 40)
}

const focusLastPathNode = async () => scrollToNode(lastPathNodeId.value)

const focusNewestBranch = async () => {
  if (!props.treeNodes.length) return
  const depth = maxDepth.value
  const newest =
    props.treeNodes.find((n) => n.branchStatus === 'pending' && Number(n.depth) === depth) ||
    props.treeNodes.find((n) => Number(n.depth) === depth)
  if (newest) await scrollToNode(newest.id)
}

const formatNodeDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'NO TIMESTAMP'
  return date.toLocaleDateString()
}

const nodeRiskScore = (node) => {
  const seed = Array.from(`${node?.title || ''}${node?.description || ''}`).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return 18 + (seed % 72)
}

const regretScore = (node) => Math.min(96, Math.max(8, nodeRiskScore(node) - 7 + ((Number(node?.depth) || 1) * 5)))
const isHighRiskNode = (node) => nodeRiskScore(node) >= 70
const isPathNode = (id) => pathSet.value.has(id)

const isMutedNode = (node) => node.branchStatus === 'discarded'

const isMutedEdge = (edge) => {
  const to = nodeMap.value.get(edge.to)
  return to?.branchStatus === 'discarded'
}
const isActiveEdge = (edge) => pathSet.value.has(edge.from) && pathSet.value.has(edge.to)

const nodeStatus = (node) => {
  if (node.branchStatus === 'pending') return 'PENDING · 待选'
  if (node.branchStatus === 'discarded') return 'DISCARDED · 枯枝'
  if (node.branchStatus === 'chosen' || isPathNode(node.id)) return 'SELECTED PATH'
  if (isHighRiskNode(node)) return 'HIGH RISK'
  if ((node.children || []).length) return 'BRANCH READY'
  return 'CANDIDATE'
}

const realityCost = (node) => {
  const map = [
    '时间成本偏高，需要持续投入与阶段复盘。',
    '现实阻力中等，适合小步验证后扩大投入。',
    '机会窗口较短，需快速判断资源与风险。',
    '情绪与关系成本需纳入同步评估。'
  ]
  return map[nodeRiskScore(node) % map.length]
}

const layout = computed(() => {
  const roots = props.treeNodes.filter((node) => !node.parentId)
  const childrenMap = new Map()
  props.treeNodes.forEach((node) => {
    childrenMap.set(
      node.id,
      (node.children || []).map((id) => nodeMap.value.get(id)).filter(Boolean)
    )
  })

  const rows = new Map()
  props.treeNodes.forEach((node) => {
    const depth = Number(node.depth) || 1
    const list = rows.get(depth) || []
    list.push(node)
    rows.set(depth, list)
  })

  const positioned = []
  const positions = new Map()
  const sortedDepths = [...rows.keys()].sort((a, b) => a - b)
  sortedDepths.forEach((depth) => {
    const rowNodes = rows.get(depth) || []
    const centerOffset = ((rowNodes.length - 1) * V_GAP) / 2
    rowNodes.forEach((node, index) => {
      const x = START_X + (depth - 1) * H_GAP
      const y = START_Y + index * V_GAP - centerOffset
      const parent = node.parentId ? nodeMap.value.get(node.parentId) : null
      const item = {
        ...node,
        x,
        y,
        parentTitle: parent?.title || '',
        childrenCount: (childrenMap.get(node.id) || []).length
      }
      positioned.push(item)
      positions.set(node.id, item)
    })
  })

  const edges = []
  props.treeNodes.forEach((node) => {
    const from = positions.get(node.id)
    if (!from) return
    ;(childrenMap.get(node.id) || []).forEach((child) => {
      const to = positions.get(child.id)
      if (!to) return
      const startX = from.x + NODE_WIDTH / 2
      const startY = from.y
      const endX = to.x - NODE_WIDTH / 2
      const endY = to.y
      const laneOffset = ((to.y - from.y) === 0 ? 0 : Math.sign(to.y - from.y) * 18)
      const midX = startX + Math.max(62, (endX - startX) * 0.42)
      const busX = midX + 24
      const tapY = endY - laneOffset
      edges.push({
        from: node.id,
        to: child.id,
        depth: child.depth || ((node.depth || 1) + 1),
        endX,
        endY,
        tapPath: `M ${busX} ${tapY - 16} V ${tapY + 16} M ${busX - 12} ${tapY} H ${busX + 12}`,
        path: `M ${startX} ${startY} H ${midX} L ${busX} ${tapY} V ${endY} H ${endX}`
      })
    })
  })

  const width = Math.max(900, START_X + (sortedDepths.length - 1) * H_GAP + NODE_WIDTH + 160)
  const height = Math.max(560, START_Y + Math.max(...[...rows.values()].map((row) => row.length), 1) * V_GAP)
  return { nodes: positioned, edges, width, height, roots }
})

watch([lastPathNodeId, canvasScale, () => layout.value.width, () => layout.value.height], focusLastPathNode, { immediate: true })

watch(
  () => props.treeNodes.length,
  (len, prev) => {
    if (len > (prev || 0)) focusNewestBranch()
  }
)

watch([() => layout.value.width, () => layout.value.height, canvasScale], () => nextTick(syncCanvasViewport))

onMounted(() => {
  nextTick(() => {
    const el = timelineCanvas.value
    if (!el) return
    syncCanvasViewport()
    el.addEventListener('scroll', syncCanvasViewport, { passive: true })
    canvasViewportObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncCanvasViewport) : null
    canvasViewportObserver?.observe(el)
  })
})

onUnmounted(() => {
  timelineCanvas.value?.removeEventListener('scroll', syncCanvasViewport)
  canvasViewportObserver?.disconnect()
  canvasViewportObserver = null
})
</script>
