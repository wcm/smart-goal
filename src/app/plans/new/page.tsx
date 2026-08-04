import { redirect } from "next/navigation";
import { NewPlanClient } from "@/components/new-plan-client";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "New plan" };

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ goal?: string }> }) {
  const [viewer, params] = await Promise.all([getViewer(), searchParams]);
  if (!viewer) {
    const next = `/plans/new${params.goal ? `?goal=${encodeURIComponent(params.goal)}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return <NewPlanClient viewer={viewer} initialGoal={params.goal?.slice(0, 1200) ?? ""} />;
}
