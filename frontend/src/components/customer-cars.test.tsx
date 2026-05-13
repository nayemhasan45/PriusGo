import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomerCars } from "./customer-cars";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

vi.mock("@/lib/cars", () => ({
  cars: [
    {
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
      imageUrl: "/images/prius-fleet.jpg",
      plateNumber: "MJO146",
      features: ["Hybrid", "Automatic", "5 seats", "Šiauliai pickup"],
    },
  ],
}));

describe("CustomerCars", () => {
  it("opens a booking modal for the selected fleet car", () => {
    render(<CustomerCars />);

    fireEvent.click(screen.getByRole("button", { name: "Choose Toyota Prius MJO146" }));

    expect(screen.getByRole("dialog", { name: "Book Toyota Prius MJO146" })).toBeInTheDocument();
    expect(screen.getByText("MJO146 — Toyota Prius MJO146")).toBeInTheDocument();
  });
});
