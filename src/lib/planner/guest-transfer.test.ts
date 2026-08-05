import { describe, expect, it } from "vitest";
import { cloneGuestPlan } from "@/lib/planner/guest-transfer";
import type { PlanRecord } from "@/lib/planner/types";

const now = "2026-08-05T12:00:00.000Z";

describe("cloneGuestPlan", () => {
  it("moves a temporary tree to a registered owner with new primary keys", () => {
    const guestPlan: PlanRecord = {
      id: "guest-plan",
      userId: "guest-user",
      goal: "Launch a newsletter",
      emoji: "💌",
      title: "Launch a newsletter",
      summary: "A practical launch plan",
      status: "active",
      assumptions: [],
      createdAt: now,
      updatedAt: now,
      steps: [
        {
          id: "parent",
          planId: "guest-plan",
          userId: "guest-user",
          parentId: null,
          generationId: "generation",
          depth: 1,
          position: 0,
          title: "Draft issue one",
          description: "Write the first issue",
          estimatedMinutes: 60,
          isCompleted: false,
          completedAt: null,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "child",
          planId: "guest-plan",
          userId: "guest-user",
          parentId: "parent",
          generationId: "generation",
          depth: 2,
          position: 0,
          title: "Write the outline",
          description: "Create a short outline",
          estimatedMinutes: 20,
          isCompleted: true,
          completedAt: now,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      contexts: [
        {
          id: "context",
          planId: "guest-plan",
          userId: "guest-user",
          targetStepId: "child",
          generationId: "generation",
          question: "Who is it for?",
          reason: "Audience changes the content.",
          answer: "Independent designers",
          position: 0,
          createdAt: now,
        },
      ],
    };

    const cloned = cloneGuestPlan(guestPlan, "registered-user");
    const [parent, child] = cloned.steps;

    expect(cloned.id).not.toBe(guestPlan.id);
    expect(cloned.userId).toBe("registered-user");
    expect(cloned.steps.every((step) => step.userId === "registered-user")).toBe(true);
    expect(child.parentId).toBe(parent.id);
    expect(cloned.contexts[0].targetStepId).toBe(child.id);
    expect(cloned.contexts[0].userId).toBe("registered-user");
    expect(child.isCompleted).toBe(true);
  });
});
