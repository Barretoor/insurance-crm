import { describe, expect, it } from "vitest";
import { extractAreaCode, normalizePhoneDigits, toE164 } from "./phone";

describe("extractAreaCode", () => {
  it("reads the area code from a 10-digit number", () => {
    expect(extractAreaCode("(214) 555-0100")).toBe("214");
  });

  it("reads the area code from an E.164 number", () => {
    expect(extractAreaCode("+12145550100")).toBe("214");
  });

  it("returns null for an incomplete number", () => {
    expect(extractAreaCode("555-0100")).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(extractAreaCode(null)).toBeNull();
    expect(extractAreaCode(undefined)).toBeNull();
  });
});

describe("normalizePhoneDigits", () => {
  it("normalizes freeform US formatting to 10 digits", () => {
    expect(normalizePhoneDigits("(214) 555-0100")).toBe("2145550100");
  });

  it("strips the country code from an 11-digit number", () => {
    expect(normalizePhoneDigits("+1 214 555 0100")).toBe("2145550100");
  });

  it("returns null for a number that isn't 10 or 11 digits", () => {
    expect(normalizePhoneDigits("5550100")).toBeNull();
  });
});

describe("toE164", () => {
  it("converts a freeform US number to E.164", () => {
    expect(toE164("(214) 555-0100")).toBe("+12145550100");
  });

  it("is idempotent on an already-E.164 number", () => {
    expect(toE164("+12145550100")).toBe("+12145550100");
  });

  it("returns null when the number can't be normalized", () => {
    expect(toE164("not a phone number")).toBeNull();
  });
});
