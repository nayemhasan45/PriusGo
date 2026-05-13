"use client";

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CarCard } from "./car-card";
import type { Car } from "@/lib/types";

vi.mock("@/components/booking-calendar", () => ({
  BookingCalendar: () => null,
}));

vi.mock("@/lib/supabase/cars", () => ({
  getCustomerCarAvailability: () => ({
    canRent: true,
    label: "Available",
    description: "Ready to rent",
  }),
}));

const testCar: Car = {
  id: "mj0146",
  name: "Toyota Prius MJO146",
  brand: "Toyota",
  model: "Prius",
  year: 2006,
  fuelType: "Petrol hybrid",
  transmission: "Automatic",
  seats: 5,
  pricePerDay: 20,
  status: "available",
  imageGradient: "from-slate-100 to-slate-200",
  plateNumber: "MJO146",
  features: ["Hybrid", "Automatic"],
};

describe("CarCard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fires priusgo:select-car event and calls onSelect when a car is chosen", () => {
    const received: CustomEvent[] = [];
    const listener = (e: Event) => received.push(e as CustomEvent);
    window.addEventListener("priusgo:select-car", listener);

    const onSelect = vi.fn();
    render(<CarCard car={testCar} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Choose Toyota Prius MJO146/i }));

    expect(onSelect).toHaveBeenCalledWith(testCar);
    expect(received).toHaveLength(1);
    expect(received[0].detail.carId).toBe("mj0146");

    window.removeEventListener("priusgo:select-car", listener);
  });

  it("fires priusgo:select-car event and scrolls to #booking when no onSelect prop", () => {
    const received: CustomEvent[] = [];
    const listener = (e: Event) => received.push(e as CustomEvent);
    window.addEventListener("priusgo:select-car", listener);

    const scrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue({ scrollIntoView } as unknown as HTMLElement);

    render(<CarCard car={testCar} />);

    fireEvent.click(screen.getByRole("button", { name: /Choose Toyota Prius MJO146/i }));

    expect(received).toHaveLength(1);
    expect(received[0].detail.carId).toBe("mj0146");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    window.removeEventListener("priusgo:select-car", listener);
  });
});
