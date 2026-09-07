import { describe, expect, it } from "vitest";
import { isStartKeyword, isStopKeyword } from "./sms-keywords";

describe("isStopKeyword", () => {
  it("recognizes all standard stop keywords, case-insensitively", () => {
    for (const word of ["stop", "STOP", "StopAll", "unsubscribe", "Cancel", "END", "quit"]) {
      expect(isStopKeyword(word)).toBe(true);
    }
  });

  it("tolerates surrounding whitespace", () => {
    expect(isStopKeyword("  stop  ")).toBe(true);
  });

  it("does not match a normal message that merely contains the word", () => {
    expect(isStopKeyword("please stop calling me at night")).toBe(false);
  });

  it("does not match unrelated text", () => {
    expect(isStopKeyword("Hola, gracias por la información")).toBe(false);
  });
});

describe("isStartKeyword", () => {
  it("recognizes all standard start keywords, case-insensitively", () => {
    for (const word of ["start", "START", "yes", "UnStop"]) {
      expect(isStartKeyword(word)).toBe(true);
    }
  });

  it("does not match a normal message that merely contains the word", () => {
    expect(isStartKeyword("yes I would like more information")).toBe(false);
  });
});
