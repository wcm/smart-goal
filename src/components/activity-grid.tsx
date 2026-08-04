import { format, subDays } from "date-fns";
import { Flame } from "lucide-react";
import { calculateStreaks } from "@/lib/planner/streaks";
import type { ActivityEvent } from "@/lib/planner/types";

function intensity(count: number) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function ActivityGrid({ events }: { events: ActivityEvent[] }) {
  const today = new Date();
  const { current, longest, counts } = calculateStreaks(events, today);
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = subDays(today, 364 - index);
    const key = format(date, "yyyy-MM-dd");
    const count = counts.get(key) ?? 0;
    return { date, key, count };
  });

  return (
    <section className="activity-card">
      <div className="activity-heading">
        <div>
          <span className="section-label">CONSISTENCY</span>
          <h2>Your progress garden</h2>
          <p>Every square is a day you moved a goal forward.</p>
        </div>
        <div className="streak-stats">
          <div><span><Flame size={16} /> Current</span><strong>{current}<small> days</small></strong></div>
          <div><span>Longest</span><strong>{longest}<small> days</small></strong></div>
        </div>
      </div>
      <div className="activity-scroll">
        <div className="activity-grid" aria-label="Completion activity over the last 365 days">
          {days.map(({ date, key, count }) => (
            <span
              key={key}
              className={`activity-cell level-${intensity(count)}`}
              title={`${format(date, "MMM d, yyyy")}: ${count} completed ${count === 1 ? "step" : "steps"}`}
              aria-label={`${format(date, "MMMM d, yyyy")}: ${count} completions`}
            />
          ))}
        </div>
      </div>
      <div className="activity-legend"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className={`activity-cell level-${level}`} key={level} />)}<span>More</span></div>
    </section>
  );
}
