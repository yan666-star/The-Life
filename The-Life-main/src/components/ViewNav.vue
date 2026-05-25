<template>
  <div class="view-nav glass-container">
    <div class="nav-track">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="view-step"
        :class="{ active: currentView === step.id, completed: isCompleted(step.id) }"
      >
        <div class="step-connector" v-if="index > 0"></div>
        <div class="step-orb">
          <span class="step-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="step-glow"></div>
        </div>
        <div class="step-content">
          <strong>{{ step.title }}</strong>
          <small>{{ step.subtitle }}</small>
        </div>
        <div class="step-particles">
          <span class="particle" v-for="n in 3" :key="n"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentView: {
    type: String,
    required: true
  }
})
const steps = [
  { id: 'genesis', title: 'GENESIS', subtitle: '入局 / 建模' },
  { id: 'destiny', title: 'DESTINY', subtitle: '命轨 / 图谱' },
  { id: 'divergence', title: 'DIVERGENCE', subtitle: '衍化 / 路线' },
  { id: 'comparison', title: 'PARALLEL', subtitle: '对比 / 双窗' },
  { id: 'reflection', title: 'REFLECTION', subtitle: '观心 / 属性' },
  { id: 'mentorship', title: 'MENTOR', subtitle: '论道 / Agent' },
  { id: 'conclusion', title: 'REPORT', subtitle: '归途 / 归档' }
]

const viewOrder = ['genesis', 'destiny', 'divergence', 'comparison', 'reflection', 'mentorship', 'conclusion']

const isCompleted = (stepId) => {
  const currentIndex = viewOrder.indexOf(props.currentView)
  if (currentIndex < 0) return false
  const stepIndex = viewOrder.indexOf(stepId)
  if (stepIndex < 0) return false
  return stepIndex < currentIndex
}
</script>

<style scoped>
.view-nav {
  padding: 1.5rem 2rem;
  margin-bottom: 3rem;
  overflow-x: auto;
}

.nav-track {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: max-content;
}

.view-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  color: var(--color-text-muted);
  transition: var(--transition-smooth);
  cursor: default;
  position: relative;
  min-width: 140px;
}

.view-step:hover {
  color: var(--color-text-muted);
  background: transparent;
}

.view-step.active {
  color: var(--color-text-primary);
  background: linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(254, 243, 199, 0.55), rgba(224, 242, 254, 0.45));
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.28), 0 10px 28px rgba(30, 58, 95, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.view-step.active .step-orb {
  background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-gold-light), var(--color-accent-sky));
  background-size: 200% 200%;
  box-shadow: 0 0 36px rgba(56, 189, 248, 0.55), 0 0 72px rgba(167, 139, 250, 0.35);
  animation: gradient-shift 3s ease infinite;
}

.view-step.active .step-index {
  color: #422006;
  font-weight: 900;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.9);
}

.view-step.active .step-glow {
  opacity: 1;
  animation: pulse-glow 1.8s ease-in-out infinite;
}

.view-step.completed .step-orb {
  background: linear-gradient(135deg, var(--color-accent-gold-light), var(--color-accent-gold), var(--color-accent-amber));
  box-shadow: 0 0 22px rgba(56, 189, 248, 0.45);
}

.view-step.completed .step-index {
  color: #78350f;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.75);
}

.step-connector {
  position: absolute;
  left: -0.5rem;
  width: 1rem;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.55), transparent);
  z-index: 0;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.22);
}

.step-orb {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(254, 249, 231, 0.55) 100%);
  border: 2px solid var(--glass-border);
  display: grid;
  place-items: center;
  position: relative;
  transition: var(--transition-bounce);
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.step-index {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-text-secondary);
  z-index: 1;
  transition: var(--transition-smooth);
}

.step-glow {
  position: absolute;
  inset: -6px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-gold-light), transparent);
  opacity: 0;
  z-index: -1;
  filter: blur(10px);
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-content strong {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.step-content small {
  font-size: 0.75rem;
  opacity: 0.7;
}

.step-particles {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
}

.step-particles .particle {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-accent-gold);
  opacity: 0;
  animation: none;
}

.view-step.active .step-particles .particle {
  opacity: 0.6;
  animation: particle-twinkle 2s ease-in-out infinite;
}

.view-step.active .step-particles .particle:nth-child(2) {
  animation-delay: 0.3s;
}

.view-step.active .step-particles .particle:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes particle-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.5); }
}

@media (max-width: 768px) {
  .view-nav {
    padding: 1rem;
  }

  .view-step {
    padding: 0.75rem 1rem;
    min-width: 100px;
  }

  .step-orb {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .step-content strong {
    font-size: 0.9rem;
  }
}

/* FUI theme: navigation highlight */
.view-step.active {
  background: rgba(255, 255, 255, 0.09) !important;
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
}

.view-step.active .step-orb,
.view-step.completed .step-orb {
  background: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.16) !important;
}

.step-connector {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent) !important;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.16) !important;
}
</style>
