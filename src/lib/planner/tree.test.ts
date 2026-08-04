import { describe, expect, it } from "vitest";
import {
  calculatePlanProgress,
  createStepRecords,
  normalizeChildEstimates,
  replaceStepChildren,
  setStepCompletion,
} from "@/lib/planner/tree";
import type { PlanRecord, StepRecord } from "@/lib/planner/types";

const now = "2026-08-04T12:00:00.000Z";

function step(overrides: Partial<StepRecord>): StepRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    planId: "plan-1",
    userId: "user-1",
    parentId: null,
    generationId: "generation-1",
    depth: 1,
    position: 0,
    title: "Step",
    description: "Description",
    estimatedMinutes: 60,
    isCompleted: false,
    completedAt: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function plan(steps: StepRecord[]): PlanRecord {
  return {
    id: "plan-1",
    userId: "user-1",
    goal: "Ship a useful product",
    title: "Ship a useful product",
    summary: "A plan",
    status: "active",
    assumptions: [],
    steps,
    contexts: [],
    createdAt: now,
    updatedAt: now,
  };
}

describe("normalizeChildEstimates", () => {
  it("preserves the parent total exactly with positive whole minutes", () => {
    const result = normalizeChildEstimates(
      [
        { title: "One", description: "", estimatedMinutes: 33 },
        { title: "Two", description: "", estimatedMinutes: 33 },
        { title: "Three", description: "", estimatedMinutes: 34 },
      ],
      73,
    );

    expect(result.reduce((sum, item) => sum + item.estimatedMinutes, 0)).toBe(73);
    expect(result.every((item) => Number.isInteger(item.estimatedMinutes))).toBe(true);
    expect(result.every((item) => item.estimatedMinutes > 0)).toBe(true);
  });
});

describe("completion propagation", () => {
  const parent = step({ id: "parent", estimatedMinutes: 100 });
  const first = step({ id: "first", parentId: "parent", depth: 2, estimatedMinutes: 40 });
  const second = step({ id: "second", parentId: "parent", depth: 2, position: 1, estimatedMinutes: 60 });

  it("checks every descendant when a parent is checked", () => {
    const result = setStepCompletion(plan([parent, first, second]), "parent", true, now);
    expect(result.steps.every((item) => item.isCompleted)).toBe(true);
  });

  it("checks an ancestor only after all active children are checked", () => {
    const oneDone = setStepCompletion(plan([parent, first, second]), "first", true, now);
    expect(oneDone.steps.find((item) => item.id === "parent")?.isCompleted).toBe(false);
    const allDone = setStepCompletion(oneDone, "second", true, now);
    expect(allDone.steps.find((item) => item.id === "parent")?.isCompleted).toBe(true);
  });

  it("unchecks ancestors when one child becomes incomplete", () => {
    const allDone = setStepCompletion(plan([parent, first, second]), "parent", true, now);
    const result = setStepCompletion(allDone, "first", false, now);
    expect(result.steps.find((item) => item.id === "parent")?.isCompleted).toBe(false);
    expect(result.steps.find((item) => item.id === "second")?.isCompleted).toBe(true);
  });
});

describe("time-weighted progress", () => {
  it("uses active leaves and does not double count their parent", () => {
    const parent = step({ id: "parent", estimatedMinutes: 100 });
    const first = step({ id: "first", parentId: "parent", depth: 2, estimatedMinutes: 25, isCompleted: true });
    const second = step({ id: "second", parentId: "parent", depth: 2, position: 1, estimatedMinutes: 75 });
    expect(calculatePlanProgress(plan([parent, first, second]))).toEqual({
      completedMinutes: 25,
      totalMinutes: 100,
      percentage: 25,
    });
  });
});

describe("regeneration", () => {
  it("archives the old subtree and creates the next depth at the same total time", () => {
    const parent = step({ id: "parent", estimatedMinutes: 90 });
    const oldChild = step({ id: "old", parentId: "parent", depth: 2, estimatedMinutes: 90 });
    const result = replaceStepChildren({
      plan: plan([parent, oldChild]),
      stepId: "parent",
      generationId: "generation-2",
      now,
      generated: [
        { title: "A", description: "", estimatedMinutes: 1 },
        { title: "B", description: "", estimatedMinutes: 2 },
      ],
    });
    const newChildren = result.steps.filter(
      (item) => item.parentId === "parent" && !item.archivedAt,
    );
    expect(result.steps.find((item) => item.id === "old")?.archivedAt).toBe(now);
    expect(newChildren.reduce((sum, item) => sum + item.estimatedMinutes, 0)).toBe(90);
    expect(newChildren.every((item) => item.depth === 2)).toBe(true);
  });

  it("rejects an eleventh layer", () => {
    expect(() =>
      createStepRecords({
        generated: [{ title: "Too deep", description: "", estimatedMinutes: 5 }],
        planId: "plan-1",
        userId: "user-1",
        parentId: "parent",
        depth: 11,
        generationId: "generation-2",
      }),
    ).toThrow("between levels 1 and 10");
  });
});
