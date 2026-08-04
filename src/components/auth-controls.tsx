"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Viewer } from "@/lib/planner/types";

export function AuthControls({ viewer }: { viewer: Viewer | null }) {
  const router = useRouter();

  if (!viewer) {
    return (
      <Link href="/login" className="button button-secondary button-sm">
        Sign in
      </Link>
    );
  }

  return (
    <div className="auth-controls">
      <Link href="/plans" className="button button-ghost button-sm">
        My plans
      </Link>
      {!viewer.isDemo && (
        <Button
          variant="ghost"
          size="sm"
          aria-label="Sign out"
          onClick={async () => {
            await createSupabaseBrowserClient()?.auth.signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut size={16} />
          <span className="desktop-only">Sign out</span>
        </Button>
      )}
    </div>
  );
}
