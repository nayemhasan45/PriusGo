import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./auth-redirect";

describe("auth redirect helpers", () => {
  it("allows known internal redirect paths", () => {
    expect(getSafeRedirectPath("/#booking")).toBe("/#booking");
    expect(getSafeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("/admin/bookings")).toBe("/admin/bookings");
  });

  it("falls back when redirect path is external or unsafe", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example/path")).toBe("/dashboard");
    expect(getSafeRedirectPath("%2F%2Fevil.example/path")).toBe("/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
    expect(getSafeRedirectPath("/%2Fadmin%2Fcars")).toBe("/dashboard");
    expect(getSafeRedirectPath("%E0%A4%A")).toBe("/dashboard");
    expect(getSafeRedirectPath("/unknown")).toBe("/dashboard");
  });
});
