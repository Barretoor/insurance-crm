import Twilio from "twilio";

const { MessagingResponse } = Twilio.twiml;

/** Empty TwiML response - acknowledges receipt without an automatic reply. */
export function emptyMessagingResponse() {
  const twiml = new MessagingResponse();
  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

/** TwiML response that replies with a single message - used for STOP/START confirmations. */
export function messagingResponseWithReply(body: string) {
  const twiml = new MessagingResponse();
  twiml.message(body);
  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
