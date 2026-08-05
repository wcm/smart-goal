"use client";

import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoalInputIcon } from "@/components/goal-input-icon";
import { Button } from "@/components/ui/button";
import { ensurePlanningSession } from "@/lib/supabase/guest";
import { asErrorMessage } from "@/lib/utils";

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

const rotatingGoals = promptRows.flat().map((prompt) => `I want to ${prompt.toLocaleLowerCase("en")}`);

function randomGoal(current = "") {
  const alternatives = rotatingGoals.filter((goal) => goal !== current);
  return alternatives[Math.floor(Math.random() * alternatives.length)] ?? rotatingGoals[0];
}

export function GoalCapture({ showSuggestions = false }: { showSuggestions?: boolean }) {
  const router = useRouter();
  const [goal, setGoal] = useState("I want to launch a newsletter");
  const [isAutoGoal, setIsAutoGoal] = useState(true);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused || !isAutoGoal || submitting) return;
    const initialRotation = window.setTimeout(() => {
      setGoal((current) => randomGoal(current));
    }, 0);
    const interval = window.setInterval(() => {
      setGoal((current) => randomGoal(current));
    }, 4500);
    return () => {
      window.clearTimeout(initialRotation);
      window.clearInterval(interval);
    };
  }, [focused, isAutoGoal, submitting]);

  async function submit() {
    if (submitting) return;
    const value = goal.trim() || randomGoal();
    setSubmitting(true);
    setError("");
    try {
      await ensurePlanningSession();
      router.push(`/plans/new?goal=${encodeURIComponent(value)}`);
    } catch (reason) {
      const message = asErrorMessage(reason);
      const normalizedMessage = message.toLowerCase();
      if (
        normalizedMessage.includes("auth session missing") ||
        normalizedMessage.includes("anonymous sign-ins are disabled")
      ) {
        const next = `/plans/new?goal=${encodeURIComponent(value)}`;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setError(message);
      setSubmitting(false);
    }
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
                      setGoal(`I want to ${prompt.toLocaleLowerCase("en")}`);
                      setIsAutoGoal(false);
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
        <span className="goal-field-mark"><GoalInputIcon /></span>
        <input
          ref={inputRef}
          value={goal}
          onChange={(event) => {
            setGoal(event.target.value);
            setIsAutoGoal(!event.target.value.trim());
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void submit();
          }}
          placeholder="I want to launch my first newsletter…"
          aria-label="What is your goal?"
          maxLength={1200}
        />
        <Button size="lg" onClick={() => void submit()} aria-busy={submitting}>
          {submitting ? "Starting your plan…" : "How do I achieve it?"}
          {submitting ? <LoaderCircle className="spin" size={18} /> : <ArrowUpRight size={18} />}
        </Button>
      </div>
      {error && (
        <p className="goal-capture-error" role="alert">
          {error} <Link href="/login">Sign in instead</Link>
        </p>
      )}
    </div>
  );
}
