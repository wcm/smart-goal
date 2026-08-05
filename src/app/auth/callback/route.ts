import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const oauthError = url.searchParams.get("error_code") || url.searchParams.get("error");
  const rawNext = url.searchParams.get("next") || "/plans";
  const next = rawNext.startsWith("/") ? rawNext : "/plans";
  const supabase = await createSupabaseServerClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  if (oauthError) {
    const destination = new URL("/login", url.origin);
    destination.searchParams.set("error", "oauth");
    destination.searchParams.set("next", next);
    return NextResponse.redirect(destination);
  }
  return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
}
