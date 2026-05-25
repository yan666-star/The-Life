import { prisma } from '../lib/prisma.js'
import { toJson, safeJsonParse } from '../lib/json.js'
import { getSessionOrThrow } from './session.service.js'
import { getVideoProvider } from '../providers/stub-video-provider.js'
import { getModelProvider } from '../providers/registry.js'
import { AppError, ErrorCodes } from '../lib/errors.js'

async function nodeToPacket(sessionId: string, treeNodeId: string) {
  const node = await prisma.destinyTreeNode.findFirst({
    where: { id: treeNodeId, sessionId },
  })
  if (!node) {
    throw new AppError(ErrorCodes.NODE_NOT_FOUND, 'Node not found', 404)
  }
  const payload = safeJsonParse(node.payloadJson, {})
  return {
    id: node.id,
    title: node.title,
    action: node.action,
    story: node.story,
    result: node.result,
    description: `${node.story}\n${node.result}`,
    impacts: (payload as { attributeDelta?: unknown }).attributeDelta,
    ...payload,
  }
}

export async function setComparisonSlot(
  sessionId: string,
  side: 'left' | 'right',
  body: { treeNodeId?: string; packetSnapshot?: unknown }
) {
  await getSessionOrThrow(sessionId)
  let snapshot = body.packetSnapshot
  if (body.treeNodeId) {
    snapshot = await nodeToPacket(sessionId, body.treeNodeId)
  }
  if (!snapshot) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED, 'treeNodeId or packetSnapshot required', 400)
  }

  await prisma.comparisonSlot.upsert({
    where: { sessionId_side: { sessionId, side } },
    create: {
      sessionId,
      side,
      treeNodeId: body.treeNodeId ?? null,
      packetSnapshot: toJson(snapshot),
    },
    update: {
      treeNodeId: body.treeNodeId ?? null,
      packetSnapshot: toJson(snapshot),
    },
  })

  return { side, ok: true }
}

export async function getComparison(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const slots = await prisma.comparisonSlot.findMany({ where: { sessionId } })
  const videos = await prisma.comparisonVideoJob.findMany({
    where: { sessionId },
    orderBy: { updatedAt: 'desc' },
  })
  const leftSlot = slots.find((s) => s.side === 'left')
  const rightSlot = slots.find((s) => s.side === 'right')
  return {
    left: leftSlot
      ? { packet: safeJsonParse(leftSlot.packetSnapshot, {}), treeNodeId: leftSlot.treeNodeId }
      : null,
    right: rightSlot
      ? { packet: safeJsonParse(rightSlot.packetSnapshot, {}), treeNodeId: rightSlot.treeNodeId }
      : null,
    videos: {
      left: videos.find((v) => v.side === 'left'),
      right: videos.find((v) => v.side === 'right'),
    },
  }
}

export async function clearComparisonSlot(sessionId: string, side: string) {
  await getSessionOrThrow(sessionId)
  await prisma.comparisonSlot.deleteMany({ where: { sessionId, side } })
  return { ok: true }
}

export async function generateComparisonVideos(sessionId: string) {
  await getSessionOrThrow(sessionId)
  const comp = await getComparison(sessionId)
  if (!comp.left?.packet || !comp.right?.packet) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED, 'Both slots required', 400)
  }

  const videoProvider = getVideoProvider()
  const modelProvider = getModelProvider()
  const character = await prisma.characterModel.findUnique({ where: { sessionId } })
  const summary = character
    ? (safeJsonParse(character.dataJson, {}) as { characterSummary?: string }).characterSummary
    : ''

  for (const side of ['left', 'right'] as const) {
    const packet = side === 'left' ? comp.left!.packet : comp.right!.packet
    let scriptText = ''
    try {
      scriptText = await modelProvider.generateText({
        systemPrompt: '生成15-30秒短视频旁白分镜脚本，中文。',
        userPrompt: `数据包：${JSON.stringify(packet)}`,
        timeoutMs: 60000,
      })
    } catch {
      scriptText = (packet as { title?: string }).title || '平行时空'
    }
    const gen = await videoProvider.generateFromPacket({
      side,
      packet: packet as Record<string, unknown>,
      characterSummary: summary,
    })
    await prisma.comparisonVideoJob.create({
      data: {
        sessionId,
        side,
        treeNodeId:
          side === 'left' ? comp.left!.treeNodeId : comp.right!.treeNodeId,
        status: 'ready',
        scriptText: gen.scriptText || scriptText,
        videoUrl: gen.videoUrl ?? null,
        provider: videoProvider.name,
      },
    })
  }

  return getComparison(sessionId)
}

export async function getComparisonVideo(sessionId: string, side: string) {
  await getSessionOrThrow(sessionId)
  const job = await prisma.comparisonVideoJob.findFirst({
    where: { sessionId, side },
    orderBy: { createdAt: 'desc' },
  })
  if (!job) {
    return { status: 'pending', videoUrl: null, posterUrl: null, scriptText: null }
  }
  return {
    status: job.status,
    videoUrl: job.videoUrl,
    posterUrl: job.posterUrl,
    scriptText: job.scriptText,
    error: job.error,
  }
}
