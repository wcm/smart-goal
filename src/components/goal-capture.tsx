"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const promptRows = [
  [
    "Run my first half marathon",
    "Launch a newsletter",
    "Learn conversational Spanish",
    "Build a consistent workout habit",
    "Start a profitable side project",
  ],
  [
    "Write my first novel",
    "Save for a home deposit",
    "Change careers into product design",
    "Plan a three-month sabbatical",
    "Grow my freelance business",
  ],
];

export function GoalCapture({ showSuggestions = false }: { showSuggestions?: boolean }) {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const value = goal.trim();
    if (value.length < 3) return;
    router.push(`/plans/new?goal=${encodeURIComponent(value)}`);
  }

  return (
    <div className="goal-capture">
      {showSuggestions && (
        <div className="prompt-tickers" aria-label="Example goals">
          {promptRows.map((prompts, rowIndex) => (
            <div className="prompt-ticker" key={prompts[0]}>
              <div className={`prompt-track row-${rowIndex + 1}`}>
                {[...prompts, ...prompts].map((prompt, index) => (
                  <button
                    type="button"
                    key={`${prompt}-${index}`}
                    onClick={() => {
                      setGoal(prompt);
                      inputRef.current?.focus();
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="goal-input-wrap">
        <Sparkles size={19} aria-hidden="true" />
        <input
          ref={inputRef}
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder="I want to launch my first newsletter…"
          aria-label="What is your goal?"
          maxLength={1200}
        />
        <Button size="lg" onClick={submit} disabled={goal.trim().length < 3}>
          How do I achieve it?
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
