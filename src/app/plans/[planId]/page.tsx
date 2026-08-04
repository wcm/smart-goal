import { redirect } from "next/navigation";
import { PlannerClient } from "@/components/planner-client";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "Plan" };

export default async function PlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const [viewer, route] = await Promise.all([getViewer(), params]);
  if (!viewer) redirect(`/login?next=${encodeURIComponent(`/plans/${route.planId}`)}`);
  return <PlannerClient planId={route.planId} viewer={viewer} />;
}
