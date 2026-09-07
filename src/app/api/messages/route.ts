import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/send-sms";

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

  const result = await sendSms({
    agencyId: session.user.agencyId,
    contact,
    body: text,
    userId: session.user.id,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ message: result.message }, { status: 201 });
}
