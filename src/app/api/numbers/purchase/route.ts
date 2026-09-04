import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appUrl, twilioClient } from "@/lib/twilio";
import { extractAreaCode } from "@/lib/phone";
import { US_STATES } from "@/lib/us-states";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede comprar números." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const phoneNumber = body?.phoneNumber;
  const region = typeof body?.region === "string" ? body.region : null;

  if (typeof phoneNumber !== "string" || !phoneNumber.startsWith("+")) {
    return NextResponse.json(
      { error: "Falta el número a comprar." },
      { status: 400 }
    );
  }

  const existing = await prisma.phoneNumber.findUnique({ where: { number: phoneNumber } });
  if (existing) {
    return NextResponse.json(
      { error: "Ese número ya está registrado en el CRM." },
      { status: 409 }
    );
  }

  const state = region && US_STATES.some((s) => s.code === region) ? region : null;

  try {
    const purchased = await twilioClient().incomingPhoneNumbers.create({
      phoneNumber,
      voiceUrl: appUrl("/api/twilio/voice/inbound"),
      voiceMethod: "POST",
      smsUrl: appUrl("/api/twilio/sms/inbound"),
      smsMethod: "POST",
    });

    const areaCode = extractAreaCode(purchased.phoneNumber);
    if (!areaCode) {
      // Extremely unlikely for a US local number, but we've already spent the
      // money - register it with a best-effort area code rather than losing
      // track of a real, billable Twilio number.
      console.error(
        "No se pudo determinar el código de área del número recién comprado:",
        purchased.phoneNumber
      );
    }

    const created = await prisma.phoneNumber.create({
      data: {
        number: purchased.phoneNumber,
        areaCode: areaCode ?? "000",
        state,
        agencyId: session.user.agencyId,
      },
    });

    return NextResponse.json({ phoneNumber: created }, { status: 201 });
  } catch (error) {
    console.error("Error comprando número de Twilio:", error);
    return NextResponse.json(
      { error: "No se pudo comprar el número. Puede que ya no esté disponible." },
      { status: 502 }
    );
  }
}
