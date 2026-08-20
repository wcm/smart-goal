"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, GitBranchPlus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StepRecord } from "@/lib/planner/types";

export type StepEditorValues = {
  title: string;
  description: string;
  estimatedMinutes: number;
  context: string;
};

export type StepEditorAction = "breakdown" | "regenerate";

export function PlanContextEditorDialog({
  open,
  initialContext,
  busy,
  onClose,
  onSave,
}: {
  open: boolean;
  initialContext: string[];
  busy: boolean;
  onClose: () => void;
  onSave: (context: string[]) => void;
}) {
  if (!open) return null;
  return (
    <PlanContextEditorContent
      key={initialContext.join("\n")}
      initialContext={initialContext}
      busy={busy}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function PlanContextEditorContent({
  initialContext,
  busy,
  onClose,
  onSave,
}: {
  initialContext: string[];
  busy: boolean;
  onClose: () => void;
  onSave: (context: string[]) => void;
}) {
  const [context, setContext] = useState(initialContext.join("\n"));

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !busy) onClose();
    }}>
      <form className="context-dialog edit-context-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-context-editor-title" onSubmit={(event) => {
        event.preventDefault();
        onSave(context.split("\n").map((line) => line.trim()).filter(Boolean));
      }}>
        <div className="dialog-heading">
          <h2 id="plan-context-editor-title">Edit plan context</h2>
          <button type="button" className="icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <label className="edit-context-field">
          <span>What should the plan take into account?</span>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Add one constraint, preference, or important detail per line…"
            maxLength={12000}
            rows={8}
            autoFocus
          />
          <small>Use one line for each detail. This context will be used when breaking steps down.</small>
        </label>
        <div className="dialog-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save context"}</Button>
        </div>
      </form>
    </div>
  );
}

export function StepEditorDialog({
  step,
  initialContext,
  hasChildren,
  actionDisabled,
  busy,
  onSave,
}: {
  step: StepRecord | null;
  initialContext: string;
  hasChildren: boolean;
  actionDisabled: boolean;
  busy: boolean;
  onSave: (values: StepEditorValues, action?: StepEditorAction) => void;
}) {
  if (!step) return null;
  return (
    <StepEditorContent
      key={`${step.id}-${step.updatedAt}`}
      step={step}
      initialContext={initialContext}
      hasChildren={hasChildren}
      actionDisabled={actionDisabled}
      busy={busy}
      onSave={onSave}
    />
  );
}

function StepEditorContent({
  step,
  initialContext,
  hasChildren,
  actionDisabled,
  busy,
  onSave,
}: {
  step: StepRecord;
  initialContext: string;
  hasChildren: boolean;
  actionDisabled: boolean;
  busy: boolean;
  onSave: (values: StepEditorValues, action?: StepEditorAction) => void;
}) {
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description);
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(step.estimatedMinutes));
  const [context, setContext] = useState(initialContext);
  const [confirmationStep, setConfirmationStep] = useState<0 | 1 | 2>(0);

  function values(): StepEditorValues {
    return {
      title: title.trim() || step.title,
      description: description.trim(),
      estimatedMinutes: Math.min(525600, Math.max(2, Math.round(Number(estimatedMinutes) || step.estimatedMinutes))),
      context: context.trim(),
    };
  }

  function saveAndClose(action?: StepEditorAction) {
    if (busy) return;
    onSave(values(), action);
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || busy) return;
      event.preventDefault();
      saveAndClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  });

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) saveAndClose();
    }}>
      <form className="context-dialog edit-context-dialog" role="dialog" aria-modal="true" aria-labelledby="step-editor-title" onSubmit={(event) => {
        event.preventDefault();
        saveAndClose();
      }}>
        <div className="dialog-heading">
          <h2 id="step-editor-title">Edit step</h2>
          <button type="button" className="icon-button" onClick={() => saveAndClose()} disabled={busy} aria-label="Save and close dialog"><X size={19} /></button>
        </div>
        <div className="edit-context-fields">
          <label className="edit-context-field">
            <span>Step title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={500} autoFocus required />
          </label>
          <label className="edit-context-field">
            <span>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={4} />
          </label>
          <label className="edit-context-field edit-time-field">
            <span>Estimated time</span>
            <span><input type="number" value={estimatedMinutes} onChange={(event) => setEstimatedMinutes(event.target.value)} min={2} max={525600} required /><small>minutes</small></span>
          </label>
          <label className="edit-context-field">
            <span>Context</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Add constraints, preferences, resources, or anything else the breakdown should consider…"
              maxLength={8000}
              rows={5}
            />
            <small>This will be considered every time you break down or regenerate this step.</small>
          </label>
        </div>
        <div className="step-editor-footer">
          {confirmationStep === 0 && <small className="edit-autosave-note">Changes save automatically when you close.</small>}
          {hasChildren && confirmationStep === 1 ? (
            <div className="regenerate-confirmation" role="alert">
              <AlertTriangle size={18} />
              <div><strong>Replace all sub-tasks?</strong><p>Their titles, descriptions, context, and completion progress will all be updated.</p></div>
              <div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmationStep(0)}>Not now</Button>
                <Button type="button" size="sm" onClick={() => setConfirmationStep(2)}>Continue</Button>
              </div>
            </div>
          ) : hasChildren && confirmationStep === 2 ? (
            <div className="regenerate-confirmation regenerate-confirmation-final" role="alert">
              <AlertTriangle size={18} />
              <div><strong>One final check</strong><p>This cannot be undone. Are you sure you want to regenerate every sub-task?</p></div>
              <div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmationStep(1)}>Back</Button>
                <Button type="button" size="sm" onClick={() => saveAndClose("regenerate")} disabled={busy}>{busy ? "Saving…" : "Yes, regenerate"}</Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => hasChildren ? setConfirmationStep(1) : saveAndClose("breakdown")}
              disabled={busy || actionDisabled || (Number(estimatedMinutes) || step.estimatedMinutes) < 2}
            >
              {busy ? null : hasChildren ? <RefreshCw size={15} /> : <GitBranchPlus size={15} />}
              {busy ? "Saving…" : hasChildren ? "Regenerate all sub-tasks" : "Break it down"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
