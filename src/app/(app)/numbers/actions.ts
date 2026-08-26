"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { extractAreaCode } from "@/lib/phone";
import { US_STATES } from "@/lib/us-states";
import { appUrl, twilioClient } from "@/lib/twilio";

export type PhoneNumberActionState = { error?: string; warning?: string };

const E164_US_REGEX = /^\+1\d{10}$/;

export async function createPhoneNumber(
  _prevState: PhoneNumberActionState,
  formData: FormData
): Promise<PhoneNumberActionState> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return { error: "Solo un administrador puede agregar números." };
  }

  const number = String(formData.get("number") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();

  if (!E164_US_REGEX.test(number)) {
    return {
      error: "El número debe estar en formato E.164, ej. +12145551234.",
    };
  }
  if (state && !US_STATES.some((s) => s.code === state)) {
    return { error: "Estado inválido." };
  }

  const areaCode = extractAreaCode(number);
  if (!areaCode) {
    return { error: "No se pudo determinar el código de área del número." };
  }

  const existing = await prisma.phoneNumber.findUnique({ where: { number } });
  if (existing) {
    return { error: "Ese número ya está registrado." };
  }

  await prisma.phoneNumber.create({
    data: {
      number,
      areaCode,
      state: state || null,
      agencyId: session.user.agencyId,
    },
  });

  revalidatePath("/numbers");

  const warning = await configureInboundWebhook(number);
  return warning ? { warning } : {};
}

/**
 * Best-effort: points this Twilio number's "A call comes in" webhook at our
 * inbound handler, so the admin doesn't have to configure it by hand in the
 * Twilio Console. Returns a warning message if it couldn't be done.
 */
async function configureInboundWebhook(number: string): Promise<string | null> {
  try {
    const client = twilioClient();
    const [incomingNumber] = await client.incomingPhoneNumbers.list({
      phoneNumber: number,
      limit: 1,
    });

    if (!incomingNumber) {
      return "El número se guardó, pero no se encontró en tu cuenta de Twilio: configura manualmente su webhook de voz en la consola de Twilio para poder recibir llamadas.";
    }

    await client.incomingPhoneNumbers(incomingNumber.sid).update({
      voiceUrl: appUrl("/api/twilio/voice/inbound"),
      voiceMethod: "POST",
    });

    return null;
  } catch (error) {
    console.error("No se pudo configurar el webhook de voz entrante:", error);
    return "El número se guardó, pero no se pudo configurar automáticamente su webhook de voz. Configúralo manualmente en la consola de Twilio para poder recibir llamadas.";
  }
}

export async function togglePhoneNumberActive(formData: FormData) {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") return;

  const id = String(formData.get("id") ?? "");
  const phoneNumber = await prisma.phoneNumber.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });
  if (!phoneNumber) return;

  await prisma.phoneNumber.update({
    where: { id: phoneNumber.id },
    data: { active: !phoneNumber.active },
  });

  revalidatePath("/numbers");
}
