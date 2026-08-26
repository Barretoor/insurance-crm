import Twilio from "twilio";

/**
 * Verifies that a request was genuinely sent by Twilio (HMAC signature over the
 * exact webhook URL + form params) and returns the parsed form params if valid.
 *
 * `url` must be byte-for-byte the URL Twilio was given (including query string).
 */
export async function verifyTwilioRequest(
  request: Request,
  url: string
): Promise<Record<string, string> | null> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature");
  if (!authToken || !signature) return null;

  const formData = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    params[key] = String(value);
  }

  const isValid = Twilio.validateRequest(authToken, signature, url, params);
  return isValid ? params : null;
}
