import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { isDemoAiEnabled } from "@/lib/config";
import {
  GeneratedBreakdownSchema,
  GeneratedPlanSchema,
  GeneratedQuestionsSchema,
  type ContextInputSchema,
} from "@/lib/ai/schemas";
import {
  BREAKDOWN_PROMPT,
  PLAN_PROMPT,
  QUESTIONS_PROMPT,
} from "@/lib/ai/prompts";
import type { z } from "zod";

type ContextInput = z.infer<typeof ContextInputSchema>;

export class AiConfigurationError extends Error {}
export class AiRefusalError extends Error {}

type RequestIdentity = { safetyIdentifier: string };

function titleFromGoal(goal: string) {
  const words = goal
    .replace(/[?.!]+$/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7);
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function contextText(context: ContextInput[]) {
  if (context.length === 0) return "No additional context was supplied.";
  return context
    .map((entry, index) => `${index + 1}. ${entry.question}\nAnswer: ${entry.answer}`)
    .join("\n\n");
}

class DemoAiProvider {
  async generatePlan(goal: string, context: ContextInput[]) {
    const subject = titleFromGoal(goal);
    const contextNote = context.length
      ? "The plan reflects the constraints and preferences you added."
      : "You can add context to make the timing and sequence more personal.";
    return {
      title: subject,
      summary: `A practical path from a clear definition of ${subject.toLowerCase()} through execution, review, and a sustainable finish. ${contextNote}`,
      assumptions: [
        "The goal can be pursued consistently each week.",
        "The estimates are starting points and can be adjusted as you learn.",
      ],
      steps: [
        {
          title: "Define the finish line",
          description:
            "Write a specific success statement, the constraints that matter, and how you will know the goal is complete.",
          estimatedMinutes: 45,
        },
        {
          title: "Assess the starting point",
          description:
            "Inventory your current resources, gaps, dependencies, and the most likely obstacles.",
          estimatedMinutes: 75,
        },
        {
          title: "Prepare the essentials",
          description:
            "Gather the tools, knowledge, people, and schedule needed to begin without avoidable friction.",
          estimatedMinutes: 120,
        },
        {
          title: "Execute the core work",
          description:
            "Complete the highest-impact work in focused sessions, recording decisions and blockers as you go.",
          estimatedMinutes: 300,
        },
        {
          title: "Review, improve, and sustain",
          description:
            "Check the result against the finish line, close remaining gaps, and decide how to maintain the outcome.",
          estimatedMinutes: 90,
        },
      ],
    };
  }

  async generateQuestions(args: {
    goal: string;
    targetTitle: string | null;
    existingContext: ContextInput[];
  }) {
    const scope = args.targetTitle ?? titleFromGoal(args.goal);
    const candidates = [
        {
          question: `What would a successful result for “${scope}” look like in concrete terms?`,
          reason: "A measurable finish line changes what the plan needs to include.",
        },
        {
          question: "Is there a target date or a weekly time budget to work within?",
          reason: "Timing constraints determine the appropriate scope and pace.",
        },
        {
          question: "What have you already completed, tried, or learned?",
          reason: "Existing progress prevents duplicated work and improves sequencing.",
        },
        {
          question: "What is the biggest constraint or risk you expect?",
          reason: "The plan can address the most likely blocker early.",
        },
        {
          question: "Is anyone else involved, and what do you need from them?",
          reason: "Dependencies and ownership can materially change the sequence.",
        },
        {
          question: "What trade-off are you unwilling to make while pursuing this?",
          reason: "A hard boundary keeps the plan useful instead of merely ambitious.",
        },
      ];
    const fresh = candidates.filter(
        (candidate) =>
          !args.existingContext.some(
            (entry) => entry.question.toLowerCase() === candidate.question.toLowerCase(),
          ),
      );
    return {
      questions: (fresh.length >= 3 ? fresh : candidates).slice(0, 4),
    };
  }

  async generateBreakdown(args: {
    targetTitle: string;
    targetMinutes: number;
  }) {
    const unit = args.targetTitle.toLowerCase();
    const quarter = Math.max(1, Math.floor(args.targetMinutes / 4));
    return {
      steps: [
        {
          title: `Clarify the outcome for ${unit}`,
          description: "Confirm the inputs, constraints, and exact result this step must produce.",
          estimatedMinutes: quarter,
        },
        {
          title: "Gather what you need",
          description: "Collect the information, tools, and dependencies required before execution.",
          estimatedMinutes: quarter,
        },
        {
          title: `Complete ${unit}`,
          description: "Do the core work in a focused pass and record any decisions or follow-ups.",
          estimatedMinutes: quarter * 2,
        },
        {
          title: "Check the result",
          description: "Compare the outcome with the success criteria and correct material gaps.",
          estimatedMinutes: quarter,
        },
      ],
    };
  }
}

class OpenAiProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-5.6-terra";
  }

  async generatePlan(
    goal: string,
    context: ContextInput[],
    identity: RequestIdentity,
  ) {
    const response = await this.client.responses.parse({
      model: this.model,
      store: false,
      safety_identifier: identity.safetyIdentifier,
      reasoning: { effort: "low" },
      max_output_tokens: 2500,
      input: [
        { role: "system", content: PLAN_PROMPT },
        {
          role: "user",
          content: `Goal:\n${goal}\n\nContext:\n${contextText(context)}`,
        },
      ],
      text: {
        verbosity: "low",
        format: zodTextFormat(GeneratedPlanSchema, "goal_plan"),
      },
    });
    if (!response.output_parsed) {
      throw new AiRefusalError("The plan could not be generated for this request.");
    }
    return response.output_parsed;
  }

  async generateQuestions(
    args: {
      goal: string;
      planSummary: string;
      targetTitle: string | null;
      targetDescription: string | null;
      ancestorPath: string[];
      existingContext: ContextInput[];
    },
    identity: RequestIdentity,
  ) {
    const response = await this.client.responses.parse({
      model: this.model,
      store: false,
      safety_identifier: identity.safetyIdentifier,
      reasoning: { effort: "low" },
      max_output_tokens: 1200,
      input: [
        { role: "system", content: QUESTIONS_PROMPT },
        {
          role: "user",
          content: `Goal: ${args.goal}\nPlan summary: ${args.planSummary || "Not generated yet."}\nTarget: ${args.targetTitle ?? "Whole plan"}\nTarget details: ${args.targetDescription ?? "None"}\nAncestor path: ${args.ancestorPath.join(" > ") || "Whole plan"}\nExisting context:\n${contextText(args.existingContext)}`,
        },
      ],
      text: {
        verbosity: "low",
        format: zodTextFormat(GeneratedQuestionsSchema, "context_questions"),
      },
    });
    if (!response.output_parsed) {
      throw new AiRefusalError("Questions could not be generated for this request.");
    }
    return response.output_parsed;
  }

  async generateBreakdown(
    args: {
      goal: string;
      planSummary: string;
      targetTitle: string;
      targetDescription: string;
      targetMinutes: number;
      targetDepth: number;
      ancestorPath: string[];
      context: ContextInput[];
    },
    identity: RequestIdentity,
  ) {
    const response = await this.client.responses.parse({
      model: this.model,
      store: false,
      safety_identifier: identity.safetyIdentifier,
      reasoning: { effort: "low" },
      max_output_tokens: 2000,
      input: [
        { role: "system", content: BREAKDOWN_PROMPT },
        {
          role: "user",
          content: `Goal: ${args.goal}\nPlan summary: ${args.planSummary}\nAncestor path: ${args.ancestorPath.join(" > ")}\nParent step: ${args.targetTitle}\nParent details: ${args.targetDescription}\nParent time: ${args.targetMinutes} minutes\nParent depth: ${args.targetDepth}\nContext:\n${contextText(args.context)}`,
        },
      ],
      text: {
        verbosity: "low",
        format: zodTextFormat(GeneratedBreakdownSchema, "step_breakdown"),
      },
    });
    if (!response.output_parsed) {
      throw new AiRefusalError("The step could not be broken down for this request.");
    }
    return response.output_parsed;
  }
}

export function createAiProvider() {
  if (isDemoAiEnabled()) return new DemoAiProvider();
  if (!process.env.OPENAI_API_KEY) {
    throw new AiConfigurationError(
      "Live AI is not configured. Add OPENAI_API_KEY or enable demo mode outside production.",
    );
  }
  return new OpenAiProvider(process.env.OPENAI_API_KEY);
}
