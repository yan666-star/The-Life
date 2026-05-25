<template>
  <div v-if="show" class="dialog-overlay" @click.self="cancel">
    <div class="dialog-box">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="cancel">×</button>
      </div>
      <div class="dialog-body">
        <p>{{ message }}</p>
        <input 
          v-model="inputValue" 
          :type="inputType" 
          class="dialog-input" 
          :placeholder="placeholder"
          @keydown.enter="confirm"
          autoFocus
        >
      </div>
      <div class="dialog-actions">
        <button class="btn btn-secondary" @click="cancel">取消</button>
        <button class="btn btn-primary" @click="confirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '输入信息' },
  message: { type: String, required: true },
  placeholder: { type: String, default: '' },
  defaultValue: { type: String, default: '' },
  inputType: { type: String, default: 'text' }
})

const emit = defineEmits(['confirm', 'cancel'])

const inputValue = ref(props.defaultValue)

watch(() => props.show, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue
  }
})

const confirm = () => {
  emit('confirm', inputValue.value)
  inputValue.value = ''
}

const cancel = () => {
  emit('cancel')
  inputValue.value = ''
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-box {
  background: linear-gradient(180deg, rgba(255, 249, 239, 0.98), rgba(241, 226, 208, 0.95));
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(108, 85, 62, 0.3);
  max-width: 420px;
  width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(140, 115, 88, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: rgba(44, 36, 27, 0.9);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: rgba(44, 36, 27, 0.6);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: rgba(44, 36, 27, 0.9);
}

.dialog-body {
  padding: 24px;
}

.dialog-body p {
  margin: 0 0 16px;
  color: rgba(44, 36, 27, 0.78);
  font-size: 0.95rem;
}

.dialog-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(140, 115, 88, 0.2);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.6);
  color: rgba(44, 36, 27, 0.9);
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
}

.dialog-input:focus {
  border-color: rgba(226, 163, 90, 0.6);
  background: rgba(255, 255, 255, 0.95);
}

.dialog-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(140, 115, 88, 0.12);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(180deg, rgba(226, 163, 90, 0.9), rgba(211, 143, 73, 0.85));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(226, 163, 90, 0.3);
}

.btn-secondary {
  background: rgba(247, 243, 235, 0.8);
  color: rgba(44, 36, 27, 0.78);
  border: 1px solid rgba(140, 115, 88, 0.2);
}

.btn-secondary:hover {
  background: rgba(241, 226, 208, 0.9);
  border-color: rgba(140, 115, 88, 0.3);
}
</style>
