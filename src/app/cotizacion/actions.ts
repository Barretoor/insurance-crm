"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { extractAreaCode, normalizePhoneDigits } from "@/lib/phone";
import { US_STATES } from "@/lib/us-states";
import { getDefaultStageId } from "@/lib/pipeline";

// Single-tenant for now: this is the only agency using the CRM, and the
// public quote form isn't multi-tenant (no per-agency slug/subdomain yet).
const ANDREA_INSURANCE_AGENCY_ID = "cmtawjzvb000004l2n705uoce";

export type QuoteFormState = { error?: string };

export async function submitQuoteRequest(
  _prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  // Honeypot: real visitors never fill a field they can't see.
  if (String(formData.get("company") ?? "").trim()) {
    redirect("/cotizacion/gracias");
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const smsConsent = formData.get("smsConsent") === "on";

  if (!name) return { error: "El nombre es obligatorio." };
  if (!phone) return { error: "El teléfono es obligatorio." };
  if (state && !US_STATES.some((s) => s.code === state)) {
    return { error: "Estado inválido." };
  }

  const stageId = await getDefaultStageId(ANDREA_INSURANCE_AGENCY_ID);

  const submittedAt = new Date().toLocaleString("es-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const notes = [
    `Lead desde el formulario público de cotización (${submittedAt}).`,
    `Consentimiento SMS: ${smsConsent ? "Sí" : "No"}.`,
    message ? `Mensaje: ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await prisma.contact.create({
    data: {
      name,
      phone,
      email: email || null,
      city: city || null,
      state: state || null,
      notes,
      areaCode: extractAreaCode(phone),
      phoneDigits: normalizePhoneDigits(phone),
      agencyId: ANDREA_INSURANCE_AGENCY_ID,
      stageId,
      smsOptOut: !smsConsent,
    },
  });

  redirect("/cotizacion/gracias");
}
