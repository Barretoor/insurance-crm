import type { AppointmentStatus } from "@/generated/prisma/enums";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const APPOINTMENT_STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-accent-50 text-accent-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export function formatTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function formatDurationMin(min: number): string {
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
