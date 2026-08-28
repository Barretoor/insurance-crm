/** Builds a full weeks-of-days grid (Sun-Sat) covering the given month, padded with adjacent-month days. */
export function getMonthGrid(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstOfMonth.getDay();

  const gridStart = new Date(year, month, 1 - startWeekday);
  const totalDaysNeeded = startWeekday + lastOfMonth.getDate();
  const totalWeeks = Math.ceil(totalDaysNeeded / 7);

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < totalWeeks; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calendar-day key in UTC. Date-only values (Task.dueDate) are parsed from
 * "YYYY-MM-DD" inputs as UTC midnight, so grouping/comparing by UTC keeps
 * that consistent regardless of the server's local timezone.
 */
export function dateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Parses a "YYYY-MM" search param into { year, month } (month 0-indexed), defaulting to the current month. */
export function parseMonthParam(param: string | undefined): {
  year: number;
  month: number;
} {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [year, month] = param.split("-").map(Number);
    return { year, month: month - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("es-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

export const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
