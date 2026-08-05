import { redirect } from "next/navigation";
import { AuthBenefits } from "@/components/auth-benefits";
import { LoginCard } from "@/components/login-card";
import { SiteHeader } from "@/components/site-header";
import { hasSupabaseConfig } from "@/lib/config";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const viewer = await getViewer();
  const nextPath = params.next?.startsWith("/") ? params.next : "/plans";
  if (viewer && !viewer.isDemo) redirect(nextPath);

  return (
    <div className="login-shell">
      <SiteHeader viewer={null} hideAuth />
      <main className="login-page">
        <section className="login-card">
          <h1>Sign in to continue</h1>
          <AuthBenefits />
          <LoginCard nextPath={nextPath} demoMode={!hasSupabaseConfig()} />
        </section>
      </main>
    </div>
  );
}
