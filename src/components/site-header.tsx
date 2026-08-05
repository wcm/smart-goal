import { Logo } from "@/components/logo";
import { AuthControls } from "@/components/auth-controls";
import type { Viewer } from "@/lib/planner/types";

export function SiteHeader({ viewer, hideAuth = false, autoOpenGuestSignIn = false }: { viewer: Viewer | null; hideAuth?: boolean; autoOpenGuestSignIn?: boolean }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        {!hideAuth && <AuthControls viewer={viewer} autoOpenGuestSignIn={autoOpenGuestSignIn} />}
      </div>
    </header>
  );
}
