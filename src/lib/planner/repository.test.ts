import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTemporaryPlan,
  getPlan,
  listPlans,
  savePlan,
} from "@/lib/planner/repository";
import type { PlanRecord } from "@/lib/planner/types";

function temporaryPlan(id: string): PlanRecord {
  const now = "2026-08-05T12:00:00.000Z";
  return {
    id,
    userId: "guest-user",
    goal: `Goal ${id}`,
    emoji: "🎯",
    title: `Plan ${id}`,
    summary: "A temporary plan",
    status: "active",
    assumptions: [],
    steps: [],
    contexts: [],
    createdAt: now,
    updatedAt: now,
  };
}

describe("temporary plan storage", () => {
  beforeEach(() => clearTemporaryPlan());

  it("keeps only the current plan in the browser session and allows replacing it", async () => {
    await savePlan(temporaryPlan("first"), { temporary: true });
    await savePlan(temporaryPlan("second"), { temporary: true });

    expect(await getPlan("first", "guest-user", { temporary: true })).toBeNull();
    expect((await listPlans("guest-user", { temporary: true })).map((plan) => plan.id)).toEqual(["second"]);
  });
});
