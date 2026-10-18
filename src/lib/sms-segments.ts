const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
// Extension characters cost two code units each (escape + char).
const GSM_EXTENDED = "^{}\\[~]|€\f";

export type SmsLength = {
  encoding: "GSM-7" | "UCS-2";
  length: number;
  /** Characters that fit before the message splits into more segments. */
  capacity: number;
  segments: number;
};

/**
 * Carriers send plain GSM-7 text at 160 chars/segment (153 once concatenated),
 * but a single character outside that set - notably Spanish á, í, ó, ú - switches
 * the whole message to UCS-2 at 70 chars/segment (67 concatenated).
 */
export function smsLength(text: string): SmsLength {
  let gsmUnits = 0;
  let isGsm = true;

  for (const char of text) {
    if (GSM_BASIC.includes(char)) gsmUnits += 1;
    else if (GSM_EXTENDED.includes(char)) gsmUnits += 2;
    else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    const segments = gsmUnits <= 160 ? 1 : Math.ceil(gsmUnits / 153);
    return {
      encoding: "GSM-7",
      length: gsmUnits,
      capacity: segments === 1 ? 160 : segments * 153,
      segments,
    };
  }

  const length = text.length;
  const segments = length <= 70 ? 1 : Math.ceil(length / 67);
  return {
    encoding: "UCS-2",
    length,
    capacity: segments === 1 ? 70 : segments * 67,
    segments,
  };
}
