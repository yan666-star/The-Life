<template>
  <div v-if="true" class="genesis-view">
    <div class="genesis-console">
      <aside class="profile-input-panel glass-container">
        <h1 class="title">GENESIS / 入局</h1>
        <p class="panel-subtitle">SUBJECT PROFILE INPUT</p>
        <section class="form-section">
          <h2>BASIC DATA / 基础信息</h2>
          <div class="form-row">
          <div class="form-group">
            <label>年龄</label>
            <input type="number" v-model="local.age" class="input" placeholder="请输入年龄">
          </div>
          <div class="form-group">
            <label>学历</label>
            <select v-model="local.education" class="input">
              <option value="">请选择学历</option>
              <option value="high school">高中</option>
              <option value="college">大专</option>
              <option value="bachelor">本科</option>
              <option value="master">硕士</option>
              <option value="phd">博士</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>职业</label>
            <input type="text" v-model="local.occupation" class="input" placeholder="请输入职业">
          </div>
          <div class="form-group">
            <label>城市</label>
            <input type="text" v-model="local.city" class="input" placeholder="请输入城市">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>月收入</label>
            <input type="number" v-model="local.income" class="input" placeholder="请输入月收入">
          </div>
          <div class="form-group">
            <label>家庭状况</label>
            <select v-model="local.family" class="input">
              <option value="">请选择</option>
              <option value="single">单身</option>
              <option value="married">已婚</option>
              <option value="married_with_children">已婚有子女</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>核心技能</label>
            <input type="text" v-model="local.skills" class="input" placeholder="请输入核心技能">
          </div>
          <div class="form-group">
            <label>可投入成本</label>
            <input type="number" v-model="local.investment" class="input" placeholder="请输入可投入成本">
          </div>
        </div>
        </section>
      </aside>

      <main class="calibration-panel glass-container fade-in">
        <section class="form-section">
          <h2>PERSONALITY VECTOR / 人格与偏好建模</h2>
        <div class="form-row">
          <div class="form-group">
            <label>风险偏好</label>
            <select v-model="local.riskPreference" class="input">
              <option value="">请选择</option>
              <option value="risk-averse">风险规避</option>
              <option value="moderate">平衡型</option>
              <option value="risk-seeking">风险偏好</option>
            </select>
          </div>
          <div class="form-group">
            <label>延迟满足能力</label>
            <select v-model="local.delayGratification" class="input">
              <option value="">请选择</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>抗压能力</label>
            <select v-model="local.stressResistance" class="input">
              <option value="">请选择</option>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div class="form-group">
            <label>决策风格</label>
            <select v-model="local.decisionStyle" class="input">
              <option value="">请选择</option>
              <option value="analytical">分析型</option>
              <option value="intuitive">直觉型</option>
              <option value="collaborative">协作型</option>
            </select>
          </div>
        </div>
        </section>

        <section class="form-section goal-matrix">
          <h2>GOAL MATRIX / 目标矩阵</h2>
          <div class="form-row">
          <div class="form-group full-width">
            <label>人生目标</label>
            <textarea v-model="local.lifeGoals" class="input" rows="3" placeholder="请输入短期和长期人生目标"></textarea>
          </div>
        </div>
        </section>

        <section class="form-section decision-calibration">
          <h2>DECISION CALIBRATION / 决策校准卡</h2>
          <div class="card-flip" :class="{ flipped: isCardFlipped }" @click="$emit('flip-card')">
          <div class="card-front glass-container">
            <h3>{{ currentScenario.scenario }}</h3>
            <p>CLICK CARD TO REVEAL OPTIONS</p>
            <span class="calibration-scan"></span>
          </div>
          <div class="card-back glass-container" v-if="isCardFlipped">
            <div class="option" v-for="(option, index) in currentScenario.options" :key="index" @click.stop="$emit('select-option', option.style)">
              <b>LOCK-{{ String(index + 1).padStart(2, '0') }}</b>
              <span>{{ option.text }}</span>
              <small>{{ option.style }}</small>
            </div>
          </div>
        </div>
        <button class="btn btn-secondary" @click="$emit('fetch-scenario')">GENERATE SCENARIO</button>
        <button class="btn btn-secondary" @click="$emit('skip-scenario')">USE DEFAULT MODEL</button>
        </section>

        <button class="btn btn-primary" @click="$emit('start-destiny')">INITIALIZE DESTINY GRAPH</button>
      </main>

      <aside class="model-panel glass-container">
        <h2>REALTIME MODEL CONSOLE</h2>
        <div class="scan-avatar">
          <span></span>
          <i></i>
        </div>
        <div class="scan-row"><span>SUBJECT</span><b>USER_01</b></div>
        <div class="scan-row"><span>PROFILE SYNC</span><b>{{ profileCompletion }}%</b></div>
        <div class="scan-row"><span>RISK VECTOR</span><b>{{ local.riskPreference || 'PENDING' }}</b></div>
        <div class="scan-row"><span>DECISION STYLE</span><b>{{ local.decisionStyle || 'PENDING' }}</b></div>
        <div class="scan-meter"><i :style="{ width: profileCompletion + '%' }"></i></div>
        <div class="model-item" v-for="item in modelItems" :key="item.label">
          <span>{{ item.label }}</span>
          <i><b :style="{ width: item.value + '%' }"></b></i>
          <strong>{{ item.value }}%</strong>
        </div>
        <div class="model-readout">
          <strong>GOAL MATRIX</strong>
          <p>{{ local.lifeGoals || '等待录入人生目标。' }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
const props = defineProps(['userInfo','isCardFlipped','currentScenario','statusMessage'])
const emit = defineEmits(['update:userInfo','fetch-scenario','flip-card','select-option','skip-scenario','mark-edit','backup','clear','start-destiny'])

const local = reactive({ ...props.userInfo })

const profileCompletion = computed(() => {
  const keys = ['age', 'education', 'occupation', 'city', 'income', 'family', 'skills', 'investment', 'riskPreference', 'delayGratification', 'stressResistance', 'decisionStyle', 'lifeGoals']
  const filled = keys.filter((key) => String(local[key] || '').trim()).length
  return Math.round((filled / keys.length) * 100)
})

const modelItems = computed(() => [
  { label: 'BASIC DATA', value: Math.min(100, ['age', 'education', 'occupation', 'city', 'income', 'family'].filter((key) => local[key]).length * 16) },
  { label: 'SKILL INDEX', value: local.skills ? 82 : 24 },
  { label: 'PERSONALITY', value: ['riskPreference', 'delayGratification', 'stressResistance', 'decisionStyle'].filter((key) => local[key]).length * 25 },
  { label: 'GOAL CLARITY', value: local.lifeGoals ? 90 : 18 }
])

watch(() => props.userInfo, (nv) => {
  Object.assign(local, nv || {})
}, { deep: true })

watch(local, (nv) => {
  emit('update:userInfo', { ...nv })
}, { deep: true })
</script>

<style scoped>
/* 组件可复用的样式依赖全局样式，局部微调 */
.genesis-view { padding: 8px; }
.genesis-console {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(420px, 1.25fr) 300px;
  gap: 16px;
  align-items: start;
}
.profile-input-panel,
.calibration-panel { width: 100%; padding: 22px; }
.panel-subtitle {
  margin: -8px 0 18px;
  color: rgba(255,255,255,.5);
  font: 11px "Share Tech Mono", monospace;
  letter-spacing: .14em;
}
.form-section { margin-bottom: 24px; }
.form-row { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:16px; margin-top:16px; }
.form-group { flex:1; }
.full-width { flex:1 1 100%; }

.card-flip { margin: 12px 0; position: relative; }
.card-front, .card-back { padding: 18px; border-radius: 14px; }
.card-front {
  position: relative;
  min-height: 128px;
  overflow: hidden;
}
.calibration-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fff, transparent);
  animation: calibration-sweep 2.8s linear infinite;
}
.card-back .option {
  display:grid;
  grid-template-columns: 70px 1fr auto;
  align-items:center;
  gap:12px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,.14);
}
.card-back .option:hover {
  border-color: rgba(255,255,255,.6);
  box-shadow: 0 0 16px rgba(255,255,255,.12);
}
.card-back .option b {
  color: rgba(255,255,255,.52);
  font: 10px "Share Tech Mono", monospace;
}
.model-panel {
  padding: 18px;
  position: sticky;
  top: 16px;
}
.scan-avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 150px;
  aspect-ratio: 1;
  margin: 18px auto;
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 50%;
}
.scan-avatar span {
  width: 58px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.55);
  box-shadow: 0 0 22px rgba(255,255,255,.16);
}
.scan-avatar i {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  border: 1px dashed rgba(255,255,255,.28);
  animation: scan-spin 14s linear infinite;
}
.scan-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255,255,255,.1);
  font: 11px "Share Tech Mono", monospace;
}
.scan-row span,
.model-item span {
  color: rgba(255,255,255,.52);
}
.scan-row b,
.model-item strong {
  color: #fff;
  font-weight: 400;
}
.scan-meter,
.model-item i {
  display: block;
  height: 3px;
  margin-top: 16px;
  background: rgba(255,255,255,.12);
}
.scan-meter i,
.model-item b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg,#fff,rgba(255,255,255,.36));
  box-shadow: 0 0 10px rgba(255,255,255,.24);
}
.model-item {
  display: grid;
  grid-template-columns: 94px 1fr 40px;
  gap: 10px;
  align-items: center;
  min-height: 34px;
  font: 11px "Share Tech Mono", monospace;
}
.model-item i {
  margin: 0;
}
.model-readout {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,.12);
}
.model-readout strong {
  font: 12px "Share Tech Mono", monospace;
}
.model-readout p {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
}
@keyframes scan-spin { to { transform: rotate(360deg); } }
@keyframes calibration-sweep {
  from { transform: translateY(0); opacity: .1; }
  45% { opacity: .9; }
  to { transform: translateY(130px); opacity: .1; }
}
@media (max-width: 1180px) {
  .genesis-console {
    grid-template-columns: 1fr;
  }
  .model-panel {
    position: static;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
