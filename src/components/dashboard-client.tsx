"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowUpRight, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { ActivityGrid } from "@/components/activity-grid";
import { Button } from "@/components/ui/button";
import { archivePlan, deletePlan, getActivity, listPlans } from "@/lib/planner/repository";
import { calculatePlanProgress, formatMinutes } from "@/lib/planner/tree";
import type { ActivityEvent, PlanRecord, Viewer } from "@/lib/planner/types";
import { asErrorMessage } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function DashboardClient({ viewer }: { viewer: Viewer }) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!viewer.isDemo) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      void createSupabaseBrowserClient()
        ?.from("profiles")
        .update({ timezone, updated_at: new Date().toISOString() })
        .eq("id", viewer.id);
    }
    Promise.all([listPlans(viewer.id), getActivity(viewer.id)])
      .then(([loadedPlans, events]) => {
        setPlans(loadedPlans);
        setActivity(events);
      })
      .catch((reason) => setError(asErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [viewer.id, viewer.isDemo]);

  const visiblePlans = useMemo(
    () => plans.filter((plan) => plan.status === (showArchived ? "archived" : "active")),
    [plans, showArchived],
  );

  function startGoal() {
    if (goal.trim().length < 3) return;
    router.push(`/plans/new?goal=${encodeURIComponent(goal.trim())}`);
  }

  return (
    <main className="dashboard page-shell app-shell">
      {viewer.isDemo && <div className="demo-banner"><Sparkles size={16} /> Demo mode — plans are saved only in this browser until Supabase is connected.</div>}
      <section className="dashboard-heading"><h1>Plans</h1></section>

      <section className="quick-goal">
        <Sparkles size={19} aria-hidden="true" />
        <input value={goal} onChange={(event) => setGoal(event.target.value)} onKeyDown={(event) => event.key === "Enter" && startGoal()} placeholder="Start a new plan…" aria-label="Start a new plan" />
        <Button onClick={startGoal} disabled={goal.trim().length < 3} aria-label="Create plan"><ArrowUpRight size={18} /></Button>
      </section>

      <section className="plans-section">
        <div className="section-row"><h2>{showArchived ? "Archived" : "In progress"}</h2><div className="plan-tabs"><button className={!showArchived ? "active" : ""} onClick={() => setShowArchived(false)}>Active</button><button className={showArchived ? "active" : ""} onClick={() => setShowArchived(true)}>Archived</button></div></div>
        {error && <div className="error-card" role="alert">{error}</div>}
        {loading ? (
          <div className="plan-grid"><div className="plan-card skeleton" /><div className="plan-card skeleton" /></div>
        ) : visiblePlans.length === 0 ? (
          <div className="empty-plans"><h3>{showArchived ? "No archived plans" : "No plans yet"}</h3></div>
        ) : (
          <div className="plan-grid">
            {visiblePlans.map((plan) => {
              const progress = calculatePlanProgress(plan);
              return (
                <article className="plan-card" key={plan.id}>
                  <div className="plan-card-top"><span className="plan-date">Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(plan.updatedAt))}</span><div className="card-menu-wrap"><button className="icon-button" onClick={() => setOpenMenu(openMenu === plan.id ? null : plan.id)} aria-label="Plan actions"><MoreHorizontal size={19} /></button>{openMenu === plan.id && <div className="card-menu"><button onClick={async () => { const updated = await archivePlan(plan); setPlans((current) => current.map((item) => item.id === updated.id ? updated : item)); setOpenMenu(null); }}><Archive size={15} />{plan.status === "active" ? "Archive" : "Restore"}</button><button className="danger" onClick={async () => { if (!window.confirm("Delete this plan permanently?")) return; await deletePlan(plan.id); setPlans((current) => current.filter((item) => item.id !== plan.id)); }}><Trash2 size={15} />Delete</button></div>}</div></div>
                  <Link href={`/plans/${plan.id}`} className="plan-card-link">
                    <h3>{plan.title}</h3><p>{plan.summary}</p>
                    <div className="plan-card-progress"><div><span>{progress.percentage}%</span><span>{formatMinutes(progress.totalMinutes)}</span></div><div className="progress-track"><span style={{ width: `${progress.percentage}%` }} /></div></div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <ActivityGrid events={activity} />
    </main>
  );
}
