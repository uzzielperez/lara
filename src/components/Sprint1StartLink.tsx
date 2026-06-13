"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { signInUrl } from "@/lib/sprint1-flow";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "accent";
};

export default function Sprint1StartLink({
  children,
  className = "",
  variant = "primary",
}: Props) {
  const { status } = useSession();
  const [href, setHref] = useState(signInUrl());

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setHref(signInUrl());
      return;
    }

    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => setHref(data.nextRoute || "/intake"))
      .catch(() => setHref("/intake"));
  }, [status]);

  const variantClass =
    variant === "outline"
      ? "btn-outline"
      : variant === "accent"
        ? "btn-accent"
        : "btn-primary";

  return (
    <Link href={href} className={`${variantClass} ${className}`.trim()}>
      {children}
    </Link>
  );
}
