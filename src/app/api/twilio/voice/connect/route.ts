import Twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { RECORDING_DISCLOSURE, VOICE_LANGUAGE, appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";

const { VoiceResponse } = Twilio.twiml;

function xmlResponse(twiml: InstanceType<typeof VoiceResponse>) {
  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

/**
 * TwiML fetched by Twilio once the agent's own phone answers. Plays a short
 * consent notice, then dials the contact, whispering the same notice to them
 * before bridging both legs together, with recording enabled on the bridge.
 */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(`/api/twilio/voice/connect?callId=${callId}`);
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) {
    return new Response("Call not found", { status: 404 });
  }

  const twiml = new VoiceResponse();
  twiml.say({ language: VOICE_LANGUAGE }, RECORDING_DISCLOSURE);

  const dial = twiml.dial({
    callerId: call.fromNumber,
    record: "record-from-answer",
    recordingStatusCallback: appUrl(
      `/api/twilio/voice/recording?callId=${call.id}`
    ),
    recordingStatusCallbackMethod: "POST",
    recordingStatusCallbackEvent: ["completed"],
  });

  dial.number(
    { url: appUrl(`/api/twilio/voice/whisper?callId=${call.id}`) },
    call.toNumber
  );

  return xmlResponse(twiml);
}
