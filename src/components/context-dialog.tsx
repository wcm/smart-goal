"use client";

import { X } from "lucide-react";
import { ContextQuestionForm } from "@/components/context-question-form";
import type { GeneratedQuestion } from "@/lib/planner/types";

export function ContextDialog({
  open,
  subject,
  questions,
  busy,
  submitLabel = "Update the plan",
  busyLabel = "Updating…",
  onClose,
  onSubmit,
}: {
  open: boolean;
  subject: string;
  questions: GeneratedQuestion[];
  busy: boolean;
  submitLabel?: string;
  busyLabel?: string;
  onClose: () => void;
  onSubmit: (answers: { question: string; answer: string }[]) => void;
}) {
  if (!open) return null;

  return (
    <ContextDialogContent
      key={questions.map((question) => question.question).join("|")}
      subject={subject}
      questions={questions}
      busy={busy}
      submitLabel={submitLabel}
      busyLabel={busyLabel}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function ContextDialogContent({
  subject,
  questions,
  busy,
  submitLabel,
  busyLabel,
  onClose,
  onSubmit,
}: {
  subject: string;
  questions: GeneratedQuestion[];
  busy: boolean;
  submitLabel: string;
  busyLabel: string;
  onClose: () => void;
  onSubmit: (answers: { question: string; answer: string }[]) => void;
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !busy) onClose();
    }}>
      <section className="context-dialog" role="dialog" aria-modal="true" aria-labelledby="context-title">
        <div className="dialog-heading">
          <h2 id="context-title">Add context</h2>
          <button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <p className="context-subject">{subject}</p>
        <ContextQuestionForm
          questions={questions}
          busy={busy}
          submitLabel={submitLabel}
          busyLabel={busyLabel}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </section>
    </div>
  );
}
