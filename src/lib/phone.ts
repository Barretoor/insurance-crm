/** Extracts the 3-digit US/Canada area code from a phone number, if present. */
export function extractAreaCode(phone: string | null | undefined): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits.slice(0, 3);
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1, 4);

  return null;
}

/**
 * Normalizes a US/Canada phone number to its 10-digit national significant
 * number, e.g. "(214) 555-0100" and "+12145550100" both become "2145550100".
 * Used to match freeform Contact.phone values against Twilio's E.164 From/To,
 * regardless of how the number was originally typed in.
 */
export function normalizePhoneDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);

  return null;
}
