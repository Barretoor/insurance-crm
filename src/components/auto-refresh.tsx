"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-runs the current page's server queries on an interval while the tab is visible, so new inbound texts show up without a manual reload. */
export function AutoRefresh({ intervalMs = 6000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
