# 🎯 快速参考卡

## 📍 文件导航

### 新增文件（2个）
```
src/
├── components/
│   ├── ComparisonView.vue       ← 双窗对比主组件 (520行)
│   └── AttributesSidebar.vue    ← 属性侧栏组件 (380行)
```

### 修改文件（4个）
```
src/
├── App.vue                      ← +ComparisonView 导入和路由
├── style.css                    ← +80个新类，+20个新变量
└── components/
    ├── ViewNav.vue             ← +对比导航步骤
    └── DivergenceView.vue       ← +对比入口按钮
```

---

## 🎨 核心色彩速查

| 用途 | 十六进制 | RGB |
|------|---------|-----|
| 主金色 | #d4a574 | 212, 165, 116 |
| 明亮金 | #ffd700 | 255, 215, 0 |
| 温暖金 | #ffbf00 | 255, 191, 0 |
| 成功绿 | #00d084 | 0, 208, 132 |
| 危险红 | #ff6b6b | 255, 107, 107 |
| 信息蓝 | #4a9eff | 74, 158, 255 |

---

## ⌨️ 快速命令

```bash
# 启动开发
npm run dev

# 构建生产
npm run build

# 预览生产版本
npm run preview
```

---

## 🧩 组件使用示例

### 使用 ComparisonView
```vue
<template>
  <ComparisonView
    :routes="compareRoutes"
    :attributes="attributes"
    @go-back="goBack"
    @confirm-selection="confirm"
  />
</template>

<script setup>
import ComparisonView from '@/components/ComparisonView.vue'
</script>
```

### 使用 AttributesSidebar
```vue
<template>
  <AttributesSidebar 
    :attributes="{ career: 65, finance: 55, ... }"
    :showTrendPreview="true"
  />
</template>

<script setup>
import AttributesSidebar from '@/components/AttributesSidebar.vue'
</script>
```

---

## 🔄 数据结构参考

### 路线对象
```javascript
{
  id: "ai_route_123",
  title: "科技职业道路",
  type: "科技职业道路",
  description: "进入知名科技公司...",
  feasibility: 82,          // 0-100
  difficulty: "中等",       // 低/中等/高
  benefit: "高",            // 低/中等/高/极高
  tag: "推荐",
  tagColor: "high",
  impacts: {
    career: 80,
    finance: 75,
    relationship: 45,
    health: 50,
    growth: 85
  }
}
```

### 属性对象
```javascript
{
  职业发展: 65,
  财务状况: 55,
  人际关系: 70,
  健康状态: 60,
  个人成长: 75
}
```

---

## 🎬 动画类名

| 类名 | 效果 |
|------|------|
| `.fade-in` | 淡入 |
| `.fade-in-scale` | 缩放淡入 |
| `.slide-in-left` | 左滑淡入 |
| `.slide-in-right` | 右滑淡入 |
| `.float` | 浮动 |

---

## 🔑 常用 CSS 变量

```css
/* 颜色变量 */
--color-accent-gold: #d4a574;
--color-accent-gold-bright: #ffd700;
--color-text-primary: #f5e6d3;
--color-text-secondary: #d4c4b0;

/* 间距变量 */
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* 过渡变量 */
--transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: all 0.6s cubic-bezier(0.68, -0.3, 0.265, 1.3);
```

---

## 🐛 常见问题

### 滑块对比不响应？
- 检查 `.slider-container` 的宽度
- 确保 JavaScript 事件监听已绑定
- 清除浏览器缓存重新加载

### 属性值不更新？
- 确保 props 传入了正确的属性对象
- 检查数据绑定是否双向
- 验证计算属性逻辑

### 样式不生效？
- 检查 CSS 变量是否在根元素定义
- 清除 Vite 缓存：`rm -rf .vite`
- 验证 CSS Scope 是否冲突

---

## 📞 支持

- 文档: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- 验收清单: [ACCEPTANCE_CHECKLIST.md](ACCEPTANCE_CHECKLIST.md)
- 问题报告: 请包括浏览器版本和错误日志

