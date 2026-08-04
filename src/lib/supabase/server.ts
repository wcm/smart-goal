import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEMO_USER_ID, hasSupabaseConfig } from "@/lib/config";
import type { Viewer } from "@/lib/planner/types";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) return null;
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot write cookies. The root proxy refreshes
            // sessions before authenticated pages are rendered.
          }
        },
      },
    },
  );
}

export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      id: DEMO_USER_ID,
      name: "Demo planner",
      email: "demo@goal-planner.local",
      avatarUrl: null,
      isDemo: true,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return {
    id: user.id,
    name:
      user.user_metadata.full_name ||
      user.user_metadata.name ||
      user.email?.split("@")[0] ||
      "Planner",
    email: user.email || "",
    avatarUrl: user.user_metadata.avatar_url || null,
    isDemo: false,
  };
}
