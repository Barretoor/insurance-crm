import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { emptyMessagingResponse } from "@/lib/sms-twiml";
import { normalizePhoneDigits } from "@/lib/phone";

/**
 * Shared "a text comes in" webhook for every Twilio number in every agency's
 * pool (configured as each IncomingPhoneNumber's Messaging URL). The agency
 * is resolved from the `To` number, and the sender is matched against that
 * agency's contacts by normalized phone digits - same pattern as inbound
 * voice calls.
 */
export async function POST(request: Request) {
  const expectedUrl = appUrl("/api/twilio/sms/inbound");
  const params = await verifyTwilioRequest(request, expectedUrl);
  if (!params) {
    return new Response("Invalid signature", { status: 403 });
  }

  const from = params.From;
  const to = params.To;
  const body = params.Body ?? "";

  const phoneNumber = to
    ? await prisma.phoneNumber.findUnique({ where: { number: to } })
    : null;

  if (!phoneNumber) {
    return emptyMessagingResponse();
  }

  const fromDigits = normalizePhoneDigits(from);
  const contact = fromDigits
    ? await prisma.contact.findFirst({
        where: { agencyId: phoneNumber.agencyId, phoneDigits: fromDigits },
      })
    : null;

  await prisma.message.create({
    data: {
      direction: "INBOUND",
      body,
      status: "RECEIVED",
      read: false,
      agencyId: phoneNumber.agencyId,
      contactId: contact?.id,
      phoneNumberId: phoneNumber.id,
      fromNumber: from,
      toNumber: to,
      twilioMessageSid: params.MessageSid || null,
    },
  });

  return emptyMessagingResponse();
}
