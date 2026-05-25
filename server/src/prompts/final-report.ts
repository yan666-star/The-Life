export const finalReportSystemPrompt = `你是人生分岔路终局分析引擎。比较目标五维与当前五维，结合最后已选节点与完整路径，输出后悔指数与分析。输出 JSON。`

export function finalReportUserPrompt(payload: string) {
  return `终局分析输入：\n${payload}\n\n输出 regretLevel(0-100), regretText, goalAlignment[], pathSummary, finalAnalysis, lifeAdvice, missedSignals, nextActions`
}
