import { prisma } from '../lib/prisma.js'
import { toJson, safeJsonParse } from '../lib/json.js'
import { attributeGaps } from '../lib/attributes.js'
import { getModelProvider } from '../providers/registry.js'
import { mentorReplySchema } from '../schemas/attributes.js'
import {
  MENTOR_ROLES,
  mentorSystemPrompt,
  mentorUserPrompt,
} from '../prompts/mentorship.js'
import {
  buildPathContext,
  pathContextToPromptText,
} from '../builders/path-context.builder.js'
import { getSessionOrThrow } from './session.service.js'
import { getComparison } from './comparison.service.js'

export function listMentorRoles() {
  return MENTOR_ROLES
}

async function getOrCreateChatSession(sessionId: string, mentorRole: string) {
  return prisma.chatSession.upsert({
    where: { sessionId_mentorRole: { sessionId, mentorRole } },
    create: { sessionId, mentorRole },
    update: {},
  })
}

export async function sendMentorMessage(
  sessionId: string,
  mentorRole: string,
  message: string,
  includeComparison = false
) {
  await getSessionOrThrow(sessionId)
  const ctx = await buildPathContext(sessionId)
  const gaps = ctx
    ? attributeGaps(ctx.targetAttributes, ctx.currentAttributes)
    : {}

  let contextObj: Record<string, unknown> = {
    pathContext: ctx ? JSON.parse(pathContextToPromptText(ctx)) : {},
    attributeGaps: gaps,
  }
  if (includeComparison) {
    const comp = await getComparison(sessionId)
    contextObj.comparison = {
      left: comp.left?.packet,
      right: comp.right?.packet,
    }
  }

  const chatSession = await getOrCreateChatSession(sessionId, mentorRole)

  await prisma.chatMessage.create({
    data: {
      chatSessionId: chatSession.id,
      role: 'user',
      mentorRole,
      content: message,
      contextSnapshotJson: toJson({
        lastChosenNodeId: ctx?.lastChosenNode?.id,
        currentAttributes: ctx?.currentAttributes,
      }),
    },
  })

  const history = await prisma.chatMessage.findMany({
    where: { chatSessionId: chatSession.id },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  const provider = getModelProvider()
  let replyText = ''
  let structured: {
    directAnswer: string
    rolePerspective: string
    suggestedActions?: string[]
    followUpQuestion?: string
  } | null = null

  try {
    structured = await provider.generateJson({
      systemPrompt: mentorSystemPrompt(mentorRole),
      userPrompt:
        mentorUserPrompt(message, toJson({ ...contextObj, recentChat: history.reverse() })),
      schema: mentorReplySchema,
      timeoutMs: 120000,
    })
    replyText = [structured.directAnswer, structured.rolePerspective]
      .filter(Boolean)
      .join('\n\n')
    if (structured.suggestedActions?.length) {
      replyText += `\n\n建议：\n${structured.suggestedActions.map((a) => `· ${a}`).join('\n')}`
    }
  } catch {
    replyText = `作为${mentorRole}，针对你的问题「${message}」：建议结合当前路径继续验证，并关注五维中与目标差距最大的维度。`
    structured = {
      directAnswer: replyText,
      rolePerspective: '',
    }
  }

  const msg = await prisma.chatMessage.create({
    data: {
      chatSessionId: chatSession.id,
      role: 'assistant',
      mentorRole,
      content: replyText,
      contextSnapshotJson: toJson(contextObj),
    },
  })

  return {
    messageId: msg.id,
    reply: replyText,
    mentorRole,
    structured,
    usedContext: {
      lastChosenNodeId: ctx?.lastChosenNode?.id ?? null,
      activePathLength: ctx?.pathSummaries.length ?? 0,
      currentAttributes: ctx?.currentAttributes ?? null,
    },
    suggestedActions: structured?.suggestedActions ?? [],
    riskFlags: [],
  }
}

export async function getChatHistory(sessionId: string, mentorRole?: string) {
  await getSessionOrThrow(sessionId)
  const sessions = await prisma.chatSession.findMany({
    where: { sessionId, ...(mentorRole ? { mentorRole } : {}) },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
  return {
    sessions: sessions.map((s) => ({
      mentorRole: s.mentorRole,
      messages: s.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        mentorRole: m.mentorRole,
        time: m.createdAt.toISOString(),
      })),
    })),
  }
}

export async function clearChatHistory(sessionId: string, mentorRole?: string) {
  await getSessionOrThrow(sessionId)
  const sessions = await prisma.chatSession.findMany({
    where: { sessionId, ...(mentorRole ? { mentorRole } : {}) },
  })
  for (const s of sessions) {
    await prisma.chatMessage.deleteMany({ where: { chatSessionId: s.id } })
  }
  return { ok: true }
}
