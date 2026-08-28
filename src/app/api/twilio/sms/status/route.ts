import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { mapTwilioMessageStatus } from "@/lib/message-labels";

export async function POST(request: Request) {
  const messageId = new URL(request.url).searchParams.get("messageId");
  if (!messageId) {
    return new Response("Missing messageId", { status: 400 });
  }

  const expectedUrl = appUrl(`/api/twilio/sms/status?messageId=${messageId}`);
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    return new Response("Message not found", { status: 404 });
  }

  await prisma.message.update({
    where: { id: message.id },
    data: {
      status: mapTwilioMessageStatus(params.MessageStatus ?? ""),
      twilioMessageSid: params.MessageSid || message.twilioMessageSid,
    },
  });

  return new Response("", { status: 204 });
}
