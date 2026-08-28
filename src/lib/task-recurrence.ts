import type { TaskRecurrence } from "@/generated/prisma/enums";

export const TASK_RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  NONE: "No se repite",
  DAILY: "Diaria",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
};

/**
 * Advances `dueDate` by one recurrence cycle, then keeps advancing until the
 * result is strictly after `today` - so a task completed late (e.g. a daily
 * task done a few days late) still lands on the next *future* occurrence
 * instead of repeating in the past.
 */
export function getNextRecurrenceDate(
  dueDate: Date,
  recurrence: TaskRecurrence,
  today: Date = new Date()
): Date | null {
  if (recurrence === "NONE") return null;

  // dueDate is parsed from a date-only ("YYYY-MM-DD") input as UTC midnight,
  // so all arithmetic here stays in UTC to avoid drifting a day depending on
  // the server's local timezone.
  const endOfToday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  let next = new Date(dueDate);
  do {
    next = advanceOnce(next, recurrence);
  } while (next <= endOfToday);

  return next;
}

function advanceOnce(date: Date, recurrence: TaskRecurrence): Date {
  const next = new Date(date);
  switch (recurrence) {
    case "DAILY":
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "WEEKLY":
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case "MONTHLY": {
      // Clamp to the target month's last day instead of letting e.g. Jan 31
      // overflow into March when the target month is shorter (Feb).
      const day = next.getUTCDate();
      next.setUTCDate(1);
      next.setUTCMonth(next.getUTCMonth() + 1);
      const daysInTargetMonth = new Date(
        Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
      ).getUTCDate();
      next.setUTCDate(Math.min(day, daysInTargetMonth));
      break;
    }
  }
  return next;
}
