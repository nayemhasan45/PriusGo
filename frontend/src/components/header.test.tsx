import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./header";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

describe("Header", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
      },
    });
    document.documentElement.classList.remove("site-dark");
  });

  it("closes the mobile menu after switching to dark mode", () => {
    render(<Header />);

    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(screen.getByRole("button", { name: "Dark mode" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dark mode" }));

    expect(document.documentElement).toHaveClass("site-dark");
    expect(screen.queryByRole("button", { name: "Dark mode" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Normal mode" })).not.toBeInTheDocument();
  });
});
