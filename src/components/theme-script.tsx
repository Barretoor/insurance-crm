/**
 * Blocking inline script, rendered as the first thing in <body>, so the
 * correct theme class is on <html> before first paint (no flash of the
 * wrong theme). Scripts inserted this way don't re-run on React re-renders,
 * so live updates (changing theme on /profile, OS preference changes while
 * on "Automático") are handled separately by <ThemeSync>.
 */
export function ThemeScript({ theme }: { theme: "LIGHT" | "DARK" | "SYSTEM" }) {
  const script = `(function(){try{var t=${JSON.stringify(theme)};var d=t==="DARK"||(t==="SYSTEM"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
