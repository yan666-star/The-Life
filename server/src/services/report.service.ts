import { prisma } from '../lib/prisma.js'
import { toJson, safeJsonParse } from '../lib/json.js'
import {
  parseAttributes,
  attributeGaps,
  computeRegretBaseScore,
} from '../lib/attributes.js'
import { ATTR_KEYS } from '../config.js'
import { getModelProvider } from '../providers/registry.js'
import { finalReportAiSchema } from '../schemas/attributes.js'
import {
  finalReportSystemPrompt,
  finalReportUserPrompt,
} from '../prompts/final-report.js'
import { buildPathContext } from '../builders/path-context.builder.js'
import { getSessionOrThrow } from './session.service.js'
import { AppError, ErrorCodes } from '../lib/errors.js'
import { getChatHistory } from './mentorship.service.js'

export async function generateFinalReport(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const ctx = await buildPathContext(sessionId)
  if (!ctx) {
    throw new AppError(ErrorCodes.SESSION_NOT_FOUND, 'No session context', 404)
  }

  const target = ctx.targetAttributes
  const current = ctx.currentAttributes
  const gaps = attributeGaps(target, current)

  let volatility = 0
  const hist = await prisma.attributeSnapshot.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: 2,
  })
  if (hist.length === 2) {
    for (const k of ATTR_KEYS) {
      volatility += Math.abs(
        (hist[0] as Record<string, number>)[k] - (hist[1] as Record<string, number>)[k]
      )
    }
  }

  const regretBase = computeRegretBaseScore(target, current, volatility)
  const lastNode = ctx.lastChosenNode

  const chat = await getChatHistory(sessionId)
  const recentChatSummary = chat.sessions
    .flatMap((s) => s.messages.filter((m) => m.role === 'user').slice(-1))
    .slice(-3)
    .map((m) => m.content)

  const payload = {
    character: ctx.character,
    targetAttributes: target,
    currentAttributes: current,
    attributeGaps: gaps,
    regretBaseScore: regretBase,
    pathSummaries: ctx.pathSummaries,
    lastChosenNode: lastNode
      ? {
          id: lastNode.id,
          title: lastNode.title,
          story: lastNode.story,
          action: lastNode.action,
          result: lastNode.result,
          payload: safeJsonParse(lastNode.payloadJson, {}),
        }
      : null,
    recentChatSummary,
  }

  const provider = getModelProvider()
  let aiPart = {
    regretLevel: regretBase,
    regretText: regretBase > 60 ? '存在较高后悔风险' : regretBase > 30 ? '略有遗憾' : '后悔风险可控',
    pathSummary: ctx.pathSummaries.map((p) => p.summary).join(' → '),
    finalAnalysis: `当前五维与目标存在差距，最大缺口在 ${ATTR_KEYS.map((k) => ({ k, g: gaps[k] })).sort((a, b) => b.g - a.g)[0]?.k}。`,
    lifeAdvice: '建议根据目标五维优先补齐短板，并保持路径连贯性。',
    goalAlignment: ATTR_KEYS.map((k) => ({
      key: k,
      target: target[k],
      current: current[k],
      gap: gaps[k],
      comment: gaps[k] > 0 ? '尚未达成目标' : '已达成或超越目标',
    })),
    missedSignals: [] as string[],
    nextActions: ['复盘最后节点选择', '调整下一阶段行动'] as string[],
  }

  try {
    aiPart = await provider.generateJson({
      systemPrompt: finalReportSystemPrompt,
      userPrompt: finalReportUserPrompt(toJson(payload)),
      schema: finalReportAiSchema,
      timeoutMs: 180000,
    })
  } catch {
    // keep rule-based fallback
  }

  const report = {
    id: undefined as string | undefined,
    sessionId,
    generatedAt: new Date().toISOString(),
    lastChosenNodeId: lastNode?.id ?? null,
    lastChosenNodeTitle: lastNode?.title ?? '未选择节点',
    targetAttributes: target,
    currentAttributes: current,
    attributeGaps: gaps,
    regretLevel: Math.min(100, Math.max(0, Math.round(aiPart.regretLevel ?? regretBase))),
    regretText: aiPart.regretText,
    goalAlignment: aiPart.goalAlignment,
    pathSummary: aiPart.pathSummary,
    finalAnalysis: aiPart.finalAnalysis,
    lifeAdvice: aiPart.lifeAdvice,
    missedSignals: aiPart.missedSignals ?? [],
    nextActions: aiPart.nextActions ?? [],
    regretBaseScore: regretBase,
  }

  const saved = await prisma.finalReport.create({
    data: { sessionId, dataJson: toJson(report) },
  })
  report.id = saved.id

  return report
}

export async function getCurrentReport(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const latest = await prisma.finalReport.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  })
  if (!latest) {
    throw new AppError(ErrorCodes.REPORT_NOT_FOUND, 'No final report', 404)
  }
  return safeJsonParse(latest.dataJson, {})
}

export async function exportReport(sessionId: string) {
  return getCurrentReport(sessionId)
}
