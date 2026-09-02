import { describe, expect, it } from "vitest";
import { getNextRecurrenceDate } from "./task-recurrence";

function utc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

describe("getNextRecurrenceDate", () => {
  it("returns null for NONE", () => {
    expect(getNextRecurrenceDate(utc(2026, 1, 15), "NONE", utc(2026, 1, 15))).toBeNull();
  });

  it("advances DAILY by one day past today", () => {
    const result = getNextRecurrenceDate(utc(2026, 1, 15), "DAILY", utc(2026, 1, 15));
    expect(result?.toISOString().slice(0, 10)).toBe("2026-01-16");
  });

  it("advances WEEKLY by seven days past today", () => {
    const result = getNextRecurrenceDate(utc(2026, 1, 15), "WEEKLY", utc(2026, 1, 15));
    expect(result?.toISOString().slice(0, 10)).toBe("2026-01-22");
  });

  it("keeps advancing a late-completed task until it's strictly in the future", () => {
    // A daily task due Jan 10 but only completed Jan 15 should land on Jan 16,
    // not Jan 11 (which would still be in the past relative to "today").
    const result = getNextRecurrenceDate(utc(2026, 1, 10), "DAILY", utc(2026, 1, 15));
    expect(result?.toISOString().slice(0, 10)).toBe("2026-01-16");
  });

  it("clamps MONTHLY to the shorter target month instead of overflowing (Jan 31 -> Feb 28, non-leap year)", () => {
    const result = getNextRecurrenceDate(utc(2026, 1, 31), "MONTHLY", utc(2026, 1, 31));
    expect(result?.toISOString().slice(0, 10)).toBe("2026-02-28");
  });

  it("clamps MONTHLY to Feb 29 on a leap year instead of overflowing into March", () => {
    const result = getNextRecurrenceDate(utc(2024, 1, 31), "MONTHLY", utc(2024, 1, 31));
    expect(result?.toISOString().slice(0, 10)).toBe("2024-02-29");
  });

  it("advances MONTHLY normally when the day exists in the target month", () => {
    const result = getNextRecurrenceDate(utc(2026, 1, 15), "MONTHLY", utc(2026, 1, 15));
    expect(result?.toISOString().slice(0, 10)).toBe("2026-02-15");
  });
});
