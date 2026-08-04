import { Logo } from "@/components/logo";
import { AuthControls } from "@/components/auth-controls";
import type { Viewer } from "@/lib/planner/types";

export function SiteHeader({ viewer, app = false }: { viewer: Viewer | null; app?: boolean }) {
  return (
    <header className={app ? "site-header app-header" : "site-header"}>
      <div className="header-inner">
        <Logo />
        <AuthControls viewer={viewer} />
      </div>
    </header>
  );
}
