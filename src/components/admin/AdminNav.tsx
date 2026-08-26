"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Applications", match: (p: string) => p === "/admin" || p.startsWith("/admin/applications") },
  { href: "/admin/students", label: "Students", match: (p: string) => p.startsWith("/admin/students") },
  { href: "/admin/schools", label: "Schools", match: (p: string) => p.startsWith("/admin/schools") },
  { href: "/admin/programs", label: "Programs", match: (p: string) => p.startsWith("/admin/programs") },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-800/80">
      {LINKS.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
              active ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
