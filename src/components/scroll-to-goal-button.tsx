"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToGoalButton({ label = "Build my SMART goal now", light = false }: { label?: string; light?: boolean }) {
  function scrollToGoal() {
    const input = document.querySelector<HTMLInputElement>("#goal-builder input");
    if (!input) return;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      input.focus({ preventScroll: true });
      input.select();
    }, 550);
  }

  return (
    <Button className={light ? "smart-scroll-cta light" : "smart-scroll-cta"} size="lg" onClick={scrollToGoal}>
      {label} <ArrowUpRight size={17} />
    </Button>
  );
}
