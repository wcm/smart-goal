"use client";

import { useEffect } from "react";
import { clearGuestPlanSnapshot } from "@/lib/planner/guest-transfer";
import { clearTemporaryPlan } from "@/lib/planner/repository";

export function ClearTemporaryPlan() {
  useEffect(() => {
    clearTemporaryPlan();
    clearGuestPlanSnapshot();
  }, []);

  return null;
}
