import Twilio from "twilio";
import { RECORDING_DISCLOSURE, VOICE_LANGUAGE, appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";

const { VoiceResponse } = Twilio.twiml;

/**
 * TwiML executed on the contact's leg right after they answer, before being
 * bridged into the call — this is the legally-required recording disclosure
 * heard by the person being called.
 */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(`/api/twilio/voice/whisper?callId=${callId}`);
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const twiml = new VoiceResponse();
  twiml.say({ language: VOICE_LANGUAGE }, RECORDING_DISCLOSURE);

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
