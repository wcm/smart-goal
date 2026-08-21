"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ChevronRight,
  Clock3,
  CloudOff,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  PlanContextEditorDialog,
  StepEditorDialog,
  type StepEditorAction,
  type StepEditorValues,
} from "@/components/context-editor-dialog";
import { GuestUpgradeButton } from "@/components/guest-upgrade-button";
import { StepTree } from "@/components/step-tree";
import { PageBackLink } from "@/components/page-back-link";
import { PlanEmojiPicker } from "@/components/plan-emoji-picker";
import { PlanRenameDialog } from "@/components/plan-rename-dialog";
import { AiClientError, postAi } from "@/lib/ai/client";
import { GUEST_MAX_STEP_DEPTH, MAX_STEP_DEPTH } from "@/lib/config";
import { clearGuestPlanSnapshot } from "@/lib/planner/guest-transfer";
import {
  archivePlan,
  deletePlan,
  getPlan,
  renamePlan,
  savePlan,
  toggleStepCompletion,
} from "@/lib/planner/repository";
import {
  buildStepTree,
  calculatePlanProgress,
  formatMinutes,
  hasOnlyFirstStepLayer,
  replaceStepChildren,
  setStepCompletion,
} from "@/lib/planner/tree";
import type {
  ContextAnswer,
  GeneratedStep,
  PlanRecord,
  StepRecord,
  Viewer,
} from "@/lib/planner/types";
import { asErrorMessage, createId } from "@/lib/utils";

type UpgradeReason = "save" | "depth" | "usage";
const MANUAL_STEP_CONTEXT_QUESTION = "Additional step context";
const SMART_DEFINITION_PREFIX = "SMART goal definition:";

function hasUsefulAnswer(answer: string) {
  const normalized = answer.trim().toLowerCase();
  return Boolean(normalized) && normalized !== "no preference provided.";
}

function contextAnswerLine(entry: ContextAnswer) {
  return entry.question === MANUAL_STEP_CONTEXT_QUESTION
    ? entry.answer.trim()
    : `${entry.question}: ${entry.answer.trim()}`;
}

function getPlanContextItems(plan: PlanRecord) {
  const items = [
    ...plan.contexts
      .filter((entry) => entry.targetStepId === null && hasUsefulAnswer(entry.answer))
      .map(contextAnswerLine),
    ...plan.assumptions.map((assumption) => assumption.trim()).filter(Boolean),
  ];
  return Array.from(new Set(items));
}

function displayPlanContextItem(item: string) {
  return item.startsWith(SMART_DEFINITION_PREFIX)
    ? item.replace(SMART_DEFINITION_PREFIX, `${SMART_DEFINITION_PREFIX}\n`)
    : item;
}

function getStepContextText(plan: PlanRecord, stepId: string) {
  return plan.contexts
    .filter((entry) => entry.targetStepId === stepId && hasUsefulAnswer(entry.answer))
    .map(contextAnswerLine)
    .join("\n");
}

function packContextLines(lines: string[], maxChunks = 12) {
  const chunks: string[] = [];
  let current = "";

  for (const rawLine of lines) {
    let remaining = rawLine.trim();
    while (remaining && chunks.length < maxChunks) {
      const separator = current ? "\n" : "";
      const available = 2000 - current.length - separator.length;
      const part = remaining.slice(0, available);
      current += `${separator}${part}`;
      remaining = remaining.slice(part.length);
      if (current.length >= 2000) {
        chunks.push(current);
        current = "";
      }
    }
    if (chunks.length >= maxChunks) break;
  }
  if (current && chunks.length < maxChunks) chunks.push(current);
  return chunks;
}

function getBreakdownContext(plan: PlanRecord, step: StepRecord) {
  const pathIds = new Set<string>();
  let current: StepRecord | undefined = step;
  while (current) {
    pathIds.add(current.id);
    current = current.parentId
      ? plan.steps.find((candidate) => candidate.id === current?.parentId)
      : undefined;
  }

  const stepContext = plan.contexts
    .filter((entry) => entry.targetStepId && pathIds.has(entry.targetStepId) && hasUsefulAnswer(entry.answer))
    .sort((left, right) => Number(right.targetStepId === step.id) - Number(left.targetStepId === step.id))
    .map((entry) => {
      const sourceStep = plan.steps.find((candidate) => candidate.id === entry.targetStepId);
      return `${sourceStep?.title ?? "Step"}: ${contextAnswerLine(entry)}`;
    });
  const planAnswers = plan.contexts
    .filter((entry) => entry.targetStepId === null && hasUsefulAnswer(entry.answer))
    .map((entry) => contextAnswerLine(entry));
  const planContext = plan.assumptions
    .map((answer) => answer.trim())
    .filter(Boolean)
    .map((answer) => `Plan context: ${answer}`);

  return packContextLines([...stepContext, ...planAnswers, ...planContext]).map((answer, index) => ({
    question: index === 0 ? "Relevant saved context" : `Relevant saved context (continued ${index + 1})`,
    answer,
  }));
}

function ancestorPath(plan: PlanRecord, step: StepRecord) {
  const path = [step.title];
  let parentId = step.parentId;
  while (parentId) {
    const parent = plan.steps.find((candidate) => candidate.id === parentId);
    if (!parent) break;
    path.unshift(parent.title);
    parentId = parent.parentId;
  }
  return path;
}

export function PlannerClient({ planId, viewer }: { planId: string; viewer: Viewer }) {
  const [plan, setPlan] = useState<PlanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyTarget, setBusyTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<"plan" | string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [planActionBusy, setPlanActionBusy] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    getPlan(planId, viewer.id, { temporary: viewer.isGuest })
      .then(setPlan)
      .catch((reason) => setError(asErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [planId, viewer.id, viewer.isGuest]);

  useEffect(() => {
    if (!viewer.isGuest && !viewer.isDemo) clearGuestPlanSnapshot();
  }, [viewer.isDemo, viewer.isGuest]);

  const progress = useMemo(
    () => (plan ? calculatePlanProgress(plan) : null),
    [plan],
  );
  const tree = useMemo(() => (plan ? buildStepTree(plan) : []), [plan]);
  const hasOnlyFirstLayer = useMemo(() => plan ? hasOnlyFirstStepLayer(plan) : false, [plan]);
  const planContextItems = useMemo(() => plan ? getPlanContextItems(plan) : [], [plan]);
  const editedStep = useMemo(
    () => plan && editTarget && editTarget !== "plan" ? plan.steps.find((step) => step.id === editTarget) ?? null : null,
    [editTarget, plan],
  );
  const editedStepHasChildren = useMemo(
    () => Boolean(plan && editedStep && plan.steps.some((step) => !step.archivedAt && step.parentId === editedStep.id)),
    [editedStep, plan],
  );

  function handlePlanningError(reason: unknown) {
    if (reason instanceof AiClientError) {
      if (reason.code === "GUEST_DEPTH_LIMIT_REACHED") {
        setUpgradeReason("depth");
        return;
      }
      if (reason.code === "GUEST_AI_LIMIT_REACHED") {
        setUpgradeReason("usage");
        return;
      }
    }
    setError(asErrorMessage(reason));
  }

  async function toggle(step: StepRecord, completed: boolean) {
    if (!plan) return;
    const previous = plan;
    setPlan(setStepCompletion(plan, step.id, completed));
    setError("");
    try {
      setPlan(await toggleStepCompletion(previous, step.id, completed, { temporary: viewer.isGuest }));
    } catch (reason) {
      setPlan(previous);
      setError(asErrorMessage(reason));
    }
  }

  async function changePlanEmoji(emoji: string) {
    if (!plan || emoji === plan.emoji) return;
    const previous = plan;
    const updated = { ...plan, emoji, updatedAt: new Date().toISOString() };
    setPlan(updated);
    setError("");
    try {
      await savePlan(updated, { temporary: viewer.isGuest });
    } catch (reason) {
      setPlan(previous);
      setError(asErrorMessage(reason));
    }
  }

  function confirmRegeneration() {
    return window.confirm(
      "Regenerate all sub-tasks? Their titles, descriptions, context, and completion progress will all be updated.",
    ) && window.confirm(
      "One final check: this cannot be undone. Are you sure you want to regenerate every sub-task?",
    );
  }

  async function breakDown(step: StepRecord, sourcePlan = plan, regenerationConfirmed = false) {
    if (!sourcePlan) return;
    if (viewer.isGuest && step.depth >= GUEST_MAX_STEP_DEPTH) {
      setUpgradeReason("depth");
      return;
    }
    const hasChildren = sourcePlan.steps.some((candidate) => !candidate.archivedAt && candidate.parentId === step.id);
    if (hasChildren && !regenerationConfirmed && !confirmRegeneration()) return;
    const context = getBreakdownContext(sourcePlan, step);
    setBusyTarget(step.id);
    setError("");
    try {
      const { output } = await postAi<{ steps: GeneratedStep[] }>("breakdown", {
        goal: sourcePlan.goal,
        planSummary: sourcePlan.summary,
        targetTitle: step.title,
        targetDescription: step.description,
        targetMinutes: step.estimatedMinutes,
        targetDepth: step.depth,
        ancestorPath: ancestorPath(sourcePlan, step),
        context,
      });
      const generationId = createId();
      const now = new Date().toISOString();
      const updated = replaceStepChildren({
        plan: sourcePlan,
        stepId: step.id,
        generated: output.steps,
        generationId,
        now,
      });
      await savePlan(updated, { temporary: viewer.isGuest });
      setPlan(updated);
    } catch (reason) {
      handlePlanningError(reason);
    } finally {
      setBusyTarget(null);
    }
  }

  async function savePlanContext(context: string[]) {
    if (!plan) return;
    setEditBusy(true);
    setError("");
    try {
      const now = new Date().toISOString();
      const updated: PlanRecord = {
        ...plan,
        assumptions: context,
        contexts: plan.contexts.map((entry) => entry.targetStepId === null ? { ...entry, answer: "" } : entry),
        updatedAt: now,
      };
      await savePlan(updated, { temporary: viewer.isGuest });
      setPlan(updated);
      setEditTarget(null);
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setEditBusy(false);
    }
  }

  async function saveStepChanges(values: StepEditorValues, action?: StepEditorAction) {
    if (!plan || !editedStep) return;
    setEditBusy(true);
    setError("");
    try {
      const currentContext = getStepContextText(plan, editedStep.id).trim();
      const hasChanges = values.title !== editedStep.title
        || values.description !== editedStep.description
        || values.estimatedMinutes !== editedStep.estimatedMinutes
        || values.context !== currentContext;
      if (!hasChanges) {
        setEditTarget(null);
        if (action) await breakDown(editedStep, plan, action === "regenerate");
        return;
      }
      const now = new Date().toISOString();
      const stepContexts = plan.contexts.filter((entry) => entry.targetStepId === editedStep.id);
      const manualContext = stepContexts.find((entry) => entry.question === MANUAL_STEP_CONTEXT_QUESTION);
      let updatedContexts = plan.contexts.map((entry) => entry.targetStepId === editedStep.id ? { ...entry, answer: "" } : entry);
      if (values.context) {
        if (manualContext) {
          updatedContexts = updatedContexts.map((entry) => entry.id === manualContext.id ? { ...entry, answer: values.context } : entry);
        } else {
          updatedContexts = updatedContexts.concat({
            id: createId(),
            planId: plan.id,
            userId: plan.userId,
            targetStepId: editedStep.id,
            generationId: editedStep.generationId,
            question: MANUAL_STEP_CONTEXT_QUESTION,
            reason: "Edited directly by the user.",
            answer: values.context,
            position: stepContexts.length,
            createdAt: now,
          });
        }
      }
      const updated: PlanRecord = {
        ...plan,
        steps: plan.steps.map((step) => step.id === editedStep.id ? {
          ...step,
          title: values.title,
          description: values.description,
          estimatedMinutes: values.estimatedMinutes,
          updatedAt: now,
        } : step),
        contexts: updatedContexts,
        updatedAt: now,
      };
      const updatedStep = updated.steps.find((step) => step.id === editedStep.id);
      await savePlan(updated, { temporary: viewer.isGuest });
      setPlan(updated);
      setEditTarget(null);
      if (action && updatedStep) {
        await breakDown(updatedStep, updated, action === "regenerate");
      }
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setEditBusy(false);
    }
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleDismiss(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }
    window.addEventListener("pointerdown", handleDismiss);
    window.addEventListener("keydown", handleDismiss);
    return () => {
      window.removeEventListener("pointerdown", handleDismiss);
      window.removeEventListener("keydown", handleDismiss);
    };
  }, [menuOpen]);

  async function toggleArchive() {
    if (!plan || planActionBusy) return;
    setMenuOpen(false);
    setPlanActionBusy(true);
    setError("");
    try {
      setPlan(await archivePlan(plan, { temporary: viewer.isGuest }));
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setPlanActionBusy(false);
    }
  }

  async function savePlanName(title: string) {
    if (!plan || planActionBusy) return;
    setPlanActionBusy(true);
    setError("");
    try {
      setPlan(await renamePlan(plan, title, { temporary: viewer.isGuest }));
      setRenameOpen(false);
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setPlanActionBusy(false);
    }
  }

  async function removePlan() {
    if (!plan || planActionBusy) return;
    if (!window.confirm("Delete this plan permanently?")) return;
    setMenuOpen(false);
    setPlanActionBusy(true);
    setError("");
    try {
      await deletePlan(plan.id, { temporary: viewer.isGuest });
      router.push(viewer.isGuest ? "/" : "/plans");
    } catch (reason) {
      setError(asErrorMessage(reason));
      setPlanActionBusy(false);
    }
  }

  if (loading) {
    return <main className="planner page-shell app-shell"><div className="planner-loading"><LoaderCircle className="spin" /><span>Opening your plan…</span></div></main>;
  }
  if (!plan) {
    return <main className="planner page-shell app-shell"><div className="empty-plans empty-plans-detailed"><h2>Plan not found</h2><p>It may have been removed or belong to a different account.</p><Link className="button button-secondary" href="/plans">Back to plans</Link></div></main>;
  }

  return (
    <main className={`planner page-shell app-shell ${viewer.isGuest ? "has-guest-banner" : ""}`}>
      <div className="page-back-row"><PageBackLink href={viewer.isGuest ? "/" : "/plans"}>{viewer.isGuest ? "Home" : "All plans"}</PageBackLink></div>
      {viewer.isDemo && <div className="demo-banner"><Sparkles size={16} /> Demo mode — AI responses are deterministic and this plan lives only in this browser.</div>}
      {viewer.isGuest && (
        <div className="guest-plan-banner">
          <div>
            <CloudOff size={22} />
            <span><strong>Don’t lose your progress</strong><small>Sign in to save this plan and continue next time.</small></span>
          </div>
          <GuestUpgradeButton
            label="Save this plan"
            reason={upgradeReason ?? "save"}
            open={Boolean(upgradeReason)}
            onOpenChange={(open) => setUpgradeReason(open ? upgradeReason ?? "save" : null)}
          />
        </div>
      )}
      {error && <div className="error-card floating-message" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}

      <section className="planner-hero">
        <div className="planner-title">
          <h1>{plan.title}{plan.status === "archived" && <span className="plan-status-chip">Archived</span>}</h1>
          <p>{plan.summary}</p>
        </div>
        <div className="card-menu-wrap" ref={menuRef}>
          <button className="icon-button" onClick={() => setMenuOpen((open) => !open)} disabled={planActionBusy} aria-label="Plan actions" aria-expanded={menuOpen}><MoreHorizontal size={19} /></button>
          {menuOpen && (
            <div className="card-menu">
              <button onClick={() => { setMenuOpen(false); setRenameOpen(true); }}><Pencil size={15} />Rename</button>
              {!viewer.isGuest && <button onClick={() => void toggleArchive()}><Archive size={15} />{plan.status === "active" ? "Archive" : "Restore"}</button>}
              <button className="danger" onClick={() => void removePlan()}><Trash2 size={15} />Delete</button>
            </div>
          )}
        </div>
      </section>

      <section className="plan-overview">
        <PlanEmojiPicker value={plan.emoji} size="lg" onChange={(emoji) => void changePlanEmoji(emoji)} />
        <div className="overview-progress"><div><strong>{progress?.percentage ?? 0}%</strong><span>{progress?.completedMinutes ?? 0} / {progress?.totalMinutes ?? 0} min</span></div><div className="progress-track"><span style={{ width: `${progress?.percentage ?? 0}%` }} /></div></div>
        <div className="overview-time"><Clock3 size={18} /><span><small>Total time</small><strong>{formatMinutes(progress?.totalMinutes ?? 0)}</strong></span></div>
      </section>

      <details className="assumptions">
        <summary>
          <span className="assumptions-collapse-icon" aria-hidden="true"><ChevronRight size={17} /></span>
          <h2>Plan context</h2>
          <button className="step-edit-button context-edit-button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setEditTarget("plan"); }} aria-label="Edit plan context" title="Edit plan context"><Pencil size={16} /></button>
        </summary>
        {planContextItems.length > 0
          ? <ul className="plan-context-list">{planContextItems.map((item) => <li className="plan-context-item" key={item}>{displayPlanContextItem(item)}</li>)}</ul>
          : <p className="assumptions-empty">No additional context yet.</p>}
      </details>

      <section className="plan-steps-section">
        <div className="steps-heading"><h2>Steps</h2></div>
        <StepTree nodes={tree} busyTarget={busyTarget} onToggle={toggle} onBreakdown={(step) => breakDown(step)} onEdit={(step) => setEditTarget(step.id)} isGuest={viewer.isGuest} highlightFirstBreakdown={hasOnlyFirstLayer} />
      </section>

      <PlanContextEditorDialog
        open={editTarget === "plan"}
        initialContext={planContextItems}
        busy={editBusy}
        onClose={() => setEditTarget(null)}
        onSave={(context) => void savePlanContext(context)}
      />
      <PlanRenameDialog
        plan={renameOpen ? plan : null}
        busy={planActionBusy}
        onClose={() => setRenameOpen(false)}
        onSave={(title) => void savePlanName(title)}
      />
      <StepEditorDialog
        step={editedStep}
        initialContext={editedStep ? getStepContextText(plan, editedStep.id) : ""}
        hasChildren={editedStepHasChildren}
        actionDisabled={Boolean(editedStep && (
          editedStep.isCompleted
          || editedStep.depth >= MAX_STEP_DEPTH
          || (viewer.isGuest && editedStep.depth >= GUEST_MAX_STEP_DEPTH)
        ))}
        busy={editBusy}
        onClose={() => setEditTarget(null)}
        onSave={(values, action) => void saveStepChanges(values, action)}
      />
    </main>
  );
}
