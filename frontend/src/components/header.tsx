"use client";

import Link from "next/link";
import { LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/#cars", label: "Fleet" },
  { href: "/#pricing", label: "Pricing" },
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

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userLabel, setUserLabel] = useState("Signed-in customer");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const showAuthState = !supabase || isAuthReady;

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

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e9e9] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-6 lg:px-10">
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
          {showAuthState && isAdmin && (
            <>
              <Link href="/admin/bookings" className="transition-colors hover:text-[#0b0b0b]">Admin bookings</Link>
              <Link href="/admin/cars" className="transition-colors hover:text-[#0b0b0b]">Admin cars</Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
          className="rounded-full border border-[#e9e9e9] p-2 text-[#0b0b0b] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#e9e9e9] bg-white px-5 py-6 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-[#616161]">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="hover:text-[#0b0b0b]">
                {item.label}
              </Link>
            ))}
            {showAuthState && isAdmin && (
              <>
                <Link href="/admin/bookings" onClick={() => setMobileOpen(false)} className="hover:text-[#0b0b0b]">Admin bookings</Link>
                <Link href="/admin/cars" onClick={() => setMobileOpen(false)} className="hover:text-[#0b0b0b]">Admin cars</Link>
              </>
            )}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            {showAuthState && isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b0b0b] py-2 pl-2 pr-5 text-center text-sm font-semibold text-white"
                  aria-label={`${userLabel} dashboard`}
                >
                  <span className="flex size-9 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15">
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
                <button onClick={signOut} className="text-sm text-[#616161]">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/#cars" onClick={() => setMobileOpen(false)} className="rounded-full bg-[#ff3600] px-5 py-3 text-center text-sm font-semibold text-white">
                  Book Now
                </Link>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-full border border-[#e9e9e9] px-5 py-3 text-center text-sm font-medium text-[#0b0b0b]">
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
