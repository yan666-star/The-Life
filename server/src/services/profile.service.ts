import { prisma } from '../lib/prisma.js'
import { toJson } from '../lib/json.js'
import { parseAttributes } from '../lib/attributes.js'
import { getModelProvider } from '../providers/registry.js'
import { characterModelSchema } from '../schemas/attributes.js'
import { profileSystemPrompt, profileUserPrompt } from '../prompts/profile.js'
import { normalizeCharacterModel } from '../lib/ai-json-normalize.js'
import { getSessionOrThrow } from './session.service.js'
import { config } from '../config.js'

const DEFAULT_CHARACTER = {
  characterSummary: '一位正在规划人生路径的都市青年',
  goals: '职业成长与生活平衡',
  constraints: '时间与资金有限',
  personalityTags: ['理性', '进取'],
  initialAttributes: {
    career: 70,
    finance: 65,
    relationship: 75,
    health: 68,
    growth: 72,
  },
  targetAttributes: {
    career: 85,
    finance: 80,
    relationship: 78,
    health: 75,
    growth: 88,
  },
  reasoning: '基于默认画像的建模',
}

export async function modelProfile(sessionId: string, userInfo: unknown) {
  await getSessionOrThrow(sessionId)

  await prisma.profileInput.upsert({
    where: { sessionId },
    create: { sessionId, dataJson: toJson(userInfo) },
    update: { dataJson: toJson(userInfo) },
  })

  let model = DEFAULT_CHARACTER
  const provider = getModelProvider()
  try {
    model = await provider.generateJson({
      systemPrompt: profileSystemPrompt,
      userPrompt: profileUserPrompt(userInfo),
      schema: characterModelSchema,
      normalize: normalizeCharacterModel,
    })
  } catch (err) {
    console.warn('[profile.model] AI fallback:', err instanceof Error ? err.message : err)
    model = {
      ...DEFAULT_CHARACTER,
      characterSummary: `基于输入的建模：${JSON.stringify(userInfo).slice(0, 200)}`,
    }
  }

  const initial = parseAttributes(model.initialAttributes)
  const target = parseAttributes(model.targetAttributes)

  await prisma.characterModel.upsert({
    where: { sessionId },
    create: { sessionId, dataJson: toJson({ ...model, initialAttributes: initial, targetAttributes: target }) },
    update: { dataJson: toJson({ ...model, initialAttributes: initial, targetAttributes: target }) },
  })

  await prisma.attributeSnapshot.create({
    data: {
      sessionId,
      round: 0,
      career: initial.career,
      finance: initial.finance,
      relationship: initial.relationship,
      health: initial.health,
      growth: initial.growth,
      source: 'initial',
    },
  })

  let root = await prisma.destinyTreeNode.findFirst({
    where: { sessionId, parentId: null },
  })
  if (!root) {
    root = await prisma.destinyTreeNode.create({
      data: {
        sessionId,
        parentId: null,
        depth: 1,
        round: 0,
        title: '当前人生节点',
        action: '从当前现实状态出发',
        story: model.characterSummary,
        result: '等待第一次关键选择',
        summary: model.characterSummary.slice(0, 200),
        branchStatus: 'chosen',
        isOnActivePath: true,
        payloadJson: '{}',
      },
    })
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { activePathLeafId: root.id },
    })
    await prisma.chosenPathNode.create({
      data: {
        sessionId,
        treeNodeId: root.id,
        orderIndex: 0,
        summary: root.summary,
        fullContent: toJson({ title: root.title, story: root.story, action: root.action, result: root.result }),
      },
    })
  }

  try {
    await prisma.aIRequestLog.create({
      data: {
        sessionId,
        kind: 'profile_model',
        provider: provider.name,
        model: config.ollama.model,
        promptVersion: config.promptVersion,
        success: true,
      },
    })
  } catch (logErr) {
    console.warn('[profile.model] log skip:', logErr)
  }

  return {
    characterModel: { ...model, initialAttributes: initial, targetAttributes: target },
    initialAttributes: initial,
    targetAttributes: target,
    rootNodeId: root.id,
  }
}
