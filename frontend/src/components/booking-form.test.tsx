import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookingForm } from "./booking-form";
import type { Car } from "@/lib/types";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

vi.mock("@/components/booking-date-picker", () => ({
  BookingDatePicker: () => null,
}));

const DRAFT_KEY = "priusgo:booking-draft";

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

describe("BookingForm", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("shows step guide when no car is selected and no draft", () => {
    render(<BookingForm />);
    expect(screen.getByText(/complete these steps to book/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a car/i)).toBeInTheDocument();
  });

  it("shows the booking form when initialCar is provided", () => {
    render(<BookingForm initialCar={testCar} />);
    expect(screen.getByText("MJO146 — Toyota Prius MJO146")).toBeInTheDocument();
    expect(screen.queryByText(/choose a car from the fleet first/i)).not.toBeInTheDocument();
  });

  it("pre-fills form fields from sessionStorage draft on mount", () => {
    const draft = {
      carId: testCar.id,
      fullName: "John Doe",
      email: "john@example.com",
      phone: "+37061234567",
      pickupLocation: "Kaunas",
      pickupTime: "10:00",
      returnTime: "18:00",
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    render(<BookingForm initialCar={testCar} />);

    expect((screen.getByPlaceholderText("Al Amin") as HTMLInputElement).value).toBe("John Doe");
    expect((screen.getByPlaceholderText("you@email.com") as HTMLInputElement).value).toBe("john@example.com");
    expect((screen.getByPlaceholderText("+370 ...") as HTMLInputElement).value).toBe("+37061234567");
    expect((screen.getByDisplayValue("Kaunas") as HTMLInputElement).value).toBe("Kaunas");
  });

  it("clears the sessionStorage draft after reading it on mount", () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ carId: testCar.id, fullName: "Jane" }));

    render(<BookingForm initialCar={testCar} />);

    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it("uses default empty values when no draft exists in sessionStorage", () => {
    render(<BookingForm initialCar={testCar} />);

    expect((screen.getByPlaceholderText("Al Amin") as HTMLInputElement).value).toBe("");
    expect((screen.getByPlaceholderText("you@email.com") as HTMLInputElement).value).toBe("");
  });
});
