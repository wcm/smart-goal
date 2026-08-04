"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Lightbulb, Sparkles } from "lucide-react";
import { ContextDialog } from "@/components/context-dialog";
import { Button } from "@/components/ui/button";
import { postAi } from "@/lib/ai/client";
import { createStepRecords } from "@/lib/planner/tree";
import { savePlan } from "@/lib/planner/repository";
import type {
  GeneratedPlan,
  GeneratedQuestion,
  PlanRecord,
  Viewer,
} from "@/lib/planner/types";
import { asErrorMessage, createId } from "@/lib/utils";

export function NewPlanClient({ viewer, initialGoal }: { viewer: Viewer; initialGoal: string }) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState<"questions" | "plan" | null>(null);
  const [error, setError] = useState("");

  async function generate(context: { question: string; answer: string }[] = []) {
    setBusy("plan");
    setError("");
    try {
      const { output } = await postAi<GeneratedPlan>("plan", { goal: goal.trim(), context });
      const now = new Date().toISOString();
      const planId = createId();
      const generationId = createId();
      const plan: PlanRecord = {
        id: planId,
        userId: viewer.id,
        goal: goal.trim(),
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
      await savePlan(plan);
      router.push(`/plans/${plan.id}`);
    } catch (reason) {
      setError(asErrorMessage(reason));
      setBusy(null);
      setDialogOpen(false);
    }
  }

  async function askQuestions() {
    if (goal.trim().length < 3) return;
    setBusy("questions");
    setError("");
    try {
      const { output } = await postAi<{ questions: GeneratedQuestion[] }>("questions", {
        goal: goal.trim(),
        planSummary: "",
        targetTitle: null,
        targetDescription: null,
        ancestorPath: [],
        existingContext: [],
      });
      setQuestions(output.questions);
      setDialogOpen(true);
    } catch (reason) {
      setError(asErrorMessage(reason));
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="new-plan page-shell app-shell narrow-shell">
      <Link href="/plans" className="back-link"><ArrowLeft size={16} /> Back to plans</Link>
      <section className="new-plan-card">
        <span className="new-plan-orbit"><Sparkles size={25} /></span>
        <span className="eyebrow"><span /> A fresh start</span>
        <h1>What do you want<br /><em>to make happen?</em></h1>
        <p>Describe the outcome in your own words. It can be ambitious, messy, or incomplete—we’ll shape it together.</p>
        <label className="large-goal-input">
          <span>Your goal</span>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="I want to…"
            rows={5}
            maxLength={1200}
            autoFocus
          />
          <small>{goal.length}/1200</small>
        </label>
        {error && <div className="error-card" role="alert">{error}</div>}
        <div className="new-plan-actions">
          <Button variant="secondary" size="lg" onClick={askQuestions} disabled={goal.trim().length < 3 || Boolean(busy)}>
            <Lightbulb size={18} /> {busy === "questions" ? "Thinking of questions…" : "Add more context"}
          </Button>
          <Button size="lg" onClick={() => generate()} disabled={goal.trim().length < 3 || Boolean(busy)}>
            {busy === "plan" ? "Building your plan…" : "How do I achieve it?"} <ArrowRight size={18} />
          </Button>
        </div>
        <div className="privacy-note"><span>Private by default</span><span>•</span><span>Editable at every level</span><span>•</span><span>Realistic time estimates</span></div>
      </section>
      <ContextDialog
        open={dialogOpen}
        title="Help us shape the first plan"
        questions={questions}
        busy={busy === "plan"}
        onClose={() => setDialogOpen(false)}
        onSubmit={generate}
      />
    </main>
  );
}
