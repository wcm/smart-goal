"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedQuestion } from "@/lib/planner/types";

export function ContextDialog({
  open,
  title,
  questions,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  questions: GeneratedQuestion[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (answers: { question: string; answer: string }[]) => void;
}) {
  if (!open) return null;

  return (
    <ContextDialogContent
      key={questions.map((question) => question.question).join("|")}
      title={title}
      questions={questions}
      busy={busy}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function ContextDialogContent({
  title,
  questions,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  questions: GeneratedQuestion[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (answers: { question: string; answer: string }[]) => void;
}) {
  const [answers, setAnswers] = useState<string[]>(() =>
    questions.map(() => ""),
  );

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !busy) onClose();
    }}>
      <section className="context-dialog" role="dialog" aria-modal="true" aria-labelledby="context-title">
        <div className="dialog-heading">
          <span className="dialog-icon"><Lightbulb size={20} /></span>
          <div><span className="section-label">ADD CONTEXT</span><h2 id="context-title">{title}</h2></div>
          <button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <p className="dialog-intro">A little context helps Goal Planner make the next version more realistic for you. Skip anything that does not matter.</p>
        <div className="question-list">
          {questions.map((question, index) => (
            <label key={`${question.question}-${index}`}>
              <span><strong>{index + 1}.</strong> {question.question}</span>
              <small>{question.reason}</small>
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
        </div>
        <div className="dialog-actions">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button
            onClick={() => onSubmit(questions.map((question, index) => ({ question: question.question, answer: answers[index]?.trim() || "No preference provided." })))}
            disabled={busy || answers.every((answer) => !answer.trim())}
          >
            {busy ? "Updating…" : "Update the plan"}
          </Button>
        </div>
      </section>
    </div>
  );
}
