import { describe, expect, it } from "vitest";
import { formatDurationMin } from "./appointment-labels";

describe("formatDurationMin", () => {
  it("formats durations under an hour in minutes", () => {
    expect(formatDurationMin(30)).toBe("30 min");
    expect(formatDurationMin(5)).toBe("5 min");
  });

  it("formats exact hours without a minutes remainder", () => {
    expect(formatDurationMin(60)).toBe("1 h");
    expect(formatDurationMin(120)).toBe("2 h");
  });

  it("formats hours with a minutes remainder", () => {
    expect(formatDurationMin(90)).toBe("1 h 30 min");
    expect(formatDurationMin(135)).toBe("2 h 15 min");
  });
});
