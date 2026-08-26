"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FREE_CHAT_PROMPTS } from "@/lib/subscription";
import { startCheckout } from "@/lib/checkout";

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

const PATHWAY = [
  {
    id: "PATHWAY_ADMISSION",
    name: "School Admission",
    price: "€480",
    blurb: "Application support through school acceptance.",
  },
  {
    id: "PATHWAY_VISA",
    name: "Visa Application",
    price: "€480",
    blurb: "Document prep and visa filing support.",
  },
  {
    id: "PATHWAY_LANDING",
    name: "Landing Support",
    price: "€240",
    blurb: "Arrival checklist and first weeks in country.",
  },
];

const INCLUDED = [
  "Full eligibility report (PDF)",
  "Unlimited ask-anything chat",
  "1:1 coaching & live call support",
  "Voice input in dashboard chat",
  "Scholarship leads from LARA EdTech",
  "Personalized help finding housing",
];

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");
    if (checkout === "success") {
      setMessage(
        plan
          ? `Payment received — your ${plan.replace(/_/g, " ").toLowerCase()} access is active.`
          : "Payment received — thank you!"
      );
    } else if (checkout === "cancelled") {
      setMessage("Checkout cancelled. You can try again anytime.");
    }
  }, [searchParams]);

  async function checkout(plan: string) {
    if (status !== "authenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/pricing")}`);
      return;
    }
    setLoading(plan);
    setMessage(null);
    try {
      await startCheckout(plan, "/pricing");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      setMessage(msg);
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-16 animate-fade-in">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="eyebrow mb-3">Unlock the full plan</p>
        <h1 className="section-heading !text-4xl md:!text-5xl mb-4">Choose your plan</h1>
        <p className="section-subheading">
          You get {FREE_CHAT_PROMPTS} free prompts to ask LARA anything. Subscriptions unlock the full
          path, eligibility report, and coaching. Pathway packages are billed separately via Stripe.
        </p>
      </div>

      {message && (
        <div
          className="max-w-2xl mx-auto mb-8 rounded-xl px-4 py-3 text-sm text-center"
          style={{
            background: message.includes("cancelled") ? "var(--surface)" : "rgba(199,93,58,0.1)",
            border: "1px solid var(--hairline)",
            color: "var(--ink)",
          }}
        >
          {message}
          {message.includes("received") && (
            <span>
              {" "}
              <a href="/report" className="underline font-medium">View your report</a>
            </span>
          )}
        </div>
      )}

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
              onClick={() => checkout(plan.id)}
              disabled={loading !== null}
              className={`mt-auto ${plan.featured ? "btn-primary" : "btn-outline"} w-full text-sm disabled:opacity-60`}
            >
              {loading === plan.id ? "Redirecting to Stripe…" : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mb-14">
        <h2 className="text-xl font-bold mb-2 text-center" style={{ color: "var(--ink)" }}>
          Paid pathway packages
        </h2>
        <p className="text-sm text-center mb-6 max-w-lg mx-auto" style={{ color: "var(--ink-soft)" }}>
          Hands-on support from the LARA team — each stage unlocks after payment.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {PATHWAY.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
            >
              <h3 className="font-bold" style={{ color: "var(--ink)" }}>{pkg.name}</h3>
              <p className="text-2xl font-extrabold mt-2 mb-2" style={{ color: "var(--accent)" }}>
                {pkg.price}
              </p>
              <p className="text-sm mb-5 flex-1" style={{ color: "var(--ink-soft)" }}>{pkg.blurb}</p>
              <button
                onClick={() => checkout(pkg.id)}
                disabled={loading !== null}
                className="btn-outline w-full text-sm disabled:opacity-60"
              >
                {loading === pkg.id ? "Redirecting…" : "Pay with Stripe"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto text-center">
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>Every subscription includes</p>
        <ul className="inline-flex flex-col gap-2 text-sm text-left" style={{ color: "var(--ink-soft)" }}>
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span style={{ color: "var(--accent)" }}>✓</span> {f}
            </li>
          ))}
        </ul>
        <p className="text-xs mt-6" style={{ color: "var(--ink-faint)" }}>
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  );
}
