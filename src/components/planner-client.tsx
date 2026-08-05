"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  CloudOff,
  Lightbulb,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { ContextDialog } from "@/components/context-dialog";
import { GuestUpgradeButton } from "@/components/guest-upgrade-button";
import { StepTree } from "@/components/step-tree";
import { Button } from "@/components/ui/button";
import { PageBackLink } from "@/components/page-back-link";
import { PlanEmojiPicker } from "@/components/plan-emoji-picker";
import { AiClientError, postAi } from "@/lib/ai/client";
import { GUEST_MAX_STEP_DEPTH } from "@/lib/config";
import { clearGuestPlanSnapshot } from "@/lib/planner/guest-transfer";
import {
  getPlan,
  savePlan,
  toggleStepCompletion,
} from "@/lib/planner/repository";
import {
  buildStepTree,
  calculatePlanProgress,
  formatMinutes,
  getActiveSteps,
  hasCompletedDescendants,
  replacePlanSteps,
  replaceStepChildren,
  setStepCompletion,
} from "@/lib/planner/tree";
import type {
  ContextAnswer,
  GeneratedPlan,
  GeneratedQuestion,
  GeneratedStep,
  PlanRecord,
  StepRecord,
  Viewer,
} from "@/lib/planner/types";
import { asErrorMessage, createId } from "@/lib/utils";

type ContextTarget = { step: StepRecord | null; questions: GeneratedQuestion[] };
type UpgradeReason = "save" | "depth" | "usage";

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
  const [contextTarget, setContextTarget] = useState<ContextTarget | null>(null);
  const [contextBusy, setContextBusy] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);

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
  const contextStepHasChildren = Boolean(
    plan && contextTarget?.step && getActiveSteps(plan).some((step) => step.parentId === contextTarget.step?.id),
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

  function confirmReplacement(step: StepRecord | null) {
    if (!plan) return false;
    const hasCompleted = step
      ? hasCompletedDescendants(plan, step.id)
      : getActiveSteps(plan).some((candidate) => candidate.isCompleted);
    return (
      !hasCompleted ||
      window.confirm(
        "This branch contains completed work. Regenerating will replace the active steps and reset progress for this branch. Your activity history will remain. Continue?",
      )
    );
  }

  async function breakDown(
    step: StepRecord,
    context: { question: string; answer: string }[] = [],
    questionMetadata: GeneratedQuestion[] = [],
  ) {
    if (!plan) return;
    if (viewer.isGuest && step.depth >= GUEST_MAX_STEP_DEPTH) {
      setUpgradeReason("depth");
      return;
    }
    if (!confirmReplacement(step)) return;
    setBusyTarget(step.id);
    setContextBusy(context.length > 0);
    setError("");
    try {
      const { output } = await postAi<{ steps: GeneratedStep[] }>("breakdown", {
        goal: plan.goal,
        planSummary: plan.summary,
        targetTitle: step.title,
        targetDescription: step.description,
        targetMinutes: step.estimatedMinutes,
        targetDepth: step.depth,
        ancestorPath: ancestorPath(plan, step),
        context,
      });
      const generationId = createId();
      const now = new Date().toISOString();
      let updated = replaceStepChildren({
        plan,
        stepId: step.id,
        generated: output.steps,
        generationId,
        now,
      });
      const newContexts: ContextAnswer[] = context.map((entry, position) => ({
        id: createId(),
        planId: plan.id,
        userId: plan.userId,
        targetStepId: step.id,
        generationId,
        question: entry.question,
        reason: questionMetadata[position]?.reason ?? "Added before regeneration.",
        answer: entry.answer,
        position,
        createdAt: now,
      }));
      updated = { ...updated, contexts: updated.contexts.concat(newContexts) };
      await savePlan(updated, { temporary: viewer.isGuest });
      setPlan(updated);
      setContextTarget(null);
    } catch (reason) {
      handlePlanningError(reason);
    } finally {
      setBusyTarget(null);
      setContextBusy(false);
    }
  }

  async function askForContext(step: StepRecord | null) {
    if (!plan) return;
    if (viewer.isGuest && step && step.depth >= GUEST_MAX_STEP_DEPTH) {
      setUpgradeReason("depth");
      return;
    }
    setBusyTarget(step?.id ?? "plan-context");
    setError("");
    try {
      const existing = plan.contexts
        .filter((entry) => entry.targetStepId === (step?.id ?? null))
        .map((entry) => ({ question: entry.question, answer: entry.answer }));
      const { output } = await postAi<{ questions: GeneratedQuestion[] }>("questions", {
        goal: plan.goal,
        planSummary: plan.summary,
        targetTitle: step?.title ?? null,
        targetDescription: step?.description ?? null,
        ancestorPath: step ? ancestorPath(plan, step) : [],
        existingContext: existing,
      });
      setContextTarget({ step, questions: output.questions });
    } catch (reason) {
      handlePlanningError(reason);
    } finally {
      setBusyTarget(null);
    }
  }

  async function regeneratePlan(
    context: { question: string; answer: string }[],
    questionMetadata: GeneratedQuestion[],
  ) {
    if (!plan || !confirmReplacement(null)) return;
    setContextBusy(true);
    setBusyTarget("plan-context");
    setError("");
    try {
      const { output } = await postAi<GeneratedPlan>("plan", {
        goal: plan.goal,
        context,
      });
      const generationId = createId();
      const now = new Date().toISOString();
      let updated = replacePlanSteps({
        plan,
        generated: output.steps,
        generationId,
        title: output.title,
        summary: output.summary,
        assumptions: output.assumptions,
        now,
      });
      updated = {
        ...updated,
        contexts: updated.contexts.concat(
          context.map((entry, position) => ({
            id: createId(),
            planId: plan.id,
            userId: plan.userId,
            targetStepId: null,
            generationId,
            question: entry.question,
            reason: questionMetadata[position]?.reason ?? "Added before regeneration.",
            answer: entry.answer,
            position,
            createdAt: now,
          })),
        ),
      };
      await savePlan(updated, { temporary: viewer.isGuest });
      setPlan(updated);
      setContextTarget(null);
    } catch (reason) {
      handlePlanningError(reason);
    } finally {
      setContextBusy(false);
      setBusyTarget(null);
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
            <CloudOff size={18} />
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
        <div className="planner-title"><h1>{plan.title}</h1><p>{plan.summary}</p></div>
      </section>

      <section className="plan-overview">
        <PlanEmojiPicker value={plan.emoji} size="lg" onChange={(emoji) => void changePlanEmoji(emoji)} />
        <div className="overview-progress"><div><strong>{progress?.percentage ?? 0}%</strong><span>{progress?.completedMinutes ?? 0} / {progress?.totalMinutes ?? 0} min</span></div><div className="progress-track"><span style={{ width: `${progress?.percentage ?? 0}%` }} /></div></div>
        <div className="overview-time"><Clock3 size={18} /><span><small>Total time</small><strong>{formatMinutes(progress?.totalMinutes ?? 0)}</strong></span></div>
      </section>

      <details className="assumptions">
        <summary>Planning assumptions</summary>
        {plan.assumptions.length > 0 && <ul>{plan.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>}
        <div className="assumptions-actions">
          <Button variant="secondary" onClick={() => askForContext(null)} disabled={Boolean(busyTarget)}>{busyTarget === "plan-context" ? <LoaderCircle className="spin" size={17} /> : <Lightbulb size={17} />} Add context</Button>
        </div>
      </details>

      <section className="plan-steps-section">
        <div className="steps-heading"><h2>Steps</h2></div>
        <StepTree nodes={tree} busyTarget={busyTarget} onToggle={toggle} onBreakdown={(step) => breakDown(step)} onAddContext={askForContext} isGuest={viewer.isGuest} />
      </section>

      <ContextDialog
        open={Boolean(contextTarget)}
        subject={contextTarget?.step?.title ?? plan.title}
        questions={contextTarget?.questions ?? []}
        busy={contextBusy}
        submitLabel={contextTarget?.step ? contextStepHasChildren ? "Regenerate" : "Break it down" : "Update the plan"}
        busyLabel={contextTarget?.step ? contextStepHasChildren ? "Regenerating…" : "Breaking it down…" : "Updating…"}
        onClose={() => setContextTarget(null)}
        onSubmit={(answers) => {
          if (!contextTarget) return;
          if (contextTarget.step) breakDown(contextTarget.step, answers, contextTarget.questions);
          else regeneratePlan(answers, contextTarget.questions);
        }}
      />
    </main>
  );
}
