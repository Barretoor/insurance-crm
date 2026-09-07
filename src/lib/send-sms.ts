import { prisma } from "@/lib/prisma";
import { twilioClient, appUrl } from "@/lib/twilio";
import { selectLocalPresenceNumber } from "@/lib/phone-pool";
import { mapTwilioMessageStatus } from "@/lib/message-labels";
import { toE164 } from "@/lib/phone";

type SendSmsContact = {
  id: string;
  phone: string | null;
  areaCode: string | null;
  state: string | null;
  smsOptOut: boolean;
};

type SendSmsParams = {
  agencyId: string;
  contact: SendSmsContact;
  body: string;
  /** Attribute the message to the agent who sent it manually. */
  userId?: string;
  /** Attribute the message to the automation that sent it. */
  automationId?: string;
};

/**
 * Shared "send a text and record it" path used by both the manual chat
 * endpoint and the automation runner - picks a local-presence number from
 * the pool, sends via Twilio, and persists the Message either way.
 */
export async function sendSms({
  agencyId,
  contact,
  body,
  userId,
  automationId,
}: SendSmsParams) {
  if (contact.smsOptOut) {
    return {
      error: "Este contacto se dio de baja de mensajes de texto (STOP).",
    } as const;
  }

  const toNumber = toE164(contact.phone);
  if (!toNumber) {
    return { error: "El contacto no tiene un teléfono válido registrado." } as const;
  }

  const phoneNumber = await selectLocalPresenceNumber(agencyId, contact);
  if (!phoneNumber) {
    return { error: "No hay números disponibles en el pool de tu agencia." } as const;
  }

  const message = await prisma.message.create({
    data: {
      direction: "OUTBOUND",
      body,
      status: "QUEUED",
      read: true,
      agencyId,
      contactId: contact.id,
      userId,
      automationId,
      phoneNumberId: phoneNumber.id,
      fromNumber: phoneNumber.number,
      toNumber,
    },
  });

  try {
    const twilioMessage = await twilioClient().messages.create({
      to: toNumber,
      from: phoneNumber.number,
      body,
      statusCallback: appUrl(`/api/twilio/sms/status?messageId=${message.id}`),
    });

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: {
        twilioMessageSid: twilioMessage.sid,
        status: mapTwilioMessageStatus(twilioMessage.status),
      },
    });

    return { message: updated } as const;
  } catch (error) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FAILED" },
    });
    console.error("Error al enviar SMS:", error);
    return { error: "No se pudo enviar el mensaje." } as const;
  }
}
