<template>
  <div class="attributes-sidebar glass-container">
    <div class="sidebar-header">
      <h3 class="sidebar-title">动态属性系统</h3>
      <button class="sidebar-toggle" @click="isExpanded = !isExpanded" :class="{ expanded: isExpanded }">
        ▸
      </button>
    </div>

    <div v-if="isExpanded" class="sidebar-content">
      <!-- 属性条形图 -->
      <div class="attributes-grid">
        <div v-for="(value, key) in attributes" :key="key" class="attribute-item">
          <div class="attribute-header">
            <span class="attribute-label">{{ attributeLabels[key] || key }}</span>
            <span class="attribute-value" :class="getValueClass(value)">{{ value }}</span>
          </div>
          <div class="attribute-bar">
            <div class="attribute-fill" :style="{ width: value + '%' }" :class="getBarClass(value)">
              <div class="fill-shine"></div>
            </div>
            <div class="attribute-threshold threshold-low"></div>
            <div class="attribute-threshold threshold-mid"></div>
            <div class="attribute-glow" :class="getBarClass(value)"></div>
          </div>
          <div class="attribute-markers">
            <span class="marker">0</span>
            <span class="marker text-center">低</span>
            <span class="marker text-center">中</span>
            <span class="marker text-center">高</span>
            <span class="marker">100</span>
          </div>
        </div>
      </div>

      <!-- 快速统计 -->
      <div class="quick-stats">
        <div class="stat-card">
          <span class="stat-label">平均值</span>
          <span class="stat-value">{{ averageValue }}%</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">最高值</span>
          <span class="stat-value high">{{ maxValue }}%</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">最低值</span>
          <span class="stat-value low">{{ minValue }}%</span>
        </div>
      </div>

      <!-- AI导师建议 -->
      <div class="ai-mentor glass-card">
        <div class="mentor-header">
          <span class="mentor-avatar">🤖</span>
          <h4 class="mentor-title">AI顾问建议</h4>
        </div>
        <p class="mentor-advice">{{ mentorAdvice }}</p>
        <button class="btn btn-refresh" @click="refreshAdvice">
          🔄 刷新建议
        </button>
      </div>

      <!-- 属性趋势预测 -->
      <div class="trend-preview" v-if="showTrendPreview">
        <h4>预期影响趋势</h4>
        <div class="trend-items">
          <div 
            v-for="(impact, attr) in predictedImpacts" 
            :key="attr"
            class="trend-item"
            :class="{ positive: impact > 0, negative: impact < 0 }"
          >
            <span class="trend-attr">{{ attributeLabels[attr] }}</span>
            <span class="trend-value">{{ impact > 0 ? '+' : '' }}{{ impact }}</span>
          </div>
        </div>
      </div>

      <!-- 展开/收起动画指示 -->
      <div class="expansion-guide">
        <small>点击上方"▸"可折叠此面板</small>
      </div>
    </div>

    <!-- 折叠态显示 -->
    <div v-else class="sidebar-collapsed">
      <div class="collapsed-icon">📊</div>
      <div class="collapsed-values">
        <div v-for="(value, key) in attributes" :key="key" class="collapsed-item" :title="attributeLabels[key]">
          <span class="collapsed-label">{{ attributeLabels[key]?.slice(0,2) }}</span>
          <span class="collapsed-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  attributes: {
    type: Object,
    default: () => ({
      职业发展: 65,
      财务状况: 55,
      人际关系: 70,
      健康状态: 60,
      个人成长: 75
    })
  },
  predictedImpacts: {
    type: Object,
    default: () => ({})
  },
  showTrendPreview: {
    type: Boolean,
    default: true
  }
})

const isExpanded = ref(true)

const attributeLabels = {
  career: '职业发展',
  finance: '财务状况',
  relationship: '人际关系',
  health: '健康状态',
  growth: '个人成长'
}

// 计算属性
const averageValue = computed(() => {
  const values = Object.values(props.attributes)
  const sum = values.reduce((a, b) => a + b, 0)
  return Math.round(sum / values.length)
})

const maxValue = computed(() => {
  return Math.max(...Object.values(props.attributes))
})

const minValue = computed(() => {
  return Math.min(...Object.values(props.attributes))
})

const mentorAdvice = ref('根据你的当前属性分布，建议在接下来的选择中重点关注"财务状况"的提升。')

// 方法
const getValueClass = (value) => {
  if (value >= 80) return 'high'
  if (value >= 50) return 'medium'
  return 'low'
}

const getBarClass = (value) => {
  if (value >= 80) return 'bar-high'
  if (value >= 60) return 'bar-medium'
  if (value >= 40) return 'bar-low'
  return 'bar-critical'
}

const refreshAdvice = () => {
  const advices = [
    '关注财务状况的提升，这是长期稳定的基础。',
    '投入更多时间到人际关系维护，社交资本同样重要。',
    '健康是革命的本钱，建议增加运动频率。',
    '个人成长是持续进步的引擎，不要忽视学习投入。',
    '职业发展需要多维度支撑，不能单点突破。'
  ]
  const randomAdvice = advices[Math.floor(Math.random() * advices.length)]
  mentorAdvice.value = randomAdvice
}
</script>

<style scoped>
.attributes-sidebar {
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  transition: var(--transition-smooth);
  height: fit-content;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(255, 255, 255, 0.3));
  border-bottom: 1px solid var(--glass-border);
  cursor: pointer;
  user-select: none;
}

.sidebar-header:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(255, 255, 255, 0.4));
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-accent-gold);
  margin: 0;
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(56, 189, 248, 0.1);
  border-radius: 8px;
  color: var(--color-accent-gold);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.sidebar-toggle:hover {
  background: rgba(56, 189, 248, 0.2);
  transform: scale(1.1);
}

.sidebar-toggle.expanded {
  transform: rotate(90deg);
}

.sidebar-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 属性网格 */
.attributes-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.attribute-item {
  animation: slideInLeft 0.5s ease-out;
}

.attribute-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.attribute-label {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.attribute-value {
  font-size: 0.95rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.1);
  color: var(--color-accent-gold);
}

.attribute-value.high {
  background: rgba(124, 58, 237, 0.15);
  color: #7c3aed;
}

.attribute-value.low {
  background: rgba(79, 70, 229, 0.15);
  color: #4f46e5;
}

.attribute-bar {
  position: relative;
  height: 14px;
  background: rgba(224, 242, 254, 0.75);
  border-radius: 7px;
  overflow: visible;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: inset 0 1px 2px rgba(14, 116, 185, 0.08);
}

.attribute-fill {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.fill-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2.5s ease-in-out infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.attribute-fill.bar-high {
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.attribute-fill.bar-medium {
  background: linear-gradient(90deg, #4f46e5, #6366f1, #818cf8);
  box-shadow: 0 0 12px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.attribute-fill.bar-low {
  background: linear-gradient(90deg, #4338ca, #4f46e5, #6366f1);
  box-shadow: 0 0 12px rgba(67, 56, 202, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.attribute-fill.bar-critical {
  background: linear-gradient(90deg, #312e81, #4338ca, #4f46e5);
  box-shadow: 0 0 12px rgba(67, 56, 202, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: pulse-critical 1s ease-in-out infinite;
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.attribute-glow {
  position: absolute;
  top: -4px;
  left: 0;
  height: 4px;
  border-radius: 2px;
  filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.attribute-bar:hover .attribute-glow {
  opacity: 0.8;
}

.attribute-glow.bar-high {
  background: #8b5cf6;
  box-shadow: 0 0 8px #6366f1;
}

.attribute-glow.bar-medium {
  background: #6366f1;
  box-shadow: 0 0 8px #4f46e5;
}

.attribute-glow.bar-low {
  background: #4f46e5;
  box-shadow: 0 0 8px #4338ca;
}

.attribute-glow.bar-critical {
  background: #4338ca;
  box-shadow: 0 0 8px #312e81;
}

.attribute-threshold {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.attribute-bar:hover .attribute-threshold {
  opacity: 1;
}

.threshold-low {
  left: 33.33%;
}

.threshold-mid {
  left: 66.66%;
}

.attribute-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.attribute-markers .marker {
  min-width: 24px;
  text-align: center;
}

.attribute-markers .text-center {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

/* 快速统计 */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.stat-card {
  text-align: center;
  padding: 12px;
  background: rgba(56, 189, 248, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.1);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent-gold);
}

.stat-value.high {
  color: #7c3aed;
}

.stat-value.low {
  color: #4f46e5;
}

/* AI顾问卡片 */
.ai-mentor {
  padding: 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(255, 255, 255, 0.3));
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.mentor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.mentor-avatar {
  font-size: 1.5rem;
}

.mentor-title {
  font-size: 0.95rem;
  color: var(--color-accent-gold);
  margin: 0;
}

.mentor-advice {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.btn-refresh {
  width: 100%;
  padding: 8px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: var(--color-accent-gold);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.btn-refresh:hover {
  background: rgba(56, 189, 248, 0.25);
  transform: scale(1.02);
}

/* 趋势预测 */
.trend-preview {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.trend-preview h4 {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0 0 12px 0;
}

.trend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 0.85rem;
}

.trend-item.positive {
  border-left: 3px solid #7c3aed;
}

.trend-item.negative {
  border-left: 3px solid #4f46e5;
}

.trend-attr {
  color: var(--color-text-secondary);
}

.trend-value {
  font-weight: 600;
  color: var(--color-accent-gold);
}

.trend-item.positive .trend-value {
  color: #7c3aed;
}

.trend-item.negative .trend-value {
  color: #4f46e5;
}

/* 展开指引 */
.expansion-guide {
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.7;
  padding-top: 12px;
  border-top: 1px solid rgba(56, 189, 248, 0.1);
}

/* 折叠态 */
.sidebar-collapsed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.collapsed-icon {
  font-size: 2rem;
}

.collapsed-values {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 8px;
  width: 100%;
}

.collapsed-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(56, 189, 248, 0.1);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: help;
  transition: all 0.2s ease;
}

.collapsed-item:hover {
  background: rgba(56, 189, 248, 0.2);
  transform: translateX(4px);
}

.collapsed-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.collapsed-value {
  color: var(--color-accent-gold);
  font-weight: 700;
}

@media (max-width: 1200px) {
  .attributes-sidebar {
    max-height: none;
  }

  .quick-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar-content {
    max-height: 400px;
  }

  .quick-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .attribute-item {
    margin-bottom: 8px;
  }
}
</style>
