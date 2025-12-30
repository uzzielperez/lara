"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="px-4 py-2 text-sm text-white/80">
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors rounded-lg"
        >
          {session.user?.name || session.user?.email}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors rounded-lg"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors rounded-lg"
    >
      Sign In
    </Link>
  );
}

