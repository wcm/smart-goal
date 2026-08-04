export const AI_DAILY_LIMIT = 20;
export const MAX_STEP_DEPTH = 10;
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function isDemoAiEnabled() {
  return (
    process.env.GOAL_PLANNER_ENABLE_DEMO === "true" ||
    (process.env.NODE_ENV !== "production" && !process.env.OPENAI_API_KEY)
  );
}
