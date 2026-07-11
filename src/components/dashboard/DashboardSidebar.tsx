"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { DASHBOARD_NAV, PREMIUM_NAV } from "@/lib/dashboard-nav";
import { hasPremiumCoaching } from "@/lib/subscription";

type Props = {
  completionPercent: number;
  subscriptionStatus?: string | null;
};

export default function DashboardSidebar({ completionPercent, subscriptionStatus }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const premium = hasPremiumCoaching(subscriptionStatus);

  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r h-full"
      style={{ borderColor: "var(--hairline)", background: "var(--surface-warm)" }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--hairline)" }}>
        <Link href="/" className="font-extrabold text-lg tracking-tight" style={{ color: "var(--ink)" }}>
          LARA
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
          Study abroad dashboard
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {DASHBOARD_NAV.map((item) => {
          const active =
            item.href === "/profile"
              ? pathname === "/profile"
              : pathname.startsWith(item.href.replace("#documents", ""));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={
                active
                  ? { background: "var(--surface)", color: "var(--ink)", boxShadow: "0 1px 0 var(--hairline)" }
                  : { color: "var(--ink-soft)" }
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <Link
          href={premium ? "/chat" : PREMIUM_NAV.href}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium mt-2"
          style={{ color: premium ? "var(--ink-soft)" : "var(--ink-faint)" }}
        >
          <span>{PREMIUM_NAV.icon}</span>
          <span className="flex-1">{PREMIUM_NAV.label}</span>
          {!premium && (
            <span
              className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(199,93,58,0.12)", color: "var(--accent)" }}
            >
              Pro
            </span>
          )}
        </Link>
      </nav>

      <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--hairline)" }}>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "var(--ink-soft)" }}>Getting started</span>
            <span style={{ color: "var(--accent)" }}>{completionPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--hairline-strong)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${completionPercent}%`, background: "var(--accent)" }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "var(--ink)" }}
          >
            {(session?.user?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
              {session?.user?.name ?? "Student"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--ink-faint)" }}>
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
