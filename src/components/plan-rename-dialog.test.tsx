import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlanRenameDialog } from "@/components/plan-rename-dialog";
import type { PlanRecord } from "@/lib/planner/types";

const plan: PlanRecord = {
  id: "plan-1",
  userId: "user-1",
  goal: "Launch a newsletter",
  emoji: "📰",
  title: "Launch my newsletter",
  summary: "A practical launch plan",
  status: "active",
  assumptions: [],
  steps: [],
  contexts: [],
  createdAt: "2026-08-21T10:00:00.000Z",
  updatedAt: "2026-08-21T10:00:00.000Z",
};

afterEach(cleanup);

describe("PlanRenameDialog", () => {
  it("saves a changed plan name without surrounding whitespace", () => {
    const onSave = vi.fn();
    render(<PlanRenameDialog plan={plan} busy={false} onClose={vi.fn()} onSave={onSave} />);

    const input = screen.getByRole("textbox", { name: "Plan name" });
    expect(input).toHaveValue(plan.title);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    fireEvent.change(input, { target: { value: "  Publish a weekly newsletter  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("Publish a weekly newsletter");
  });

  it("discards changes from the close icon", () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(<PlanRenameDialog plan={plan} busy={false} onClose={onClose} onSave={onSave} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Plan name" }), {
      target: { value: "A discarded name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes on Escape when it is not saving", () => {
    const onClose = vi.fn();
    render(<PlanRenameDialog plan={plan} busy={false} onClose={onClose} onSave={vi.fn()} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
