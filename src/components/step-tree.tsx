"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  GitBranchPlus,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
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
  onAddContext,
  isGuest = false,
}: {
  nodes: StepTreeNode[];
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onAddContext: (step: StepRecord) => void;
  isGuest?: boolean;
}) {
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
          onAddContext={onAddContext}
          isGuest={isGuest}
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
  onAddContext,
  isGuest,
}: {
  node: StepTreeNode;
  index: number;
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onAddContext: (step: StepRecord) => void;
  isGuest: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;
  const atLimit = node.depth >= MAX_STEP_DEPTH;
  const atGuestLimit = isGuest && node.depth >= GUEST_MAX_STEP_DEPTH && !atLimit;
  const tooSmall = node.estimatedMinutes < 2;
  const busy = busyTarget === node.id;

  return (
    <article className={`step-branch depth-${Math.min(node.depth, 4)} ${node.isCompleted ? "completed" : ""}`}>
      <div className="step-card">
        <div className="step-leading">
          {hasChildren ? (
            <button className="collapse-button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand child steps" : "Collapse child steps"}>
              {collapsed ? <ChevronRight size={17} /> : <ChevronDown size={17} />}
            </button>
          ) : <span className="collapse-spacer" />}
          <button
            className="step-checkbox"
            onClick={() => onToggle(node, !node.isCompleted)}
            aria-label={`${node.isCompleted ? "Mark incomplete" : "Mark complete"}: ${node.title}`}
            aria-pressed={node.isCompleted}
          >
            {node.isCompleted && <Check size={15} strokeWidth={3} />}
          </button>
        </div>
        <div className="step-body">
          <div className="step-title-row">
            <h3>{node.title}</h3>
            <span className="step-index" aria-label={`Level ${node.depth}, step ${index + 1}`}>
              <span className="step-depth-dots" aria-hidden="true">
                {Array.from({ length: node.depth }, (_, dotIndex) => <i key={dotIndex} />)}
              </span>
              <span aria-hidden="true">{index + 1}</span>
            </span>
          </div>
          <p>{node.description}</p>
          <div className="step-actions">
            <span className="time-chip">{formatMinutes(node.estimatedMinutes)}</span>
            <Button variant="ghost" size="sm" onClick={() => onAddContext(node)} disabled={Boolean(busyTarget)}><Lightbulb size={15} /> Add context</Button>
            <Button variant="secondary" size="sm" onClick={() => onBreakdown(node)} disabled={Boolean(busyTarget) || atLimit || tooSmall} title={atLimit ? `Maximum depth of ${MAX_STEP_DEPTH} reached` : atGuestLimit ? "Sign in to unlock more levels" : undefined}>
              {busy ? <LoaderCircle className="spin" size={15} /> : atLimit || atGuestLimit ? <LockKeyhole size={15} /> : <GitBranchPlus size={15} />}
              {busy ? "Working…" : atLimit ? "Depth limit" : atGuestLimit ? "Unlock next level" : hasChildren ? "Regenerate" : "Break it down"}
            </Button>
          </div>
        </div>
      </div>
      {hasChildren && !collapsed && (
        <div className="step-children">
          <span className="branch-line" aria-hidden="true" />
          <StepTree nodes={node.children} busyTarget={busyTarget} onToggle={onToggle} onBreakdown={onBreakdown} onAddContext={onAddContext} isGuest={isGuest} />
        </div>
      )}
    </article>
  );
}
