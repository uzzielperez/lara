"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "var(--hairline)" }} />;
  }

  if (session) {
    const label = session.user?.name?.split(" ")[0] || session.user?.email || "Account";
    const initial = (label[0] || "?").toUpperCase();
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
          style={{ color: "var(--ink)" }}
          title="Profile settings"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--ink)" }}
          >
            {initial}
          </span>
          <span className="hidden sm:inline">{label}</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium px-2 py-1.5 rounded-full transition-colors hover:opacity-70"
          style={{ color: "var(--ink-faint)" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="text-sm font-semibold px-3 py-2 rounded-full transition-colors hover:opacity-70"
      style={{ color: "var(--ink)" }}
    >
      Sign in
    </Link>
  );
}
