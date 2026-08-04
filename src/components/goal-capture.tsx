"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GoalCapture() {
  const router = useRouter();
  const [goal, setGoal] = useState("");

  function submit() {
    const value = goal.trim();
    if (value.length < 3) return;
    router.push(`/plans/new?goal=${encodeURIComponent(value)}`);
  }

  return (
    <div className="goal-capture">
      <div className="goal-input-wrap">
        <Sparkles size={19} aria-hidden="true" />
        <input
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="I want to launch my first newsletter…"
          aria-label="What is your goal?"
          maxLength={1200}
        />
      </div>
      <Button size="lg" onClick={submit} disabled={goal.trim().length < 3}>
        How do I achieve it?
        <ArrowRight size={18} />
      </Button>
      <p>No perfect prompt needed. Start broad; Goal Planner will help you clarify.</p>
    </div>
  );
}
