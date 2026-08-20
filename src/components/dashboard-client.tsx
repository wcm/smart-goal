"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArrowUpRight, CircleCheck, CloudOff, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { ActivityGrid } from "@/components/activity-grid";
import { GoalInputIcon } from "@/components/goal-input-icon";
import { GuestUpgradeButton } from "@/components/guest-upgrade-button";
import { PlanEmojiPicker } from "@/components/plan-emoji-picker";
import { Button } from "@/components/ui/button";
import { archivePlan, deletePlan, getActivity, listPlans, savePlan } from "@/lib/planner/repository";
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
    const repositoryOptions = { temporary: viewer.isGuest };
    Promise.all([listPlans(viewer.id, repositoryOptions), getActivity(viewer.id, repositoryOptions)])
      .then(([loadedPlans, events]) => {
        setPlans(loadedPlans);
        setActivity(events);
      })
      .catch((reason) => setError(asErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [viewer.id, viewer.isDemo, viewer.isGuest]);

  const visiblePlans = useMemo(
    () => plans.filter((plan) => showArchived
      ? plan.status === "archived"
      : plan.status === "active" && calculatePlanProgress(plan).percentage < 100),
    [plans, showArchived],
  );
  const completedPlans = useMemo(
    () => showArchived
      ? []
      : plans.filter((plan) => plan.status === "active" && calculatePlanProgress(plan).percentage === 100),
    [plans, showArchived],
  );

  function startGoal() {
    if (goal.trim().length < 3) return;
    router.push(`/plans/new?goal=${encodeURIComponent(goal.trim())}`);
  }

  async function changePlanEmoji(plan: PlanRecord, emoji: string) {
    if (emoji === plan.emoji) return;
    const updated = { ...plan, emoji, updatedAt: new Date().toISOString() };
    setPlans((current) => current.map((item) => item.id === plan.id ? updated : item));
    setError("");
    try {
      await savePlan(updated, { temporary: viewer.isGuest });
    } catch (reason) {
      setPlans((current) => current.map((item) => item.id === plan.id ? plan : item));
      setError(asErrorMessage(reason));
    }
  }

  function renderPlanActions(plan: PlanRecord) {
    return (
      <div className="card-menu-wrap">
        <button className="icon-button" onClick={() => setOpenMenu(openMenu === plan.id ? null : plan.id)} aria-label="Plan actions"><MoreHorizontal size={19} /></button>
        {openMenu === plan.id && (
          <div className="card-menu">
            {!viewer.isGuest && <button onClick={async () => { const updated = await archivePlan(plan); setPlans((current) => current.map((item) => item.id === updated.id ? updated : item)); setOpenMenu(null); }}><Archive size={15} />{plan.status === "active" ? "Archive" : "Restore"}</button>}
            <button className="danger" onClick={async () => { if (!window.confirm("Delete this plan permanently?")) return; await deletePlan(plan.id, { temporary: viewer.isGuest }); setPlans((current) => current.filter((item) => item.id !== plan.id)); }}><Trash2 size={15} />Delete</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className={`dashboard page-shell app-shell ${viewer.isGuest && plans[0] ? "has-guest-banner" : ""}`}>
      {viewer.isDemo && <div className="demo-banner"><Sparkles size={16} /> Demo mode — plans are saved only in this browser until Supabase is connected.</div>}
      {viewer.isGuest && plans[0] && (
        <div className="guest-plan-banner dashboard-guest-banner">
          <div><CloudOff size={22} /><span><strong>Don’t lose your progress</strong><small>Sign in to save this plan and continue next time.</small></span></div>
          <GuestUpgradeButton label="Save this plan" />
        </div>
      )}
      <section className="dashboard-heading"><h1>{viewer.isGuest ? "My plan" : "My plans"}</h1></section>

      {!viewer.isGuest && <ActivityGrid events={activity} />}

      <section className="plans-section">
        <div className={`plans-toolbar ${viewer.isGuest ? "guest" : ""}`}>
          {!viewer.isGuest && <div className="plan-tabs"><button className={!showArchived ? "active" : ""} onClick={() => setShowArchived(false)}>Active</button><button className={showArchived ? "active" : ""} onClick={() => setShowArchived(true)}>Archived</button></div>}
          <div className="quick-goal">
            <span className="goal-field-mark"><GoalInputIcon /></span>
            <input value={goal} onChange={(event) => setGoal(event.target.value)} onKeyDown={(event) => event.key === "Enter" && startGoal()} placeholder="Start a new SMART goal…" aria-label="Start a new SMART goal" />
            <Button onClick={startGoal} disabled={goal.trim().length < 3} aria-label="Make goal SMART"><ArrowUpRight size={18} /></Button>
          </div>
        </div>
        {error && <div className="error-card" role="alert">{error}</div>}
        {loading ? (
          <div className="plan-grid"><div className="plan-card skeleton" /><div className="plan-card skeleton" /></div>
        ) : (
          <>
            {visiblePlans.length === 0 && completedPlans.length === 0 ? (
              <div className="empty-plans"><h3>{showArchived ? "No archived plans" : "No plans yet"}</h3></div>
            ) : visiblePlans.length > 0 ? (
              <div className="plan-grid">
                {visiblePlans.map((plan) => {
                  const progress = calculatePlanProgress(plan);
                  return (
                    <article className="plan-card" key={plan.id}>
                      <div className="plan-card-top">
                        <PlanEmojiPicker value={plan.emoji} onChange={(emoji) => void changePlanEmoji(plan, emoji)} />
                        <div className="plan-card-meta">
                          <span className="plan-date">Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(plan.updatedAt))}</span>
                          {renderPlanActions(plan)}
                        </div>
                      </div>
                      <Link href={`/plans/${plan.id}`} className="plan-card-link">
                        <h3>{plan.title}</h3><p>{plan.summary}</p>
                        <div className="plan-card-progress"><div><span>{progress.percentage}%</span><span>{formatMinutes(progress.totalMinutes)}</span></div><div className="progress-track"><span style={{ width: `${progress.percentage}%` }} /></div></div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {completedPlans.length > 0 && (
              <section className="completed-plans-section" aria-labelledby="completed-plans-heading">
                <h2 id="completed-plans-heading">Completed</h2>
                <div className="completed-plan-list">
                  {completedPlans.map((plan) => (
                    <article className="completed-plan-row" key={plan.id}>
                      <PlanEmojiPicker value={plan.emoji} onChange={(emoji) => void changePlanEmoji(plan, emoji)} />
                      <Link href={`/plans/${plan.id}`} className="completed-plan-link">
                        <strong>{plan.title}</strong>
                        <span><span className="completed-state"><CircleCheck size={14} />Complete</span><i aria-hidden="true">·</i><span>Updated {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(plan.updatedAt))}</span></span>
                      </Link>
                      {renderPlanActions(plan)}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}
