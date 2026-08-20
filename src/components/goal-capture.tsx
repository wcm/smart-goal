"use client";

import Link from "next/link";
import { ArrowUpRight, LoaderCircle, X } from "lucide-react";
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
const autoGoalPrefix = "I want to ";
const initialGoal = "I want to launch a useful weekly newsletter";

function randomGoal(current = "") {
  const alternatives = rotatingGoals.filter((goal) => goal !== current);
  return alternatives[Math.floor(Math.random() * alternatives.length)] ?? rotatingGoals[0];
}

export function GoalCapture({ showSuggestions = false, id }: { showSuggestions?: boolean; id?: string }) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);
  const [isAutoGoal, setIsAutoGoal] = useState(true);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const autoGoalTargetRef = useRef(initialGoal);

  useEffect(() => {
    if (focused || !isAutoGoal || submitting) return;
    let timeout: number | undefined;
    let stopped = false;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showNextGoal = () => {
      const nextGoal = randomGoal(autoGoalTargetRef.current);
      autoGoalTargetRef.current = nextGoal;

      if (prefersReducedMotion) {
        setGoal(nextGoal);
        timeout = window.setTimeout(showNextGoal, 4500);
        return;
      }

      let characterIndex = autoGoalPrefix.length;
      setGoal(autoGoalPrefix);
      const typeNextCharacter = () => {
        if (stopped) return;
        characterIndex += 1;
        setGoal(nextGoal.slice(0, characterIndex));
        timeout = characterIndex < nextGoal.length
          ? window.setTimeout(typeNextCharacter, 34)
          : window.setTimeout(showNextGoal, 3400);
      };
      timeout = window.setTimeout(typeNextCharacter, 120);
    };

    timeout = window.setTimeout(showNextGoal, 3400);
    return () => {
      stopped = true;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [focused, isAutoGoal, submitting]);

  async function submit() {
    if (submitting) return;
    const value = (isAutoGoal ? autoGoalTargetRef.current : goal).trim() || randomGoal();
    setGoal(value);
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
    <div className="goal-capture" id={id}>
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
                      const selectedGoal = `I want to ${prompt.toLocaleLowerCase("en")}`;
                      autoGoalTargetRef.current = selectedGoal;
                      setGoal(selectedGoal);
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
        <span className="goal-field-input">
          <input
            ref={inputRef}
            value={goal}
            onChange={(event) => {
              setGoal(event.target.value);
              setIsAutoGoal(!event.target.value.trim());
            }}
            onFocus={() => {
              setFocused(true);
              if (isAutoGoal) setGoal(autoGoalTargetRef.current);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submit();
            }}
            placeholder="I want to launch my first newsletter…"
            aria-label="What is your goal?"
            maxLength={1200}
          />
          {focused && goal.trim() && (
            <button
              type="button"
              className="goal-clear-button"
              aria-label="Clear goal"
              title="Clear"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                setGoal("");
                setIsAutoGoal(false);
                inputRef.current?.focus();
              }}
            >
              <X size={14} />
            </button>
          )}
        </span>
        <Button size="lg" onClick={() => void submit()} aria-busy={submitting}>
          {submitting ? "Making it SMART…" : "Make it SMART"}
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
