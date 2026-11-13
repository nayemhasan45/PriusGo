import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CarHero } from "./car-hero";

vi.mock("@/components/fleet-count", () => ({ FleetCount: () => <span>3</span> }));

describe("CarHero", () => {
  it("keeps rental information, navigation and the photo accessible", () => {
    render(<CarHero />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Rent a Toyota Prius in Šiauliai/);
    expect(screen.getByRole("link", { name: /Choose a car/ })).toHaveAttribute("href", "#cars");
    expect(screen.getByRole("link", { name: /See how it works/ })).toHaveAttribute("href", "#process");
    expect(screen.getByRole("img", { name: /Toyota Prius.*photograph/i })).toBeInTheDocument();
    expect(screen.getByText("€20")).toBeInTheDocument();
    expect(screen.getByText("€100")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Šiauliai, Lithuania/)).toBeInTheDocument();
  });
});
