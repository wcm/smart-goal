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
import { MAX_STEP_DEPTH } from "@/lib/config";
import { formatMinutes, type StepTreeNode } from "@/lib/planner/tree";
import type { StepRecord } from "@/lib/planner/types";

export function StepTree({
  nodes,
  busyTarget,
  onToggle,
  onBreakdown,
  onAddContext,
}: {
  nodes: StepTreeNode[];
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onAddContext: (step: StepRecord) => void;
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
}: {
  node: StepTreeNode;
  index: number;
  busyTarget: string | null;
  onToggle: (step: StepRecord, completed: boolean) => void;
  onBreakdown: (step: StepRecord) => void;
  onAddContext: (step: StepRecord) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;
  const atLimit = node.depth >= MAX_STEP_DEPTH;
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
          <div className="step-meta"><span>LEVEL {node.depth}</span><span>STEP {String(index + 1).padStart(2, "0")}</span></div>
          <h3>{node.title}</h3>
          <p>{node.description}</p>
          <div className="step-actions">
            <span className="time-chip">{formatMinutes(node.estimatedMinutes)}</span>
            <Button variant="ghost" size="sm" onClick={() => onAddContext(node)} disabled={Boolean(busyTarget)}><Lightbulb size={15} /> Add context</Button>
            <Button variant="secondary" size="sm" onClick={() => onBreakdown(node)} disabled={Boolean(busyTarget) || atLimit || tooSmall} title={atLimit ? `Maximum depth of ${MAX_STEP_DEPTH} reached` : undefined}>
              {busy ? <LoaderCircle className="spin" size={15} /> : atLimit ? <LockKeyhole size={15} /> : <GitBranchPlus size={15} />}
              {busy ? "Working…" : atLimit ? "Depth limit" : hasChildren ? "Regenerate children" : "Break it down"}
            </Button>
          </div>
        </div>
      </div>
      {hasChildren && !collapsed && (
        <div className="step-children">
          <span className="branch-line" aria-hidden="true" />
          <StepTree nodes={node.children} busyTarget={busyTarget} onToggle={onToggle} onBreakdown={onBreakdown} onAddContext={onAddContext} />
        </div>
      )}
    </article>
  );
}
