"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DISCOVERY_ROUTES } from "@/lib/discovery-routes";

export default function HomeDiscoveryCta() {
  const { status } = useSession();
  const [ready, setReady] = useState<{ profileComplete: boolean } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setReady(null);
      return;
    }

    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) =>
        setReady({
          profileComplete: Boolean(data.profileComplete),
        })
      )
      .catch(() => setReady(null));
  }, [status]);

  if (!ready?.profileComplete) return null;

  return (
    <div
      className="w-full max-w-3xl mx-auto mb-8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}
    >
      <p className="text-sm flex-1" style={{ color: "var(--ink)" }}>
        Your profile is ready — ask LARA anything or browse programs matched to you.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/chat" className="btn-outline text-sm !py-2.5">
          Ask LARA
        </Link>
        <Link href={DISCOVERY_ROUTES.programs} className="btn-primary text-sm !py-2.5">
          Browse programs
        </Link>
      </div>
    </div>
  );
}
