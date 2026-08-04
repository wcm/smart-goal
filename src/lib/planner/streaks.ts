import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { ActivityEvent } from "@/lib/planner/types";

export function getActivityCounts(events: ActivityEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.source !== "manual") continue;
    counts.set(event.localDate, (counts.get(event.localDate) ?? 0) + 1);
  }
  return counts;
}

export function calculateStreaks(events: ActivityEvent[], today = new Date()) {
  const counts = getActivityCounts(events);
  const activeDates = [...counts.keys()].sort();
  let longest = 0;
  let running = 0;
  let previous: Date | null = null;

  for (const dateString of activeDates) {
    const current = parseISO(dateString);
    running =
      previous && differenceInCalendarDays(current, previous) === 1
        ? running + 1
        : 1;
    longest = Math.max(longest, running);
    previous = current;
  }

  const start = startOfDay(today);
  const todayKey = format(start, "yyyy-MM-dd");
  const yesterday = subDays(start, 1);
  let cursor = counts.has(todayKey) ? start : yesterday;
  let current = 0;

  while (counts.has(format(cursor, "yyyy-MM-dd"))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  return { current, longest, counts };
}
