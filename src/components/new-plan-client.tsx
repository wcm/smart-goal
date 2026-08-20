"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { ContextQuestionForm } from "@/components/context-question-form";
import { PageBackLink } from "@/components/page-back-link";
import { Button } from "@/components/ui/button";
import { AiClientError, postAi } from "@/lib/ai/client";
import { savePlan } from "@/lib/planner/repository";
import { createStepRecords } from "@/lib/planner/tree";
import type {
  GeneratedPlan,
  GeneratedQuestion,
  GeneratedSmartGoal,
  PlanRecord,
  Viewer,
} from "@/lib/planner/types";
import { asErrorMessage, createId } from "@/lib/utils";

const smartDimensions = [
  { key: "specific", letter: "S", name: "Specific", prompt: "What will I accomplish?" },
  { key: "measurable", letter: "M", name: "Measurable", prompt: "How will I know?" },
  { key: "achievable", letter: "A", name: "Achievable", prompt: "Is the path realistic?" },
  { key: "relevant", letter: "R", name: "Relevant", prompt: "Why is it worth doing?" },
  { key: "timeBound", letter: "T", name: "Time-bound", prompt: "When will it happen?" },
] as const;

function isGuestQuotaError(reason: unknown, isGuest: boolean) {
  return isGuest && reason instanceof AiClientError && reason.code === "GUEST_AI_LIMIT_REACHED";
}

function smartContext(smartGoal: GeneratedSmartGoal) {
  return {
    question: "SMART goal definition",
    answer: [
      `Specific: ${smartGoal.specific}`,
      `Measurable: ${smartGoal.measurable}`,
      `Achievable: ${smartGoal.achievable}`,
      `Relevant: ${smartGoal.relevant}`,
      `Time-bound: ${smartGoal.timeBound}`,
    ].join("\n"),
  };
}

export function NewPlanClient({ viewer, initialGoal }: { viewer: Viewer; initialGoal: string }) {
  const router = useRouter();
  const startingGoal = initialGoal.trim();
  const [stage, setStage] = useState<"smart" | "context" | "plan">("smart");
  const [smartGoal, setSmartGoal] = useState<GeneratedSmartGoal | null>(null);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [busy, setBusy] = useState<"smart" | "questions" | "plan" | null>("smart");
  const [error, setError] = useState("");
  const [smartAttempt, setSmartAttempt] = useState(0);
  const [planContext, setPlanContext] = useState<{ question: string; answer: string }[]>([]);

  function goToStage(next: "smart" | "context") {
    if (busy) return;
    setError("");
    setStage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    let active = true;
    void postAi<GeneratedSmartGoal>("smart", { goal: startingGoal })
      .then(({ output }) => {
        if (active) setSmartGoal(output);
      })
      .catch((reason) => {
        if (!active) return;
        if (isGuestQuotaError(reason, viewer.isGuest)) {
          router.replace("/?signin=usage");
          return;
        }
        setError(asErrorMessage(reason));
      })
      .finally(() => {
        if (active) setBusy(null);
      });

    return () => {
      active = false;
    };
  }, [router, smartAttempt, startingGoal, viewer.isGuest]);

  function updateSmartGoal(key: keyof GeneratedSmartGoal, value: string) {
    setSmartGoal((current) => current ? { ...current, [key]: value } : current);
  }

  async function prepareContext() {
    if (!smartGoal || busy) return;
    setStage("context");
    setQuestions([]);
    setBusy("questions");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const { output } = await postAi<{ questions: GeneratedQuestion[] }>("questions", {
        goal: smartGoal.goal,
        planSummary: "",
        targetTitle: null,
        targetDescription: null,
        ancestorPath: [],
        existingContext: [smartContext(smartGoal)],
      });
      setQuestions(output.questions);
    } catch (reason) {
      if (isGuestQuotaError(reason, viewer.isGuest)) {
        router.replace("/?signin=usage");
        return;
      }
      setError(asErrorMessage(reason));
    } finally {
      setBusy(null);
    }
  }

  async function generate(context: { question: string; answer: string }[]) {
    if (!smartGoal) return;
    setStage("plan");
    setPlanContext(context);
    setBusy("plan");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const allContext = [smartContext(smartGoal), ...context];
    try {
      const { output } = await postAi<GeneratedPlan>("plan", { goal: smartGoal.goal, context: allContext });
      const now = new Date().toISOString();
      const planId = createId();
      const generationId = createId();
      const plan: PlanRecord = {
        id: planId,
        userId: viewer.id,
        goal: smartGoal.goal,
        emoji: output.emoji,
        title: output.title,
        summary: output.summary,
        status: "active",
        assumptions: output.assumptions,
        steps: createStepRecords({
          generated: output.steps,
          planId,
          userId: viewer.id,
          parentId: null,
          depth: 1,
          generationId,
          now,
        }),
        contexts: allContext.map((entry, position) => ({
          id: createId(),
          planId,
          userId: viewer.id,
          targetStepId: null,
          generationId,
          question: entry.question,
          reason: position === 0
            ? "The five SMART dimensions keep the plan aligned with a clear finish line."
            : questions[position - 1]?.reason ?? "Added before the initial plan.",
          answer: entry.answer,
          position,
          createdAt: now,
        })),
        createdAt: now,
        updatedAt: now,
      };
      await savePlan(plan, { temporary: viewer.isGuest });
      router.push(`/plans/${plan.id}`);
    } catch (reason) {
      if (isGuestQuotaError(reason, viewer.isGuest)) {
        router.replace("/?signin=usage");
        return;
      }
      setError(asErrorMessage(reason));
      setBusy(null);
    }
  }

  const smartIsComplete = Boolean(smartGoal && Object.values(smartGoal).every((value) => value.trim().length >= 3));

  return (
    <main className="new-plan page-shell app-shell">
      <div className="page-back-row"><PageBackLink href={viewer.isGuest ? "/" : "/plans"}>{viewer.isGuest ? "Home" : "Back to goals"}</PageBackLink></div>

      <section className="new-plan-card smart-builder-card">
        <nav className="goal-builder-progress" aria-label="SMART goal builder progress">
          {stage === "smart" ? (
            <span className="active"><i>1</i> Make it SMART</span>
          ) : busy ? (
            <span className="complete"><i><Check size={13} /></i> Make it SMART</span>
          ) : (
            <button type="button" className="complete" onClick={() => goToStage("smart")}><i><Check size={13} /></i> Make it SMART</button>
          )}
          <b className={stage === "smart" ? "" : "complete-line"} aria-hidden="true" />
          {stage === "plan" && !busy ? (
            <button type="button" className="complete" onClick={() => goToStage("context")}><i><Check size={13} /></i> Add context</button>
          ) : (
            <span className={stage === "context" ? "active" : stage === "plan" ? "complete" : ""}>
              {stage === "plan" ? <i><Check size={13} /></i> : <i>2</i>} Add context
            </span>
          )}
          <b className={stage === "plan" ? "complete-line" : ""} aria-hidden="true" />
          <span className={stage === "plan" ? "active" : ""}><i>3</i> Build the plan</span>
        </nav>
        {stage === "smart" ? (
          <>
            <div className="starting-goal"><span>Starting goal</span><p>“{startingGoal}”</p></div>
            {error && <div className="error-card" role="alert">{error}</div>}

            {busy === "smart" && (
              <div className="context-loading"><LoaderCircle className="spin" size={20} /> Making your goal SMART…</div>
            )}

            {!busy && error && !smartGoal && (
              <Button variant="secondary" onClick={() => {
                setBusy("smart");
                setError("");
                setSmartAttempt((attempt) => attempt + 1);
              }}>Try again</Button>
            )}

            {smartGoal && (
              <div className="smart-editor">
                <label className="smart-statement-field">
                  <span>Your SMART goal</span>
                  <textarea
                    aria-label="Your SMART goal"
                    value={smartGoal.goal}
                    onChange={(event) => updateSmartGoal("goal", event.target.value)}
                    rows={3}
                    maxLength={1200}
                  />
                </label>

                <div className="smart-dimension-list">
                  {smartDimensions.map((dimension) => (
                    <label className={`smart-dimension dimension-${dimension.letter.toLowerCase()}`} key={dimension.key}>
                      <strong aria-hidden="true">{dimension.letter}</strong>
                      <span><b>{dimension.name}</b><small>{dimension.prompt}</small></span>
                      <textarea
                        aria-label={dimension.name}
                        value={smartGoal[dimension.key]}
                        onChange={(event) => updateSmartGoal(dimension.key, event.target.value)}
                        rows={2}
                        maxLength={500}
                      />
                    </label>
                  ))}
                </div>

                <div className="smart-editor-actions">
                  <Button size="lg" onClick={() => void prepareContext()} disabled={!smartIsComplete || Boolean(busy)}>
                    Continue: add context <ArrowRight size={17} />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : stage === "plan" ? (
          <div className="new-plan-context smart-context-stage">
            <div className="smart-goal-summary">
              <span>Your SMART goal</span>
              <strong>{smartGoal?.goal}</strong>
            </div>
            {error && <div className="error-card" role="alert">{error}</div>}

            {busy === "plan" && (
              <div className="context-loading"><LoaderCircle className="spin" size={20} /> Building your execution plan…</div>
            )}

            {!busy && error && (
              <Button variant="secondary" onClick={() => void generate(planContext)}>Try again</Button>
            )}
          </div>
        ) : (
          <div className="new-plan-context smart-context-stage">
            <div className="smart-goal-summary">
              <span>Your SMART goal</span>
              <strong>{smartGoal?.goal}</strong>
            </div>
            {error && <div className="error-card" role="alert">{error}</div>}

            {busy === "questions" && (
              <div className="context-loading"><LoaderCircle className="spin" size={20} /> Preparing a few useful questions…</div>
            )}

            {!busy && error && questions.length === 0 && (
              <Button variant="secondary" onClick={() => void prepareContext()}>Try again</Button>
            )}

            {questions.length > 0 && (
              <ContextQuestionForm
                key={questions.map((question) => question.question).join("|")}
                questions={questions}
                busy={busy === "plan"}
                submitLabel="Build my execution plan"
                initialAnswers={planContext}
                onSubmit={generate}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}
