import { describe, expect, it } from "vitest";
import { calculateStreaks } from "@/lib/planner/streaks";
import type { ActivityEvent } from "@/lib/planner/types";

function event(localDate: string, source: ActivityEvent["source"] = "manual"): ActivityEvent {
  return {
    id: `${source}-${localDate}`,
    userId: "user-1",
    planId: "plan-1",
    stepId: "step-1",
    source,
    localDate,
    createdAt: `${localDate}T10:00:00.000Z`,
  };
}

describe("calculateStreaks", () => {
  it("counts consecutive manual-completion days and ignores cascade events", () => {
    const result = calculateStreaks(
      [
        event("2026-08-01"),
        event("2026-08-02"),
        event("2026-08-03"),
        event("2026-08-04", "cascade"),
      ],
      new Date("2026-08-04T12:00:00"),
    );
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.counts.has("2026-08-04")).toBe(false);
  });

  it("keeps the current streak alive when today is empty but yesterday is active", () => {
    const result = calculateStreaks(
      [event("2026-08-02"), event("2026-08-03")],
      new Date("2026-08-04T12:00:00"),
    );
    expect(result.current).toBe(2);
  });
});
