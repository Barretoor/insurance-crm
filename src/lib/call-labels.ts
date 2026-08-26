import type { CallDirection, CallStatus } from "@/generated/prisma/enums";

export const CALL_DIRECTION_LABELS: Record<CallDirection, string> = {
  INBOUND: "Entrante",
  OUTBOUND: "Saliente",
};

export const CALL_DIRECTION_BADGE_CLASSES: Record<CallDirection, string> = {
  INBOUND: "bg-purple-50 text-purple-700",
  OUTBOUND: "bg-sky-50 text-sky-700",
};

export const CALL_DIRECTION_ICONS: Record<CallDirection, string> = {
  INBOUND: "↓",
  OUTBOUND: "↑",
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  QUEUED: "En cola",
  INITIATED: "Iniciada",
  RINGING: "Timbrando",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completada",
  BUSY: "Ocupado",
  FAILED: "Fallida",
  NO_ANSWER: "Sin respuesta",
  CANCELED: "Cancelada",
};

export const CALL_STATUS_BADGE_CLASSES: Record<CallStatus, string> = {
  QUEUED: "bg-gray-100 text-gray-600",
  INITIATED: "bg-blue-50 text-blue-700",
  RINGING: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-green-50 text-green-700",
  BUSY: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  NO_ANSWER: "bg-red-50 text-red-700",
  CANCELED: "bg-gray-100 text-gray-600",
};

/** Maps Twilio's lowercase-hyphenated CallStatus values to our enum. */
export function mapTwilioCallStatus(status: string): CallStatus {
  const map: Record<string, CallStatus> = {
    queued: "QUEUED",
    initiated: "INITIATED",
    ringing: "RINGING",
    "in-progress": "IN_PROGRESS",
    answered: "IN_PROGRESS",
    completed: "COMPLETED",
    busy: "BUSY",
    failed: "FAILED",
    "no-answer": "NO_ANSWER",
    canceled: "CANCELED",
  };
  return map[status] ?? "FAILED";
}

const TERMINAL_STATUSES: CallStatus[] = [
  "COMPLETED",
  "BUSY",
  "FAILED",
  "NO_ANSWER",
  "CANCELED",
];

export function isTerminalCallStatus(status: CallStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
