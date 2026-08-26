import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { twilioClient, appUrl } from "@/lib/twilio";
import { selectLocalPresenceNumber } from "@/lib/phone-pool";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const contactId = body?.contactId;
  if (typeof contactId !== "string") {
    return NextResponse.json(
      { error: "Falta el contactId." },
      { status: 400 }
    );
  }

  const [contact, agent] = await Promise.all([
    prisma.contact.findFirst({
      where: { id: contactId, agencyId: session.user.agencyId },
    }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
  ]);

  if (!contact) {
    return NextResponse.json(
      { error: "Contacto no encontrado." },
      { status: 404 }
    );
  }
  if (!contact.phone) {
    return NextResponse.json(
      { error: "El contacto no tiene un teléfono registrado." },
      { status: 400 }
    );
  }
  if (!agent?.phone) {
    return NextResponse.json(
      {
        error:
          "Agrega tu número de teléfono en 'Mi perfil' antes de hacer llamadas.",
      },
      { status: 400 }
    );
  }

  const phoneNumber = await selectLocalPresenceNumber(
    session.user.agencyId,
    contact
  );
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "No hay números disponibles en el pool de tu agencia." },
      { status: 400 }
    );
  }

  const call = await prisma.call.create({
    data: {
      contactId: contact.id,
      userId: agent.id,
      phoneNumberId: phoneNumber.id,
      fromNumber: phoneNumber.number,
      toNumber: contact.phone,
      status: "QUEUED",
    },
  });

  try {
    const twilioCall = await twilioClient().calls.create({
      to: agent.phone,
      from: phoneNumber.number,
      url: appUrl(`/api/twilio/voice/connect?callId=${call.id}`),
      method: "POST",
      statusCallback: appUrl(`/api/twilio/voice/status?callId=${call.id}`),
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    await prisma.call.update({
      where: { id: call.id },
      data: { twilioCallSid: twilioCall.sid, status: "INITIATED" },
    });

    return NextResponse.json(
      { callId: call.id, status: "initiated" },
      { status: 201 }
    );
  } catch (error) {
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "FAILED", endedAt: new Date() },
    });

    console.error("Error al iniciar llamada de Twilio:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar la llamada." },
      { status: 502 }
    );
  }
}
