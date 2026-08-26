"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { canAccessStaffUi } from "@/lib/staff";

/** Header entry to the staff Pathway console (visible to staff emails / ADMIN). */
export default function StaffConsoleLink() {
  const { data: session, status } = useSession();
  if (status !== "authenticated") return null;

  const email = session?.user?.email;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!canAccessStaffUi({ email, role })) return null;

  return (
    <Link
      href="/admin"
      className="hidden sm:inline-flex text-sm font-semibold px-3 py-2 rounded-lg transition-opacity hover:opacity-80"
      style={{ background: "var(--ink)", color: "#fff" }}
    >
      Staff
    </Link>
  );
}
