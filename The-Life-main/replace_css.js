const fs=require('fs'); let code=fs.readFileSync('src/App.vue','utf8');
const oldCss = \
.tree-nodes {
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
}
\;
const newCss = \
.tree-org {
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
  width: 220px;
  padding: 1.5rem;
  border-radius: 20px;
  margin: 0;
  cursor: pointer;
  transition: var(--transition-smooth);
  position: relative;
  z-index: 2;
}
\;

code = code.replace(oldCss.trim(), newCss.trim());

const childCssOld = \
.first-level-children {
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
}
\;
code = code.replace(childCssOld.trim(), '');

fs.writeFileSync('src/App.vue', code);
console.log('CSS Replaced successfully');

