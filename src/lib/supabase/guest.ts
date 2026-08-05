"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type PlanningSession = {
  isGuest: boolean;
};

function isMissingSessionError(error: { name?: string; message?: string }) {
  return (
    error.name === "AuthSessionMissingError" ||
    error.message?.toLowerCase().includes("auth session missing")
  );
}

export async function ensurePlanningSession(): Promise<PlanningSession> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return { isGuest: false };

  const {
    data: { user: existingUser },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError && !isMissingSessionError(userError)) throw userError;

  let user = existingUser;
  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { source: "goal-capture" } },
    });
    if (error) throw error;
    user = data.user;
  }

  return { isGuest: Boolean(user?.is_anonymous) };
}
