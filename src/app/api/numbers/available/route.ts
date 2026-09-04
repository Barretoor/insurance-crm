import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { twilioClient } from "@/lib/twilio";

export async function GET(request: Request) {
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

  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (!query) {
    return NextResponse.json(
      { error: "Escribe un código de área o ciudad." },
      { status: 400 }
    );
  }

  const isAreaCode = /^\d{3}$/.test(query);

  try {
    const [available, pricing] = await Promise.all([
      twilioClient()
        .availablePhoneNumbers("US")
        .local.list(
          isAreaCode
            ? { areaCode: Number(query), limit: 20 }
            : { inLocality: query, limit: 20 }
        ),
      twilioClient().pricing.v1.phoneNumbers.countries("US").fetch(),
    ]);

    // Twilio's SDK types claim `currentPrice` is a number, but the API
    // actually returns it as a numeric string (e.g. "1.15") - coerce it so
    // clients can rely on it being a real number.
    const rawPrice = pricing.phoneNumberPrices.find(
      (p) => p.numberType === "local"
    )?.currentPrice;
    const monthlyPrice =
      rawPrice != null && !Number.isNaN(Number(rawPrice)) ? Number(rawPrice) : null;

    const numbers = available.map((n) => ({
      phoneNumber: n.phoneNumber,
      friendlyName: n.friendlyName,
      locality: n.locality,
      region: n.region,
    }));

    return NextResponse.json({
      numbers,
      monthlyPrice,
      priceUnit: pricing.priceUnit,
    });
  } catch (error) {
    console.error("Error buscando números disponibles en Twilio:", error);
    return NextResponse.json(
      { error: "No se pudo buscar números disponibles. Verifica el código de área o ciudad." },
      { status: 502 }
    );
  }
}
