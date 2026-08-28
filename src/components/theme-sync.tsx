"use client";

import { useEffect } from "react";
import { applyTheme, type ThemePreference } from "@/lib/theme";

/**
 * Keeps <html>'s dark class correct after the initial paint: re-applies on
 * mount (safety net) and, when the preference is "Automático", live-tracks
 * OS light/dark changes while the tab stays open.
 */
export function ThemeSync({ theme }: { theme: ThemePreference }) {
  useEffect(() => {
    applyTheme(theme);

    if (theme !== "SYSTEM") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}
