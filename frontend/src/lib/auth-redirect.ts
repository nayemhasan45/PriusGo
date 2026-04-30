const allowedRedirectPaths = new Set([
  "/",
  "/#booking",
  "/dashboard",
  "/admin/bookings",
  "/admin/cars",
]);

export function getSafeRedirectPath(rawRedirectTo: string | null, fallback = "/dashboard") {
  if (!rawRedirectTo) return fallback;

  try {
    const decoded = decodeURIComponent(rawRedirectTo).trim();
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return fallback;
    if (decoded.includes(":")) return fallback;
    if (!allowedRedirectPaths.has(decoded)) return fallback;
    return decoded;
  } catch {
    return fallback;
  }
}
