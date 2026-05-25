<template>
  <div class="tree-branch">
    <div class="tree-node-wrap">
      <div class="tree-connector" v-if="hasChildren"></div>
      <div
        class="tree-node-card"
        :class="[{ active: selectedNode === node.id }, levelClass]"
        @click.stop="$emit('select-node', node.id)"
        :title="node.description"
      >
        <span class="node-title">{{ node.title }}</span>
        <div class="node-branch-count" v-if="hasChildren">{{ children.length }}</div>
      </div>
    </div>

    <div class="tree-children" v-if="children.length">
      <TreeBranch
        v-for="child in children"
        :key="child.id"
        :node="child"
        :selectedNode="selectedNode"
        :level="level + 1"
        @select-node="$emit('select-node', $event)"
        @edit-node="$emit('edit-node', $event)"
        @delete-node="$emit('delete-node', $event)"
        @extend-branch="$emit('extend-branch', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, defineOptions } from 'vue'

defineOptions({ name: 'TreeBranch' })

const props = defineProps({
  node: { type: Object, required: true },
  nodes: { type: Array, required: true },
  selectedNode: { type: [String, Number], required: true },
  level: { type: Number, default: 1 }
})

defineEmits(['select-node', 'edit-node', 'delete-node', 'extend-branch'])

const children = computed(() => {
  const childIds = Array.isArray(props.node.children) ? props.node.children : []
  return childIds
    .map((childId) => props.nodes.find((candidate) => candidate.id === childId))
    .filter(Boolean)
})

const hasChildren = computed(() => children.value.length > 0)
const levelClass = computed(() => `level-${Math.min(props.level, 6)}`)
</script>

<style scoped>
.tree-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 12px;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.tree-node-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.tree-connector {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 12px;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.45), rgba(167, 139, 250, 0.25));
  opacity: 0.85;
}

.tree-connector::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  width: 16px;
  height: 2px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);
  opacity: 0.85;
}

.tree-node-card {
  position: relative;
  min-width: 140px;
  max-width: 160px;
  padding: 12px 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.55) 0%, rgba(224, 242, 254, 0.38) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 16px;
  cursor: pointer;
  transition: var(--transition-smooth);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 0 8px 28px rgba(14, 116, 185, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.85);
  overflow: hidden;
}

.tree-node-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.95), rgba(167, 139, 250, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.tree-node-card:hover {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72) 0%, rgba(224, 242, 254, 0.52) 100%);
  border-color: rgba(125, 211, 252, 0.85);
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 14px 40px rgba(56, 189, 248, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.tree-node-card:hover::before {
  opacity: 1;
}

.tree-node-card.active {
  border-color: rgba(56, 189, 248, 0.75);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.82) 0%, rgba(224, 242, 254, 0.58) 100%);
  box-shadow: 0 16px 44px rgba(14, 165, 233, 0.22), 0 0 0 1px rgba(125, 211, 252, 0.45);
  transform: translateY(-8px);
}

.tree-node-card.level-1 {
  min-width: 160px;
  max-width: 180px;
  padding: 14px 18px;
  border-width: 1.5px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.62) 0%, rgba(224, 242, 254, 0.42) 100%);
}

.tree-node-card.level-1 .node-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0c4a6e;
}

.tree-node-card.level-1:hover .node-title {
  color: #0369a1;
}

.tree-node-card.level-2 {
  min-width: 150px;
  max-width: 170px;
  padding: 12px 16px;
}

.tree-node-card.level-2 .node-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.tree-node-card.level-3,
.tree-node-card.level-4,
.tree-node-card.level-5,
.tree-node-card.level-6 {
  min-width: 130px;
  max-width: 150px;
  padding: 10px 14px;
}

.tree-node-card.level-3 .node-title,
.tree-node-card.level-4 .node-title,
.tree-node-card.level-5 .node-title,
.tree-node-card.level-6 .node-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.node-title {
  color: #1e3a5f;
  text-align: center;
  line-height: 1.5;
  word-break: break-word;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: color 0.3s, text-shadow 0.3s;
  display: block;
}

.tree-node-card:hover .node-title {
  color: #0369a1;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
}

.tree-node-card.active .node-title {
  color: #075985;
  text-shadow: 0 0 14px rgba(14, 165, 233, 0.35);
}

.node-branch-count {
  font-size: 0.7rem;
  font-weight: 500;
  color: #0369a1;
  background: rgba(224, 242, 254, 0.85);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
  letter-spacing: 0.02em;
  border: 1px solid rgba(125, 211, 252, 0.45);
}

.tree-children {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  padding: 6px 8px 0;
  position: relative;
  flex-wrap: wrap;
}

.tree-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(100% - 40px);
  height: 2px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.35), transparent);
  opacity: 0.75;
}

@media (max-width: 1024px) {
  .tree-branch {
    gap: 10px;
  }

  .tree-node-wrap {
    padding-top: 8px;
  }

  .tree-connector {
    height: 10px;
  }

  .tree-connector::after {
    top: 10px;
    width: 12px;
  }

  .tree-children {
    gap: 12px;
  }

  .tree-node-card.level-1 .node-title {
    font-size: 0.95rem;
  }

  .tree-node-card.level-2 .node-title {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .tree-branch {
    gap: 8px;
  }

  .tree-node-card {
    min-width: 120px;
    max-width: 140px;
    padding: 10px 12px;
  }

  .tree-node-card.level-1 {
    min-width: 130px;
    max-width: 150px;
  }

  .tree-node-card.level-1 .node-title,
  .tree-node-card.level-2 .node-title,
  .tree-node-card.level-3 .node-title,
  .tree-node-card.level-4 .node-title {
    font-size: 0.85rem;
  }

  .tree-children {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  .tree-children::before {
    display: none;
  }
}

@media (max-width: 480px) {
  .tree-node-card {
    min-width: 110px;
    max-width: 130px;
    padding: 8px 10px;
  }

  .tree-node-card.level-1 {
    min-width: 120px;
    max-width: 140px;
  }

  .node-title {
    font-size: 0.8rem;
  }

  .node-branch-count {
    font-size: 0.65rem;
    padding: 1px 6px;
  }
}
</style>