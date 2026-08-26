import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { isTerminalCallStatus, mapTwilioCallStatus } from "@/lib/call-labels";

/** Status callback for the outer (agent) leg of the call. */
export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(`/api/twilio/voice/status?callId=${callId}`);
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) {
    return new Response("Call not found", { status: 404 });
  }

  const status = mapTwilioCallStatus(params.CallStatus ?? "");
  const durationSec = params.CallDuration
    ? Number(params.CallDuration)
    : undefined;

  await prisma.call.update({
    where: { id: call.id },
    data: {
      status,
      twilioCallSid: params.CallSid ?? call.twilioCallSid,
      ...(durationSec !== undefined ? { durationSec } : {}),
      ...(isTerminalCallStatus(status) ? { endedAt: new Date() } : {}),
    },
  });

  return new Response("", { status: 204 });
}
