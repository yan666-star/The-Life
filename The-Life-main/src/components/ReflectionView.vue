<template>
  <div class="reflection-view">
    <div class="reflection-container">
      <h1 class="title">REFLECTION / 心理与现实状态仪表盘</h1>

      <div class="compass glass-container">
        <div class="compass-center">
          <h2>STATE COMPASS</h2>
          <p>以等级、趋势和叙事状态呈现五维变化，而非单纯数值。</p>
        </div>
        <div class="compass-directions">
          <div class="direction" v-for="axis in radarAxes" :key="axis.key">
            <div class="direction-icon" :class="axis.key"></div>
            <h3>{{ axis.label }}</h3>
            <div class="attribute-level" :class="getLevelClass(attributes[axis.key])">
              {{ getLevelText(attributes[axis.key]) }}
            </div>
            <div class="attribute-bar">
              <div class="attribute-fill" :style="{ width: attributes[axis.key] + '%' }"></div>
            </div>
            <p class="attribute-narrative">{{ getAttributeNarrative(axis.key, attributes[axis.key]) }}</p>
          </div>
        </div>
      </div>

      <div class="visualization-section glass-container">
        <h3>ATTRIBUTE TELEMETRY</h3>
        <div class="visualization-options">
          <button class="btn btn-secondary small" @click="$emit('show-radar')">RADAR</button>
          <button class="btn btn-secondary small" @click="$emit('show-trend')">TREND</button>
          <button class="btn btn-secondary small" @click="$emit('show-impact')">IMPACT TRACE</button>
        </div>
        <div class="chart-container">
          <div v-if="currentChart === 'radar'" class="radar-chart">
            <svg class="radar-svg" viewBox="0 0 240 240" aria-hidden="true">
              <g class="radar-grid">
                <circle cx="120" cy="120" r="90"></circle>
                <circle cx="120" cy="120" r="60"></circle>
                <circle cx="120" cy="120" r="30"></circle>
              </g>
              <g class="radar-axes">
                <line v-for="(axis, index) in radarAxes" :key="axis.key" :x1="120" :y1="120" :x2="radarAxisPoints[index].x" :y2="radarAxisPoints[index].y"></line>
              </g>
              <polygon class="radar-shape" :points="radarPolygon"></polygon>
              <g class="radar-labels">
                <text v-for="(axis, index) in radarAxes" :key="axis.key" :x="radarAxisPoints[index].lx" :y="radarAxisPoints[index].ly">{{ axis.label }}</text>
              </g>
            </svg>
            <div class="radar-legend">
              <span v-for="axis in radarAxes" :key="axis.key">{{ axis.label }} {{ attributes[axis.key] }}%</span>
            </div>
          </div>
          <div v-else-if="currentChart === 'trend'" class="trend-chart">
            <svg class="trend-svg" viewBox="0 0 440 220" aria-hidden="true">
              <g class="trend-grid">
                <line x1="20" y1="20" x2="20" y2="200"></line>
                <line x1="20" y1="200" x2="420" y2="200"></line>
                <line x1="20" y1="80" x2="420" y2="80"></line>
                <line x1="20" y1="140" x2="420" y2="140"></line>
              </g>
              <path v-for="axis in radarAxes" :key="axis.key" :d="getTrendPath(axis.key)" :class="['trend-line', axis.key]" />
            </svg>
            <div class="trend-legend">
              <span v-for="axis in radarAxes" :key="axis.key" :class="['legend-item', axis.key]">{{ axis.label }}</span>
            </div>
          </div>
          <div v-else-if="currentChart === 'impact'" class="impact-chart">
            <div class="impact-list" v-if="impactHistory.length">
              <div class="impact-item" v-for="impact in impactHistory" :key="impact.id">
                <div class="impact-title">{{ impact.title }}</div>
                <div class="impact-meta">{{ impact.time }}</div>
                <div class="impact-tags">
                  <span v-for="(value, key) in impact.changes" :key="key" :class="['impact-tag', value >= 0 ? 'positive' : 'negative']">{{ axisLabelMap[key] }} {{ value > 0 ? '+' : '' }}{{ value }}</span>
                </div>
              </div>
            </div>
            <p v-else class="impact-empty">尚未生成溯源记录，先选择一条路线。</p>
          </div>
        </div>
      </div>

      <div class="social-sidebar glass-container">
        <h3>REALITY FEED / 天下志</h3>
        <div class="social-item" v-for="item in socialFeed" :key="item.id">
          <span class="source">{{ item.source }}</span>
          <p>{{ item.text }}</p>
          <span class="update-time">{{ item.date }}</span>
        </div>
        <button class="btn btn-secondary small" @click="$emit('refresh-social')">SYNC REALITY DATA</button>
      </div>

      <div class="reflection-controls">
        <button class="btn btn-secondary" @click="$emit('go-to-divergence')">BACK / 返回原界面</button>
        <button class="btn btn-primary" @click="$emit('go-to-mentorship')">OPEN MENTOR CHANNEL</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  attributes: { type: Object, required: true },
  attributeHistory: { type: Array, required: true },
  impactHistory: { type: Array, required: true },
  currentChart: { type: String, required: true },
  radarAxes: { type: Array, required: true },
  radarAxisPoints: { type: Array, required: true },
  radarPolygon: { type: String, required: true },
  axisLabelMap: { type: Object, required: true },
  socialFeed: { type: Array, required: true }
})

const emit = defineEmits(['show-radar','show-trend','show-impact','refresh-social','go-to-divergence','go-to-mentorship'])

const getTrendPath = (key) => {
  const records = props.attributeHistory || []
  if (!records.length) return ''
  const width = 400
  const height = 180
  const xStep = records.length > 1 ? width / (records.length - 1) : width
  return records
    .map((item, idx) => {
      const value = Math.max(0, Math.min(100, Number(item?.[key] ?? 0)))
      const x = 20 + idx * xStep
      const y = 200 - (value / 100) * height
      return `${idx === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
}

const getLevelClass = (value) => {
  if (value >= 80) return 'level-high'
  if (value >= 60) return 'level-medium'
  return 'level-low'
}

const getLevelText = (value) => {
  if (value >= 80) return '顶尖'
  if (value >= 60) return '良好'
  if (value >= 40) return '一般'
  return '初级'
}

const getAttributeNarrative = (attribute, value) => {
  const narratives = {
    career: {
      high: '你的职业发展前景广阔，有很大的晋升空间。',
      medium: '你的职业发展稳定，有一定的成长机会。',
      low: '你的职业发展面临挑战，需要更多努力。'
    },
    finance: {
      high: '你的财务状况良好，有足够的储蓄和投资。',
      medium: '你的财务状况稳定，能够满足基本需求。',
      low: '你的财务状况紧张，需要更合理的规划。'
    },
    relationship: {
      high: '你的人际关系和谐，社交网络广泛。',
      medium: '你的人际关系稳定，有几个知心朋友。',
      low: '你的人际关系需要改善，建议主动社交。'
    },
    health: {
      high: '你的健康状态良好，充满活力。',
      medium: '你的健康状态一般，需要注意保养。',
      low: '你的健康状态不佳，建议加强锻炼。'
    },
    growth: {
      high: '你保持持续学习，个人成长迅速。',
      medium: '你有一定的学习意识，能够不断进步。',
      low: '你需要更主动地学习和成长。'
    }
  }
  let level = 'low'
  if (value >= 80) level = 'high'
  else if (value >= 60) level = 'medium'
  return narratives[attribute][level]
}
</script>

<style scoped>
.reflection-view {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.reflection-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  animation: slideInUp 0.8s ease-out;
  position: relative;
  z-index: 1;
}

.compass {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  padding: var(--space-lg);
  position: relative;
}

.compass-center {
  grid-column: 1;
  text-align: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
}

.compass-center h2 {
  font-size: 1.4rem;
  margin-bottom: var(--space-sm);
  color: var(--color-accent-gold-bright);
}

.compass-center p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.compass-directions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-md);
  padding: var(--space-md);
}

.direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(232, 200, 114, 0.08);
  border-radius: 16px;
  transition: var(--transition-smooth);
  text-align: center;
}

.direction:hover {
  background: rgba(232, 200, 114, 0.15);
  transform: translateY(-4px);
}

.direction-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.3), rgba(232, 200, 114, 0.1));
  border: 2px solid var(--glass-border);
  transition: var(--transition-smooth);
  box-shadow: 0 0 20px rgba(232, 200, 114, 0.2);
}

.direction:hover .direction-icon {
  box-shadow: 0 0 30px rgba(232, 200, 114, 0.4), var(--glow-gold);
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.5), rgba(232, 200, 114, 0.2));
  border-color: var(--glass-border-hover);
}

.direction-icon.career::before {
  content: '💼';
}

.direction-icon.finance::before {
  content: '💰';
}

.direction-icon.relationship::before {
  content: '🤝';
}

.direction-icon.health::before {
  content: '💪';
}

.direction-icon.growth::before {
  content: '📈';
}

.direction h3 {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin: var(--space-xs) 0;
}

.attribute-level {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  transition: var(--transition-smooth);
}

.attribute-level.level-high {
  background: rgba(232, 200, 114, 0.2);
  color: var(--fui-hot-bright);
  box-shadow: 0 0 15px var(--fui-glow);
}

.attribute-level.level-medium {
  background: rgba(201, 162, 78, 0.2);
  color: var(--fui-hot);
  box-shadow: 0 0 15px rgba(201, 162, 78, 0.25);
}

.attribute-level.level-low {
  background: rgba(100, 80, 50, 0.25);
  color: rgba(160, 130, 85, 0.95);
  box-shadow: 0 0 10px rgba(80, 55, 15, 0.2);
}

.attribute-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.attribute-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-gold-bright));
  box-shadow: 0 0 10px rgba(232, 200, 114, 0.5);
  transition: width 0.5s ease-out;
}

.attribute-narrative {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin-top: var(--space-xs);
}

.visualization-section {
  padding: var(--space-lg);
  animation: slideInUp 0.8s ease-out 0.1s both;
}

.visualization-section h3 {
  font-size: 1.3rem;
  margin-bottom: var(--space-md);
  color: var(--color-accent-gold-bright);
}

.visualization-options {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.chart-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: var(--space-lg);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart,
.trend-chart,
.impact-chart {
  width: 100%;
}

.radar-svg,
.trend-svg {
  width: 100%;
  height: 100%;
  max-height: 400px;
}

.radar-grid circle {
  fill: none;
  stroke: var(--glass-border);
  stroke-width: 1;
  opacity: 0.5;
}

.radar-axes line {
  stroke: var(--glass-border);
  stroke-width: 1;
  opacity: 0.3;
}

.radar-shape {
  fill: rgba(232, 200, 114, 0.15);
  stroke: var(--color-accent-gold);
  stroke-width: 2;
  filter: drop-shadow(0 0 10px rgba(232, 200, 114, 0.3));
}

.radar-labels text {
  fill: var(--color-text-secondary);
  font-size: 12px;
  text-anchor: middle;
}

.radar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-md);
  justify-content: center;
  font-size: 0.9rem;
}

.radar-legend span {
  color: var(--color-text-secondary);
  padding: 4px 12px;
  background: rgba(232, 200, 114, 0.1);
  border-radius: 12px;
}

.trend-grid line {
  stroke: var(--glass-border);
  stroke-width: 1;
  opacity: 0.2;
}

.trend-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px rgba(232, 200, 114, 0.3));
}

.trend-line.career {
  stroke: #c9a24e;
}

.trend-line.finance {
  stroke: #e8c872;
}

.trend-line.relationship {
  stroke: #b8860b;
}

.trend-line.health {
  stroke: #8b6914;
}

.trend-line.growth {
  stroke: #b8860b;
}

.trend-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-top: var(--space-md);
  justify-content: center;
}

.legend-item {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  background: rgba(232, 200, 114, 0.1);
  border-left: 3px solid;
}

.legend-item.career {
  border-left-color: #c9a24e;
  color: #0369a1;
}

.legend-item.finance {
  border-left-color: #e8c872;
  color: #8b6914;
}

.legend-item.relationship {
  border-left-color: #b8860b;
  color: #6d28d9;
}

.legend-item.health {
  border-left-color: #8b6914;
  color: #4338ca;
}

.legend-item.growth {
  border-left-color: #b8860b;
  color: #6d28d9;
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.impact-item {
  padding: var(--space-md);
  background: rgba(232, 200, 114, 0.08);
  border-radius: 12px;
  border-left: 4px solid var(--color-accent-gold);
  transition: var(--transition-smooth);
}

.impact-item:hover {
  background: rgba(232, 200, 114, 0.15);
  transform: translateX(8px);
}

.impact-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.impact-meta {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
}

.impact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.impact-tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.impact-tag.positive {
  background: rgba(124, 58, 237, 0.2);
  color: #8b6914;
}

.impact-tag.negative {
  background: rgba(79, 70, 229, 0.2);
  color: #4f46e5;
}

.impact-empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-xl);
}

.social-sidebar {
  padding: var(--space-lg);
  animation: slideInUp 0.8s ease-out 0.2s both;
  max-height: 300px;
  overflow-y: auto;
}

.social-sidebar h3 {
  font-size: 1.2rem;
  margin-bottom: var(--space-md);
  color: var(--color-accent-gold-bright);
}

.social-item {
  padding: var(--space-md);
  background: rgba(232, 200, 114, 0.08);
  border-radius: 12px;
  margin-bottom: var(--space-md);
  transition: var(--transition-smooth);
  border-left: 3px solid var(--color-accent-gold);
}

.social-item:hover {
  background: rgba(232, 200, 114, 0.15);
  border-left-color: var(--color-accent-gold-bright);
}

.source {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent-gold);
  display: block;
  margin-bottom: var(--space-xs);
}

.social-item p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
  line-height: 1.5;
}

.update-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.reflection-controls {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding: var(--space-md) 0;
  animation: slideInUp 0.8s ease-out 0.3s both;
}

.reflection-controls .btn {
  flex: 1;
  max-width: 200px;
}

@media (max-width: 768px) {
  .compass-directions {
    grid-template-columns: repeat(2, 1fr);
  }

  .visualization-section {
    padding: var(--space-md);
  }

  .reflection-controls {
    flex-direction: column;
  }

  .reflection-controls .btn {
    max-width: 100%;
  }

  .social-sidebar {
    max-height: 250px;
  }
}

@media (max-width: 480px) {
  .compass-directions {
    grid-template-columns: 1fr;
  }

  .direction-icon {
    width: 54px;
    height: 54px;
    font-size: 28px;
  }
}
</style>
