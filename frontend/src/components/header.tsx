import Link from "next/link";
import { CarFront, Menu } from "lucide-react";

const navItems = [
  { href: "#cars", label: "Cars" },
  { href: "#pricing", label: "Pricing" },
  { href: "#booking", label: "Book" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
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
            <a key={item.href} href={item.href} className="transition hover:text-emerald-700">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
            Login
          </Link>
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
            Dashboard
          </Link>
        </div>

        <button className="rounded-full border border-slate-200 p-2 md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  );
}
