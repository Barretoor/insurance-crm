import Twilio from "twilio";

const { MessagingResponse } = Twilio.twiml;

/** Empty TwiML response - we never auto-reply, just acknowledge receipt. */
export function emptyMessagingResponse() {
  const twiml = new MessagingResponse();
  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
