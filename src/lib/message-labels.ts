import type { MessageStatus } from "@/generated/prisma/enums";

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  QUEUED: "En cola",
  SENT: "Enviado",
  DELIVERED: "Entregado",
  UNDELIVERED: "No entregado",
  FAILED: "Fallido",
  RECEIVED: "Recibido",
};

export const MESSAGE_STATUS_BADGE_CLASSES: Record<MessageStatus, string> = {
  QUEUED: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
  UNDELIVERED: "bg-red-50 text-red-700",
  FAILED: "bg-red-50 text-red-700",
  RECEIVED: "bg-gray-100 text-gray-600",
};

/** Maps Twilio's lowercase MessageStatus values to our enum. */
export function mapTwilioMessageStatus(status: string): MessageStatus {
  const map: Record<string, MessageStatus> = {
    accepted: "QUEUED",
    queued: "QUEUED",
    sending: "QUEUED",
    sent: "SENT",
    delivered: "DELIVERED",
    undelivered: "UNDELIVERED",
    failed: "FAILED",
    receiving: "RECEIVED",
    received: "RECEIVED",
  };
  return map[status] ?? "FAILED";
}

export function formatMessageTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
