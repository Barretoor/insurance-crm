import Twilio from "twilio";

let client: ReturnType<typeof Twilio> | null = null;

export function twilioClient() {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error(
        "TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN no están configuradas."
      );
    }
    client = Twilio(accountSid, authToken);
  }
  return client;
}

/** Builds an absolute, publicly reachable URL for Twilio webhooks (needs APP_URL, e.g. an ngrok tunnel in dev). */
export function appUrl(pathAndQuery: string): string {
  const base = process.env.APP_URL;
  if (!base) {
    throw new Error(
      "APP_URL no está configurada (debe ser una URL pública alcanzable por Twilio)."
    );
  }
  return `${base.replace(/\/$/, "")}${pathAndQuery}`;
}

/** Recording-consent disclosure, played on both outbound and inbound calls. */
export const RECORDING_DISCLOSURE =
  "Esta llamada puede ser grabada con fines de calidad y capacitación.";

export const VOICE_LANGUAGE = "es-MX" as const;
