// Fixed zone so server-rendered and browser-rendered labels match (no
// hydration mismatch); the agency operates in Texas.
const TIME_ZONE = "America/Chicago";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("es-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date): string {
  return dayKeyFormat.format(date);
}

function daysAgo(date: Date, now: Date): number {
  const a = Date.parse(dayKey(date));
  const b = Date.parse(dayKey(now));
  return Math.round((b - a) / DAY_MS);
}

export function formatClock(date: Date): string {
  return timeFormat.format(date);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Day label shown in the middle of a chat, e.g. "Hoy", "Ayer", "Miércoles", "mié, 14 oct". */
export function formatChatDay(date: Date, now: Date): string {
  const diff = daysAgo(date, now);
  if (diff <= 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) {
    return capitalize(
      new Intl.DateTimeFormat("es-US", { timeZone: TIME_ZONE, weekday: "long" }).format(date)
    );
  }
  const sameYear = dayKey(date).slice(0, 4) === dayKey(now).slice(0, 4);
  return new Intl.DateTimeFormat("es-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

/** Short stamp for the conversation list: the clock time today, otherwise the day. */
export function formatListStamp(date: Date, now: Date): string {
  const diff = daysAgo(date, now);
  if (diff <= 0) return formatClock(date);
  if (diff === 1) return "Ayer";
  if (diff < 7) {
    return capitalize(
      new Intl.DateTimeFormat("es-US", { timeZone: TIME_ZONE, weekday: "short" }).format(date)
    );
  }
  return new Intl.DateTimeFormat("es-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    ...(dayKey(date).slice(0, 4) === dayKey(now).slice(0, 4) ? {} : { year: "2-digit" }),
  }).format(date);
}
