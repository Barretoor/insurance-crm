import Twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { VOICE_LANGUAGE, appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { xmlResponse } from "@/lib/voice-twiml";

const { VoiceResponse } = Twilio.twiml;

/** Whispered to whichever agent picks up, before they're bridged to the caller. */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(
    `/api/twilio/voice/inbound-whisper?callId=${callId}`
  );
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const call = await prisma.call.findUnique({
    where: { id: callId },
    include: { contact: { select: { name: true } } },
  });

  const twiml = new VoiceResponse();
  const who = call?.contact?.name ?? "un número desconocido";
  twiml.say(
    { language: VOICE_LANGUAGE },
    `Llamada entrante de ${who}. Conectando.`
  );

  return xmlResponse(twiml);
}
