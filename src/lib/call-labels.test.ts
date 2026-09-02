import { describe, expect, it } from "vitest";
import {
  formatDuration,
  isTerminalCallStatus,
  mapTwilioCallStatus,
} from "./call-labels";

describe("mapTwilioCallStatus", () => {
  it("maps known Twilio statuses to our enum", () => {
    expect(mapTwilioCallStatus("in-progress")).toBe("IN_PROGRESS");
    expect(mapTwilioCallStatus("answered")).toBe("IN_PROGRESS");
    expect(mapTwilioCallStatus("completed")).toBe("COMPLETED");
    expect(mapTwilioCallStatus("no-answer")).toBe("NO_ANSWER");
  });

  it("falls back to FAILED for an unrecognized status", () => {
    expect(mapTwilioCallStatus("something-new-twilio-added")).toBe("FAILED");
  });
});

describe("isTerminalCallStatus", () => {
  it("treats completed/busy/failed/no-answer/canceled as terminal", () => {
    for (const status of [
      "COMPLETED",
      "BUSY",
      "FAILED",
      "NO_ANSWER",
      "CANCELED",
    ] as const) {
      expect(isTerminalCallStatus(status)).toBe(true);
    }
  });

  it("treats in-flight statuses as non-terminal", () => {
    for (const status of [
      "QUEUED",
      "INITIATED",
      "RINGING",
      "IN_PROGRESS",
    ] as const) {
      expect(isTerminalCallStatus(status)).toBe(false);
    }
  });
});

describe("formatDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("shows a dash for missing or zero duration", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(0)).toBe("—");
  });
});
