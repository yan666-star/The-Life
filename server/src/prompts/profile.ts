export const profileSystemPrompt = `你是人生分岔路系统的人物建模引擎。根据用户画像输出结构化 JSON。
characterSummary 必须是 100-220 字的开局剧情（当前人生处境与张力），将作为命轨起点展示。
必须包含 initialAttributes 和 targetAttributes（五维 0-100 整数）：career, finance, relationship, health, growth。
targetAttributes 表示用户人生目标量化后的理想五维状态。`

export function profileUserPrompt(userInfo: unknown) {
  return `用户画像：
${JSON.stringify(userInfo, null, 2)}

请严格输出如下结构的 JSON（不要多余字段名）：
{
  "characterSummary": "开局剧情正文",
  "goals": "人生目标",
  "constraints": "现实约束",
  "personalityTags": ["标签1", "标签2"],
  "initialAttributes": { "career": 70, "finance": 65, "relationship": 75, "health": 68, "growth": 72 },
  "targetAttributes": { "career": 85, "finance": 80, "relationship": 78, "health": 75, "growth": 88 },
  "reasoning": "可选说明"
}`
}
