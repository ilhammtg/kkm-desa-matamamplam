"use client";

import { incrementSiteVisit } from "@/server/actions/analytics.actions";
import { useEffect, useRef } from "react";

export function SiteTracker() {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Simple session check to avoid double counting on reload (basic)
    // For better analytics, use local storage with expiration
    const key = `kkm_site_visit_${new Date().toDateString()}`;
    const visited = localStorage.getItem(key);

    if (!visited && !hasTracked.current) {
      incrementSiteVisit();
      localStorage.setItem(key, "true");
      hasTracked.current = true;
    }
  }, []);

  return null;
}
