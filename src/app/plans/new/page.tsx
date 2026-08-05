import { redirect } from "next/navigation";
import { NewPlanClient } from "@/components/new-plan-client";
import { getViewer } from "@/lib/supabase/server";

export const metadata = { title: "New plan" };

export default async function NewPlanPage({ searchParams }: { searchParams: Promise<{ goal?: string }> }) {
  const [viewer, params] = await Promise.all([getViewer(), searchParams]);
  const goal = params.goal?.trim().slice(0, 1200) ?? "";
  if (!viewer) {
    const next = `/plans/new${goal ? `?goal=${encodeURIComponent(goal)}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  if (goal.length < 3) redirect("/plans");
  return <NewPlanClient viewer={viewer} initialGoal={goal} />;
}
