"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanRecord } from "@/lib/planner/types";

export function PlanRenameDialog({
  plan,
  busy,
  onClose,
  onSave,
}: {
  plan: PlanRecord | null;
  busy: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  if (!plan) return null;
  return (
    <PlanRenameDialogContent
      key={`${plan.id}-${plan.title}`}
      plan={plan}
      busy={busy}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function PlanRenameDialogContent({
  plan,
  busy,
  onClose,
  onSave,
}: {
  plan: PlanRecord;
  busy: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(plan.title);
  const trimmedTitle = title.trim();
  const missingTitle = !trimmedTitle;
  const unchanged = trimmedTitle === plan.title;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || busy) return;
      event.preventDefault();
      onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [busy, onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !busy) onClose();
    }}>
      <form className="context-dialog rename-plan-dialog" role="dialog" aria-modal="true" aria-labelledby="rename-plan-title" onSubmit={(event) => {
        event.preventDefault();
        if (!busy && !missingTitle && !unchanged) onSave(trimmedTitle);
      }}>
        <div className="dialog-heading">
          <h2 id="rename-plan-title">Rename plan</h2>
          <button type="button" className="icon-button" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={19} /></button>
        </div>
        <label className="edit-context-field">
          <span>Plan name</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={500}
            autoFocus
            required
            aria-invalid={missingTitle}
          />
          {missingTitle && <small className="form-error">Add a plan name.</small>}
        </label>
        <div className="dialog-actions">
          <Button type="submit" disabled={busy || missingTitle || unchanged}>
            {busy && <LoaderCircle className="spin" size={16} />}
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
