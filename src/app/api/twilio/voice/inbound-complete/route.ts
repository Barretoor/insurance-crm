import Twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { appUrl, twilioClient } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { xmlResponse, appendVoicemail } from "@/lib/voice-twiml";
import { mapTwilioCallStatus } from "@/lib/call-labels";

const { VoiceResponse } = Twilio.twiml;

/**
 * <Dial action> callback: fires once the attempt to ring the agency's agents
 * resolves, however it resolves. If someone answered, we're done (the bridge
 * already handled the conversation). Otherwise we fall back to voicemail.
 */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(
    `/api/twilio/voice/inbound-complete?callId=${callId}`
  );
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) {
    return new Response("Call not found", { status: 404 });
  }

  const status = mapTwilioCallStatus(params.DialCallStatus ?? "");
  const durationSec = params.DialCallDuration
    ? Number(params.DialCallDuration)
    : undefined;
  const answered = status === "COMPLETED";

  let userId: string | null | undefined = undefined;
  if (answered && params.DialCallSid) {
    userId = await findAnsweringAgentId(call.phoneNumberId, params.DialCallSid);
  }

  await prisma.call.update({
    where: { id: call.id },
    data: {
      status,
      ...(durationSec !== undefined ? { durationSec } : {}),
      ...(userId !== undefined ? { userId } : {}),
      ...(!answered ? { wentToVoicemail: true } : {}),
      endedAt: new Date(),
    },
  });

  const twiml = new VoiceResponse();
  if (answered) {
    twiml.hangup();
  } else {
    appendVoicemail(twiml, call.id);
  }

  return xmlResponse(twiml);
}

/** Best-effort: figure out which agent's phone answered, via the Twilio REST API. */
async function findAnsweringAgentId(
  phoneNumberId: string | null,
  dialCallSid: string
): Promise<string | null> {
  try {
    if (!phoneNumberId) return null;

    const phoneNumber = await prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
      select: { agencyId: true },
    });
    if (!phoneNumber) return null;

    const childCall = await twilioClient().calls(dialCallSid).fetch();
    const answeredNumber = childCall.to;
    if (!answeredNumber) return null;

    const agent = await prisma.user.findFirst({
      where: { agencyId: phoneNumber.agencyId, phone: answeredNumber },
      select: { id: true },
    });
    return agent?.id ?? null;
  } catch (error) {
    console.error("No se pudo determinar qué agente contestó:", error);
    return null;
  }
}
