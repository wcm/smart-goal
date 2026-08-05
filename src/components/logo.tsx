import Link from "next/link";
import { GoalMarkIcon } from "@/components/goal-mark-icon";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("logo", className)} aria-label="Goal Planner home">
      <span className="logo-mark">
        <GoalMarkIcon />
      </span>
      {!compact && <span>Goal Planner</span>}
    </Link>
  );
}
