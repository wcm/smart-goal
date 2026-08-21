import { MAX_STEP_DEPTH } from "@/lib/config";
import { createId } from "@/lib/utils";
import type {
  GeneratedStep,
  PlanRecord,
  StepRecord,
} from "@/lib/planner/types";

export type StepTreeNode = StepRecord & { children: StepTreeNode[] };

export function getActiveSteps(plan: PlanRecord) {
  return plan.steps.filter((step) => !step.archivedAt);
}

export function hasOnlyFirstStepLayer(plan: PlanRecord) {
  const active = getActiveSteps(plan);
  return active.length > 0 && active.every((step) => step.depth === 1);
}

export function buildStepTree(plan: PlanRecord): StepTreeNode[] {
  const active = getActiveSteps(plan);
  const byParent = new Map<string | null, StepRecord[]>();

  for (const step of active) {
    const siblings = byParent.get(step.parentId) ?? [];
    siblings.push(step);
    byParent.set(step.parentId, siblings);
  }

  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.position - b.position);
  }

  const visited = new Set<string>();
  const visit = (step: StepRecord): StepTreeNode => {
    if (visited.has(step.id)) {
      return { ...step, children: [] };
    }
    visited.add(step.id);
    return {
      ...step,
      children: (byParent.get(step.id) ?? []).map(visit),
    };
  };

  return (byParent.get(null) ?? []).map(visit);
}

export function calculatePlanProgress(plan: PlanRecord) {
  const active = getActiveSteps(plan);
  const parentIds = new Set(
    active.map((step) => step.parentId).filter((id): id is string => Boolean(id)),
  );
  const leaves = active.filter((step) => !parentIds.has(step.id));
  const totalMinutes = leaves.reduce(
    (sum, step) => sum + step.estimatedMinutes,
    0,
  );
  const completedMinutes = leaves
    .filter((step) => step.isCompleted)
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);
  const completedLeaves = leaves.filter((step) => step.isCompleted).length;

  return {
    completedMinutes,
    totalMinutes,
    percentage: totalMinutes === 0
      ? leaves.length === 0 ? 0 : Math.round((completedLeaves / leaves.length) * 100)
      : Math.round((completedMinutes / totalMinutes) * 100),
  };
}

const MAX_STEP_MINUTES = 525600;
const MAX_BREAKDOWN_CHILDREN = 8;

export function formatMinutes(totalMinutes: number) {
  if (totalMinutes === 0) return "<1m";
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function sanitizeMinutesInput(value: string) {
  const compact = value.replace(/\s/g, "");
  if (compact.startsWith("<")) return compact.startsWith("<1") ? "<1" : "<";
  return compact.replace(/\D/g, "").slice(0, 7);
}

export function parseMinutesInput(value: string) {
  const compact = value.replace(/\s/g, "");
  if (compact === "<1") return 0;
  if (!/^\d{1,7}$/.test(compact)) return null;
  return Math.min(MAX_STEP_MINUTES, Number(compact));
}

export function normalizeChildEstimates(
  generated: GeneratedStep[],
  targetMinutes: number,
) {
  const total = Math.max(0, Math.round(targetMinutes));
  const usable = generated
    .filter((step) => step.title.trim())
    .slice(0, MAX_BREAKDOWN_CHILDREN);

  if (usable.length < 2) {
    throw new Error("A breakdown needs at least two useful steps.");
  }

  const proposed = usable.map((step) => Math.max(0, Math.round(step.estimatedMinutes)));
  const weights = proposed.some((minutes) => minutes > 0) ? proposed : usable.map(() => 1);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const rawShares = weights.map((weight) => (weight / weightTotal) * total);
  const allocations = rawShares.map((share) => Math.floor(share));
  let remainder = total - allocations.reduce((sum, value) => sum + value, 0);

  const fractionalOrder = rawShares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  for (let index = 0; remainder > 0; index += 1) {
    allocations[fractionalOrder[index % fractionalOrder.length].index] += 1;
    remainder -= 1;
  }

  return usable.map((step, index) => ({
    ...step,
    title: step.title.trim(),
    description: step.description.trim(),
    estimatedMinutes: allocations[index],
  }));
}

export function createStepRecords(args: {
  generated: GeneratedStep[];
  planId: string;
  userId: string;
  parentId: string | null;
  depth: number;
  generationId: string;
  now?: string;
}): StepRecord[] {
  if (args.depth < 1 || args.depth > MAX_STEP_DEPTH) {
    throw new Error(`Steps must be between levels 1 and ${MAX_STEP_DEPTH}.`);
  }

  const now = args.now ?? new Date().toISOString();
  return args.generated.map((step, position) => ({
    id: createId(),
    planId: args.planId,
    userId: args.userId,
    parentId: args.parentId,
    generationId: args.generationId,
    depth: args.depth,
    position,
    title: step.title.trim(),
    description: step.description.trim(),
    estimatedMinutes: Math.max(0, Math.round(step.estimatedMinutes)),
    isCompleted: false,
    completedAt: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  }));
}

function collectDescendantIds(steps: StepRecord[], rootId: string) {
  const descendants = new Set<string>();
  let frontier = [rootId];

  while (frontier.length > 0) {
    const parents = new Set(frontier);
    const children = steps.filter(
      (step) =>
        !step.archivedAt &&
        step.parentId !== null &&
        parents.has(step.parentId),
    );
    frontier = children.map((step) => step.id);
    for (const child of children) descendants.add(child.id);
  }

  return descendants;
}

export function hasCompletedDescendants(plan: PlanRecord, stepId: string) {
  const ids = collectDescendantIds(plan.steps, stepId);
  return plan.steps.some(
    (step) => ids.has(step.id) && !step.archivedAt && step.isCompleted,
  );
}

export function setStepCompletion(
  plan: PlanRecord,
  stepId: string,
  completed: boolean,
  now = new Date().toISOString(),
): PlanRecord {
  const target = plan.steps.find(
    (step) => step.id === stepId && !step.archivedAt,
  );
  if (!target) throw new Error("Step not found.");

  const affected = collectDescendantIds(plan.steps, stepId);
  affected.add(stepId);

  const steps = plan.steps.map((step) =>
    affected.has(step.id) && !step.archivedAt
      ? {
          ...step,
          isCompleted: completed,
          completedAt: completed ? now : null,
          updatedAt: now,
        }
      : { ...step },
  );

  let parentId = target.parentId;
  while (parentId) {
    const parent = steps.find((step) => step.id === parentId && !step.archivedAt);
    if (!parent) break;
    const children = steps.filter(
      (step) => step.parentId === parentId && !step.archivedAt,
    );
    const parentCompleted =
      children.length > 0 && children.every((step) => step.isCompleted);
    parent.isCompleted = parentCompleted;
    parent.completedAt = parentCompleted ? now : null;
    parent.updatedAt = now;
    parentId = parent.parentId;
  }

  return { ...plan, steps, updatedAt: now };
}

export function replaceStepChildren(args: {
  plan: PlanRecord;
  stepId: string;
  generated: GeneratedStep[];
  generationId: string;
  now?: string;
}) {
  const now = args.now ?? new Date().toISOString();
  const parent = args.plan.steps.find(
    (step) => step.id === args.stepId && !step.archivedAt,
  );
  if (!parent) throw new Error("Step not found.");
  if (parent.depth >= MAX_STEP_DEPTH) {
    throw new Error(`The maximum depth is ${MAX_STEP_DEPTH} levels.`);
  }

  const descendantIds = collectDescendantIds(args.plan.steps, parent.id);
  const normalized = normalizeChildEstimates(
    args.generated,
    parent.estimatedMinutes,
  );
  const newChildren = createStepRecords({
    generated: normalized,
    planId: args.plan.id,
    userId: args.plan.userId,
    parentId: parent.id,
    depth: parent.depth + 1,
    generationId: args.generationId,
    now,
  });

  const steps = args.plan.steps
    .map((step) =>
      descendantIds.has(step.id) && !step.archivedAt
        ? { ...step, archivedAt: now, updatedAt: now }
        : { ...step },
    )
    .concat(newChildren)
    .map((step) =>
      step.id === parent.id
        ? {
            ...step,
            isCompleted: false,
            completedAt: null,
            updatedAt: now,
          }
        : step,
    );

  return { ...args.plan, steps, updatedAt: now };
}

export function replacePlanSteps(args: {
  plan: PlanRecord;
  generated: GeneratedStep[];
  generationId: string;
  title: string;
  summary: string;
  assumptions: string[];
  now?: string;
}) {
  const now = args.now ?? new Date().toISOString();
  const active = args.plan.steps.filter((step) => !step.archivedAt);
  const targetMinutes = active
    .filter((step) => step.parentId === null)
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);
  const generated =
    targetMinutes > 1
      ? normalizeChildEstimates(args.generated, targetMinutes)
      : args.generated;
  const newSteps = createStepRecords({
    generated,
    planId: args.plan.id,
    userId: args.plan.userId,
    parentId: null,
    depth: 1,
    generationId: args.generationId,
    now,
  });

  return {
    ...args.plan,
    title: args.title,
    summary: args.summary,
    assumptions: args.assumptions,
    steps: args.plan.steps
      .map((step) =>
        !step.archivedAt
          ? { ...step, archivedAt: now, updatedAt: now }
          : { ...step },
      )
      .concat(newSteps),
    updatedAt: now,
  };
}
