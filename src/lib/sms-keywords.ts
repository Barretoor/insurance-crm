// Standard CTIA/carrier-recognized opt-out and opt-in keywords, matched as
// the *entire* message body (case-insensitive) - not just "contains" - so a
// normal reply that happens to mention "stop" doesn't trigger this.
const STOP_KEYWORDS = new Set([
  "STOP",
  "STOPALL",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
]);
const START_KEYWORDS = new Set(["START", "YES", "UNSTOP"]);

export function isStopKeyword(body: string): boolean {
  return STOP_KEYWORDS.has(body.trim().toUpperCase());
}

export function isStartKeyword(body: string): boolean {
  return START_KEYWORDS.has(body.trim().toUpperCase());
}

export const STOP_CONFIRMATION_MESSAGE =
  "Te has dado de baja y no recibirás más mensajes de este número. Responde START para volver a suscribirte.";

export const START_CONFIRMATION_MESSAGE =
  "Te has vuelto a suscribir y puedes recibir mensajes de este número. Responde STOP en cualquier momento para darte de baja.";
