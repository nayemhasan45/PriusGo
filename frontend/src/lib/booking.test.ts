import { describe, expect, it } from "vitest";
import { calculateRentalDays, dateRangeOverlapsBlocks, estimateBookingPrice, formatLocalDate } from "./booking";

describe("booking helpers", () => {
  it("calculates inclusive rental days", () => {
    expect(calculateRentalDays("2026-05-01", "2026-05-01")).toBe(1);
    expect(calculateRentalDays("2026-05-01", "2026-05-03")).toBe(3);
  });

  it("rejects an end date before a start date", () => {
    expect(() => calculateRentalDays("2026-05-03", "2026-05-01")).toThrow(
      "End date cannot be before start date",
    );
  });

  it("estimates total booking price from day count", () => {
    expect(estimateBookingPrice(35, "2026-05-01", "2026-05-03")).toBe(105);
  });

  it("uses weekly pricing when a weekly rate is provided", () => {
    expect(estimateBookingPrice(20, "2026-05-01", "2026-05-07", { pricePerWeek: 100 })).toBe(100);
    expect(estimateBookingPrice(20, "2026-05-01", "2026-05-10", { pricePerWeek: 100 })).toBe(160);
  });

  it("formats local dates without UTC timezone shifting", () => {
    expect(formatLocalDate(new Date(2026, 4, 1))).toBe("2026-05-01");
    expect(formatLocalDate(new Date(2026, 10, 9))).toBe("2026-11-09");
  });

  it("detects selected rental ranges that overlap blocked booking ranges", () => {
    const blocks = [
      { startDate: "2026-05-10", endDate: "2026-05-12", status: "approved" as const },
      { startDate: "2026-05-20", endDate: "2026-05-21", status: "completed" as const },
    ];

    expect(dateRangeOverlapsBlocks("2026-05-01", "2026-05-09", blocks)).toBe(false);
    expect(dateRangeOverlapsBlocks("2026-05-01", "2026-05-10", blocks)).toBe(true);
    expect(dateRangeOverlapsBlocks("2026-05-11", "2026-05-13", blocks)).toBe(true);
    expect(dateRangeOverlapsBlocks("2026-05-12", "2026-05-12", blocks)).toBe(true);
    expect(dateRangeOverlapsBlocks("2026-05-13", "2026-05-19", blocks)).toBe(false);
  });
});
