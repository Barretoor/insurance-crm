import { describe, expect, it } from "vitest";
import { formatChatDay, formatListStamp } from "./chat-time";

// 18 Oct 2026, 1:00 pm Central (CDT = UTC-5)
const now = new Date("2026-10-18T18:00:00Z");

describe("chat time labels", () => {
  it("labels same-day messages as Hoy and shows the clock in the list", () => {
    const earlier = new Date("2026-10-18T14:47:00Z");
    expect(formatChatDay(earlier, now)).toBe("Hoy");
    expect(formatListStamp(earlier, now)).toMatch(/9:47/);
  });

  it("uses Central time for the day boundary, not UTC", () => {
    // 11 pm Central on the 17th is already the 18th in UTC.
    const lateYesterday = new Date("2026-10-18T04:00:00Z");
    expect(formatChatDay(lateYesterday, now)).toBe("Ayer");
    expect(formatListStamp(lateYesterday, now)).toBe("Ayer");
  });

  it("uses the weekday within a week and a short date after that", () => {
    const fiveDaysAgo = new Date("2026-10-13T18:00:00Z");
    expect(formatChatDay(fiveDaysAgo, now)).toBe("Martes");
    const old = new Date("2026-09-02T18:00:00Z");
    expect(formatListStamp(old, now)).toMatch(/sept?\.? 2|2 sept?/i);
  });
});
