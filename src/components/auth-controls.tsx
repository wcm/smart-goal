"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GuestUpgradeButton } from "@/components/guest-upgrade-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Viewer } from "@/lib/planner/types";

export function AuthControls({ viewer, autoOpenGuestSignIn = false }: { viewer: Viewer | null; autoOpenGuestSignIn?: boolean }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  if (!viewer) {
    return (
      <div className="auth-controls">
        <Link href="/tips" className="button button-ghost button-sm nav-tab">
          Tips
        </Link>
        <Link href="/login" className="button button-secondary button-sm nav-sign-in">
          Sign in
        </Link>
      </div>
    );
  }

  if (viewer.isGuest) {
    return (
      <div className="auth-controls guest-auth-controls">
        <Link href="/tips" className="button button-ghost button-sm nav-tab">
          Tips
        </Link>
        <GuestUpgradeButton label="Sign in" variant="secondary" size="sm" className="nav-sign-in" autoOpen={autoOpenGuestSignIn} />
      </div>
    );
  }

  const initials = viewer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GP";
  const showAvatarImage = Boolean(viewer.avatarUrl && viewer.avatarUrl !== failedAvatarUrl);

  return (
    <div className="auth-controls">
      <Link href="/tips" className="button button-ghost button-sm nav-tab">
        Tips
      </Link>
      <Link href="/plans" className="button button-ghost button-sm nav-tab">
        My plans
      </Link>
      <div className="account-menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="avatar-button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span
            className={`avatar ${showAvatarImage ? "has-image" : ""}`}
            aria-hidden="true"
          >
            {showAvatarImage ? (
              // A native image avoids remote-host configuration for Google profile URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={viewer.avatarUrl!} alt="" referrerPolicy="no-referrer" onError={() => setFailedAvatarUrl(viewer.avatarUrl)} />
            ) : initials}
          </span>
        </button>
        {menuOpen && (
          <div className="account-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setMenuOpen(false);
                if (!viewer.isDemo) await createSupabaseBrowserClient()?.auth.signOut();
                router.push("/");
                router.refresh();
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
