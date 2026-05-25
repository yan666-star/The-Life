import { ATTR_KEYS, type AttrKey } from '../config.js'

/** 五维中文标签（提示词与日志共用） */
export const ATTR_LABELS_ZH: Record<AttrKey, string> = {
  career: '职业',
  finance: '财务',
  relationship: '人际',
  health: '健康',
  growth: '成长',
}

/** 分叉选择模拟：与 plan PathContextBuilder 对齐的连贯性约束 */
export const BRANCH_SIMULATION_RULES = `分叉选择模拟规则：
1. 仅依据上下文中的 character、五维、activePath 摘要与 recentFullNodes 推演，不得虚构用户未走过的节点。
2. 必须输出恰好 3 个互斥方向；action 彼此不同且不与 pathSummaries 中已有 action 重复。
3. 每个 story 必须承接 lastChosenNode 或路径末端剧情，80-220 字、有具体场景。
4. attributeDelta 需与 currentAttributes、attributeGaps 合理匹配（缺口大的维度可给更大正向 delta）。
5. attributeAfter = currentAttributes + attributeDelta（五维 clamp 0-100）；result 固定为 ""。
6. 勿输出未选候选、枯枝或未在上下文出现的剧情。`

export function formatAttributeDelta(delta: Partial<Record<AttrKey, number>>): string {
  return ATTR_KEYS.map((k) => {
    const n = Number(delta[k])
    if (!Number.isFinite(n) || n === 0) return `${ATTR_LABELS_ZH[k]}:0`
    return `${ATTR_LABELS_ZH[k]}:${n > 0 ? `+${Math.round(n)}` : Math.round(n)}`
  }).join(' ')
}

export function formatAttributeGapsReadable(
  gaps: Record<AttrKey, number>
): Record<AttrKey, string> {
  const out = {} as Record<AttrKey, string>
  for (const k of ATTR_KEYS) {
    const g = gaps[k]
    if (g > 0) out[k] = `距目标还差 ${g}`
    else if (g < 0) out[k] = `已超目标 ${-g}`
    else out[k] = '已达目标'
  }
  return out
}
