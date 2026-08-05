import { Sprout } from "lucide-react";

export function GoalMarkIcon({ size = 19, className }: { size?: number; className?: string }) {
  return <Sprout size={size} strokeWidth={2.2} className={className} aria-hidden="true" />;
}
