"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { GeneratedQuestion } from "@/lib/planner/types";

type ContextAnswer = { question: string; answer: string };

const ADDITIONAL_CONTEXT_QUESTION = "Anything else that feels critical?";

export function ContextQuestionForm({
  questions,
  busy,
  submitLabel,
  busyLabel,
  onCancel,
  onSubmit,
}: {
  questions: GeneratedQuestion[];
  busy: boolean;
  submitLabel: string;
  busyLabel: string;
  onCancel?: () => void;
  onSubmit: (answers: ContextAnswer[]) => void;
}) {
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [additionalContext, setAdditionalContext] = useState("");

  function submit() {
    const generatedAnswers = questions.map((question, index) => ({
      question: question.question,
      answer: answers[index]?.trim() || "No preference provided.",
    }));
    const extra = additionalContext.trim();
    onSubmit(extra
      ? generatedAnswers.concat({ question: ADDITIONAL_CONTEXT_QUESTION, answer: extra })
      : generatedAnswers);
  }

  return (
    <>
      <div className="question-list">
        {questions.map((question, index) => (
          <label key={`${question.question}-${index}`}>
            <span><strong>{index + 1}</strong> {question.question}</span>
            <textarea
              value={answers[index] ?? ""}
              onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
              placeholder="Your answer…"
              maxLength={2000}
              rows={3}
              autoFocus={index === 0}
            />
          </label>
        ))}
        <label className="additional-context">
          <span><strong aria-hidden="true">+</strong> {ADDITIONAL_CONTEXT_QUESTION}</span>
          <textarea
            value={additionalContext}
            onChange={(event) => setAdditionalContext(event.target.value)}
            placeholder="Add any constraint, preference, or detail…"
            maxLength={2000}
            rows={3}
          />
        </label>
      </div>
      <div className="dialog-actions">
        {onCancel && <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>}
        <Button onClick={submit} disabled={busy}>
          {busy ? busyLabel : submitLabel}
        </Button>
      </div>
    </>
  );
}
