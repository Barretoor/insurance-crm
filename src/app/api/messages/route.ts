import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { twilioClient, appUrl } from "@/lib/twilio";
import { selectLocalPresenceNumber } from "@/lib/phone-pool";
import { mapTwilioMessageStatus } from "@/lib/message-labels";
import { toE164 } from "@/lib/phone";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contactId = body?.contactId;
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (typeof contactId !== "string") {
    return NextResponse.json({ error: "Falta el contactId." }, { status: 400 });
  }
  if (!text) {
    return NextResponse.json(
      { error: "El mensaje no puede estar vacío." },
      { status: 400 }
    );
  }

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, agencyId: session.user.agencyId },
  });
  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
  }
  const toNumber = toE164(contact.phone);
  if (!toNumber) {
    return NextResponse.json(
      { error: "El contacto no tiene un teléfono válido registrado." },
      { status: 400 }
    );
  }

  const phoneNumber = await selectLocalPresenceNumber(session.user.agencyId, contact);
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "No hay números disponibles en el pool de tu agencia." },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      direction: "OUTBOUND",
      body: text,
      status: "QUEUED",
      read: true,
      agencyId: session.user.agencyId,
      contactId: contact.id,
      userId: session.user.id,
      phoneNumberId: phoneNumber.id,
      fromNumber: phoneNumber.number,
      toNumber,
    },
  });

  try {
    const twilioMessage = await twilioClient().messages.create({
      to: toNumber,
      from: phoneNumber.number,
      body: text,
      statusCallback: appUrl(`/api/twilio/sms/status?messageId=${message.id}`),
    });

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: {
        twilioMessageSid: twilioMessage.sid,
        status: mapTwilioMessageStatus(twilioMessage.status),
      },
    });

    return NextResponse.json({ message: updated }, { status: 201 });
  } catch (error) {
    await prisma.message.update({
      where: { id: message.id },
      data: { status: "FAILED" },
    });

    console.error("Error al enviar SMS de Twilio:", error);
    return NextResponse.json({ error: "No se pudo enviar el mensaje." }, { status: 502 });
  }
}
