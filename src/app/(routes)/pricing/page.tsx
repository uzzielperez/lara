"use client";

import { Suspense } from "react";
import PricingContent from "./PricingContent";

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-5 py-16 text-center" style={{ color: "var(--ink-soft)" }}>
          Loading plans…
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
