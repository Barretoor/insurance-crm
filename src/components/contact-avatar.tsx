function hueFor(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Solid mid-tone circle with initials; the hue comes from the name so a contact always keeps its color, in light and dark mode. */
export function ContactAvatar({
  name,
  className = "h-10 w-10 text-sm",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{ backgroundColor: `hsl(${hueFor(name)} 48% 44%)` }}
    >
      {initialsFor(name)}
    </span>
  );
}
