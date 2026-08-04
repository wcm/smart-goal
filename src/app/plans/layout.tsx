import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getViewer } from "@/lib/supabase/server";

export default async function PlansLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/plans");
  return <div className="app-page"><SiteHeader viewer={viewer} />{children}</div>;
}
