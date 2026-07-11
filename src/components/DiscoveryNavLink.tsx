"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DISCOVERY_ROUTES } from "@/lib/discovery-routes";

export default function DiscoveryNavLink() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setVisible(false);
      return;
    }

    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => setVisible(Boolean(data.profileComplete)))
      .catch(() => setVisible(false));
  }, [status]);

  if (!visible) return null;

  return (
    <Link
      href={DISCOVERY_ROUTES.programs}
      className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
      style={{ color: "var(--ink-soft)" }}
    >
      Programs
    </Link>
  );
}
