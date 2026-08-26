import type { PolicyStatus, PolicyType } from "@/generated/prisma/enums";

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  TERM: "Temporal (Term)",
  WHOLE_LIFE: "Vida entera",
  UNIVERSAL_LIFE: "Vida universal",
  FINAL_EXPENSE: "Gastos finales",
  OTHER: "Otro",
};

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  ACTIVE: "Activa",
  EXPIRED: "Vencida",
  CANCELLED: "Cancelada",
};

export const POLICY_STATUS_BADGE_CLASSES: Record<PolicyStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  EXPIRED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export function formatCurrency(value: number | string): string {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
