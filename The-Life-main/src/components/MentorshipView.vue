<template>
  <div class="mentorship-view">
    <div class="mentorship-header">
      <h1 class="title">MENTOR / AI Agent 通讯舱</h1>
      <p class="subtitle">ASK / ANALYZE / SIMULATE / COMPARE</p>
    </div>

    <div class="mentorship-layout">
      <div class="mentorship-main">
        <div class="agent-comms-section">
          <div class="agent-core-container">
            <div class="agent-halo-ring ring-1"></div>
            <div class="agent-halo-ring ring-2"></div>
            <div class="agent-halo-ring ring-3"></div>
            <div class="agent-core">
              <span></span>
              <i v-for="n in 8" :key="n"></i>
            </div>
          </div>
          
          <div class="ai-info">
            <div class="ai-name-row">
              <h2 class="ai-name">{{ currentAIDisplay }}</h2>
              <div class="status-indicator" :class="statusClass">
                <span class="status-dot"></span>
                <span class="status-text">{{ statusText }}</span>
              </div>
            </div>
            <p class="ai-description">{{ currentAIDescription }}</p>
            <div class="ai-tags">
              <span class="ai-tag" v-for="tag in currentAITags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="chat-section">
          <div class="chat-channel-label">NODE-BOUND CHAT ARCHIVE / CURRENT CHANNEL: {{ currentAIDisplay }}</div>
          <div class="chat-container" ref="chatContainer">
            <div class="chat-messages">
              <div 
                v-for="(msg, index) in displayMessages" 
                :key="index"
                class="chat-message"
                :class="msg.role === 'ai' ? 'ai-message' : 'user-message'"
              >
                <div class="message-bubble">
                  <div class="message-content">
                    <p>{{ msg.content }}</p>
                  </div>
                  <div class="message-time">{{ msg.time }}</div>
                </div>
              </div>
              
              <div class="chat-message ai-message" v-if="isGeneratingAIResponse">
                <div class="message-bubble">
                  <div class="message-content typing-content">
                    <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div class="message-time">思考中...</div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input-bar">
            <div class="input-wrapper">
              <input 
                type="text" 
                v-model="localInput" 
                class="chat-input" 
                placeholder="ASK / ANALYZE / SIMULATE / COMPARE ..."
                @keyup.enter="onSend"
              >
              <button class="voice-btn" :class="{ active: isListening }" @click="$emit('toggle-voice')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            </div>
            <button class="send-btn" @click="onSend" :disabled="isGeneratingAIResponse">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <aside class="mentorship-sidebar">
        <div class="role-selection-card">
          <h3 class="sidebar-title">AI AGENT ROLES</h3>
          <div class="role-grid">
            <button 
              v-for="role in aiRoles" 
              :key="role.id"
              class="role-card"
              :class="{ selected: currentAI角色 === role.name }"
              @click="$emit('select-ai-role', role.name)"
            >
              <div class="role-icon">
                <component :is="role.iconComponent" />
              </div>
              <span class="role-name">{{ role.name }}</span>
              <span class="role-desc">{{ role.shortDesc }}</span>
              <div class="role-selected-indicator"></div>
            </button>
          </div>
        </div>

        <div class="quick-prompts-card">
          <h3 class="sidebar-title">COMMAND PRESETS</h3>
          <div class="prompt-list">
            <button class="prompt-btn" @click="usePrompt(prompt)" v-for="prompt in quickPrompts" :key="prompt">
              {{ prompt }}
            </button>
          </div>
        </div>
      </aside>
    </div>

    <div class="mentorship-footer">
      <button class="btn btn-secondary" @click="$emit('go-to-reflection')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        BACK / 返回原界面
      </button>
      <button class="btn btn-primary" @click="$emit('go-to-conclusion')">
        OPEN REPORT
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, h } from 'vue'

const props = defineProps([
  'chatMessages',
  'isGeneratingAIResponse',
  'chatInput',
  'currentAI角色',
  'currentAIDescription',
  'isListening'
])

const emit = defineEmits(['send-message', 'select-ai-role', 'toggle-voice', 'go-to-reflection', 'go-to-conclusion'])

const localInput = ref(props.chatInput || '')
const chatContainer = ref(null)

watch(() => props.chatInput, (v) => {
  localInput.value = v || ''
})

watch(() => props.chatMessages, () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}, { deep: true })

const onSend = () => {
  const text = String(localInput.value || '').trim()
  if (!text) return
  emit('send-message', text)
  localInput.value = ''
}

const usePrompt = (prompt) => {
  localInput.value = prompt
}

const currentAIDisplay = computed(() => props['currentAI角色'] || 'AI顾问')

const aiRoles = [
  { id: 1, name: '职场导师', shortDesc: '职业发展', iconComponent: { render: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [h('rect', { x: 2, y: 7, width: 20, height: 14 }), h('path', { d: 'M16 3H8a2 2 0 0 0-2 2v2' })]) }},
  { id: 2, name: '情感顾问', shortDesc: '人际关系', iconComponent: { render: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })]) }},
  { id: 3, name: '创业前辈', shortDesc: '创业指导', iconComponent: { render: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [h('polygon', { points: '12 2 2 7 12 12 22 7 12 2' }), h('polyline', { points: '2 17 12 22 22 17' }), h('polyline', { points: '2 12 12 17 22 12' })]) }},
  { id: 4, name: '人生规划师', shortDesc: '长期规划', iconComponent: { render: () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, [h('circle', { cx: 12, cy: 12, r: 10 }), h('polyline', { points: '12 6 12 12 16 14' })]) }}
]

const roleTags = {
  '职场导师': ['职业规划', '职场沟通', '晋升策略', '技能提升'],
  '情感顾问': ['情感疏导', '关系修复', '沟通技巧', '心理建设'],
  '创业前辈': ['商业模式', '融资策略', '团队管理', '市场拓展'],
  '人生规划师': ['目标设定', '时间管理', '决策优化', '长期视野']
}

const currentAITags = computed(() => roleTags[currentAIDisplay.value] || ['智能顾问', '随时响应'])

const statusClass = computed(() => ({
  'status-online': !props.isGeneratingAIResponse && !props.isListening,
  'status-thinking': props.isGeneratingAIResponse,
  'status-listening': props.isListening
}))

const statusText = computed(() => {
  if (props.isListening) return '聆听中'
  if (props.isGeneratingAIResponse) return '思考中'
  return '在线'
})

const displayMessages = computed(() => {
  const msgs = Array.isArray(props.chatMessages) ? [...props.chatMessages] : []
  return msgs.map((msg, idx) => {
    const isAi = idx % 2 === 0
    return {
      role: isAi ? 'ai' : 'user',
      content: msg,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  })
})

const quickPrompts = [
  '我最近对职业发展很迷茫',
  '如何平衡工作和生活？',
  '想听听你对我人生选择的建议',
  '有哪些容易被忽略的人生选择？'
]
</script>

<style scoped>
.mentorship-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
  background:
    radial-gradient(ellipse 120% 90% at 50% -20%, rgba(139, 105, 20, 0.32) 0%, transparent 55%),
    radial-gradient(ellipse 85% 70% at 15% 28%, rgba(232, 200, 114, 0.2) 0%, transparent 58%),
    radial-gradient(ellipse 90% 80% at 85% 80%, rgba(184, 140, 60, 0.22) 0%, transparent 60%),
    linear-gradient(165deg, #090c1d 0%, #0b1028 42%, #120f2f 100%);
}

.dna-particles-mentorship {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(circle at 12% 18%, rgba(232, 200, 114, 0.22) 0%, transparent 42%),
    radial-gradient(circle at 88% 76%, rgba(201, 162, 78, 0.2) 0%, transparent 45%),
    radial-gradient(circle at 55% 52%, rgba(184, 140, 60, 0.16) 0%, transparent 50%);
  animation: cosmic-drift-mentorship 18s ease-in-out infinite alternate;
}

.dna-particles-mentorship::before,
.dna-particles-mentorship::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 8% 15%, rgba(255, 255, 255, 0.85), transparent),
    radial-gradient(1.5px 1.5px at 18% 36%, rgba(196, 181, 253, 0.72), transparent),
    radial-gradient(2px 2px at 33% 66%, rgba(125, 211, 252, 0.68), transparent),
    radial-gradient(1.5px 1.5px at 48% 22%, rgba(255, 255, 255, 0.65), transparent),
    radial-gradient(2px 2px at 66% 58%, rgba(184, 140, 60, 0.62), transparent),
    radial-gradient(1.5px 1.5px at 82% 28%, rgba(125, 211, 252, 0.65), transparent),
    radial-gradient(2px 2px at 92% 78%, rgba(255, 255, 255, 0.72), transparent);
  animation: stars-twinkle-mentorship 10s ease-in-out infinite alternate;
}

.dna-particles-mentorship::after {
  background-size: 180% 180%;
  opacity: 0.55;
  filter: blur(0.2px);
  animation-duration: 14s;
  animation-direction: alternate-reverse;
}

@keyframes cosmic-drift-mentorship {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-1.5%, -1%, 0) scale(1.03); }
  100% { transform: translate3d(1.2%, 1.2%, 0) scale(1.01); }
}

@keyframes stars-twinkle-mentorship {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}

.mentorship-header {
  text-align: center;
  padding: 20px 0 30px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.26) 0%, rgba(184, 140, 60, 0.16) 100%);
  border: 1px solid rgba(125, 211, 252, 0.5);
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(232, 200, 114, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.mentorship-header .title {
  font-size: 2rem;
  margin: 0 0 8px;
  background: linear-gradient(90deg, #fff4d6, #e8c872, #e0e7ff);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
  font-weight: 800;
  text-shadow: 0 0 30px rgba(232, 200, 114, 0.5);
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin: 0;
}

.mentorship-layout {
  display: flex;
  gap: 24px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.mentorship-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.crystal-avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.22) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(221, 214, 254, 0.14) 100%);
  border: 1px solid rgba(125, 211, 252, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(25px);
  box-shadow: 0 0 40px rgba(232, 200, 114, 0.15);
}

.crystal-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.crystal-halo-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(125, 211, 252, 0.5);
  animation: pulse-ring 3s ease-in-out infinite;
}

.halo-ring-1 {
  inset: -15px;
  animation-delay: 0s;
}

.halo-ring-2 {
  inset: -30px;
  animation-delay: 0.5s;
  border-color: rgba(232, 200, 114, 0.35);
}

.halo-ring-3 {
  inset: -45px;
  animation-delay: 1s;
  border-color: rgba(184, 140, 60, 0.25);
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

.crystal-avatar {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b6914 0%, #e8c872 50%, #b8860b 100%);
  box-shadow: 
    0 0 50px rgba(125, 211, 252, 0.7),
    0 0 100px rgba(184, 140, 60, 0.35),
    inset 0 0 30px rgba(255, 255, 255, 0.4);
  animation: crystal-float 4s ease-in-out infinite;
}

@keyframes crystal-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.crystal-core {
  position: absolute;
  inset: 20%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.92), rgba(125, 211, 252, 0.78));
  animation: core-glow 2s ease-in-out infinite alternate;
}

@keyframes core-glow {
  0% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.8); }
}

.crystal-shine {
  position: absolute;
  top: 15%;
  left: 20%;
  width: 30%;
  height: 20%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6), transparent);
  border-radius: 50%;
  filter: blur(4px);
}

.floating-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #e8c872;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(232, 200, 114, 0.8);
}

.p1 { top: 10%; left: 50%; animation: float-particle 3s ease-in-out infinite; }
.p2 { top: 50%; right: 5%; animation: float-particle 3s ease-in-out infinite 0.5s; }
.p3 { bottom: 15%; left: 20%; animation: float-particle 3s ease-in-out infinite 1s; }
.p4 { top: 30%; right: 15%; animation: float-particle 3s ease-in-out infinite 1.5s; }
.p5 { bottom: 25%; right: 25%; animation: float-particle 3s ease-in-out infinite 2s; }

@keyframes float-particle {
  0%, 100% { opacity: 0.3; transform: translate(0, 0); }
  50% { opacity: 1; transform: translate(5px, -10px); }
}

.avatar-ring-glow {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 200, 114, 0.24) 0%, transparent 70%);
  animation: ring-rotate 10s linear infinite;
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-info {
  flex: 1;
}

.ai-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.ai-name {
  font-size: 1.5rem;
  color: #0369a1;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 0 20px rgba(232, 200, 114, 0.5);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-indicator.status-online {
  background: rgba(124, 58, 237, 0.15);
  color: #8b6914;
}

.status-indicator.status-thinking {
  background: rgba(232, 200, 114, 0.15);
  color: #c9a24e;
}

.status-indicator.status-listening {
  background: rgba(139, 105, 20, 0.15);
  color: #8b6914;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: status-blink 1s ease-in-out infinite;
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.ai-description {
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.ai-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.12) 0%, rgba(184, 140, 60, 0.08) 100%);
  border: 1px solid rgba(232, 200, 114, 0.24);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #0369a1;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.82) 0%, rgba(224, 242, 254, 0.5) 55%, rgba(237, 233, 254, 0.38) 100%);
  border: 1px solid rgba(125, 211, 252, 0.24);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(18px);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 300px;
  max-height: 400px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-message {
  display: flex;
  animation: message-in 0.3s ease-out;
}

@keyframes message-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message.user-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  position: relative;
}

.message-content {
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
}

.ai-message .message-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 242, 254, 0.65) 100%);
  border: 1px solid rgba(125, 211, 252, 0.22);
  color: var(--color-text-primary);
  border-bottom-left-radius: 4px;
}

.user-message .message-content {
  background: linear-gradient(135deg, #8b6914 0%, #e8c872 55%, #b8860b 100%);
  color: #f8fafc;
  border-bottom-right-radius: 4px;
}

.message-content p {
  margin: 0;
  font-size: 0.9rem;
}

.message-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: 4px;
  text-align: right;
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #e8c872;
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.chat-input-bar {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(125, 211, 252, 0.18);
  backdrop-filter: blur(14px);
}

.input-wrapper {
  flex: 1;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(125, 211, 252, 0.2);
  border-radius: 12px;
  padding: 4px;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 12px;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.chat-input:focus-visible {
  outline: 2px solid var(--fui-hot);
  outline-offset: 2px;
}

.chat-input::placeholder {
  color: var(--color-text-muted);
}

.voice-btn, .send-btn {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.voice-btn {
  background: rgba(139, 105, 20, 0.1);
  color: #8b6914;
}

.voice-btn:hover {
  background: rgba(139, 105, 20, 0.2);
  box-shadow: 0 0 15px rgba(139, 105, 20, 0.3);
}

.voice-btn.active {
  background: #8b6914;
  color: white;
  animation: voice-pulse 1s ease-in-out infinite;
}

@keyframes voice-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(139, 105, 20, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(139, 105, 20, 0); }
}

.send-btn {
  background: linear-gradient(135deg, #8b6914 0%, #e8c872 55%, #b8860b 100%);
  color: #f8fafc;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(232, 200, 114, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mentorship-sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-selection-card, .quick-prompts-card {
  background: linear-gradient(155deg, rgba(255, 255, 255, 0.78) 0%, rgba(224, 242, 254, 0.55) 55%, rgba(237, 233, 254, 0.4) 100%);
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(22px) saturate(1.08);
}

.sidebar-title {
  font-size: 1rem;
  color: #0369a1;
  margin: 0 0 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #e8c872, #b8860b);
  border-radius: 2px;
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.role-card {
  position: relative;
  padding: 16px 12px;
  background: rgba(232, 200, 114, 0.05);
  border: 1px solid rgba(125, 211, 252, 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.role-card:hover {
  background: rgba(232, 200, 114, 0.1);
  border-color: rgba(125, 211, 252, 0.35);
  transform: translateY(-2px);
}

.role-card.selected {
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.18) 0%, rgba(184, 140, 60, 0.12) 100%);
  border-color: rgba(125, 211, 252, 0.85);
  box-shadow: 0 0 20px rgba(232, 200, 114, 0.22);
}

.role-selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8c872;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.role-card.selected .role-selected-indicator {
  opacity: 1;
  transform: scale(1);
  box-shadow: 0 0 10px rgba(232, 200, 114, 0.6);
}

.role-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(232, 200, 114, 0.12) 0%, rgba(184, 140, 60, 0.08) 100%);
  border-radius: 10px;
  color: #0369a1;
}

.role-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-desc {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-btn {
  padding: 10px 14px;
  background: rgba(232, 200, 114, 0.05);
  border: 1px solid rgba(125, 211, 252, 0.1);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
}

.prompt-btn:hover {
  background: rgba(232, 200, 114, 0.1);
  border-color: rgba(125, 211, 252, 0.3);
  color: #0369a1;
}

.mentorship-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid rgba(125, 211, 252, 0.1);
  position: relative;
  z-index: 1;
}

.mentorship-footer .btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

/* 琉璃蓝主题覆盖：与深空背景协调 */
.mentorship-view :is(.header-icon, .crystal-avatar-section, .chat-section, .role-selection-card, .quick-prompts-card) {
  border-color: rgba(201, 162, 78, 0.38) !important;
  box-shadow: 0 18px 44px rgba(3, 6, 24, 0.5), 0 0 30px rgba(139, 105, 20, 0.18) !important;
}

.mentorship-view :is(.crystal-avatar-section, .chat-section, .role-selection-card, .quick-prompts-card) {
  background: linear-gradient(145deg, rgba(8, 12, 30, 0.8), rgba(16, 24, 48, 0.72), rgba(38, 31, 80, 0.56)) !important;
  backdrop-filter: blur(22px) saturate(1.15) !important;
}

.mentorship-view .header-icon,
.mentorship-view .send-btn,
.mentorship-view .sidebar-title::before,
.mentorship-view .role-card.selected,
.mentorship-view .role-icon {
  background: linear-gradient(135deg, #8b6914 0%, #e8c872 52%, #b8860b 100%) !important;
  color: #f8fafc !important;
}

.mentorship-view .chat-input-bar,
.mentorship-view .input-wrapper,
.mentorship-view .prompt-btn {
  border-color: rgba(201, 162, 78, 0.42) !important;
  background: linear-gradient(135deg, rgba(15, 22, 44, 0.78), rgba(28, 34, 68, 0.7), rgba(54, 45, 99, 0.6)) !important;
}

.mentorship-view :is(.subtitle, .ai-description, .mentor-advice, .role-desc, .chat-input::placeholder, .message-time) {
  color: #a5b4fc !important;
}

.mentorship-view :is(.ai-name, .sidebar-title, .mentor-title, .role-name, .prompt-btn, .chat-input, .message-content) {
  color: #e0e7ff !important;
}

.mentorship-view .send-btn:hover:not(:disabled),
.mentorship-view .prompt-btn:hover,
.mentorship-view .role-card:hover {
  box-shadow: 0 0 22px rgba(232, 200, 114, 0.35) !important;
}

.mentorship-view .typing-indicator span,
.mentorship-view .role-selected-indicator {
  background: #e8c872 !important;
  box-shadow: 0 0 12px rgba(232, 200, 114, 0.5) !important;
}

.mentorship-view .mentorship-header .title,
.mentorship-view .sidebar-title,
.mentorship-view .ai-tag {
  color: #c7d2fe !important;
  text-shadow: 0 0 18px rgba(201, 162, 78, 0.36) !important;
}

.mentorship-view .header-icon,
.mentorship-view .send-btn {
  animation: gradient-shift 5s ease infinite !important;
  background-size: 220% 220% !important;
}
</style>
