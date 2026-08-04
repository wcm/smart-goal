"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Viewer } from "@/lib/planner/types";

export function AuthControls({ viewer }: { viewer: Viewer | null }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <Link href="/login" className="button button-secondary button-sm">
        Sign in
      </Link>
    );
  }

  const initials = viewer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "GP";

  return (
    <div className="auth-controls">
      <Link href="/plans" className="button button-ghost button-sm">
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
            className={`avatar ${viewer.avatarUrl ? "has-image" : ""}`}
            style={viewer.avatarUrl ? { backgroundImage: `url(${viewer.avatarUrl})` } : undefined}
            aria-hidden="true"
          >
            {!viewer.avatarUrl && initials}
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
