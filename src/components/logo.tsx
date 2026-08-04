import Link from "next/link";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("logo", className)} aria-label="GoalFlow home">
      <span className="logo-mark">
        <Sprout size={19} strokeWidth={2.2} aria-hidden="true" />
      </span>
      {!compact && <span>GoalFlow</span>}
    </Link>
  );
}
