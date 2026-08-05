"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { ContextQuestionForm } from "@/components/context-question-form";
import { PageBackLink } from "@/components/page-back-link";
import { Button } from "@/components/ui/button";
import { AiClientError, postAi } from "@/lib/ai/client";
import { savePlan } from "@/lib/planner/repository";
import { createStepRecords } from "@/lib/planner/tree";
import type {
  GeneratedPlan,
  GeneratedQuestion,
  PlanRecord,
  Viewer,
} from "@/lib/planner/types";
import { asErrorMessage, createId } from "@/lib/utils";

function isGuestQuotaError(reason: unknown, isGuest: boolean) {
  return isGuest && reason instanceof AiClientError && reason.code === "GUEST_AI_LIMIT_REACHED";
}

export function NewPlanClient({ viewer, initialGoal }: { viewer: Viewer; initialGoal: string }) {
  const router = useRouter();
  const goal = initialGoal.trim();
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [busy, setBusy] = useState<"questions" | "plan" | null>("questions");
  const [error, setError] = useState("");
  const [requestAttempt, setRequestAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    void postAi<{ questions: GeneratedQuestion[] }>("questions", {
      goal,
      planSummary: "",
      targetTitle: null,
      targetDescription: null,
      ancestorPath: [],
      existingContext: [],
    })
      .then(({ output }) => {
        if (active) setQuestions(output.questions);
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
  }, [goal, requestAttempt, router, viewer.isGuest]);

  async function generate(context: { question: string; answer: string }[]) {
    setBusy("plan");
    setError("");
    try {
      const { output } = await postAi<GeneratedPlan>("plan", { goal, context });
      const now = new Date().toISOString();
      const planId = createId();
      const generationId = createId();
      const plan: PlanRecord = {
        id: planId,
        userId: viewer.id,
        goal,
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
        contexts: context.map((entry, position) => ({
          id: createId(),
          planId,
          userId: viewer.id,
          targetStepId: null,
          generationId,
          question: entry.question,
          reason: questions[position]?.reason ?? "Added before the initial plan.",
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

  return (
    <main className="new-plan page-shell app-shell">
      <div className="page-back-row"><PageBackLink href={viewer.isGuest ? "/" : "/plans"}>{viewer.isGuest ? "Home" : "Back to plans"}</PageBackLink></div>
      <section className="new-plan-card context-first-card">
        <h1>{goal}</h1>
        {error && <div className="error-card" role="alert">{error}</div>}

        {busy === "questions" && (
          <div className="context-loading"><LoaderCircle className="spin" size={20} /> Preparing a few questions…</div>
        )}

        {!busy && error && questions.length === 0 && (
          <Button variant="secondary" onClick={() => {
            setBusy("questions");
            setError("");
            setQuestions([]);
            setRequestAttempt((attempt) => attempt + 1);
          }}>Try again</Button>
        )}

        {questions.length > 0 && (
          <div className="new-plan-context">
            <h2>Add context</h2>
            <ContextQuestionForm
              key={questions.map((question) => question.question).join("|")}
              questions={questions}
              busy={busy === "plan"}
              submitLabel="Build my plan"
              busyLabel="Building your plan…"
              onSubmit={generate}
            />
          </div>
        )}
      </section>
    </main>
  );
}
