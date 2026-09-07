import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/twilio";
import { verifyTwilioRequest } from "@/lib/twilio-verify";
import { emptyMessagingResponse, messagingResponseWithReply } from "@/lib/sms-twiml";
import { normalizePhoneDigits } from "@/lib/phone";
import {
  isStartKeyword,
  isStopKeyword,
  START_CONFIRMATION_MESSAGE,
  STOP_CONFIRMATION_MESSAGE,
} from "@/lib/sms-keywords";

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

  // TCPA compliance: STOP/START only apply when we recognize the sender as
  // an existing contact. The confirmation reply below bypasses the normal
  // send path (and its opt-out check) since it's the confirmation *of* the
  // opt-out/opt-in itself, not a regular message.
  if (contact) {
    let confirmation: string | null = null;

    if (isStopKeyword(body) && !contact.smsOptOut) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { smsOptOut: true, smsOptOutAt: new Date() },
      });
      confirmation = STOP_CONFIRMATION_MESSAGE;
    } else if (isStartKeyword(body) && contact.smsOptOut) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { smsOptOut: false, smsOptOutAt: null },
      });
      confirmation = START_CONFIRMATION_MESSAGE;
    }

    if (confirmation) {
      await prisma.message.create({
        data: {
          direction: "OUTBOUND",
          body: confirmation,
          status: "SENT",
          read: true,
          agencyId: phoneNumber.agencyId,
          contactId: contact.id,
          phoneNumberId: phoneNumber.id,
          fromNumber: to,
          toNumber: from,
        },
      });

      return messagingResponseWithReply(confirmation);
    }
  }

  return emptyMessagingResponse();
}
