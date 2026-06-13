"use client";

import Link from "next/link";

const ASSIST_MAILTO =
  "mailto:hello@filipinas-abroad.com?subject=LARA%20EdTech%20relocation%20help&body=Hi%20LARA%20team%2C%20I%27d%20like%20help%20with%20scholarships%20and%20finding%20a%20place.";

export default function PaywallCard({ teaser }: { teaser?: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)" }}>
      <div className="px-6 py-7" style={{ background: "var(--ink)" }}>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
          style={{ background: "rgba(200,162,75,0.18)", color: "var(--gold)" }}
        >
          Premium
        </span>
        <h3 className="text-2xl font-extrabold text-white mt-4 mb-2">
          Unlock your full eligibility report
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
          {teaser ??
            "Your readiness score, gap analysis, and matched partner programs, ready to download."}
        </p>
      </div>

      <div className="px-6 py-6" style={{ background: "var(--surface)" }}>
        <ul className="space-y-2.5 mb-6 text-sm" style={{ color: "var(--ink-soft)" }}>
          {[
            "Downloadable PDF plan with your matched programs",
            "Eligibility score and exactly what to improve",
            "Scholarship leads and a hand from LARA EdTech",
            "Personalized help finding a place to live",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span style={{ color: "var(--accent)" }} className="mt-0.5">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/pricing" className="btn-primary flex-1 text-sm">
            Unlock full report
          </Link>
          <a href={ASSIST_MAILTO} className="btn-outline flex-1 text-sm">
            Talk to LARA EdTech
          </a>
        </div>
      </div>
    </div>
  );
}
