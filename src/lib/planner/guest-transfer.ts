"use client";

import {
  getTemporaryPlanSnapshot,
  listPlans,
} from "@/lib/planner/repository";
import type { PlanRecord } from "@/lib/planner/types";
import { createId } from "@/lib/utils";

const PENDING_PLAN_KEY = "goal-planner-pending-guest-plan-v1";

export async function snapshotGuestPlan(userId: string) {
  const temporaryPlan = getTemporaryPlanSnapshot();
  const [legacyPlan] = temporaryPlan?.userId === userId ? [] : await listPlans(userId);
  const plan = temporaryPlan?.userId === userId ? temporaryPlan : legacyPlan;
  if (!plan) return false;
  window.localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(plan));
  return true;
}

export function clearGuestPlanSnapshot() {
  window.localStorage.removeItem(PENDING_PLAN_KEY);
}

export function readGuestPlanSnapshot() {
  const value = window.localStorage.getItem(PENDING_PLAN_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as PlanRecord;
  } catch {
    clearGuestPlanSnapshot();
    return null;
  }
}

export function cloneGuestPlan(plan: PlanRecord, userId: string): PlanRecord {
  const now = new Date().toISOString();
  const planId = createId();
  const stepIds = new Map(plan.steps.map((step) => [step.id, createId()]));

  return {
    ...plan,
    id: planId,
    userId,
    status: "active",
    createdAt: now,
    updatedAt: now,
    steps: plan.steps.map((step) => ({
      ...step,
      id: stepIds.get(step.id)!,
      planId,
      userId,
      parentId: step.parentId ? stepIds.get(step.parentId) ?? null : null,
      createdAt: now,
      updatedAt: now,
    })),
    contexts: plan.contexts.map((context) => ({
      ...context,
      id: createId(),
      planId,
      userId,
      targetStepId: context.targetStepId
        ? stepIds.get(context.targetStepId) ?? null
        : null,
      createdAt: now,
    })),
  };
}
