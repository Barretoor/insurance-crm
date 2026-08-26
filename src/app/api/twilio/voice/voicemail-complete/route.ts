import Twilio from "twilio";
import { VOICE_LANGUAGE, appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { xmlResponse } from "@/lib/voice-twiml";

const { VoiceResponse } = Twilio.twiml;

/** <Record action> callback: fires right after the voicemail message is captured. */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(
    `/api/twilio/voice/voicemail-complete?callId=${callId}`
  );
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const twiml = new VoiceResponse();
  twiml.say(
    { language: VOICE_LANGUAGE },
    "Gracias, hemos recibido tu mensaje. Un agente te contactará pronto."
  );
  twiml.hangup();

  return xmlResponse(twiml);
}
