import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  return (
    <div className="legal-site">
      <SiteHeader viewer={viewer?.isDemo ? null : viewer} />
      {children}
      <footer className="legal-footer">
        <div className="page-shell">
          <span>© {new Date().getFullYear()} Goal Planner</span>
          <nav aria-label="Legal"><Link href="/terms">Terms &amp; Conditions</Link><Link href="/privacy">Privacy Policy</Link></nav>
        </div>
      </footer>
    </div>
  );
}
