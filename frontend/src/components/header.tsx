"use client";

import Link from "next/link";
import { CarFront, LogOut, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/#cars", label: "Cars" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#booking", label: "Book" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-950">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <CarFront className="size-5" />
          </span>
          <span className="text-xl">PriusGo</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-emerald-700">
              {item.label}
            </Link>
          ))}
          {showAuthState && isAdmin && (
            <>
              <Link href="/admin/bookings" className="transition hover:text-emerald-700">
                Admin bookings
              </Link>
              <Link href="/admin/cars" className="transition hover:text-emerald-700">
                Admin cars
              </Link>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {showAuthState && isLoggedIn ? (
            <>
              <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
                Dashboard
              </Link>
              <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
                Login
              </Link>
              <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
                Dashboard
              </Link>
            </>
          )}
        </div>

        {showAuthState && isLoggedIn ? (
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 md:hidden" aria-label="Sign out">
            <LogOut className="size-4" /> Sign out
          </button>
        ) : (
          <Link href="/login" className="rounded-full border border-slate-200 p-2 md:hidden" aria-label="Open login">
            <Menu className="size-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
