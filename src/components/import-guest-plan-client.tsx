"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  clearGuestPlanSnapshot,
  cloneGuestPlan,
  readGuestPlanSnapshot,
} from "@/lib/planner/guest-transfer";
import { clearTemporaryPlan, savePlan } from "@/lib/planner/repository";
import type { Viewer } from "@/lib/planner/types";
import { asErrorMessage } from "@/lib/utils";

export function ImportGuestPlanClient({ viewer }: { viewer: Viewer }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const snapshot = readGuestPlanSnapshot();
    if (!snapshot) {
      router.replace("/plans");
      return;
    }

    const plan = cloneGuestPlan(snapshot, viewer.id);
    void savePlan(plan)
      .then(() => {
        if (!active) return;
        clearGuestPlanSnapshot();
        clearTemporaryPlan();
        router.replace(`/plans/${plan.id}`);
      })
      .catch((reason) => {
        if (active) setError(asErrorMessage(reason));
      });

    return () => {
      active = false;
    };
  }, [attempt, router, viewer.id]);

  return (
    <main className="planner page-shell app-shell">
      <section className="import-plan-card">
        {error ? (
          <>
            <h1>Your plan is still safe</h1>
            <p>We could not add it to this account yet.</p>
            <div className="error-card" role="alert">{error}</div>
            <Button onClick={() => { setError(""); setAttempt((value) => value + 1); }}>
              Try again
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="spin" size={23} />
            <h1>Saving your plan…</h1>
            <p>Keeping every step and completed item exactly as you left it.</p>
          </>
        )}
      </section>
    </main>
  );
}
