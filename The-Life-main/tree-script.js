const fs = require('fs');
let code = fs.readFileSync('src/App.vue', 'utf-8');

const htmlOld = \            <div class="tree-nodes">
              <!-- 主节点 -->
              <div class="node main-node" :class="{ active: selectedNode === 'current' }" @click="selectNode('current')">
                <div class="node-content">
                  <h3>{{ treeNodes.find(n => n.id === 'current')?.title }}</h3>
                  <p>{{ treeNodes.find(n => n.id === 'current')?.description }}</p>
                  <div class="node-actions">
                    <button class="btn btn-secondary small" @click="editNode('current')">编辑</button>
                    <button class="btn btn-secondary small" @click="deleteNode('current')">删除</button>
                    <button class="btn btn-secondary small" @click="extendBranch('current')">延伸分支</button>
                  </div>
                </div>
              </div>
              
              <!-- 一级子节点 - 水平布局 -->
              <div class="first-level-children">
                <div v-for="childId in treeNodes.find(n => n.id === 'current')?.children" :key="childId" class="node branch-node" :class="{ active: selectedNode === childId }" @click="selectNode(childId)">
                  <div class="node-content">
                    <h3>{{ treeNodes.find(n => n.id === childId)?.title }}</h3>
                    <p>{{ treeNodes.find(n => n.id === childId)?.description }}</p>
                    <div class="node-actions">
                      <button class="btn btn-secondary small" @click="editNode(childId)">编辑</button>
                      <button class="btn btn-secondary small" @click="deleteNode(childId)">删除</button>
                      <button class="btn btn-secondary small" @click="extendBranch(childId)">延伸分支</button>
                    </div>
                  </div>
                  
                  <!-- 二级子节点 -->
                  <div v-if="treeNodes.find(n => n.id === childId)?.children && treeNodes.find(n => n.id === childId)?.children.length > 0" class="second-level-children">
                    <div v-for="grandchildId in treeNodes.find(n => n.id === childId)?.children" :key="grandchildId" class="node branch-node small-node" :class="{ active: selectedNode === grandchildId }" @click="selectNode(grandchildId)">
                      <div class="node-content">
                        <h3>{{ treeNodes.find(n => n.id === grandchildId)?.title }}</h3>
                        <p>{{ treeNodes.find(n => n.id === grandchildId)?.description }}</p>
                        <div class="node-actions">
                          <button class="btn btn-secondary small" @click="editNode(grandchildId)">编辑</button>
                          <button class="btn btn-secondary small" @click="deleteNode(grandchildId)">删除</button>
                          <button class="btn btn-secondary small" @click="extendBranch(grandchildId)">延伸分支</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>\;

const htmlNew = \            <div class="tree-org">
              <div class="tree-org-node-group">
                <!-- 主节点 -->
                <div class="node main-node" :class="{ active: selectedNode === 'current' }" @click="selectNode('current')">
                  <div class="node-content">
                    <h3>{{ treeNodes.find(n => n.id === 'current')?.title }}</h3>
                    <p>{{ treeNodes.find(n => n.id === 'current')?.description }}</p>
                    <div class="node-actions">
                      <button class="btn btn-secondary small" @click.stop="editNode('current')">编辑</button>
                      <button class="btn btn-secondary small" @click.stop="deleteNode('current')">删除</button>
                      <button class="btn btn-secondary small" @click.stop="extendBranch('current')">延伸分支</button>
                    </div>
                  </div>
                </div>
                
                <!-- 一级子节点群 -->
                <div class="tree-org-children" v-if="treeNodes.find(n => n.id === 'current')?.children && treeNodes.find(n => n.id === 'current')?.children.length > 0">
                  <div v-for="childId in treeNodes.find(n => n.id === 'current')?.children" :key="childId" class="tree-org-node-group">
                    <div class="node branch-node" :class="{ active: selectedNode === childId }" @click="selectNode(childId)">
                      <div class="node-content">
                        <h3>{{ treeNodes.find(n => n.id === childId)?.title }}</h3>
                        <p>{{ treeNodes.find(n => n.id === childId)?.description }}</p>
                        <div class="node-actions">
                          <button class="btn btn-secondary small" @click.stop="editNode(childId)">编辑</button>
                          <button class="btn btn-secondary small" @click.stop="deleteNode(childId)">删除</button>
                          <button class="btn btn-secondary small" @click.stop="extendBranch(childId)">延伸分支</button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 二级子节点群 -->
                    <div class="tree-org-children" v-if="treeNodes.find(n => n.id === childId)?.children && treeNodes.find(n => n.id === childId)?.children.length > 0">
                      <div v-for="grandchildId in treeNodes.find(n => n.id === childId)?.children" :key="grandchildId" class="tree-org-node-group">
                        <div class="node branch-node small-node" :class="{ active: selectedNode === grandchildId }" @click="selectNode(grandchildId)">
                          <div class="node-content">
                            <h3>{{ treeNodes.find(n => n.id === grandchildId)?.title }}</h3>
                            <p>{{ treeNodes.find(n => n.id === grandchildId)?.description }}</p>
                            <div class="node-actions">
                              <button class="btn btn-secondary small" @click.stop="editNode(grandchildId)">编辑</button>
                              <button class="btn btn-secondary small" @click.stop="deleteNode(grandchildId)">删除</button>
                              <button class="btn btn-secondary small" @click.stop="extendBranch(grandchildId)">延伸分支</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>\;

// Replace HTML
let newCode = code.replace(htmlOld, htmlNew);
if(newCode === code) {
  console.log('HTML replace failed. Maybe whitespace difference.');
  // regex fallback if needed
}

// Replace CSS
const cssOld = \.tree-nodes {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.node {
  width: 200px;
  padding: 1.5rem;
  border-radius: 20px;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
}

.node::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  width: 2px;
  height: 10px;
  background: var(--glass-border);
  transform: translateX(-50%);
}

.node:first-child::before {
  display: none;
}\;

const cssNew = \.tree-org {
  display: flex;
  justify-content: center;
  padding: 1rem;
  overflow-x: auto;
}

.tree-org-children {
  display: flex;
  justify-content: center;
  position: relative;
  padding-top: 3rem;
}

.tree-org-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 3rem;
  background: rgba(220, 200, 180, 0.8);
  transform: translateX(-50%);
}

.tree-org-node-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 3rem 1rem 0 1rem;
}

.tree-org > .tree-org-node-group {
  padding-top: 0;
}

.tree-org-node-group::before {
  content: '';
  position: absolute;
  top: 0;
  right: 50%;
  width: 50%;
  height: 3rem;
  border-top: 2px solid rgba(220, 200, 180, 0.8);
}

.tree-org-node-group::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 3rem;
  border-top: 2px solid rgba(220, 200, 180, 0.8);
  border-left: 2px solid rgba(220, 200, 180, 0.8);
}

.tree-org-children > .tree-org-node-group:first-child::before {
  border-top: none;
}

.tree-org-children > .tree-org-node-group:last-child::after {
  border-top: none;
}

.tree-org-children > .tree-org-node-group:last-child::before {
  border-right: 2px solid rgba(220, 200, 180, 0.8);
  border-radius: 0 12px 0 0;
}

.tree-org-children > .tree-org-node-group:first-child::after {
  border-radius: 12px 0 0 0;
}

.tree-org-children > .tree-org-node-group:only-child::after {
  border-top: none;
}

.tree-org-children > .tree-org-node-group:only-child::before {
  border-top: none;
  border-right: 2px solid rgba(220, 200, 180, 0.8);
  border-radius: 0;
}

.node {
  width: 200px;
  padding: 1.5rem;
  border-radius: 20px;
  margin: 0;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
  z-index: 2;
}\;

newCode = newCode.replace(cssOld, cssNew);

// Remove the old first-level and second-level CSS entirely
const cssRemove = \.first-level-children {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

.second-level-children {
  display: flex;
  gap: 1.8rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}\;
newCode = newCode.replace(cssRemove, '');

fs.writeFileSync('src/App.vue', newCode);
console.log('Update finished.');
