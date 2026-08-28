import Twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { RECORDING_DISCLOSURE, SAY_VOICE_OPTIONS, appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { xmlResponse, appendVoicemail } from "@/lib/voice-twiml";
import { normalizePhoneDigits } from "@/lib/phone";

const { VoiceResponse } = Twilio.twiml;

/**
 * Shared "a call comes in" webhook for every Twilio number in every agency's
 * pool (configured as each IncomingPhoneNumber's Voice URL). The agency is
 * resolved from the `To` number, and the caller is matched against that
 * agency's contacts by normalized phone digits.
 */
export async function POST(request: Request) {
  const expectedUrl = appUrl("/api/twilio/voice/inbound");
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const from = params.From;
  const to = params.To;

  const phoneNumber = to
    ? await prisma.phoneNumber.findUnique({ where: { number: to } })
    : null;

  if (!phoneNumber) {
    const twiml = new VoiceResponse();
    twiml.say(
      SAY_VOICE_OPTIONS,
      "Lo sentimos, este número no está disponible en este momento."
    );
    twiml.hangup();
    return xmlResponse(twiml);
  }

  const fromDigits = normalizePhoneDigits(from);
  const contact = fromDigits
    ? await prisma.contact.findFirst({
        where: { agencyId: phoneNumber.agencyId, phoneDigits: fromDigits },
      })
    : null;

  const call = await prisma.call.create({
    data: {
      direction: "INBOUND",
      contactId: contact?.id,
      phoneNumberId: phoneNumber.id,
      fromNumber: from,
      toNumber: to,
      status: "RINGING",
      twilioCallSid: params.CallSid || null,
    },
  });

  const agents = await prisma.user.findMany({
    where: { agencyId: phoneNumber.agencyId, phone: { not: null } },
  });

  const twiml = new VoiceResponse();
  twiml.say(SAY_VOICE_OPTIONS, RECORDING_DISCLOSURE);

  if (agents.length === 0) {
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "NO_ANSWER", wentToVoicemail: true, endedAt: new Date() },
    });
    appendVoicemail(twiml, call.id);
    return xmlResponse(twiml);
  }

  const dial = twiml.dial({
    action: appUrl(`/api/twilio/voice/inbound-complete?callId=${call.id}`),
    method: "POST",
    timeout: 25,
    record: "record-from-answer",
    recordingStatusCallback: appUrl(
      `/api/twilio/voice/recording?callId=${call.id}`
    ),
    recordingStatusCallbackMethod: "POST",
    recordingStatusCallbackEvent: ["completed"],
  });

  for (const agent of agents) {
    dial.number(
      { url: appUrl(`/api/twilio/voice/inbound-whisper?callId=${call.id}`) },
      agent.phone as string
    );
  }

  return xmlResponse(twiml);
}
