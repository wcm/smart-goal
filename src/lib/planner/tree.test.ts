import { describe, expect, it } from "vitest";
import {
  calculatePlanProgress,
  createStepRecords,
  formatMinutes,
  normalizeChildEstimates,
  parseMinutesInput,
  replaceStepChildren,
  sanitizeMinutesInput,
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
    emoji: "🚀",
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

  it("keeps every child sub-minute when the parent is sub-minute", () => {
    const result = normalizeChildEstimates(
      Array.from({ length: 5 }, (_, index) => ({
        title: `Step ${index + 1}`,
        description: "",
        estimatedMinutes: 1,
      })),
      0,
    );

    expect(result).toHaveLength(5);
    expect(result.every((item) => item.estimatedMinutes === 0)).toBe(true);
    expect(result.every((item) => formatMinutes(item.estimatedMinutes) === "<1m")).toBe(true);
  });

  it("spends a single parent minute on one child and leaves the rest sub-minute", () => {
    const result = normalizeChildEstimates(
      [
        { title: "One", description: "", estimatedMinutes: 1 },
        { title: "Two", description: "", estimatedMinutes: 1 },
        { title: "Three", description: "", estimatedMinutes: 1 },
      ],
      1,
    );

    expect(result.map((item) => item.estimatedMinutes)).toEqual([1, 0, 0]);
  });

  it("keeps the child count independent of the parent's minutes", () => {
    const result = normalizeChildEstimates(
      Array.from({ length: 5 }, (_, index) => ({
        title: `Step ${index + 1}`,
        description: "",
        estimatedMinutes: 1,
      })),
      2,
    );

    expect(result).toHaveLength(5);
    expect(result.map((item) => item.estimatedMinutes)).toEqual([1, 1, 0, 0, 0]);
  });

  it("follows the generated weights when the parent has few minutes", () => {
    const result = normalizeChildEstimates(
      [
        { title: "One", description: "", estimatedMinutes: 1 },
        { title: "Two", description: "", estimatedMinutes: 3 },
        { title: "Three", description: "", estimatedMinutes: 1 },
      ],
      3,
    );

    expect(result.map((item) => item.estimatedMinutes)).toEqual([1, 2, 0]);
  });

  it("honours a generated sub-minute estimate", () => {
    const result = normalizeChildEstimates(
      [
        { title: "One", description: "", estimatedMinutes: 5 },
        { title: "Two", description: "", estimatedMinutes: 0 },
      ],
      5,
    );

    expect(result.map((item) => item.estimatedMinutes)).toEqual([5, 0]);
  });

  it("spreads evenly when every generated estimate is sub-minute", () => {
    const result = normalizeChildEstimates(
      Array.from({ length: 4 }, (_, index) => ({
        title: `Step ${index + 1}`,
        description: "",
        estimatedMinutes: 0,
      })),
      4,
    );

    expect(result.map((item) => item.estimatedMinutes)).toEqual([1, 1, 1, 1]);
  });

  it("keeps at most eight children", () => {
    const result = normalizeChildEstimates(
      Array.from({ length: 11 }, (_, index) => ({
        title: `Step ${index + 1}`,
        description: "",
        estimatedMinutes: 2,
      })),
      12,
    );

    expect(result).toHaveLength(8);
    expect(result.reduce((sum, item) => sum + item.estimatedMinutes, 0)).toBe(12);
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

  it("falls back to completed step count for an entirely sub-minute plan", () => {
    const first = step({ id: "first", estimatedMinutes: 0, isCompleted: true });
    const second = step({ id: "second", estimatedMinutes: 0, position: 1 });
    expect(calculatePlanProgress(plan([first, second]))).toEqual({
      completedMinutes: 0,
      totalMinutes: 0,
      percentage: 50,
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

  it("archives every descendant layer when refreshing a parent", () => {
    const parent = step({ id: "parent", estimatedMinutes: 90 });
    const child = step({ id: "child", parentId: "parent", depth: 2, estimatedMinutes: 90 });
    const grandchild = step({ id: "grandchild", parentId: "child", depth: 3, estimatedMinutes: 90 });
    const result = replaceStepChildren({
      plan: plan([parent, child, grandchild]),
      stepId: "parent",
      generationId: "generation-2",
      now,
      generated: [
        { title: "A", description: "", estimatedMinutes: 1 },
        { title: "B", description: "", estimatedMinutes: 1 },
      ],
    });

    expect(result.steps.find((item) => item.id === "child")?.archivedAt).toBe(now);
    expect(result.steps.find((item) => item.id === "grandchild")?.archivedAt).toBe(now);
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

describe("minutes input", () => {
  it.each([
    ["45", "45"],
    ["4 5", "45"],
    ["12.5", "125"],
    ["-5", "5"],
    ["30m", "30"],
    ["90 minutes", "90"],
    ["12345678", "1234567"],
    ["<", "<"],
    ["<1", "<1"],
    ["< 1", "<1"],
    ["<1m", "<1"],
    ["<9", "<"],
    ["", ""],
  ])("masks %j down to %j", (typed, expected) => {
    expect(sanitizeMinutesInput(typed)).toBe(expected);
  });

  it.each([
    ["45", 45],
    ["1", 1],
    ["0", 0],
    ["<1", 0],
    ["9999999", 525600],
  ])("reads %j as %i minutes", (entry, expected) => {
    expect(parseMinutesInput(entry)).toBe(expected);
  });

  it.each(["", " ", "<", "<1m", "12.5", "-5", "1e3", "abc", "1,5"])(
    "rejects %j",
    (entry) => {
      expect(parseMinutesInput(entry)).toBeNull();
    },
  );

  it("round-trips the sub-minute sentinel", () => {
    expect(formatMinutes(parseMinutesInput("<1") ?? 1)).toBe("<1m");
  });
});
