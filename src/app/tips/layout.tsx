import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

export default async function TipsLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();

  return (
    <div className="tips-page">
      <SiteHeader viewer={viewer?.isDemo ? null : viewer} />
      {children}
    </div>
  );
}
