import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { LoginCard } from "@/components/login-card";
import { hasSupabaseConfig } from "@/lib/config";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const viewer = await getViewer();
  const nextPath = params.next?.startsWith("/") ? params.next : "/plans";
  if (viewer && !viewer.isDemo) redirect(nextPath);

  return (
    <main className="login-page">
      <Logo />
      <section className="login-card">
        <span className="eyebrow"><span /> Welcome to GoalFlow</span>
        <h1>Keep your plans<br /><em>moving with you.</em></h1>
        <p>Sign in once to save multiple goals, sync progress, and build a streak that reflects real work.</p>
        <LoginCard nextPath={nextPath} demoMode={!hasSupabaseConfig()} />
      </section>
    </main>
  );
}
