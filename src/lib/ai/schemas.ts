import { z } from "zod";

export const GeneratedStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedMinutes: z.number().int().positive(),
});

export const GeneratedPlanSchema = z.object({
  emoji: z.string().min(1).max(16),
  title: z.string(),
  summary: z.string(),
  assumptions: z.array(z.string()),
  steps: z.array(GeneratedStepSchema).min(3).max(8),
});

export const GeneratedQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        reason: z.string(),
      }),
    )
    .length(3),
});

export const GeneratedBreakdownSchema = z.object({
  steps: z.array(GeneratedStepSchema).min(2).max(8),
});

export const ContextInputSchema = z.object({
  question: z.string().max(500),
  answer: z.string().max(2000),
});

export const GeneratePlanInputSchema = z.object({
  goal: z.string().trim().min(3).max(1200),
  context: z.array(ContextInputSchema).max(8).default([]),
});

export const GenerateQuestionsInputSchema = z.object({
  goal: z.string().trim().min(3).max(1200),
  planSummary: z.string().max(3000).default(""),
  targetTitle: z.string().max(500).nullable().default(null),
  targetDescription: z.string().max(2000).nullable().default(null),
  ancestorPath: z.array(z.string().max(500)).max(10).default([]),
  existingContext: z.array(ContextInputSchema).max(8).default([]),
});

export const GenerateBreakdownInputSchema = z.object({
  goal: z.string().trim().min(3).max(1200),
  planSummary: z.string().max(3000),
  targetTitle: z.string().trim().min(1).max(500),
  targetDescription: z.string().max(2000),
  targetMinutes: z.number().int().min(2).max(525600),
  targetDepth: z.number().int().min(1).max(9),
  ancestorPath: z.array(z.string().max(500)).max(10),
  context: z.array(ContextInputSchema).max(8).default([]),
});
