"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseConfig } from "@/lib/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
