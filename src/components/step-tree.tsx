"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUEST_MAX_STEP_DEPTH, MAX_STEP_DEPTH } from "@/lib/config";
import { formatMinutes, type StepTreeNode } from "@/lib/planner/tree";
import type { StepRecord } from "@/lib/planner/types";

export function StepTree({
  nodes,
  busyTarget,
  onToggle,
  onBreakdown,
  onEdit,
  isGuest = false,
  highlightFirstBreakdown = false,
}: {
  nodes: StepTreeNode[];
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onEdit: (step: StepRecord) => void;
  isGuest?: boolean;
  highlightFirstBreakdown?: boolean;
}) {
  const highlightedStepId = highlightFirstBreakdown
    ? nodes.find((node) => (
      !node.isCompleted
      && node.children.length === 0
      && node.depth < MAX_STEP_DEPTH
      && (!isGuest || node.depth < GUEST_MAX_STEP_DEPTH)
    ))?.id ?? null
    : null;

  return (
    <div className="step-tree">
      {nodes.map((node, index) => (
        <StepCard
          key={node.id}
          node={node}
          index={index}
          busyTarget={busyTarget}
          onToggle={onToggle}
          onBreakdown={onBreakdown}
          onEdit={onEdit}
          isGuest={isGuest}
          highlightBreakdown={node.id === highlightedStepId}
        />
      ))}
    </div>
  );
}

function StepCard({
  node,
  index,
  busyTarget,
  onToggle,
  onBreakdown,
  onEdit,
  isGuest,
  highlightBreakdown,
}: {
  node: StepTreeNode;
  index: number;
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onEdit: (step: StepRecord) => void;
  isGuest: boolean;
  highlightBreakdown: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const hasChildren = node.children.length > 0;
  const atLimit = node.depth >= MAX_STEP_DEPTH;
  const atGuestLimit = isGuest && node.depth >= GUEST_MAX_STEP_DEPTH && !atLimit;
  const busy = busyTarget === node.id;

  useEffect(() => {
    if (!celebrating) return;
    const timer = window.setTimeout(() => setCelebrating(false), 900);
    return () => window.clearTimeout(timer);
  }, [celebrating]);

  function toggleCompletion() {
    if (!node.isCompleted) setCelebrating(true);
    onToggle(node, !node.isCompleted);
  }

  return (
    <article className={`step-branch depth-${Math.min(node.depth, 4)} ${node.isCompleted ? "completed" : ""}`}>
      <div
        className={`step-card ${hasChildren ? "is-collapsible" : ""} ${celebrating ? "is-celebrating" : ""}`}
        onClick={(event) => {
          if (busy || !hasChildren || (event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
          setCollapsed((value) => !value);
        }}
      >
        <div className="step-leading">
          {hasChildren && !busy ? (
            <button
              className="collapse-button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expand child steps" : "Collapse child steps"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronRight size={17} /> : <ChevronDown size={17} />}
            </button>
          ) : <span className="collapse-spacer" />}
        </div>
        <div className="step-body">
          <div className="step-meta">
            <span className="step-index" aria-label={`Level ${node.depth}, step ${index + 1}`}>
              <span className="step-depth-dots" aria-hidden="true">
                {Array.from({ length: node.depth }, (_, dotIndex) => <i key={dotIndex} />)}
              </span>
              <span aria-hidden="true">Step {index + 1}</span>
            </span>
            <span className="time-chip">{formatMinutes(node.estimatedMinutes)}</span>
          </div>
          <h3>{node.title}</h3>
          <p>{node.description}</p>
          <div className="step-actions">
            {busy ? (
              <span className="step-working-indicator" role="status"><LoaderCircle className="spin" size={16} />Working...</span>
            ) : (
              <>
                {!node.isCompleted && !hasChildren && !atLimit && (
                  <Button className={highlightBreakdown ? "breakdown-ripple" : undefined} size="sm" onClick={() => onBreakdown(node)} disabled={Boolean(busyTarget)} title={atGuestLimit ? "Sign in to unlock more levels" : undefined}>
                    {atGuestLimit ? "Unlock next level" : "Break it down"}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className={`step-done-button ${node.isCompleted ? "is-done" : ""}`}
                  onClick={toggleCompletion}
                  disabled={Boolean(busyTarget)}
                  aria-label={`${node.isCompleted ? "Mark incomplete" : "Mark as done"}: ${node.title}`}
                  aria-pressed={node.isCompleted}
                >
                  {node.isCompleted ? <>Done <Check size={15} strokeWidth={2.6} /></> : "Mark as done"}
                </Button>
              </>
            )}
          </div>
        </div>
        <button className="step-edit-button" onClick={() => onEdit(node)} disabled={Boolean(busyTarget)} aria-label={`Edit ${node.title}`} title="Edit step"><Pencil size={16} /></button>
        {celebrating && <span className="step-celebration" aria-hidden="true">{Array.from({ length: 12 }, (_, piece) => <i key={piece} />)}</span>}
      </div>
      {hasChildren && (
        <div className={`step-children ${collapsed || busy ? "is-collapsed" : ""}`} inert={collapsed || busy}>
          <StepTree nodes={node.children} busyTarget={busyTarget} onToggle={onToggle} onBreakdown={onBreakdown} onEdit={onEdit} isGuest={isGuest} />
        </div>
      )}
    </article>
  );
}
