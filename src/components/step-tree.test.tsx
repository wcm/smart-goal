import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StepTree } from "@/components/step-tree";
import type { StepTreeNode } from "@/lib/planner/tree";

const now = "2026-08-21T10:00:00.000Z";

function node(id: string, overrides: Partial<StepTreeNode> = {}): StepTreeNode {
  return {
    id,
    planId: "plan-1",
    userId: "user-1",
    parentId: null,
    generationId: "generation-1",
    depth: 1,
    position: 0,
    title: `Step ${id}`,
    description: "Description",
    estimatedMinutes: 30,
    isCompleted: false,
    completedAt: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
    children: [],
    ...overrides,
  };
}

afterEach(cleanup);

describe("StepTree breakdown attention", () => {
  it("adds the ripple only to the first available Break it down button", () => {
    render(
      <StepTree
        nodes={[
          node("completed", { isCompleted: true, completedAt: now }),
          node("first-available", { position: 1 }),
          node("second-available", { position: 2 }),
        ]}
        busyTarget={null}
        onToggle={vi.fn()}
        onBreakdown={vi.fn()}
        onEdit={vi.fn()}
        highlightFirstBreakdown
      />,
    );

    const breakdownButtons = screen.getAllByRole("button", { name: "Break it down" });
    expect(breakdownButtons).toHaveLength(2);
    expect(breakdownButtons[0]).toHaveClass("breakdown-ripple");
    expect(breakdownButtons[1]).not.toHaveClass("breakdown-ripple");
  });
});
