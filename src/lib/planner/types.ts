export type StepRecord = {
  id: string;
  planId: string;
  userId: string;
  parentId: string | null;
  generationId: string;
  depth: number;
  position: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContextAnswer = {
  id: string;
  planId: string;
  userId: string;
  targetStepId: string | null;
  generationId: string;
  question: string;
  reason: string;
  answer: string;
  position: number;
  createdAt: string;
};

export type PlanRecord = {
  id: string;
  userId: string;
  goal: string;
  title: string;
  summary: string;
  status: "active" | "archived";
  assumptions: string[];
  steps: StepRecord[];
  contexts: ContextAnswer[];
  createdAt: string;
  updatedAt: string;
};

export type ActivityEvent = {
  id: string;
  userId: string;
  planId: string;
  stepId: string;
  source: "manual" | "cascade" | "automatic-parent";
  localDate: string;
  createdAt: string;
};

export type GeneratedStep = {
  title: string;
  description: string;
  estimatedMinutes: number;
};

export type GeneratedPlan = {
  title: string;
  summary: string;
  assumptions: string[];
  steps: GeneratedStep[];
};

export type GeneratedQuestion = {
  question: string;
  reason: string;
};

export type Viewer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isDemo: boolean;
};
