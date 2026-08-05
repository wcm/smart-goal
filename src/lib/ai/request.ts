import { createHash } from "node:crypto";
import {
  AI_DAILY_LIMIT,
  GUEST_AI_LIFETIME_LIMIT,
  GUEST_MAX_STEP_DEPTH,
  isDemoAiEnabled,
} from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

export async function authorizeAiRequest(options: { targetDepth?: number } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (isDemoAiEnabled()) {
      return {
        userId: "demo-user",
        safetyIdentifier: "goal-planner-demo",
        isGuest: false,
      };
    }
    throw new ApiRequestError(
      "Authentication is not configured. Connect Supabase before enabling live AI.",
      503,
      "AUTH_NOT_CONFIGURED",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new ApiRequestError("Sign in to use AI planning.", 401, "UNAUTHORIZED");
  }

  const isGuest = Boolean(user.is_anonymous);
  if (
    isGuest &&
    options.targetDepth !== undefined &&
    options.targetDepth >= GUEST_MAX_STEP_DEPTH
  ) {
    throw new ApiRequestError(
      `Save your plan to break steps down beyond level ${GUEST_MAX_STEP_DEPTH}.`,
      403,
      "GUEST_DEPTH_LIMIT_REACHED",
    );
  }

  const { data: allowed, error: quotaError } = await supabase.rpc("consume_ai_quota");
  if (quotaError) {
    throw new ApiRequestError(
      "AI usage could not be verified. Try again shortly.",
      503,
      "QUOTA_UNAVAILABLE",
    );
  }
  if (!allowed) {
    if (isGuest) {
      throw new ApiRequestError(
        `You have used the ${GUEST_AI_LIFETIME_LIMIT} AI actions included with a temporary plan. Save it to continue.`,
        429,
        "GUEST_AI_LIMIT_REACHED",
      );
    }
    throw new ApiRequestError(
      `You have used today's ${AI_DAILY_LIMIT} AI planning actions. Your quota resets tomorrow.`,
      429,
      "DAILY_LIMIT_REACHED",
    );
  }

  return {
    userId: user.id,
    safetyIdentifier: createHash("sha256").update(user.id).digest("hex"),
    isGuest,
  };
}
