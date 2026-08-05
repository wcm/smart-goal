import { redirect } from "next/navigation";
import { ImportGuestPlanClient } from "@/components/import-guest-plan-client";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "Saving your plan" };

export default async function ImportPlanPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/plans/import");
  if (viewer.isGuest) redirect("/");
  return <ImportGuestPlanClient viewer={viewer} />;
}

