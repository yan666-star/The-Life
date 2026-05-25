<template>
  <div class="comparison-view">
    <CrystalNodeTree />
    <div class="light-beam beam-1"></div>
    <div class="light-beam beam-2"></div>
    <div class="light-beam beam-3"></div>

    <div class="comparison-container glass-container">
      <div class="beam-accent top-left"></div>
      <div class="beam-accent top-right"></div>
      <div class="beam-accent bottom-left"></div>
      <div class="beam-accent bottom-right"></div>

      <div class="comparison-main">
        <aside class="left-sidebar">
          <AttributesSidebar
            :attributes="attributes"
            :showTrendPreview="true"
          />
        </aside>

        <main class="comparison-area">
          <div class="radar-hero glass-card" v-if="radarAxes.length">
            <div class="radar-hero-head">
              <h3>五维属性雷达</h3>
              <span class="radar-pill">职业发展 · 财务 · 人际 · 健康 · 成长</span>
            </div>
            <div class="radar-hero-body">
              <svg class="radar-mini-svg" viewBox="0 0 240 240" aria-hidden="true">
                <defs>
                  <linearGradient id="radarFillG" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="rgba(56,189,248,0.45)" />
                    <stop offset="100%" stop-color="rgba(167,139,250,0.35)" />
                  </linearGradient>
                </defs>
                <g class="radar-grid-mini">
                  <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(125,211,252,0.35)" stroke-width="1" />
                  <circle cx="120" cy="120" r="60" fill="none" stroke="rgba(125,211,252,0.25)" stroke-width="1" />
                  <circle cx="120" cy="120" r="30" fill="none" stroke="rgba(125,211,252,0.2)" stroke-width="1" />
                </g>
                <g class="radar-axes-mini">
                  <line
                    v-for="(pt, index) in radarAxisPoints"
                    :key="'ax' + index"
                    x1="120"
                    y1="120"
                    :x2="pt.x"
                    :y2="pt.y"
                    stroke="rgba(148,163,184,0.45)"
                    stroke-width="1"
                  />
                </g>
                <polygon class="radar-shape-mini" :points="radarPolygon" fill="url(#radarFillG)" stroke="rgba(56,189,248,0.85)" stroke-width="2" />
                <g class="radar-labels-mini">
                  <text
                    v-for="(axis, index) in radarAxes"
                    :key="axis.key"
                    :x="radarAxisPoints[index].lx"
                    :y="radarAxisPoints[index].ly"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="radar-lbl"
                  >{{ axis.label }}</text>
                </g>
              </svg>
            </div>
          </div>

          <div class="comparison-header">
            <h2 class="comparison-title">PARALLEL / 平行时空观察窗</h2>
            <div class="comparison-controls">
              <button
                class="btn btn-small"
                :class="{ active: comparisonMode === 'side-by-side' }"
                @click="comparisonMode = 'side-by-side'"
              >
                ▭▭ SIDE BY SIDE
              </button>
              <button
                class="btn btn-small"
                :class="{ active: comparisonMode === 'slider' }"
                @click="comparisonMode = 'slider'"
              >
                ⇄ SCAN GATE
              </button>
              <button
                class="btn btn-small"
                :class="{ active: comparisonMode === 'blend' }"
                @click="comparisonMode = 'blend'"
              >
                ◐ BLEND
              </button>
              <button v-if="selectedRoutes.length >= 2" class="btn btn-small" @click="swapRoutes">
                ⇅ SWAP
              </button>
            </div>
          </div>

          <div v-if="routes.length > 2" class="route-selector glass-card">
            <div class="selector-header">
              <h4>🔄 切换对比路线</h4>
            </div>
            <div class="selector-grid">
              <div v-for="(route, idx) in routes" :key="idx" class="route-option">
                <button
                  class="route-btn"
                  :class="{ selected: selectedRoutes.includes(route) }"
                  @click="addRouteToComparison(route)"
                >
                  <span class="route-name">{{ route.title }}</span>
                  <span class="route-feasibility">{{ route.feasibility }}%</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="comparisonMode === 'side-by-side'" class="comparison-content side-by-side">
            <div class="route-window left-window">
              <div class="route-card glass-card" @click="expandRoute(selectedRoutes[0])">
                <div class="expand-hint">TIMELINE A / CLICK TO EXPAND</div>
                <div class="route-glow"></div>
                <div class="route-visual route-visual--tech" aria-hidden="true">
                  <div class="route-visual-orbit"></div>
                  <span class="route-visual-glyph">⎔</span>
                </div>
                <p class="route-scene-caption">TIMELINE A · 平行时空观察窗</p>
                <div class="route-type" :class="selectedRoutes[0]?.type">{{ selectedRoutes[0]?.type }}</div>
                <h3 class="route-title">{{ selectedRoutes[0]?.title }}</h3>
                <p class="route-description">{{ selectedRoutes[0]?.description }}</p>
                <div class="metrics">
                  <div class="metric-item">
                    <span class="metric-label">FEASIBILITY</span>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: selectedRoutes[0]?.feasibility + '%' }"></div>
                    </div>
                    <span class="metric-value">{{ selectedRoutes[0]?.feasibility }}%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">DIFFICULTY</span>
                    <span class="metric-badge" :class="getDifficultyClass(selectedRoutes[0]?.difficulty)">
                      {{ selectedRoutes[0]?.difficulty }}
                    </span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">BENEFIT</span>
                    <span class="metric-badge benefit">{{ selectedRoutes[0]?.benefit }}</span>
                  </div>
                </div>
                <div class="attribute-impact">
                  <h4>ATTRIBUTE IMPACT</h4>
                  <div class="impact-list">
                    <div
                      v-for="(impact, attr) in getRouteImpacts(selectedRoutes[0])"
                      :key="attr"
                      class="impact-tag"
                      :class="{ positive: impact >= 0, negative: impact < 0 }"
                    >
                      {{ attributeLabels[attr] }} {{ impact > 0 ? '+' : '' }}{{ impact }}
                    </div>
                  </div>
                </div>
                <button class="btn btn-primary full-width" @click.stop="selectRoute(selectedRoutes[0])">
                  SELECT TIMELINE A
                </button>
              </div>
            </div>
            <div class="vs-pillar" aria-hidden="true">
              <div class="vs-orb">VS CORE</div>
            </div>
            <div class="route-window right-window">
              <div class="route-card glass-card" @click="expandRoute(selectedRoutes[1])">
                <div class="expand-hint">TIMELINE B / CLICK TO EXPAND</div>
                <div class="route-glow route-glow--art"></div>
                <div class="route-visual route-visual--art" aria-hidden="true">
                  <div class="route-visual-orbit"></div>
                  <span class="route-visual-glyph">✦</span>
                </div>
                <p class="route-scene-caption">TIMELINE B · 平行时空观察窗</p>
                <div class="route-type" :class="selectedRoutes[1]?.type">{{ selectedRoutes[1]?.type }}</div>
                <h3 class="route-title">{{ selectedRoutes[1]?.title }}</h3>
                <p class="route-description">{{ selectedRoutes[1]?.description }}</p>
                <div class="metrics">
                  <div class="metric-item">
                    <span class="metric-label">FEASIBILITY</span>
                    <div class="metric-bar">
                      <div class="metric-fill" :style="{ width: selectedRoutes[1]?.feasibility + '%' }"></div>
                    </div>
                    <span class="metric-value">{{ selectedRoutes[1]?.feasibility }}%</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">DIFFICULTY</span>
                    <span class="metric-badge" :class="getDifficultyClass(selectedRoutes[1]?.difficulty)">
                      {{ selectedRoutes[1]?.difficulty }}
                    </span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">BENEFIT</span>
                    <span class="metric-badge benefit">{{ selectedRoutes[1]?.benefit }}</span>
                  </div>
                </div>
                <div class="attribute-impact">
                  <h4>ATTRIBUTE IMPACT</h4>
                  <div class="impact-list">
                    <div
                      v-for="(impact, attr) in getRouteImpacts(selectedRoutes[1])"
                      :key="attr"
                      class="impact-tag"
                      :class="{ positive: impact >= 0, negative: impact < 0 }"
                    >
                      {{ attributeLabels[attr] }} {{ impact > 0 ? '+' : '' }}{{ impact }}
                    </div>
                  </div>
                </div>
                <button class="btn btn-primary full-width" @click.stop="selectRoute(selectedRoutes[1])">
                  SELECT TIMELINE B
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="comparisonMode === 'slider'" class="comparison-content slider-mode">
            <div class="slider-container glass-card">
              <div class="slider-content">
                <div class="slider-left" :style="{ width: sliderPosition + '%' }">
                  <div class="route-card glass-card" v-if="selectedRoutes[0]">
                    <div class="route-glow"></div>
                    <div class="route-type" :class="selectedRoutes[0].type">{{ selectedRoutes[0].type }}</div>
                    <h3 class="route-title">{{ selectedRoutes[0].title }}</h3>
                    <p class="route-description">{{ selectedRoutes[0].description }}</p>
                  </div>
                </div>
                <div class="slider-right" :style="{ width: (100 - sliderPosition) + '%' }">
                  <div class="route-card glass-card" v-if="selectedRoutes[1]">
                    <div class="route-glow"></div>
                    <div class="route-type" :class="selectedRoutes[1].type">{{ selectedRoutes[1].type }}</div>
                    <h3 class="route-title">{{ selectedRoutes[1].title }}</h3>
                    <p class="route-description">{{ selectedRoutes[1].description }}</p>
                  </div>
                </div>
                <div
                  class="slider-handle"
                  :style="{ left: sliderPosition + '%' }"
                  @mousedown="startSliderDrag"
                  @touchstart="startSliderDrag"
                >
                  <span class="slider-arrow">⇄</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                v-model="sliderPosition"
                class="slider-input"
              >
            </div>
          </div>

          <div v-else-if="comparisonMode === 'blend'" class="comparison-content blend-mode">
            <div class="blend-container">
              <div v-for="(route, idx) in selectedRoutes" :key="idx" class="blend-layer" :style="{ opacity: 0.5 }">
                <div class="route-card glass-card">
                  <div class="route-glow"></div>
                  <div class="route-type" :class="route.type">{{ route.type }}</div>
                  <h3 class="route-title">{{ route.title }}</h3>
                  <div class="metrics">
                    <div class="metric-item">
                      <span class="metric-label">可行性</span>
                      <div class="metric-bar">
                        <div class="metric-fill" :style="{ width: route.feasibility + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="comparison-analysis glass-card" v-if="selectedRoutes.length === 2">
            <div class="analysis-header">
              <h4>对比分析</h4>
            </div>
            <div class="analysis-grid">
              <div class="analysis-item">
                <span class="analysis-label">综合评分差异</span>
                <span class="analysis-value" :class="getScoreDifference() >= 0 ? 'positive' : 'negative'">
                  {{ getScoreDifference() > 0 ? '+' : '' }}{{ getScoreDifference() }}
                </span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">难度对比</span>
                <span class="analysis-value">
                  {{ selectedRoutes[0].difficulty }} vs {{ selectedRoutes[1].difficulty }}
                </span>
              </div>
              <div class="analysis-item">
                <span class="analysis-label">收益期望</span>
                <span class="analysis-value">
                  {{ selectedRoutes[0].benefit }} vs {{ selectedRoutes[1].benefit }}
                </span>
              </div>
            </div>
          </div>
        </main>

        <aside class="right-sidebar">
          <div class="social-dynamics glass-card">
            <div class="panel-header">
              <h3 class="panel-title">社会现实联动</h3>
            </div>
            <div class="social-item" v-for="item in socialData" :key="item.id">
              <span class="social-tag" :class="item.category">{{ item.category }}</span>
              <p class="social-text">{{ item.text }}</p>
            </div>
          </div>

          <div class="policy-info glass-card">
            <div class="panel-header">
              <h3 class="panel-title">政策与公共服务</h3>
              <span class="live-dot">实时更新</span>
            </div>
            <div class="policy-item" v-for="policy in policyData" :key="policy.id">
              <h4 class="policy-title">{{ policy.title }}</h4>
              <p class="policy-text">{{ policy.description }}</p>
              <span class="policy-date">{{ policy.date }}</span>
            </div>
          </div>

          <div class="wave-panel glass-card">
            <div class="panel-header">
              <h3 class="panel-title">社会指标波形</h3>
            </div>
            <svg class="wave-svg" viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="waveLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#e8c872" />
                  <stop offset="100%" stop-color="#b8860b" />
                </linearGradient>
              </defs>
              <path
                class="wave-area"
                :d="waveAreaPath"
                fill="url(#waveLine)"
                opacity="0.22"
              />
              <path
                class="wave-line"
                :d="compositeTrendPath" fill="none" stroke="url(#waveLine)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p class="wave-caption">综合五维属性的历史波动（示意）</p>
          </div>

          <div class="salary-panel glass-card">
            <div class="panel-header">
              <h3 class="panel-title">薪资水平参考</h3>
            </div>
            <ul class="salary-list">
              <li v-for="row in salaryBands" :key="row.role">
                <span class="salary-role">{{ row.role }}</span>
                <span class="salary-band">{{ row.band }}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div class="comparison-footer">
        <button class="btn btn-secondary" @click="$emit('go-back')">← 返回</button>
        <button class="btn btn-primary" @click="$emit('confirm-selection')">确认选择</button>
      </div>

      <Teleport to="body">
        <div v-if="expandedRoute" class="expanded-modal" @click="closeExpanded">
          <div class="expanded-content glass-container" @click.stop>
            <button class="expanded-close" @click="closeExpanded">×</button>
            <div class="expanded-header">
              <div class="route-type" :class="expandedRoute.type">{{ expandedRoute.type }}</div>
              <h2 class="expanded-title">{{ expandedRoute.title }}</h2>
              <p class="expanded-description">{{ expandedRoute.description }}</p>
            </div>
            <div class="expanded-metrics">
              <div class="expanded-metric">
                <span class="metric-label">可行性</span>
                <div class="metric-bar large">
                  <div class="metric-fill" :style="{ width: expandedRoute.feasibility + '%' }"></div>
                </div>
                <span class="metric-value">{{ expandedRoute.feasibility }}%</span>
              </div>
              <div class="expanded-metric">
                <span class="metric-label">难度</span>
                <span class="metric-badge large" :class="getDifficultyClass(expandedRoute.difficulty)">
                  {{ expandedRoute.difficulty }}
                </span>
              </div>
              <div class="expanded-metric">
                <span class="metric-label">预期收益</span>
                <span class="metric-badge benefit large">{{ expandedRoute.benefit }}</span>
              </div>
            </div>
            <div class="expanded-impacts">
              <h4>属性影响</h4>
              <div class="impact-list">
                <div
                  v-for="(impact, attr) in getRouteImpacts(expandedRoute)"
                  :key="attr"
                  class="impact-tag large"
                  :class="{ positive: impact >= 0, negative: impact < 0 }"
                >
                  {{ attributeLabels[attr] }} {{ impact > 0 ? '+' : '' }}{{ impact }}
                </div>
              </div>
            </div>
            <button class="btn btn-primary full-width" @click="selectRoute(expandedRoute)">
              选择此路线
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AttributesSidebar from './AttributesSidebar.vue'
import CrystalNodeTree from './CrystalNodeTree.vue'

const props = defineProps({
  routes: {
    type: Array,
    default: () => []
  },
  attributes: {
    type: Object,
    default: () => ({})
  },
  radarAxes: {
    type: Array,
    default: () => []
  },
  radarAxisPoints: {
    type: Array,
    default: () => []
  },
  radarPolygon: {
    type: String,
    default: ''
  },
  attributeHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-back', 'confirm-selection', 'route-selected'])

const ATTR_KEYS = ['career', 'finance', 'relationship', 'health', 'growth']

const waveGeometry = computed(() => {
  const records = props.attributeHistory || []
  const w = 280
  const h = 100
  const padX = 12
  const padY = 10
  const innerH = h - padY * 2
  if (!records.length) {
    const y = h / 2
    const line = `M${padX},${y} L${w - padX},${y}`
    return {
      line,
      area: `${line} L${w - padX},${h - padY} L${padX},${h - padY} Z`
    }
  }
  const xStep = records.length > 1 ? (w - padX * 2) / (records.length - 1) : 0
  const pts = records.map((item, idx) => {
    let sum = 0
    ATTR_KEYS.forEach((k) => {
      sum += Math.max(0, Math.min(100, Number(item[k] ?? 0)))
    })
    const v = sum / ATTR_KEYS.length
    const x = padX + idx * xStep
    const y = padY + innerH - (v / 100) * innerH
    return { x, y }
  })
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const first = pts[0]
  const last = pts[pts.length - 1]
  const area = `${line} L${last.x.toFixed(1)},${(h - padY).toFixed(1)} L${first.x.toFixed(1)},${(h - padY).toFixed(1)} Z`
  return { line, area }
})

const compositeTrendPath = computed(() => waveGeometry.value.line)
const waveAreaPath = computed(() => waveGeometry.value.area)

const salaryBands = [
  { role: '算法 / 工程', band: '35–80k / 月' },
  { role: '产品 / 运营', band: '25–55k / 月' },
  { role: '设计 / 创意', band: '18–45k / 月' },
  { role: '公共服务', band: '12–28k / 月' }
]

const comparisonMode = ref('side-by-side')
const selectedRoutes = ref([])
const sliderPosition = ref(50)
let isDraggingSlider = false
const expandedRoute = ref(null)

watch(() => props.routes, (newRoutes) => {
  if (newRoutes && newRoutes.length >= 2) {
    selectedRoutes.value = [newRoutes[0], newRoutes[1]]
  } else if (newRoutes && newRoutes.length === 1) {
    selectedRoutes.value = [newRoutes[0]]
  }
}, { immediate: true, deep: true })

const expandRoute = (route) => {
  if (route) {
    expandedRoute.value = route
  }
}

const closeExpanded = () => {
  expandedRoute.value = null
}

const attributeLabels = {
  career: '职业发展',
  finance: '财务状况',
  relationship: '人际关系',
  health: '健康状态',
  growth: '个人成长'
}

const getTagColor = (tag) => {
  const colors = {
    'AI科技': 'tag-ai',
    '创业': 'tag-startup',
    '体制': 'tag-system',
    '艺术': 'tag-art',
    '自由职业': 'tag-freelance'
  }
  return colors[tag] || 'tag-default'
}

const getRouteImpacts = (route) => {
  if (!route) return {}
  if (route.impacts) return route.impacts
  return {
    career: route.feasibility || 0,
    finance: (route.feasibility * 0.8) || 0,
    relationship: 50,
    health: 60,
    growth: (route.feasibility * 0.9) || 0
  }
}

const mentorTip = ref('当前的最优选择是平衡职业发展与个人成长的道路')

const socialData = [
  {
    id: 1,
    category: '行业',
    text: '2025年AI行业增速预计20.3%，投融资超6000亿'
  },
  {
    id: 2,
    category: '政策',
    text: '国家发布《十四五数字经济发展规划》支持新兴产业'
  },
  {
    id: 3,
    category: '数据',
    text: '互联网行业平均薪资同比增长22.3%'
  }
]

const policyData = [
  {
    id: 1,
    title: '教育支持政策',
    description: '国家继续教育计划支持职业技能提升',
    date: '2025年1月'
  },
  {
    id: 2,
    title: '创业扶持政策',
    description: '创新创业基金增加到100亿元规模',
    date: '2025年1月'
  }
]

const getAttributeClass = (value) => {
  if (value >= 80) return 'high'
  if (value >= 60) return 'medium'
  return 'low'
}

const getDifficultyClass = (difficulty) => {
  const map = { '低': 'easy', '中等': 'medium', '高': 'hard' }
  return map[difficulty] || 'medium'
}

const getScoreDifference = () => {
  if (selectedRoutes.value.length < 2) return 0
  const score1 = selectedRoutes.value[0].feasibility || 0
  const score2 = selectedRoutes.value[1].feasibility || 0
  return score1 - score2
}

const swapRoutes = () => {
  if (selectedRoutes.value.length >= 2) {
    const temp = selectedRoutes.value[0]
    selectedRoutes.value[0] = selectedRoutes.value[1]
    selectedRoutes.value[1] = temp
  }
}

const replaceRoute = (slot, route) => {
  selectedRoutes.value[slot] = route
}

const addRouteToComparison = (route) => {
  if (selectedRoutes.value.length < 2) {
    selectedRoutes.value.push(route)
  } else {
    selectedRoutes.value[1] = route
  }
}

const selectRoute = (route) => {
  emit('route-selected', route)
}

const startSliderDrag = (e) => {
  isDraggingSlider = true
  document.addEventListener('mousemove', handleSliderMove)
  document.addEventListener('mouseup', endSliderDrag)
}

const handleSliderMove = (e) => {
  if (!isDraggingSlider) return
  const container = document.querySelector('.slider-container')
  if (!container) return
  const rect = container.getBoundingClientRect()
  const pos = ((e.clientX - rect.left) / rect.width) * 100
  sliderPosition.value = Math.max(0, Math.min(100, pos))
}

const endSliderDrag = () => {
  isDraggingSlider = false
  document.removeEventListener('mousemove', handleSliderMove)
  document.removeEventListener('mouseup', endSliderDrag)
}
</script>

<style scoped>
.comparison-view {
  min-height: 100vh;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.comparison-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 32px;
  position: relative;
  z-index: 1;
}

.light-beam {
  position: fixed;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
    270deg,
    transparent,
    rgba(125, 211, 252, 0.18),
    rgba(232, 200, 114, 0.22),
    rgba(184, 140, 60, 0.12),
    transparent
  );
  animation: beam-flow 12s linear infinite;
  opacity: 0.45;
}

.beam-1 { animation-delay: 0s; top: 5%; }
.beam-2 { animation-delay: -4s; top: 35%; opacity: 0.25; }
.beam-3 { animation-delay: -8s; top: 65%; opacity: 0.15; }

@keyframes beam-flow {
  0% { transform: translateX(-50%) skewX(-15deg); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: translateX(50%) skewX(-15deg); opacity: 0; }
}

.beam-accent {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(50px);
  opacity: 0.35;
}

.beam-accent.top-left {
  top: -30px;
  left: -30px;
  background: radial-gradient(circle, rgba(125, 211, 252, 0.55) 0%, transparent 70%);
}

.beam-accent.top-right {
  top: -30px;
  right: -30px;
  background: radial-gradient(circle, rgba(232, 200, 114, 0.45) 0%, transparent 70%);
}

.beam-accent.bottom-left {
  bottom: -30px;
  left: -30px;
  background: radial-gradient(circle, rgba(184, 140, 60, 0.35) 0%, transparent 70%);
}

.beam-accent.bottom-right {
  bottom: -30px;
  right: -30px;
  background: radial-gradient(circle, rgba(244, 114, 182, 0.28) 0%, transparent 70%);
}

.radar-hero {
  padding: 18px 20px 14px;
  margin-bottom: 20px;
  border-radius: 20px;
}

.radar-hero-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.radar-hero-head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.06em;
}

.radar-pill {
  font-size: 0.68rem;
  font-weight: 600;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 244, 214, 0.55);
  border: 1px solid rgba(125, 211, 252, 0.45);
}

.radar-hero-body {
  display: flex;
  justify-content: center;
}

.radar-mini-svg {
  width: min(100%, 220px);
  height: auto;
  filter: drop-shadow(0 8px 24px rgba(232, 200, 114, 0.2));
}

.radar-lbl {
  font-size: 9px;
  fill: var(--color-text-secondary);
  font-weight: 600;
}

.radar-shape-mini {
  filter: drop-shadow(0 0 12px rgba(232, 200, 114, 0.35));
}

.comparison-main {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 24px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comparison-area {
  min-height: 600px;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.comparison-title {
  font-size: 1.6rem;
  color: var(--color-accent-gold);
}

.comparison-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn.btn-small {
  padding: 8px 16px;
  font-size: 0.85rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.btn-small:hover,
.btn.btn-small.active {
  background: rgba(125, 211, 252, 0.25);
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
  box-shadow: 0 0 15px rgba(125, 211, 252, 0.2);
}

.route-selector {
  padding: 20px;
  margin-bottom: 24px;
}

.selector-header {
  margin-bottom: 16px;
}

.route-selector h4 {
  color: var(--color-accent-gold);
  font-size: 1rem;
}

.selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.route-option {
  width: 100%;
}

.route-btn {
  width: 100%;
  padding: 12px;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.route-btn:hover {
  background: rgba(125, 211, 252, 0.15);
  border-color: rgba(125, 211, 252, 0.5);
  transform: translateY(-2px);
}

.route-btn.selected {
  background: rgba(125, 211, 252, 0.3);
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
  box-shadow: 0 0 20px rgba(125, 211, 252, 0.3);
}

.route-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.route-feasibility {
  font-size: 0.75rem;
  opacity: 0.7;
}

.comparison-content {
  margin-bottom: 24px;
}

.side-by-side {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 20px;
}

.vs-pillar {
  flex: 0 0 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.vs-orb {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #f8fafc;
  background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.95), rgba(255, 244, 214, 0.5) 45%, rgba(232, 200, 114, 0.55) 100%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 0 0 1px rgba(125, 211, 252, 0.55),
    0 12px 40px rgba(139, 105, 20, 0.35),
    0 0 28px rgba(184, 140, 60, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  animation: vs-pulse 3.2s ease-in-out infinite, vs-glint 1.6s ease-in-out infinite;
}

@keyframes vs-glint {
  0%,
  100% {
    filter: brightness(1) drop-shadow(0 0 8px rgba(232, 200, 114, 0.4));
  }
  50% {
    filter: brightness(1.12) drop-shadow(0 0 22px rgba(184, 140, 60, 0.55));
  }
}

@keyframes vs-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow:
      0 0 0 1px rgba(125, 211, 252, 0.45),
      0 10px 32px rgba(139, 105, 20, 0.28),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
  50% {
    transform: scale(1.06);
    box-shadow:
      0 0 0 2px rgba(184, 140, 60, 0.45),
      0 18px 48px rgba(232, 200, 114, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }
}

.left-window,
.right-window {
  flex: 1;
  min-width: 0;
}

.left-window .route-card,
.right-window .route-card {
  cursor: pointer;
}

.expand-hint {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.7rem;
  color: #0369a1;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: rgba(255, 255, 255, 0.92);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(125, 211, 252, 0.45);
}

.route-card:hover .expand-hint {
  opacity: 1;
}

.route-window {
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
}

.left-window { animation-delay: 0s; }
.right-window { animation-delay: 0.15s; }

.route-visual {
  position: relative;
  height: 118px;
  border-radius: 16px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 12px 32px rgba(15, 76, 129, 0.08);
}

.route-visual--tech {
  background:
    radial-gradient(ellipse 80% 80% at 20% 20%, rgba(232, 200, 114, 0.45), transparent 55%),
    radial-gradient(ellipse 60% 60% at 90% 80%, rgba(201, 162, 78, 0.35), transparent 50%),
    linear-gradient(145deg, #0c4a6e 0%, #0369a1 40%, #c9a24e 100%);
}

.route-visual--art {
  background:
    radial-gradient(ellipse 70% 70% at 80% 15%, rgba(244, 114, 182, 0.35), transparent 55%),
    radial-gradient(ellipse 50% 50% at 10% 90%, rgba(184, 140, 60, 0.4), transparent 50%),
    linear-gradient(145deg, #5c4010 0%, #8b6914 45%, #b8860b 100%);
}

.route-visual-orbit {
  position: absolute;
  inset: -40%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  animation: orbit-glow 5s ease-in-out infinite;
}

.route-visual--art .route-visual-orbit {
  animation-duration: 6.5s;
}

@keyframes orbit-glow {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.75;
  }
}

.route-visual-glyph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 2.2rem;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 0 24px rgba(255, 244, 214, 0.8);
}

.route-scene-caption {
  margin: 0 0 12px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-accent-gold);
  text-transform: none;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.route-card {
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.route-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(232, 200, 114, 0.12) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.route-glow--art {
  background: radial-gradient(circle at center, rgba(184, 140, 60, 0.14) 0%, transparent 50%);
}

.route-card:hover .route-glow {
  opacity: 1;
}

.route-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-6px);
  box-shadow: var(--glass-shadow-glow);
}

.route-type {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 14px;
  background: rgba(125, 211, 252, 0.2);
  color: var(--color-accent-gold);
}

.route-title {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: var(--color-accent-gold-light);
}

.route-description {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 0.95rem;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  min-width: 60px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.metric-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.metric-bar.large {
  height: 12px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #e8c872, #fff4d6, #b8860b);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.metric-value {
  min-width: 40px;
  text-align: right;
  font-weight: 600;
  color: var(--color-accent-gold);
}

.metric-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.metric-badge.easy {
  background: rgba(201, 162, 78, 0.2);
  color: #8b6914;
}

.metric-badge.medium {
  background: rgba(184, 140, 60, 0.2);
  color: #b8860b;
}

.metric-badge.hard {
  background: rgba(79, 70, 229, 0.2);
  color: #4f46e5;
}

.metric-badge.benefit {
  background: rgba(139, 105, 20, 0.2);
  color: #8b6914;
}

.metric-badge.large {
  padding: 8px 16px;
  font-size: 1rem;
}

.attribute-impact {
  margin-bottom: 20px;
}

.attribute-impact h4 {
  font-size: 0.95rem;
  color: var(--color-accent-gold);
  margin-bottom: 12px;
}

.impact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.impact-tag {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.impact-tag.positive {
  background: rgba(201, 162, 78, 0.15);
  color: #8b6914;
}

.impact-tag.negative {
  background: rgba(79, 70, 229, 0.15);
  color: #4f46e5;
}

.impact-tag.large {
  padding: 10px 18px;
  font-size: 1rem;
}

.slider-mode {
  margin-bottom: 24px;
}

.slider-container {
  padding: 0;
  overflow: hidden;
}

.slider-content {
  position: relative;
  height: 300px;
  display: flex;
}

.slider-left,
.slider-right {
  position: absolute;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.slider-left {
  left: 0;
  border-right: 2px solid var(--color-accent-gold);
}

.slider-right {
  right: 0;
}

.slider-left .route-card,
.slider-right .route-card {
  height: 100%;
  margin: 0;
  border-radius: 0;
}

.slider-handle {
  position: absolute;
  top: 0;
  width: 40px;
  height: 100%;
  background: rgba(125, 211, 252, 0.3);
  backdrop-filter: blur(10px);
  cursor: ew-resize;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.slider-arrow {
  font-size: 24px;
  color: var(--color-accent-gold);
}

.slider-input {
  width: 100%;
  height: 8px;
  margin-top: 16px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8b6914, #e8c872, #b8860b);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(125, 211, 252, 0.5);
}

.slider-input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8b6914, #e8c872, #b8860b);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 15px rgba(125, 211, 252, 0.5);
}

.blend-mode {
  margin-bottom: 24px;
}

.blend-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.blend-layer {
  position: relative;
}

.comparison-analysis {
  padding: 24px;
}

.analysis-header {
  margin-bottom: 20px;
}

.analysis-header h4 {
  font-size: 1.1rem;
  color: var(--color-accent-gold);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.analysis-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.62);
  border-radius: 12px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  backdrop-filter: blur(10px);
}

.analysis-label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.analysis-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-accent-gold);
}

.analysis-value.positive {
  color: #8b6914;
}

.analysis-value.negative {
  color: #4f46e5;
}

.social-dynamics,
.policy-info {
  padding: 20px;
}

.panel-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.live-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0369a1;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(224, 242, 254, 0.85);
  border: 1px solid rgba(125, 211, 252, 0.45);
}

.live-dot::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8b6914;
  box-shadow: 0 0 10px #8b6914;
  animation: live-pulse 1.2s ease-in-out infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(0.85);
  }
}

.wave-panel,
.salary-panel {
  padding: 18px;
}

.wave-svg {
  width: 100%;
  height: 72px;
  display: block;
}

.wave-caption {
  margin: 8px 0 0;
  font-size: 0.68rem;
  color: var(--color-text-muted);
}

.salary-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.salary-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 244, 214, 0.45);
  font-size: 0.78rem;
}

.salary-role {
  font-weight: 600;
  color: var(--color-text-primary);
}

.salary-band {
  font-weight: 700;
  color: var(--color-accent-gold-dark);
  white-space: nowrap;
}

.panel-title {
  font-size: 1rem;
  color: var(--color-accent-gold);
}

.social-item {
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.65);
}

.social-item:last-child {
  margin-bottom: 0;
}

.social-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.social-tag.行业 {
  background: rgba(139, 105, 20, 0.2);
  color: #8b6914;
}

.social-tag.政策 {
  background: rgba(184, 140, 60, 0.2);
  color: #b8860b;
}

.social-tag.数据 {
  background: rgba(196, 181, 253, 0.25);
  color: #8b6914;
}

.social-text {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.policy-item {
  padding: 14px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.65);
}

.policy-item:last-child {
  margin-bottom: 0;
}

.policy-title {
  font-size: 0.95rem;
  color: var(--color-accent-gold-light);
  margin-bottom: 6px;
}

.policy-text {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.policy-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.comparison-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 24px;
}

.expanded-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 58, 95, 0.42);
  backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.expanded-content {
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 40px;
  position: relative;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.expanded-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(125, 211, 252, 0.2);
  color: var(--color-accent-gold);
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.expanded-close:hover {
  background: rgba(125, 211, 252, 0.4);
  transform: rotate(90deg);
}

.expanded-header {
  text-align: center;
  margin-bottom: 32px;
}

.expanded-title {
  font-size: 2rem;
  color: var(--color-accent-gold);
  margin: 16px 0;
}

.expanded-description {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  line-height: 1.8;
}

.expanded-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.expanded-metric {
  display: flex;
  align-items: center;
  gap: 16px;
}

.expanded-metric .metric-label {
  min-width: 80px;
  font-weight: 600;
}

.expanded-impacts {
  margin-bottom: 32px;
}

.expanded-impacts h4 {
  color: var(--color-accent-gold);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.expanded-impacts .impact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 1200px) {
  .comparison-main {
    grid-template-columns: 250px 1fr 250px;
  }
}

@media (max-width: 1024px) {
  .comparison-main {
    grid-template-columns: 1fr;
  }

  .left-sidebar,
  .right-sidebar {
    order: 2;
  }

  .comparison-area {
    order: 1;
  }

  .right-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .social-dynamics,
  .policy-info,
  .wave-panel,
  .salary-panel {
    flex: 1;
    min-width: 280px;
  }
}

@media (max-width: 900px) {
  .side-by-side {
    flex-direction: column;
  }

  .vs-pillar {
    flex: 0 0 auto;
    padding: 4px 0 12px;
  }

  .vs-orb {
    width: 48px;
    height: 48px;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .comparison-view {
    padding: 12px;
  }

  .comparison-container {
    padding: 16px;
  }

  .comparison-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .blend-mode .blend-container {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .comparison-footer {
    flex-direction: column;
  }

  .comparison-footer .btn {
    width: 100%;
  }
}

/* 琉璃蓝主题覆盖：对比页局部统一 */
.comparison-view .route-type,
.comparison-view .route-btn.selected,
.comparison-view .btn.btn-small.active,
.comparison-view .analysis-header h4,
.comparison-view .panel-title {
  color: #0369a1 !important;
}

.comparison-view .route-btn:hover,
.comparison-view .route-btn.selected,
.comparison-view .analysis-item,
.comparison-view .social-item,
.comparison-view .policy-item,
.comparison-view .wave-panel,
.comparison-view .salary-panel {
  border-color: rgba(125, 211, 252, 0.42) !important;
}

.comparison-view .route-type {
  background: rgba(232, 200, 114, 0.2) !important;
}

.comparison-view .social-tag.政策,
.comparison-view .metric-badge.medium {
  background: rgba(96, 165, 250, 0.2) !important;
  color: #3b82f6 !important;
}
</style>