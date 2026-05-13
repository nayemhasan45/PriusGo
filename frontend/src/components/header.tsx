"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/#cars", label: "Fleet" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/rental-rules", label: "Rules" },
  { href: "/#trust", label: "Trust" },
  { href: "/#cars", label: "Book" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

function getUserAvatar(sessionUser: { user_metadata?: Record<string, unknown>; email?: string } | null | undefined) {
  const avatarUrl = sessionUser?.user_metadata?.avatar_url ?? sessionUser?.user_metadata?.picture;
  return typeof avatarUrl === "string" && avatarUrl.length > 0 ? avatarUrl : null;
}

function getUserLabel(sessionUser: { user_metadata?: Record<string, unknown>; email?: string } | null | undefined) {
  const fullName = sessionUser?.user_metadata?.full_name ?? sessionUser?.user_metadata?.name;
  if (typeof fullName === "string" && fullName.length > 0) return fullName;
  return sessionUser?.email ?? "Signed-in customer";
}

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem("priusgo-theme") === "dark" ? "dark" : "light";
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("priusgo-theme-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("priusgo-theme-change", onStoreChange);
  };
}

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useSyncExternalStore(subscribeToThemeChanges, getStoredTheme, () => "light");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState("Signed-in customer");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const showAuthState = !supabase || isAuthReady;

  useEffect(() => {
    document.documentElement.classList.toggle("site-dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let isMounted = true;

    async function syncAuthState() {
      const { data } = await client.auth.getSession();
      if (!isMounted) return;
      setIsLoggedIn(Boolean(data.session));
      setUserAvatarUrl(getUserAvatar(data.session?.user));
      setUserLabel(getUserLabel(data.session?.user));
      if (data.session?.user) {
        const { data: profile } = await client.from("profiles").select("role").eq("id", data.session.user.id).single();
        if (isMounted) setIsAdmin(profile?.role === "admin");
      } else {
        setIsAdmin(false);
      }
      if (isMounted) setIsAuthReady(true);
    }

    void syncAuthState();

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      setUserAvatarUrl(getUserAvatar(session?.user));
      setUserLabel(getUserLabel(session?.user));
      setIsAuthReady(true);
      if (!session) setIsAdmin(false);
      if (session) void syncAuthState();
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  function toggleTheme({ closeMobileMenu = false }: { closeMobileMenu?: boolean } = {}) {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("site-dark", next === "dark");
    window.localStorage.setItem("priusgo-theme", next);
    window.dispatchEvent(new Event("priusgo-theme-change"));
    if (closeMobileMenu) setMobileOpen(false);
  }

  const themeToggle = (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="site-theme-toggle inline-flex size-11 items-center justify-center rounded-full border border-[#e9e9e9] bg-white text-[#0b0b0b] transition hover:border-[#ff3600]/30 hover:text-[#ff3600]"
      aria-label={theme === "dark" ? "Switch to normal mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Normal mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e9e9] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-3 sm:px-6 sm:py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#ff3600] text-[11px] font-black text-white">
            P
          </span>
          <span className="font-heading text-xl font-black tracking-tight text-[#0b0b0b]">PriusGo</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#616161] md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-[#0b0b0b]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {themeToggle}
          {showAuthState && isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-[#e9e9e9] px-4 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:border-[#ff3600]/30 hover:text-[#ff3600]"
            >
              <LayoutDashboard className="size-4" /> Admin dashboard
            </Link>
          )}
          {showAuthState && isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-[#0b0b0b] py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white transition hover:bg-[#ff3600]"
                aria-label={`${userLabel} dashboard`}
              >
                <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15 shadow-sm">
                  {userAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-white">
                      <User className="size-4" />
                    </span>
                  )}
                </span>
                Dashboard
              </Link>
              <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#616161] transition hover:text-[#0b0b0b]">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[#616161] transition hover:text-[#0b0b0b]">
                Login
              </Link>
              <Link href="/#cars" className="rounded-full bg-[#ff3600] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#cc2b00]">
                Book Now
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex size-11 items-center justify-center rounded-full border border-[#e9e9e9] text-[#0b0b0b] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="site-mobile-menu border-t border-[#e9e9e9] bg-white px-5 py-6 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-medium text-[#616161]">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="site-mobile-link py-1.5 hover:text-[#0b0b0b]">
                {item.label}
              </Link>
            ))}
            {showAuthState && isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="site-mobile-link inline-flex items-center gap-2 py-1.5 hover:text-[#0b0b0b]">
                <LayoutDashboard className="size-4" /> Admin dashboard
              </Link>
            )}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => toggleTheme({ closeMobileMenu: true })}
              className="site-theme-toggle inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#e9e9e9] px-4 text-sm font-semibold text-[#0b0b0b]"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Normal mode" : "Dark mode"}
            </button>
            {showAuthState && isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b0b0b] px-4 py-3 text-center text-sm font-semibold text-white"
                  aria-label={`${userLabel} dashboard`}
                >
                  <span className="flex size-8 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15">
                    {userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-white">
                        <User className="size-4" />
                      </span>
                    )}
                  </span>
                  Dashboard
                </Link>
                <button onClick={signOut} className="site-mobile-action inline-flex min-h-11 items-center justify-center rounded-full border border-[#e9e9e9] px-4 text-sm text-[#616161]">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/#cars" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#ff3600] px-5 py-3 text-center text-sm font-semibold text-white">
                  Book Now
                </Link>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="site-mobile-action rounded-full border border-[#e9e9e9] px-5 py-3 text-center text-sm font-medium text-[#0b0b0b]">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
