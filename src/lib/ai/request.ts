import { createHash } from "node:crypto";
import { AI_DAILY_LIMIT, isDemoAiEnabled } from "@/lib/config";
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

export async function authorizeAiRequest() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    if (isDemoAiEnabled()) {
      return { userId: "demo-user", safetyIdentifier: "goal-planner-demo" };
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

  const { data: allowed, error: quotaError } = await supabase.rpc(
    "consume_ai_quota",
    { max_actions: AI_DAILY_LIMIT },
  );
  if (quotaError) {
    throw new ApiRequestError(
      "AI usage could not be verified. Try again shortly.",
      503,
      "QUOTA_UNAVAILABLE",
    );
  }
  if (!allowed) {
    throw new ApiRequestError(
      `You have used today's ${AI_DAILY_LIMIT} AI planning actions. Your quota resets tomorrow.`,
      429,
      "DAILY_LIMIT_REACHED",
    );
  }

  return {
    userId: user.id,
    safetyIdentifier: createHash("sha256").update(user.id).digest("hex"),
  };
}
