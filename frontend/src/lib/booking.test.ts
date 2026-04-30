import { describe, expect, it } from "vitest";
import { calculateRentalDays, estimateBookingPrice } from "./booking";

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
});
