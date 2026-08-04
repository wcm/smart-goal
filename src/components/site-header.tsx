import { Logo } from "@/components/logo";
import { AuthControls } from "@/components/auth-controls";
import type { Viewer } from "@/lib/planner/types";

export function SiteHeader({ viewer, hideAuth = false }: { viewer: Viewer | null; hideAuth?: boolean }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        {!hideAuth && <AuthControls viewer={viewer} />}
      </div>
    </header>
  );
}
