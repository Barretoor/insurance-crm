export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

/** Applies a theme preference to <html> immediately (client-side only). */
export function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;

  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "DARK" || (theme === "SYSTEM" && prefersDark);

  document.documentElement.classList.toggle("dark", isDark);
}
