"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setStepCompletion } from "@/lib/planner/tree";
import type {
  ActivityEvent,
  ContextAnswer,
  PlanRecord,
  StepRecord,
} from "@/lib/planner/types";

const STORAGE_KEY = "goalflow-demo-data-v1";

type DemoData = { plans: PlanRecord[]; events: ActivityEvent[] };

type PlanRow = {
  id: string;
  user_id: string;
  goal: string;
  title: string;
  summary: string;
  status: "active" | "archived";
  assumptions: string[] | null;
  created_at: string;
  updated_at: string;
};

type StepRow = {
  id: string;
  plan_id: string;
  user_id: string;
  parent_id: string | null;
  generation_id: string;
  depth: number;
  position: number;
  title: string;
  description: string;
  estimated_minutes: number;
  is_completed: boolean;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type ContextRow = {
  id: string;
  plan_id: string;
  user_id: string;
  target_step_id: string | null;
  generation_id: string;
  question: string;
  reason: string;
  answer: string;
  position: number;
  created_at: string;
};

type ActivityRow = {
  id: string;
  user_id: string;
  plan_id: string;
  step_id: string;
  source: "manual" | "cascade" | "automatic-parent";
  local_date: string;
  created_at: string;
};

function readDemoData(): DemoData {
  if (typeof window === "undefined") return { plans: [], events: [] };
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as DemoData) : { plans: [], events: [] };
  } catch {
    return { plans: [], events: [] };
  }
}

function writeDemoData(data: DemoData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function toLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapStep(row: StepRow): StepRecord {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    parentId: row.parent_id,
    generationId: row.generation_id,
    depth: row.depth,
    position: row.position,
    title: row.title,
    description: row.description,
    estimatedMinutes: row.estimated_minutes,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapContext(row: ContextRow): ContextAnswer {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    targetStepId: row.target_step_id,
    generationId: row.generation_id,
    question: row.question,
    reason: row.reason,
    answer: row.answer,
    position: row.position,
    createdAt: row.created_at,
  };
}

function mapPlan(row: PlanRow, steps: StepRow[], contexts: ContextRow[]): PlanRecord {
  return {
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    title: row.title,
    summary: row.summary,
    status: row.status,
    assumptions: row.assumptions ?? [],
    steps: steps.filter((step) => step.plan_id === row.id).map(mapStep),
    contexts: contexts
      .filter((context) => context.plan_id === row.id)
      .map(mapContext),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function planRow(plan: PlanRecord) {
  return {
    id: plan.id,
    user_id: plan.userId,
    goal: plan.goal,
    title: plan.title,
    summary: plan.summary,
    status: plan.status,
    assumptions: plan.assumptions,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
  };
}

function stepRow(step: StepRecord) {
  return {
    id: step.id,
    plan_id: step.planId,
    user_id: step.userId,
    parent_id: step.parentId,
    generation_id: step.generationId,
    depth: step.depth,
    position: step.position,
    title: step.title,
    description: step.description,
    estimated_minutes: step.estimatedMinutes,
    is_completed: step.isCompleted,
    completed_at: step.completedAt,
    archived_at: step.archivedAt,
    created_at: step.createdAt,
    updated_at: step.updatedAt,
  };
}

function contextRow(context: ContextAnswer) {
  return {
    id: context.id,
    plan_id: context.planId,
    user_id: context.userId,
    target_step_id: context.targetStepId,
    generation_id: context.generationId,
    question: context.question,
    reason: context.reason,
    answer: context.answer,
    position: context.position,
    created_at: context.createdAt,
  };
}

async function loadRemotePlans(planId?: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  let planQuery = supabase.from("plans").select("*").order("updated_at", {
    ascending: false,
  });
  if (planId) planQuery = planQuery.eq("id", planId);
  const { data: plans, error: planError } = await planQuery;
  if (planError) throw planError;
  const typedPlans = (plans ?? []) as PlanRow[];
  if (typedPlans.length === 0) return [];
  const ids = typedPlans.map((plan) => plan.id);

  const [{ data: steps, error: stepError }, { data: contexts, error: contextError }] =
    await Promise.all([
      supabase.from("steps").select("*").in("plan_id", ids),
      supabase
        .from("context_questions")
        .select("*")
        .in("plan_id", ids)
        .order("position"),
    ]);
  if (stepError) throw stepError;
  if (contextError) throw contextError;

  return typedPlans.map((plan) =>
    mapPlan(plan, (steps ?? []) as StepRow[], (contexts ?? []) as ContextRow[]),
  );
}

export async function listPlans(userId: string) {
  const remote = await loadRemotePlans();
  if (remote) return remote;
  return readDemoData().plans
    .filter((plan) => plan.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPlan(planId: string, userId: string) {
  const remote = await loadRemotePlans(planId);
  if (remote) return remote[0] ?? null;
  return (
    readDemoData().plans.find(
      (plan) => plan.id === planId && plan.userId === userId,
    ) ?? null
  );
}

export async function savePlan(plan: PlanRecord) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    const data = readDemoData();
    const index = data.plans.findIndex((candidate) => candidate.id === plan.id);
    if (index >= 0) data.plans[index] = plan;
    else data.plans.push(plan);
    writeDemoData(data);
    return plan;
  }

  const { error: planError } = await supabase.from("plans").upsert(planRow(plan));
  if (planError) throw planError;
  if (plan.steps.length > 0) {
    const { error } = await supabase.from("steps").upsert(plan.steps.map(stepRow));
    if (error) throw error;
  }
  if (plan.contexts.length > 0) {
    const { error } = await supabase
      .from("context_questions")
      .upsert(plan.contexts.map(contextRow));
    if (error) throw error;
  }
  return plan;
}

export async function toggleStepCompletion(
  plan: PlanRecord,
  stepId: string,
  completed: boolean,
) {
  const supabase = createSupabaseBrowserClient();
  if (supabase) {
    const { error } = await supabase.rpc("set_step_completion", {
      target_step_id: stepId,
      target_completed: completed,
    });
    if (error) throw error;
    const refreshed = await getPlan(plan.id, plan.userId);
    if (!refreshed) throw new Error("The updated plan could not be loaded.");
    return refreshed;
  }

  const now = new Date();
  const updated = setStepCompletion(plan, stepId, completed, now.toISOString());
  const data = readDemoData();
  const index = data.plans.findIndex((candidate) => candidate.id === plan.id);
  if (index >= 0) data.plans[index] = updated;
  if (completed) {
    data.events.push({
      id: crypto.randomUUID(),
      userId: plan.userId,
      planId: plan.id,
      stepId,
      source: "manual",
      localDate: toLocalDate(now),
      createdAt: now.toISOString(),
    });
  }
  writeDemoData(data);
  return updated;
}

export async function archivePlan(plan: PlanRecord) {
  return savePlan({
    ...plan,
    status: plan.status === "active" ? "archived" : "active",
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePlan(planId: string) {
  const supabase = createSupabaseBrowserClient();
  if (supabase) {
    const { error } = await supabase.from("plans").delete().eq("id", planId);
    if (error) throw error;
    return;
  }
  const data = readDemoData();
  data.plans = data.plans.filter((plan) => plan.id !== planId);
  data.events = data.events.filter((event) => event.planId !== planId);
  writeDemoData(data);
}

export async function getActivity(userId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    return readDemoData().events.filter((event) => event.userId === userId);
  }
  const start = new Date();
  start.setDate(start.getDate() - 370);
  const { data, error } = await supabase
    .from("completion_events")
    .select("*")
    .eq("source", "manual")
    .gte("created_at", start.toISOString())
    .order("created_at");
  if (error) throw error;
  return ((data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    stepId: row.step_id,
    source: row.source,
    localDate: row.local_date,
    createdAt: row.created_at,
  }));
}
