import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dateKey,
  getMonthGrid,
  isSameDay,
  monthParam,
  parseMonthParam,
} from "./calendar";

describe("getMonthGrid", () => {
  it("builds a grid of full weeks starting on Sunday and ending on Saturday", () => {
    const grid = getMonthGrid(2026, 0); // January 2026

    for (const week of grid) {
      expect(week).toHaveLength(7);
      expect(week[0].getDay()).toBe(0);
      expect(week[6].getDay()).toBe(6);
    }
  });

  it("includes every day of the target month", () => {
    const grid = getMonthGrid(2026, 0);
    const flat = grid.flat();

    const firstOfMonth = flat.find(
      (d) => d.getFullYear() === 2026 && d.getMonth() === 0 && d.getDate() === 1
    );
    const lastOfMonth = flat.find(
      (d) => d.getFullYear() === 2026 && d.getMonth() === 0 && d.getDate() === 31
    );

    expect(firstOfMonth).toBeDefined();
    expect(lastOfMonth).toBeDefined();
  });

  it("pads a month that doesn't start on Sunday with adjacent-month days", () => {
    // April 2026 starts on a Wednesday, so the grid's first row must be
    // padded with trailing days of March.
    const grid = getMonthGrid(2026, 3);
    expect(grid[0][0].getMonth()).not.toBe(3);
  });
});

describe("isSameDay", () => {
  it("is true for the same calendar day regardless of time", () => {
    expect(isSameDay(new Date(2026, 0, 15, 3), new Date(2026, 0, 15, 22))).toBe(true);
  });

  it("is false for different days", () => {
    expect(isSameDay(new Date(2026, 0, 15), new Date(2026, 0, 16))).toBe(false);
  });
});

describe("dateKey", () => {
  it("formats a UTC date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });
});

describe("monthParam / parseMonthParam", () => {
  it("round-trips year/month through the URL param format", () => {
    const param = monthParam(2026, 0);
    expect(param).toBe("2026-01");
    expect(parseMonthParam(param)).toEqual({ year: 2026, month: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the current month when the param is missing or malformed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 15)); // August 2026

    expect(parseMonthParam(undefined)).toEqual({ year: 2026, month: 7 });
    expect(parseMonthParam("not-a-month")).toEqual({ year: 2026, month: 7 });
  });
});
