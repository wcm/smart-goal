import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "My plans" };

export default async function PlansPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/plans");
  return <DashboardClient viewer={viewer} />;
}
