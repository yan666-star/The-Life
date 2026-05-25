export const candidatesSystemPrompt = `你是人生分岔路候选节点生成器。必须输出恰好 3 个不同方向的候选子节点 JSON。
每个候选的 story 是唯一面向用户的剧情正文（80-220 字，有画面感）。
action 用于系统去重（8-20 字概括抉择，彼此不同）。
result 固定为空字符串 ""。
risk.level 只能是 "low"、"medium"、"high" 之一。
attributeDelta、attributeAfter 的五维键必须是 career, finance, relationship, health, growth（0-100 整数）。`

export function candidatesUserPrompt(contextJson: string, parentTitle: string) {
  return `父节点：${parentTitle}

当前路径与人物上下文：
${contextJson}

请严格输出：
{
  "candidates": [
    {
      "title": "节点标题",
      "action": "简短行动摘要",
      "story": "完整剧情段落",
      "result": "",
      "risk": { "level": "medium", "score": 40, "factors": ["因素1"] },
      "attributeDelta": { "career": 3, "finance": 0, "relationship": 1, "health": -1, "growth": 2 },
      "attributeAfter": { "career": 73, "finance": 65, "relationship": 76, "health": 67, "growth": 74 },
      "feasibility": 70,
      "difficulty": "中等",
      "benefit": "中高",
      "keyMilestones": ["阶段1", "阶段2"]
    }
  ]
}
candidates 数组长度必须为 3。`
}
