"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DISCOVERY_ROUTES } from "@/lib/discovery-routes";
import { signInUrl } from "@/lib/sprint1-flow";

type Onboarding = {
  profileComplete: boolean;
  nextRoute?: string;
};

export default function HomeDiscoveryCta() {
  const { status } = useSession();
  const [ready, setReady] = useState<Onboarding | null>(null);

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
          nextRoute: data.nextRoute,
        })
      )
      .catch(() => setReady(null));
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div
        className="w-full max-w-3xl mx-auto mb-8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}
      >
        <p className="text-sm flex-1" style={{ color: "var(--ink)" }}>
          Ask a few questions free — then create a profile for answers tailored to your budget, level, and countries.
        </p>
        <Link href={signInUrl()} className="btn-primary text-sm !py-2.5 whitespace-nowrap">
          Get my free plan
        </Link>
      </div>
    );
  }

  if (!ready?.profileComplete) {
    return (
      <div
        className="w-full max-w-3xl mx-auto mb-8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
        style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}
      >
        <p className="text-sm flex-1" style={{ color: "var(--ink)" }}>
          You&apos;re signed in — finish your profile so LARA can personalize programs and guidance.
        </p>
        <Link href="/intake" className="btn-primary text-sm !py-2.5 whitespace-nowrap">
          Complete profile
        </Link>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-3xl mx-auto mb-8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}
    >
      <p className="text-sm flex-1" style={{ color: "var(--ink)" }}>
        Your profile is ready — ask LARA anything or browse programs matched to you.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href={ready.nextRoute ?? "/chat"} className="btn-outline text-sm !py-2.5">
          Continue plan
        </Link>
        <Link href={DISCOVERY_ROUTES.programs} className="btn-primary text-sm !py-2.5">
          Browse programs
        </Link>
      </div>
    </div>
  );
}
