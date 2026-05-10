"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CarFront, Gauge, Home, LogOut } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/cars", label: "Fleet", icon: CarFront },
];

export function AdminShell({ eyebrow = "PriusGo admin", title, description, actions, children }: AdminShellProps) {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function loadSessionState() {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      setHasSession(Boolean(data.session));
    }

    void loadSessionState();
  }, []);

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(255,54,0,0.14),transparent_32%),radial-gradient(circle_at_85%_8%,rgba(34,197,94,0.13),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0c0f15]/85 px-5 py-6 backdrop-blur lg:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#ff3600] font-black text-white shadow-lg shadow-[#ff3600]/20">PG</span>
            <span>
              <span className="block font-heading text-xl font-black tracking-tight">PriusGo</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">Operations</span>
            </span>
          </Link>

          <nav className="mt-10 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active ? "bg-white text-[#090b10] shadow-xl shadow-black/20" : "text-white/58 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className={`size-5 ${active ? "text-[#ff3600]" : "text-white/35 group-hover:text-[#ff6a3d]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Today first</p>
            <p className="mt-2 text-sm leading-6 text-white/58">Approvals, pickups, returns, deposits, and fleet readiness stay at the top.</p>
          </div>

          <div className="absolute bottom-6 left-5 right-5 grid gap-2">
            <Link href="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/50 transition hover:bg-white/8 hover:text-white">
              <Home className="size-5" /> Public site
            </Link>
            {hasSession && (
              <button onClick={() => void signOut()} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-white/50 transition hover:bg-white/8 hover:text-white">
                <LogOut className="size-5" /> Sign out
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090d]/86 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff6a3d]">{eyebrow}</p>
                    <h1 className="mt-1 truncate font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
                  </div>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/48 sm:text-base">{description}</p>
              </div>
              {actions && <div className="hidden shrink-0 items-center gap-3 md:flex">{actions}</div>}
            </div>

            <nav className="mt-4 grid grid-cols-3 gap-2 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${active ? "bg-white text-[#090b10]" : "bg-white/[0.04] text-white/60"}`}>
                    <Icon className="size-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <section className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</section>
        </div>
      </div>
    </main>
  );
}
