import { describe, expect, it } from "vitest";
import { mapTwilioMessageStatus } from "./message-labels";

describe("mapTwilioMessageStatus", () => {
  it("maps known Twilio statuses to our enum", () => {
    expect(mapTwilioMessageStatus("queued")).toBe("QUEUED");
    expect(mapTwilioMessageStatus("accepted")).toBe("QUEUED");
    expect(mapTwilioMessageStatus("sent")).toBe("SENT");
    expect(mapTwilioMessageStatus("delivered")).toBe("DELIVERED");
    expect(mapTwilioMessageStatus("undelivered")).toBe("UNDELIVERED");
    expect(mapTwilioMessageStatus("failed")).toBe("FAILED");
    expect(mapTwilioMessageStatus("received")).toBe("RECEIVED");
  });

  it("falls back to FAILED for an unrecognized status", () => {
    expect(mapTwilioMessageStatus("something-new-twilio-added")).toBe("FAILED");
  });
});
