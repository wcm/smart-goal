"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginCard({ nextPath, demoMode }: { nextPath: string; demoMode: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (demoMode) {
    return (
      <div className="login-actions">
        <p className="demo-note">Supabase is not configured, so this build is running in private browser-local demo mode.</p>
        <Link href={nextPath} className="button button-primary button-lg">
          Continue to demo <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="login-actions">
      <Button
        size="lg"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          const supabase = createSupabaseBrowserClient();
          if (!supabase) return;
          const { error: authError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            },
          });
          if (authError) {
            setError(authError.message);
            setLoading(false);
          }
        }}
      >
        <span className="google-g">G</span>
        {loading ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p>By continuing, you agree to keep your account information accurate and use Goal Planner responsibly.</p>
    </div>
  );
}
