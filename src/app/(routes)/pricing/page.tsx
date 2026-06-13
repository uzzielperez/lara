"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

const PLANS = [
  {
    id: "MONTHLY",
    name: "Monthly",
    price: "€49",
    period: "per month",
    blurb: "Flexible access, cancel anytime.",
    featured: true,
  },
  {
    id: "STARTER",
    name: "Starter",
    price: "€199",
    period: "6 months",
    blurb: "Best for planning a full application cycle.",
    featured: false,
  },
  {
    id: "LIFETIME",
    name: "Lifetime",
    price: "€700",
    period: "one-time",
    blurb: "Pay once, keep access forever.",
    featured: false,
  },
];

const INCLUDED = [
  "Full eligibility report (PDF)",
  "All five AI prompts unlocked",
  "Scholarship leads from LARA EdTech",
  "Personalized help finding housing",
];

export default function PricingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function activate(plan: string) {
    if (status !== "authenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/pricing")}`);
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Activation failed");
      router.push("/report");
    } catch {
      alert("Could not activate your plan. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16 animate-fade-in">
      <div className="text-center max-w-xl mx-auto mb-14">
        <p className="eyebrow mb-3">Unlock the full plan</p>
        <h1 className="section-heading !text-4xl md:!text-5xl mb-4">Choose your plan</h1>
        <p className="section-subheading">
          The first four prompts are free. Pick a plan to unlock your eligibility report
          and hands-on relocation help.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-14">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl p-7 flex flex-col"
            style={{
              background: "var(--surface)",
              border: plan.featured ? "1.5px solid var(--accent)" : "1px solid var(--hairline)",
            }}
          >
            {plan.featured && (
              <span
                className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
                style={{ background: "rgba(199,93,58,0.12)", color: "var(--accent)" }}
              >
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold" style={{ color: "var(--ink)" }}>{plan.name}</h2>
            <div className="mt-3 mb-1">
              <span className="text-4xl font-extrabold" style={{ color: "var(--ink)" }}>{plan.price}</span>
              <span className="text-sm ml-1.5" style={{ color: "var(--ink-faint)" }}>/ {plan.period}</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>{plan.blurb}</p>
            <button
              onClick={() => activate(plan.id)}
              disabled={loading !== null}
              className={`mt-auto ${plan.featured ? "btn-primary" : "btn-outline"} w-full text-sm disabled:opacity-60`}
            >
              {loading === plan.id ? "Activating…" : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto text-center">
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>Every plan includes</p>
        <ul className="inline-flex flex-col gap-2 text-sm text-left" style={{ color: "var(--ink-soft)" }}>
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span style={{ color: "var(--accent)" }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
