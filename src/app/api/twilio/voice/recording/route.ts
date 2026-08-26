import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";

export async function POST(request: Request) {
  const callId = new URL(request.url).searchParams.get("callId");
  if (!callId) {
    return new Response("Missing callId", { status: 400 });
  }

  const expectedUrl = appUrl(`/api/twilio/voice/recording?callId=${callId}`);
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) {
    return new Response("Call not found", { status: 404 });
  }

  const recordingUrl = params.RecordingUrl;
  if (!recordingUrl) {
    return new Response("Missing RecordingUrl", { status: 400 });
  }

  const durationSec = params.RecordingDuration
    ? Number(params.RecordingDuration)
    : null;

  await prisma.recording.upsert({
    where: { callId: call.id },
    update: {
      url: recordingUrl,
      twilioRecordingSid: params.RecordingSid ?? null,
      durationSec,
    },
    create: {
      callId: call.id,
      url: recordingUrl,
      twilioRecordingSid: params.RecordingSid ?? null,
      durationSec,
    },
  });

  return new Response("", { status: 204 });
}
