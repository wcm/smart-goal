"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowRight, MoreHorizontal, Plus, Sparkles, Trash2 } from "lucide-react";
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
      <section className="dashboard-welcome">
        <div><span className="eyebrow"><span /> Your workspace</span><h1>Good to see you, <em>{viewer.name.split(" ")[0]}.</em></h1><p>Choose the goal that deserves your attention today.</p></div>
        <Link className="button button-primary button-md" href="/plans/new"><Plus size={17} /> New plan</Link>
      </section>

      <section className="quick-goal">
        <div className="quick-goal-copy"><span className="quick-icon"><Sparkles size={21} /></span><div><strong>What do you want to make happen?</strong><span>Start broad. We’ll make it practical together.</span></div></div>
        <div className="quick-goal-form"><input value={goal} onChange={(event) => setGoal(event.target.value)} onKeyDown={(event) => event.key === "Enter" && startGoal()} placeholder="e.g. Run my first half marathon" /><Button onClick={startGoal} disabled={goal.trim().length < 3}>Build my plan <ArrowRight size={17} /></Button></div>
      </section>

      <section className="plans-section">
        <div className="section-row"><div><span className="section-label">YOUR GOALS</span><h2>Plans in motion</h2></div><div className="plan-tabs"><button className={!showArchived ? "active" : ""} onClick={() => setShowArchived(false)}>Active</button><button className={showArchived ? "active" : ""} onClick={() => setShowArchived(true)}>Archived</button></div></div>
        {error && <div className="error-card" role="alert">{error}</div>}
        {loading ? (
          <div className="plan-grid"><div className="plan-card skeleton" /><div className="plan-card skeleton" /></div>
        ) : visiblePlans.length === 0 ? (
          <div className="empty-plans"><span><Plus size={24} /></span><h3>{showArchived ? "No archived plans" : "Your first plan starts here"}</h3><p>{showArchived ? "Plans you archive will stay available here." : "Turn a goal into clear next steps and a realistic time estimate."}</p>{!showArchived && <Link href="/plans/new" className="button button-secondary button-md">Create a plan</Link>}</div>
        ) : (
          <div className="plan-grid">
            {visiblePlans.map((plan) => {
              const progress = calculatePlanProgress(plan);
              return (
                <article className="plan-card" key={plan.id}>
                  <div className="plan-card-top"><span className="plan-dot" /><div className="card-menu-wrap"><button className="icon-button" onClick={() => setOpenMenu(openMenu === plan.id ? null : plan.id)} aria-label="Plan actions"><MoreHorizontal size={19} /></button>{openMenu === plan.id && <div className="card-menu"><button onClick={async () => { const updated = await archivePlan(plan); setPlans((current) => current.map((item) => item.id === updated.id ? updated : item)); setOpenMenu(null); }}><Archive size={15} />{plan.status === "active" ? "Archive" : "Restore"}</button><button className="danger" onClick={async () => { if (!window.confirm("Delete this plan permanently?")) return; await deletePlan(plan.id); setPlans((current) => current.filter((item) => item.id !== plan.id)); }}><Trash2 size={15} />Delete</button></div>}</div></div>
                  <Link href={`/plans/${plan.id}`} className="plan-card-link"><span className="plan-date">Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(plan.updatedAt))}</span><h3>{plan.title}</h3><p>{plan.summary}</p></Link>
                  <div className="plan-card-progress"><div><span>{progress.percentage}% complete</span><span>{formatMinutes(progress.totalMinutes)} total</span></div><div className="progress-track"><span style={{ width: `${progress.percentage}%` }} /></div></div>
                  <Link href={`/plans/${plan.id}`} className="plan-open">Open plan <ArrowRight size={16} /></Link>
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
