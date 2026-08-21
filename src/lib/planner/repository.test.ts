import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTemporaryPlan,
  getPlan,
  listPlans,
  renamePlan,
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

  it("renames the temporary plan and trims surrounding whitespace", async () => {
    const plan = temporaryPlan("rename-me");
    await savePlan(plan, { temporary: true });

    const renamed = await renamePlan(plan, "  A clearer plan name  ", { temporary: true });

    expect(renamed.title).toBe("A clearer plan name");
    expect(renamed.updatedAt).not.toBe(plan.updatedAt);
    expect((await getPlan(plan.id, plan.userId, { temporary: true }))?.title).toBe("A clearer plan name");
  });

  it("rejects an empty plan name", async () => {
    await expect(renamePlan(temporaryPlan("empty-name"), "   ", { temporary: true }))
      .rejects.toThrow("Add a plan name.");
  });
});
