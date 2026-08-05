"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AuthBenefits } from "@/components/auth-benefits";
import { Button } from "@/components/ui/button";
import { snapshotGuestPlan } from "@/lib/planner/guest-transfer";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GuestUpgradeButton({
  label = "Sign in",
  variant = "primary",
  size = "md",
  className,
  autoOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  label?: string;
  reason?: "save" | "depth" | "usage";
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  autoOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const open = Boolean(controlledOpen || internalOpen);

  useEffect(() => {
    if (!autoOpen) return;
    const timer = window.setTimeout(() => setInternalOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [autoOpen]);

  function setOpen(value: boolean) {
    setInternalOpen(value);
    onOpenChange?.(value);
    if (!value) setError("");
  }

  async function signInWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) await snapshotGuestPlan(data.user.id);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/plans/import")}`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (signInError) throw signInError;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Google sign-in could not be opened.");
      setLoading(false);
    }
  }

  const dialog = open ? createPortal(
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !loading) setOpen(false);
      }}
    >
      <section className="login-card auth-dialog" role="dialog" aria-modal="true" aria-labelledby="guest-auth-title">
        <button
          className="icon-button auth-dialog-close"
          onClick={() => setOpen(false)}
          disabled={loading}
          aria-label="Close dialog"
        >
          <X size={19} />
        </button>
        <h1 id="guest-auth-title">Sign in to continue</h1>
        <AuthBenefits />
        <div className="login-actions">
          <Button size="lg" disabled={loading} onClick={signInWithGoogle}>
            <span className="google-g">G</span>
            {loading ? <><LoaderCircle className="spin" size={17} /> Opening Google…</> : "Continue with Google"}
          </Button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {dialog}
    </>
  );
}
