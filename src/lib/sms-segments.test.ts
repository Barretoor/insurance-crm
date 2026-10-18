import { describe, expect, it } from "vitest";
import { smsLength } from "./sms-segments";

describe("smsLength", () => {
  it("counts an empty message as one segment", () => {
    expect(smsLength("")).toEqual({ encoding: "GSM-7", length: 0, capacity: 160, segments: 1 });
  });

  it("fits 160 plain characters in one segment and splits at 161", () => {
    expect(smsLength("a".repeat(160)).segments).toBe(1);
    const split = smsLength("a".repeat(161));
    expect(split.segments).toBe(2);
    expect(split.capacity).toBe(306);
  });

  it("keeps Spanish letters that exist in GSM-7 (é, ñ, ¿) on GSM-7", () => {
    expect(smsLength("¿Cómo estás? Señor José").encoding).toBe("UCS-2");
    expect(smsLength("¿Que tal, señor José?").encoding).toBe("GSM-7");
  });

  it("switches to UCS-2 for á, í, ó, ú and shrinks the limit to 70", () => {
    const result = smsLength("Hola, tu póliza vence pronto");
    expect(result.encoding).toBe("UCS-2");
    expect(result.capacity).toBe(70);
    expect(smsLength("ó".repeat(71)).segments).toBe(2);
  });

  it("counts extension characters like { and € as two", () => {
    expect(smsLength("{").length).toBe(2);
    expect(smsLength("€".repeat(80)).segments).toBe(1);
    expect(smsLength("€".repeat(81)).segments).toBe(2);
  });
});
