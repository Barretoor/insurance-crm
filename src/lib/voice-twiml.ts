import Twilio from "twilio";
import { appUrl, SAY_VOICE_OPTIONS } from "@/lib/twilio";

type VoiceResponse = InstanceType<typeof Twilio.twiml.VoiceResponse>;

export function xmlResponse(twiml: VoiceResponse) {
  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

/** Appends the "leave a message" voicemail prompt + recording to a TwiML response. */
export function appendVoicemail(twiml: VoiceResponse, callId: string) {
  twiml.say(
    SAY_VOICE_OPTIONS,
    "En este momento no hay ningún agente disponible. Por favor, deja tu nombre y el motivo de tu llamada después del tono."
  );
  twiml.record({
    maxLength: 120,
    playBeep: true,
    action: appUrl(`/api/twilio/voice/voicemail-complete?callId=${callId}`),
    method: "POST",
    recordingStatusCallback: appUrl(
      `/api/twilio/voice/recording?callId=${callId}`
    ),
    recordingStatusCallbackMethod: "POST",
    recordingStatusCallbackEvent: ["completed"],
  });
}
