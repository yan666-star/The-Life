<template>
  <section class="command-center-view">
    <div class="cc-noise" aria-hidden="true"></div>
    <div v-if="booting" class="boot-sequence" aria-live="polite">
      <strong>BOOT SEQUENCE</strong>
      <span>LOADING SUBJECT PROFILE</span>
      <span>SYNCING REALITY DATA STREAM</span>
      <span>INITIALIZING LIFE CORE</span>
    </div>

    <header class="cc-topbar">
      <div class="cc-brand fui-cut">
        <strong>LIFE-OS</strong>
        <span>PARALLEL<br>DECISION SYSTEM</span>
      </div>
      <nav class="cc-tabs fui-cut" aria-label="系统模块">
        <button
          v-for="item in quickNav"
          :key="item.id"
          :class="{ active: item.id === 'genesis' }"
          @click="$emit('navigate', item.id)"
        >
          {{ item.label }}
        </button>
      </nav>
      <div class="cc-clock fui-cut">
        <span>SIMULATION READY</span>
        <strong>{{ clockText }}</strong>
        <i aria-hidden="true"></i>
      </div>
    </header>

    <div class="cc-grid">
      <aside class="cc-stack">
        <article class="fui-card cc-subject-card">
          <h2>SUBJECT PROFILE</h2>
          <div class="cc-data-row"><span>AGE</span><b>{{ userInfo.age || '--' }}</b></div>
          <div class="cc-data-row"><span>CITY</span><b>{{ userInfo.city || '--' }}</b></div>
          <div class="cc-data-row"><span>ROLE</span><b>{{ userInfo.occupation || '--' }}</b></div>
          <div class="cc-data-row"><span>INCOME</span><b>{{ userInfo.income || '--' }}</b></div>
          <div class="cc-data-row"><span>FAMILY</span><b>{{ userInfo.family || '--' }}</b></div>
          <div class="cc-data-row"><span>SKILL HASH</span><b>{{ skillHash }}</b></div>
        </article>

        <article class="fui-card">
          <h2>MODEL STATUS</h2>
          <div class="cc-meter" v-for="metric in modelMetrics" :key="metric.label">
            <span>{{ metric.label }}</span>
            <i><b :style="{ width: metric.value + '%' }"></b></i>
            <strong>{{ metric.value }}%</strong>
          </div>
          <footer class="cc-card-footer"><span>MODEL NORMAL</span><em></em></footer>
        </article>

        <article class="fui-card cc-log">
          <h2>NOTIFICATIONS</h2>
          <p>AI ROUTES GENERATED: {{ routeCount }}</p>
          <p>REALITY DATA SYNCED: MONTHLY FEED</p>
          <p>NODE MUTATION WATCH: {{ nodeCount }} ONLINE</p>
          <p>NEXT DIVERGENCE DETECTED</p>
        </article>
      </aside>

      <main
        class="cc-core"
        @click="handleCoreClick"
        @pointerdown="startDrag"
        @pointermove="dragCore"
        @pointerup="endDrag"
        @pointercancel="endDrag"
      >
        <div class="cc-core-label">
          <h1>LIFE CORE</h1>
          <p>SUBJECT ID: USER_01 / DECISION GRAPH ACTIVE</p>
        </div>
        <div class="cc-coords">
          <span>TIMELINE AXIS</span>
          <strong>AGE {{ userInfo.age || '--' }} / YEAR {{ timelineYear }}</strong>
          <strong>DEPTH {{ selectedDepth }} / RISK {{ riskVector }}°</strong>
        </div>
        <div class="cc-readout cc-readout-left">
          <span>02</span>
          <b>TARGET</b>
          <strong>NEXT DIVERGENCE DETECTED</strong>
        </div>
        <div class="cc-readout cc-readout-right">
          <b>ARCHIVE DISTANCE</b>
          <strong>{{ nodeCount * 128 }} SIM-UNITS</strong>
        </div>
        <div class="life-orbital">
          <div class="life-starfield"></div>
          <div class="life-ring ring-a"></div>
          <div class="life-ring ring-b"></div>
          <div class="life-ring ring-c"></div>
          <div class="life-tick-ring"></div>
          <div class="life-core" :class="{ dragging }">
            <canvas ref="earthCanvas" class="life-earth-canvas" width="720" height="720" aria-hidden="true"></canvas>
            <span
              v-for="n in 18"
              :key="n"
              :style="nodeStyle(n)"
              class="life-node"
              :title="nodeHint(n)"
            ></span>
            <span class="life-scan"></span>
          </div>
          <div class="life-crosshair"></div>
        </div>
        <div class="cc-dots" aria-hidden="true">
          <i></i><i></i><i class="active"></i><i></i><i></i>
        </div>
        <div class="cc-core-hint">DRAG CORE TO SHIFT TIMELINE / CLICK TO START GENESIS SCAN</div>
      </main>

      <aside class="cc-stack">
        <article class="fui-card cc-analytics-card">
          <h2>ATTRIBUTE ANALYTICS</h2>
          <div class="cc-chart" aria-hidden="true">
            <svg viewBox="0 0 300 110" preserveAspectRatio="none">
              <path class="cc-chart-fill" d="M0,92 L0,74 12,78 24,52 36,64 48,38 60,68 72,49 84,56 96,36 108,43 120,29 132,54 144,40 156,60 168,48 180,64 192,46 204,68 216,50 228,56 240,42 252,64 264,53 276,70 288,48 300,60 L300,92 Z"/>
              <path class="cc-chart-line" d="M0,74 L12,78 L24,52 L36,64 L48,38 L60,68 L72,49 L84,56 L96,36 L108,43 L120,29 L132,54 L144,40 L156,60 L168,48 L180,64 L192,46 L204,68 L216,50 L228,56 L240,42 L252,64 L264,53 L276,70 L288,48 L300,60"/>
            </svg>
          </div>
          <div class="cc-analytics-bottom">
            <div class="cc-donut" :style="{ '--p': averageAttribute }">
              <span>{{ averageAttribute }}%</span>
              <small>LIFE LOAD</small>
            </div>
            <div>
          <div class="cc-attribute" v-for="item in attributeRows" :key="item.key">
            <span>{{ item.label }}</span>
            <i><b :style="{ width: item.value + '%' }"></b></i>
            <strong>{{ item.value }}</strong>
          </div>
            </div>
          </div>
        </article>

        <article class="fui-card cc-stream">
          <h2>REALITY DATA STREAM <span>LIVE</span></h2>
          <div class="stream-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <div class="cc-data-row"><span>POLICY SYNC</span><b>MONTHLY</b></div>
          <div class="cc-data-row"><span>MARKET FEED</span><b>ONLINE</b></div>
        </article>

        <article class="fui-card cc-quick-card">
          <h2>QUICK START</h2>
          <div class="cc-quick">
            <button @click="$emit('navigate', 'genesis')">
              <span>01</span>START GENESIS / 入局
            </button>
          </div>
        </article>
      </aside>
    </div>

    <footer class="cc-bottombar">
      <div><span>MODE</span><strong>SIMULATION</strong></div>
      <div><span>OPERATOR</span><strong>USER_01</strong></div>
      <div><span>UPTIME</span><strong>256d 14h</strong></div>
      <div><span>SYSTEM ID</span><strong>LIFE-FUI-01</strong></div>
      <div class="cc-signal"><span>SIGNAL</span><i></i><i></i><i></i><i></i><i></i></div>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  userInfo: { type: Object, required: true },
  attributes: { type: Object, required: true },
  nodeCount: { type: Number, required: true },
  leafCount: { type: Number, required: true },
  selectedDepth: { type: Number, required: true },
  routeCount: { type: Number, required: true }
})

const emit = defineEmits(['navigate'])

const now = ref(new Date())
const booting = ref(true)
const dragging = ref(false)
const dragMoved = ref(false)
const coreYaw = ref(0)
const corePitch = ref(0)
const lastPoint = ref({ x: 0, y: 0 })
const earthCanvas = ref(null)
let timer = null
let earthAnimation = null
let earthDots = []

const quickNav = [
  { id: 'genesis', label: 'GENESIS', name: '入局', code: '01' },
  { id: 'destiny', label: 'DESTINY', name: '命轨', code: '02' },
  { id: 'divergence', label: 'DIVERGENCE', name: '衍化', code: '03' },
  { id: 'mentorship', label: 'MENTOR', name: '论道', code: '06' }
]

const modelMetrics = computed(() => [
  { label: 'RISK VECTOR', value: props.userInfo.riskPreference ? 78 : 35 },
  { label: 'STRESS LOAD', value: props.userInfo.stressResistance ? 66 : 30 },
  { label: 'GOAL MATRIX', value: props.userInfo.lifeGoals ? 92 : 40 },
  { label: 'PROFILE SYNC', value: props.userInfo.skills ? 88 : 45 }
])

const attributeRows = computed(() => [
  { key: 'career', label: 'CAREER', value: props.attributes.career || 0 },
  { key: 'finance', label: 'FINANCE', value: props.attributes.finance || 0 },
  { key: 'relationship', label: 'RELATION', value: props.attributes.relationship || 0 },
  { key: 'health', label: 'HEALTH', value: props.attributes.health || 0 },
  { key: 'growth', label: 'GROWTH', value: props.attributes.growth || 0 }
])

const averageAttribute = computed(() => {
  const values = attributeRows.value.map((item) => Number(item.value) || 0)
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
})

const skillHash = computed(() => {
  const raw = String(props.userInfo.skills || 'PENDING')
  const hash = Array.from(raw).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return `SK-${String(hash % 9999).padStart(4, '0')}`
})

const clockText = computed(() => {
  const h = String(now.value.getHours()).padStart(2, '0')
  const m = String(now.value.getMinutes()).padStart(2, '0')
  const s = String(now.value.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
})

const timelineYear = computed(() => 2026 + Math.round(coreYaw.value / 18))
const riskVector = computed(() => Math.abs(Math.round(corePitch.value * 1.8 + coreYaw.value * 0.4)) % 100)
const nodeStyle = (index) => {
  const angle = (index / 18) * Math.PI * 2 + coreYaw.value * 0.01
  const radius = 32 + (index % 4) * 11
  const x = 50 + Math.cos(angle) * radius
  const y = 50 + Math.sin(angle) * (radius * 0.72) + corePitch.value * 0.12
  return { left: `${x}%`, top: `${y}%`, animationDelay: `${index * -0.18}s` }
}

const nodeHint = (index) => {
  if (index % 5 === 0) return 'HIGH REGRET RISK NODE'
  if (index % 3 === 0) return 'UNEXPLORED BRANCH'
  return 'SAVED PATH NODE'
}

const startDrag = (event) => {
  dragging.value = true
  dragMoved.value = false
  lastPoint.value = { x: event.clientX, y: event.clientY }
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

const dragCore = (event) => {
  if (!dragging.value) return
  const dx = event.clientX - lastPoint.value.x
  const dy = event.clientY - lastPoint.value.y
  if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved.value = true
  coreYaw.value += dx * 0.25
  corePitch.value = Math.max(-32, Math.min(32, corePitch.value - dy * 0.18))
  lastPoint.value = { x: event.clientX, y: event.clientY }
}

const endDrag = (event) => {
  dragging.value = false
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}

const handleCoreClick = () => {
  if (dragMoved.value) return
  emit('navigate', 'genesis')
}

const toRadians = (deg) => (deg * Math.PI) / 180

const normalizeVec = ([x, y, z]) => {
  const len = Math.hypot(x, y, z) || 1
  return [x / len, y / len, z / len]
}

const spherePoint = (lat, lon) => {
  const latR = toRadians(lat)
  const lonR = toRadians(lon)
  const cosLat = Math.cos(latR)
  return [cosLat * Math.cos(lonR), Math.sin(latR), cosLat * Math.sin(lonR)]
}

const landScore = (lat, lon) => {
  const la = toRadians(lat)
  const lo = toRadians(lon)
  return (
    Math.sin(lo * 1.7 + la * 1.2) * 0.42 +
    Math.sin(lo * 3.1 - la * 0.9) * 0.26 +
    Math.cos(lo * 2.4 + la * 2.9) * 0.24 +
    Math.sin((lo + la) * 5.3) * 0.12
  )
}

const buildEarthDots = () => {
  earthDots = []
  for (let lat = -72; lat <= 72; lat += 2) {
    for (let lon = -180; lon < 180; lon += 2) {
      if (landScore(lat, lon) > 0.34) {
        earthDots.push(spherePoint(lat, lon))
      }
    }
  }
}

const initEarthCanvas = () => {
  const canvas = earthCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const light = normalizeVec([-0.52, 0.24, 0.82])
  const haze = normalizeVec([0.22, -0.15, 0.96])
  let size = 0
  let center = 0
  let radius = 0
  let autoYaw = 0

  const resize = () => {
    const nextSize = canvas.clientWidth || 420
    const dpr = window.devicePixelRatio || 1
    size = nextSize
    center = size / 2
    radius = size * 0.475
    canvas.width = Math.floor(size * dpr)
    canvas.height = Math.floor(size * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const rotatePoint = (x, y, z) => {
    const yaw = toRadians(coreYaw.value * 0.55) + autoYaw
    const pitch = toRadians(corePitch.value * 0.7 + 18)
    const cy = Math.cos(yaw)
    const sy = Math.sin(yaw)
    const cp = Math.cos(pitch)
    const sp = Math.sin(pitch)
    const x1 = x * cy - z * sy
    const z1 = x * sy + z * cy
    const y2 = y * cp - z1 * sp
    const z2 = y * sp + z1 * cp
    return [x1, y2, z2]
  }

  const drawBase = () => {
    const grad = ctx.createRadialGradient(center - radius * 0.32, center - radius * 0.36, radius * 0.12, center, center, radius * 1.02)
    grad.addColorStop(0, 'rgba(246,250,255,.94)')
    grad.addColorStop(0.11, 'rgba(134,145,153,.9)')
    grad.addColorStop(0.45, 'rgba(39,43,46,.96)')
    grad.addColorStop(1, 'rgba(8,10,11,1)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.fill()

    const shade = ctx.createLinearGradient(center - radius * 0.8, center - radius * 0.18, center + radius * 0.8, center + radius * 0.3)
    shade.addColorStop(0, 'rgba(255,255,255,.02)')
    shade.addColorStop(0.62, 'rgba(0,0,0,.05)')
    shade.addColorStop(1, 'rgba(0,0,0,.78)')
    ctx.fillStyle = shade
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawGrid = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.clip()

    ctx.lineWidth = 1
    for (let lat = -70; lat <= 70; lat += 10) {
      ctx.strokeStyle = lat === 0 ? 'rgba(255,255,255,.34)' : 'rgba(236,246,255,.22)'
      ctx.beginPath()
      let started = false
      for (let lon = -180; lon <= 180; lon += 3) {
        const rotated = rotatePoint(...spherePoint(lat, lon))
        if (rotated[2] <= 0) {
          started = false
          continue
        }
        const px = center + rotated[0] * radius
        const py = center - rotated[1] * radius
        if (!started) {
          ctx.moveTo(px, py)
          started = true
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()
    }

    for (let lon = -180; lon < 180; lon += 12) {
      ctx.strokeStyle = lon % 60 === 0 ? 'rgba(255,255,255,.28)' : 'rgba(236,246,255,.16)'
      ctx.beginPath()
      let started = false
      for (let lat = -89; lat <= 89; lat += 2) {
        const rotated = rotatePoint(...spherePoint(lat, lon))
        if (rotated[2] <= 0) {
          started = false
          continue
        }
        const px = center + rotated[0] * radius
        const py = center - rotated[1] * radius
        if (!started) {
          ctx.moveTo(px, py)
          started = true
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  const drawLand = () => {
    ctx.save()
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.clip()
    for (const dot of earthDots) {
      const rotated = rotatePoint(dot[0], dot[1], dot[2])
      if (rotated[2] <= 0) continue
      const px = center + rotated[0] * radius
      const py = center - rotated[1] * radius
      const lit = Math.max(0, Math.min(1, rotated[0] * light[0] + rotated[1] * light[1] + rotated[2] * light[2]))
      const hazeDot = Math.max(0, Math.min(1, rotated[0] * haze[0] + rotated[1] * haze[1] + rotated[2] * haze[2]))
      const alpha = 0.1 + lit * 0.42 + hazeDot * 0.14
      const sz = 0.8 + lit * 1.5
      ctx.fillStyle = `rgba(235,245,255,${alpha.toFixed(3)})`
      ctx.fillRect(px, py, sz, sz)
    }
    ctx.restore()
  }

  const drawAtmosphere = () => {
    ctx.strokeStyle = 'rgba(242,250,255,.72)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.stroke()

    const glow = ctx.createRadialGradient(center, center, radius * 0.86, center, center, radius * 1.16)
    glow.addColorStop(0, 'rgba(255,255,255,0)')
    glow.addColorStop(0.75, 'rgba(225,240,255,.05)')
    glow.addColorStop(1, 'rgba(225,240,255,.24)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(center, center, radius * 1.12, 0, Math.PI * 2)
    ctx.fill()
  }

  const render = () => {
    autoYaw += 0.0012
    ctx.clearRect(0, 0, size, size)
    drawBase()
    drawGrid()
    drawLand()
    drawAtmosphere()
    earthAnimation = requestAnimationFrame(render)
  }

  buildEarthDots()
  resize()
  render()
  window.addEventListener('resize', resize)
  return () => {
    window.removeEventListener('resize', resize)
  }
}

onMounted(() => {
  const cleanupEarth = initEarthCanvas()
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
  window.setTimeout(() => {
    booting.value = false
  }, 1700)
  earthCanvas.valueCleanup = cleanupEarth
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
  if (earthAnimation) cancelAnimationFrame(earthAnimation)
  earthCanvas.valueCleanup?.()
})
</script>
