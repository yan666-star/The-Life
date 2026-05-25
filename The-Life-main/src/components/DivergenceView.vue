<template>
  <div class="divergence-view">
    <div class="light-beam beam-1"></div>
    <div class="light-beam beam-2"></div>
    <div class="light-beam beam-3"></div>

    <div class="divergence-container glass-container">
      <div class="beam-accent top-left"></div>
      <div class="beam-accent top-right"></div>

      <div class="divergence-header">
        <div>
          <h1 class="title">DIVERGENCE / 衍化路线数据包</h1>
          <p class="subtitle">ROUTE PACKET GENERATOR · AI / MANUAL BRANCH SIMULATION</p>
        </div>
        <button class="btn btn-secondary divergence-back-btn" @click="$emit('go-to-destiny')">
          返回命轨 / BACK TO DESTINY
        </button>
      </div>

      <div class="mode-switch">
        <span class="mode-label" :class="{ active: mode === 'ai' }">AI MODE</span>
        <div class="toggle" :class="{ active: mode === 'ai' }" @click="$emit('toggle-mode')">
          <div class="toggle-thumb"></div>
        </div>
        <span class="mode-label" :class="{ active: mode !== 'ai' }">MANUAL MODE</span>
      </div>

      <div class="agent-collab-panel glass-card">
        <h3>AI AGENT COLLABORATION</h3>
        <div class="agent-grid">
          <div v-for="agent in agentStages" :key="agent.code" class="agent-stage">
            <span>{{ agent.code }}</span>
            <strong>{{ agent.name }}</strong>
            <i :class="{ active: isGenerating }"></i>
          </div>
        </div>
      </div>

      <div class="routes-container" v-if="mode === 'ai'">
        <div class="route-card glass-card fade-in-up" v-for="(route, index) in aiRoutes" :key="index" :style="{ animationDelay: (index * 0.1) + 's' }">
          <div class="route-glow"></div>
          <div class="packet-code">ROUTE-PACKET {{ String(index + 1).padStart(2, '0') }}</div>
          <div class="route-header">
            <h3>{{ route.title }}</h3>
            <div class="route-tag" :class="route.tagColor">{{ route.tag }}</div>
          </div>
          <p class="route-description">{{ route.description }}</p>
          <div class="route-meta">
            <div class="meta-item">
              <span class="meta-label">FEASIBILITY</span>
              <div class="meta-bar">
                <div class="meta-fill" :style="{ width: route.feasibility + '%' }"></div>
              </div>
              <span class="meta-value">{{ route.feasibility }}%</span>
            </div>
            <div class="meta-tags">
              <span class="meta-tag difficulty">DIFFICULTY {{ route.difficulty }}</span>
              <span class="meta-tag benefit">BENEFIT {{ route.benefit }}</span>
              <span class="meta-tag">REGRET {{ regretRisk(route) }}%</span>
              <span class="meta-tag">REAL COST {{ route.requiredCapital || 'ESTIMATED' }}</span>
            </div>
          </div>
          <div class="route-impact-grid">
            <span v-for="(impact, key) in routeImpact(route)" :key="key" :class="{ negative: impact < 0 }">
              {{ key }} {{ impact > 0 ? '+' : '' }}{{ impact }}
            </span>
          </div>
          <div class="route-actions">
            <button class="btn btn-secondary small" @click="$emit('refine-route', index)">REFINE</button>
            <button class="btn btn-secondary small" @click="$emit('replace-route', index)">REPLACE</button>
            <button class="btn btn-secondary small" :class="{ selected: compareRoutes.includes(route) }" @click="$emit('toggle-compare', route)">{{ compareRoutes.includes(route) ? 'REMOVE COMPARE' : 'ADD COMPARE' }}</button>
            <button class="btn btn-primary small" @click="$emit('select-route', route)">SELECT</button>
          </div>
        </div>
        <button class="btn btn-primary generate-btn" @click="$emit('generate-ai-routes')" :disabled="isGenerating">
          <span class="btn-glow"></span>
          {{ isGenerating ? 'AGENTS RUNNING...' : 'REGENERATE ROUTES' }}
        </button>
      </div>

      <div class="custom-route" v-else>
        <div class="custom-route-header">
          <h3>MANUAL ROUTE PACKET</h3>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>ROUTE NAME</label>
            <input type="text" v-model="localCustom.title" class="input" placeholder="路线名称">
          </div>
          <div class="form-group">
            <label>FEASIBILITY</label>
            <input type="number" v-model="localCustom.feasibility" class="input" placeholder="0-100%">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>DIFFICULTY</label>
            <select v-model="localCustom.difficulty" class="input">
              <option value="">请选择</option>
              <option value="低">低</option>
              <option value="中等">中等</option>
              <option value="高">高</option>
            </select>
          </div>
          <div class="form-group">
            <label>BENEFIT</label>
            <select v-model="localCustom.benefit" class="input">
              <option value="">请选择</option>
              <option value="低">低</option>
              <option value="中等">中等</option>
              <option value="高">高</option>
              <option value="极高">极高</option>
            </select>
          </div>
        </div>
        <div class="form-group full-width">
          <label>ROUTE DESCRIPTION</label>
          <textarea v-model="localCustom.description" class="input" rows="3" placeholder="路线描述"></textarea>
        </div>
        <div class="form-group full-width">
          <label>UPLOAD PLANNING DOCUMENT</label>
          <input type="file" class="input" @change="$emit('file-upload', $event)">
        </div>
        <button class="btn btn-primary" @click="$emit('add-custom-route', localCustom)">ADD MANUAL PACKET</button>
        <div class="custom-route-list" v-if="customRoutes.length">
          <h4>我的路线</h4>
          <div class="custom-route-card glass-card" v-for="(route, index) in customRoutes" :key="route.id">
            <div class="custom-route-main">
              <div>
                <strong>{{ route.title }}</strong>
                <p>{{ route.description }}</p>
              </div>
              <div class="custom-route-meta">
                <span>可行性 {{ route.feasibility }}%</span>
                <span>难度 {{ route.difficulty }}</span>
                <span>收益 {{ route.benefit }}</span>
              </div>
            </div>
            <div class="custom-route-actions">
              <button class="btn btn-secondary small" @click="$emit('select-route', route)">选择</button>
              <button class="btn btn-secondary small" @click="$emit('remove-custom-route', index)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="multimedia-section glass-card" v-if="selectedRoute">
        <div class="multimedia-header">
          <h3>MULTIMODAL OUTPUT</h3>
        </div>
        <div class="multimedia-options">
          <button class="btn btn-secondary" @click="$emit('generate-comic')">COMIC</button>
          <button class="btn btn-secondary" @click="$emit('generate-video')">VIDEO</button>
          <button class="btn btn-secondary" @click="$emit('generate-poster')">POSTER</button>
        </div>
        <div class="style-selector">
          <label>风格选择</label>
          <select v-model="localStyle" class="input">
            <option value="治愈">治愈</option>
            <option value="写实">写实</option>
            <option value="科幻">科幻</option>
          </select>
        </div>
        <div class="media-gallery" v-if="generatedMedia.length">
          <div class="media-card glass-card" v-for="media in generatedMedia" :key="media.id">
            <div class="media-thumb" :class="media.type"></div>
            <div class="media-info">
              <strong>{{ media.title }}</strong>
              <p>{{ media.description }}</p>
              <span>{{ media.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="divergence-controls">
        <button class="btn btn-secondary" @click="$emit('go-to-destiny')">返回命轨 / BACK TO DESTINY</button>
        <button v-if="compareRoutes.length >= 2" class="btn btn-primary" @click="$emit('go-to-comparison')">
          <span class="btn-icon">⇄</span>OPEN PARALLEL VIEW
        </button>
        <button class="btn btn-primary" @click="$emit('go-to-reflection')">
          <span class="btn-icon">⌁</span>VIEW ATTRIBUTES
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
defineProps({
  aiRoutes: { type: Array, required: true },
  isGenerating: { type: Boolean, required: true },
  compareRoutes: { type: Array, required: true },
  customRoutes: { type: Array, required: true },
  selectedRoute: { type: Object, required: false },
  generatedMedia: { type: Array, required: true },
  mode: { type: String, required: true }
})

const emit = defineEmits(['generate-ai-routes','refine-route','replace-route','toggle-compare','select-route','add-custom-route','remove-custom-route','file-upload','generate-comic','generate-video','generate-poster','go-to-destiny','go-to-comparison','go-to-reflection','toggle-mode'])

const localCustom = reactive({ title: '', description: '', feasibility: '', difficulty: '', benefit: '' })
const localStyle = ref('治愈')
const agentStages = [
  { code: 'AGENT-01', name: '剧本架构师' },
  { code: 'AGENT-02', name: '数值精算师' },
  { code: 'AGENT-03', name: '扰动源模拟' },
  { code: 'AGENT-04', name: '现实数据检索' }
]

const routeImpact = (route) => route?.impacts || route?.impactFactors || {}
const regretRisk = (route) => {
  const feasibility = Number(route?.feasibility || 55)
  const impacts = Object.values(routeImpact(route)).map(Number).filter(Number.isFinite)
  const negative = impacts.filter((item) => item < 0).reduce((sum, item) => sum + Math.abs(item), 0)
  return Math.max(0, Math.min(99, Math.round(100 - feasibility + negative)))
}

watch(() => localCustom, (v) => {}, { deep: true })
</script>

<style scoped>
.divergence-view {
  min-height: 100vh;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.divergence-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
  position: relative;
}

.light-beam {
  position: fixed;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(270deg, transparent, rgba(232, 200, 114, 0.15), rgba(139, 105, 20, 0.25), rgba(184, 140, 60, 0.15), transparent);
  animation: beam-flow 10s linear infinite;
  opacity: 0.5;
}

.beam-1 { animation-delay: 0s; top: 10%; }
.beam-2 { animation-delay: -3.3s; top: 40%; opacity: 0.3; }
.beam-3 { animation-delay: -6.6s; top: 70%; opacity: 0.2; }

@keyframes beam-flow {
  0% { transform: translateX(-50%) skewX(-15deg); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateX(50%) skewX(-15deg); opacity: 0; }
}

.beam-accent {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(40px);
  opacity: 0.4;
}

.beam-accent.top-left {
  top: -20px;
  left: -20px;
  background: radial-gradient(circle, rgba(232, 200, 114, 0.6) 0%, transparent 70%);
}

.beam-accent.top-right {
  top: -20px;
  right: -20px;
  background: radial-gradient(circle, rgba(125, 211, 252, 0.6) 0%, transparent 70%);
}

.divergence-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  text-align: left;
  margin-bottom: 32px;
  position: relative;
}

.divergence-back-btn {
  flex-shrink: 0;
  margin-top: 8px;
}

.header-icon {
  margin-bottom: 16px;
  animation: float-gentle 4s ease-in-out infinite;
}

.divergence-header .title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff4d6, #e8c872, #b8860b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.divergence-header .subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  letter-spacing: 0.1em;
}

.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 16px 24px;
  background: var(--glass-bg);
  border-radius: 50px;
  border: 1px solid var(--glass-border);
}

.mode-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  transition: all 0.3s ease;
}

.mode-label.active {
  color: var(--color-accent-gold);
  font-weight: 600;
}

.toggle {
  width: 56px;
  height: 28px;
  background: rgba(232, 200, 114, 0.2);
  border-radius: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid var(--glass-border);
}

.toggle.active {
  background: rgba(232, 200, 114, 0.5);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #8b6914, #e8c872);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toggle.active .toggle-thumb {
  left: 31px;
}

.routes-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.route-card {
  padding: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  transition: all 0.4s ease;
}

.route-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-4px);
  box-shadow: var(--glass-shadow-glow);
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

.route-card:hover .route-glow {
  opacity: 1;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.route-header h3 {
  font-size: 1.3rem;
  color: var(--color-accent-gold-light);
}

.route-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(232, 200, 114, 0.2);
  color: var(--color-accent-gold);
}

.route-description {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
}

.route-meta {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-label {
  min-width: 56px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.meta-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.meta-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a24e, #e8c872);
  transition: width 0.6s ease;
  border-radius: 3px;
}

.meta-value {
  min-width: 40px;
  text-align: right;
  color: var(--color-accent-gold);
  font-weight: 600;
  font-size: 0.9rem;
}

.meta-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  background: rgba(232, 200, 114, 0.15);
  color: var(--color-text-secondary);
}

.meta-tag.difficulty {
  background: rgba(96, 165, 250, 0.15);
  color: #3b82f6;
}

.meta-tag.benefit {
  background: rgba(124, 58, 237, 0.15);
  color: #8b6914;
}

.route-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.route-actions .btn {
  flex: 1;
  min-width: 100px;
}

.route-actions .btn.selected {
  background: rgba(232, 200, 114, 0.3);
  border-color: var(--color-accent-gold);
}

.generate-btn {
  position: relative;
  overflow: hidden;
  margin-top: 16px;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s linear infinite;
}

.custom-route {
  margin-top: 24px;
  position: relative;
  z-index: 1;
}

.custom-route-header {
  margin-bottom: 20px;
}

.custom-route-header h3 {
  font-size: 1.4rem;
  color: var(--color-accent-gold);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.custom-route-list {
  margin-top: 24px;
}

.custom-route-list h4 {
  font-size: 1.1rem;
  color: var(--color-accent-gold);
  margin-bottom: 16px;
}

.custom-route-card {
  padding: 16px;
  margin-bottom: 12px;
}

.custom-route-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.custom-route-main strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.custom-route-main p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.custom-route-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.custom-route-actions {
  display: flex;
  gap: 8px;
}

.multimedia-section {
  margin-top: 32px;
  padding: 24px;
  position: relative;
  z-index: 1;
}

.multimedia-header {
  margin-bottom: 20px;
}

.multimedia-header h3 {
  font-size: 1.3rem;
  color: var(--color-accent-gold);
}

.multimedia-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.style-selector {
  margin-bottom: 20px;
}

.style-selector label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.media-card {
  padding: 12px;
}

.media-thumb {
  height: 100px;
  background: rgba(232, 200, 114, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
}

.media-thumb.comic { background: linear-gradient(135deg, rgba(232, 200, 114, 0.2), rgba(184, 140, 60, 0.2)); }
.media-thumb.video { background: linear-gradient(135deg, rgba(139, 105, 20, 0.2), rgba(184, 140, 60, 0.2)); }
.media-thumb.poster { background: linear-gradient(135deg, rgba(125, 211, 252, 0.22), rgba(184, 140, 60, 0.18)); }

.media-info strong {
  display: block;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.media-info p {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.media-info span {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.divergence-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
  position: relative;
  z-index: 1;
}

.divergence-controls .btn {
  min-width: 140px;
}

.btn-icon {
  margin-right: 6px;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .divergence-view {
    padding: 12px;
  }

  .divergence-container {
    padding: 20px;
  }

  .divergence-header .title {
    font-size: 1.8rem;
  }

  .divergence-header {
    display: grid;
    text-align: center;
  }

  .divergence-back-btn {
    justify-self: center;
    margin-top: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .route-actions {
    flex-direction: column;
  }

  .route-actions .btn {
    width: 100%;
  }

  .divergence-controls {
    flex-direction: column;
  }

  .divergence-controls .btn {
    width: 100%;
  }
}

/* 琉璃蓝主题覆盖：衍化页内部统一 */
.divergence-view :is(.header-icon, .route-card, .media-card, .custom-route-item) {
  border-color: rgba(125, 211, 252, 0.34) !important;
}

.divergence-view .header-icon,
.divergence-view .mode-label.active,
.divergence-view .route-tag,
.divergence-view .btn-primary {
  background: linear-gradient(135deg, #8b6914 0%, #e8c872 50%, #b8860b 100%) !important;
  color: #f8fafc !important;
}

.divergence-view .route-card,
.divergence-view .media-card,
.divergence-view .custom-route-item,
.divergence-view .mode-switch {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.74), rgba(224, 242, 254, 0.54), rgba(237, 233, 254, 0.38)) !important;
}

.divergence-view .toggle.active .toggle-thumb {
  box-shadow: 0 0 18px rgba(232, 200, 114, 0.55) !important;
}

.divergence-view .light-beam {
  background: linear-gradient(
    270deg,
    transparent,
    rgba(232, 200, 114, 0.16),
    rgba(139, 105, 20, 0.24),
    rgba(184, 140, 60, 0.14),
    transparent
  ) !important;
}

.divergence-view .beam-accent.top-left,
.divergence-view .beam-accent.top-right {
  background: radial-gradient(circle, rgba(125, 211, 252, 0.55) 0%, transparent 72%) !important;
}
</style>
