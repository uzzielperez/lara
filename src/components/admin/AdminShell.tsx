"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◉", match: (p: string) => p === "/admin" },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: "📋",
    match: (p: string) => p.startsWith("/admin/applications"),
  },
  { href: "/admin/students", label: "Students", icon: "👥", match: (p: string) => p.startsWith("/admin/students") },
  { href: "/admin/schools", label: "Schools", icon: "🏫", match: (p: string) => p.startsWith("/admin/schools") },
  { href: "/admin/programs", label: "Programs", icon: "🎓", match: (p: string) => p.startsWith("/admin/programs") },
] as const;

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function AdminShell({ title, subtitle, children, actions }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-slate-800 bg-slate-900/60 shrink-0">
        <div className="px-4 py-5 border-b border-slate-800">
          <Link href="/admin" className="font-bold text-white tracking-tight">
            LARA Admin
          </Link>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Staff console</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          <p className="truncate">{session?.user?.email}</p>
          <Link href="/" className="text-indigo-400 hover:underline mt-2 inline-block">
            ← Student app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20 px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
              <nav className="lg:hidden flex gap-1 p-1 rounded-lg bg-slate-800/80">
                {NAV.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-xs px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
