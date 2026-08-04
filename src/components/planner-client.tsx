"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Lightbulb,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { ContextDialog } from "@/components/context-dialog";
import { StepTree } from "@/components/step-tree";
import { Button } from "@/components/ui/button";
import { postAi } from "@/lib/ai/client";
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
  const [notice, setNotice] = useState("");
  const [busyTarget, setBusyTarget] = useState<string | null>(null);
  const [contextTarget, setContextTarget] = useState<ContextTarget | null>(null);
  const [contextBusy, setContextBusy] = useState(false);

  useEffect(() => {
    getPlan(planId, viewer.id)
      .then(setPlan)
      .catch((reason) => setError(asErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [planId, viewer.id]);

  const progress = useMemo(
    () => (plan ? calculatePlanProgress(plan) : null),
    [plan],
  );
  const tree = useMemo(() => (plan ? buildStepTree(plan) : []), [plan]);

  async function toggle(step: StepRecord, completed: boolean) {
    if (!plan) return;
    const previous = plan;
    setPlan(setStepCompletion(plan, step.id, completed));
    setError("");
    try {
      setPlan(await toggleStepCompletion(previous, step.id, completed));
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
    if (!plan || !confirmReplacement(step)) return;
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
      await savePlan(updated);
      setPlan(updated);
      setNotice(`“${step.title}” now has a clearer next level.`);
      setContextTarget(null);
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setBusyTarget(null);
      setContextBusy(false);
    }
  }

  async function askForContext(step: StepRecord | null) {
    if (!plan) return;
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
      setError(asErrorMessage(reason));
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
      await savePlan(updated);
      setPlan(updated);
      setNotice("Your plan has been updated with the new context.");
      setContextTarget(null);
    } catch (reason) {
      setError(asErrorMessage(reason));
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
    <main className="planner page-shell app-shell">
      <div className="planner-breadcrumb"><Link href="/plans"><ArrowLeft size={16} /> All plans</Link></div>
      {viewer.isDemo && <div className="demo-banner"><Sparkles size={16} /> Demo mode — AI responses are deterministic and this plan lives only in this browser.</div>}
      {error && <div className="error-card floating-message" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
      {notice && <div className="success-card floating-message"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice("")}>×</button></div>}

      <section className="planner-hero">
        <div className="planner-title"><h1>{plan.title}</h1><p>{plan.summary}</p></div>
        <Button variant="secondary" onClick={() => askForContext(null)} disabled={Boolean(busyTarget)}>{busyTarget === "plan-context" ? <LoaderCircle className="spin" size={17} /> : <Lightbulb size={17} />} Add context</Button>
      </section>

      <section className="plan-overview">
        <div className="overview-progress"><div><strong>{progress?.percentage ?? 0}%</strong><span>{progress?.completedMinutes ?? 0} / {progress?.totalMinutes ?? 0} min</span></div><div className="progress-track"><span style={{ width: `${progress?.percentage ?? 0}%` }} /></div></div>
        <div className="overview-time"><Clock3 size={18} /><span><small>Total time</small><strong>{formatMinutes(progress?.totalMinutes ?? 0)}</strong></span></div>
      </section>

      {plan.assumptions.length > 0 && <details className="assumptions"><summary>Planning assumptions</summary><ul>{plan.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></details>}

      <section className="plan-steps-section">
        <div className="steps-heading"><h2>Steps</h2></div>
        <StepTree nodes={tree} busyTarget={busyTarget} onToggle={toggle} onBreakdown={(step) => breakDown(step)} onAddContext={askForContext} />
      </section>

      <ContextDialog
        open={Boolean(contextTarget)}
        subject={contextTarget?.step?.title ?? plan.title}
        questions={contextTarget?.questions ?? []}
        busy={contextBusy}
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
