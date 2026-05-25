import { z } from 'zod'
import { clampAttr } from '../lib/attributes.js'
import { ATTR_KEYS } from '../config.js'

const attrField = z.union([z.number(), z.string()]).transform((v) => {
  const n = typeof v === 'string' ? Number(v.replace(/[^\d.-]/g, '')) : v
  return clampAttr(Number.isFinite(n) ? n : 50)
})

export const attributesSchema = z.object({
  career: attrField,
  finance: attrField,
  relationship: attrField,
  health: attrField,
  growth: attrField,
})

export const profileInputSchema = z.record(z.string(), z.unknown())

export const characterModelSchema = z.object({
  characterSummary: z.string().min(1),
  goals: z.string().optional().default(''),
  constraints: z.string().optional().default(''),
  personalityTags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((v) => {
      if (Array.isArray(v)) return v
      if (typeof v === 'string' && v.trim()) {
        return v.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
      }
      return []
    }),
  initialAttributes: attributesSchema,
  targetAttributes: attributesSchema,
  reasoning: z.string().optional(),
})

export const riskSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  score: z.coerce.number().transform(clampAttr),
  factors: z.array(z.string()).min(1),
})

export const candidateNodeSchema = z.object({
  title: z.string().min(1),
  action: z.string().min(1),
  story: z.string().min(10),
  result: z.string().optional().default(''),
  risk: riskSchema,
  attributeDelta: attributesSchema,
  attributeAfter: attributesSchema,
  feasibility: z.coerce.number().optional(),
  difficulty: z.string().optional(),
  benefit: z.string().optional(),
  requiredCapital: z.string().optional(),
  keyMilestones: z.array(z.string()).optional(),
})

export const candidatesResponseSchema = z.object({
  candidates: z.array(candidateNodeSchema).min(1).max(5).transform((arr) => arr.slice(0, 3)),
})

export const mentorReplySchema = z.object({
  directAnswer: z.string().min(1),
  rolePerspective: z.string().optional().default(''),
  contextReasoning: z.string().optional(),
  suggestedActions: z.array(z.string()).optional(),
  followUpQuestion: z.string().optional(),
})

export const finalReportAiSchema = z.object({
  regretLevel: z.coerce.number().transform(clampAttr),
  regretText: z.string(),
  goalAlignment: z
    .array(
      z.object({
        key: z.string(),
        target: z.coerce.number(),
        current: z.coerce.number(),
        gap: z.coerce.number(),
        comment: z.string(),
      })
    )
    .optional(),
  pathSummary: z.string(),
  finalAnalysis: z.string(),
  lifeAdvice: z.string(),
  missedSignals: z.array(z.string()).optional(),
  nextActions: z.array(z.string()).optional(),
})
