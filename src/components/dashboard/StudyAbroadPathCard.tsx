"use client";

import Link from "next/link";
import { STUDY_ABROAD_PATH } from "@/lib/study-abroad-path";

type Props = {
  currentStep?: number;
  showPremiumCta?: boolean;
};

export default function StudyAbroadPathCard({ currentStep = 2, showPremiumCta = true }: Props) {
  return (
    <div
      className="mx-3 mb-3 rounded-xl p-3"
      style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--ink-faint)" }}>
        Simplest path abroad
      </p>
      <ol className="space-y-2">
        {STUDY_ABROAD_PATH.map((item) => {
          const active = item.step === currentStep;
          const done = item.step < currentStep;
          return (
            <li key={item.step}>
              <Link
                href={item.href}
                className="flex gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                style={active ? { background: "rgba(199,93,58,0.08)" } : undefined}
              >
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={
                    done
                      ? { background: "var(--accent)", color: "#fff" }
                      : active
                        ? { background: "rgba(199,93,58,0.18)", color: "var(--accent)" }
                        : { background: "var(--hairline-strong)", color: "var(--ink-faint)" }
                  }
                >
                  {done ? "✓" : item.step}
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-xs font-semibold leading-tight"
                    style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}
                  >
                    {item.title}
                  </span>
                  {active && (
                    <span className="block text-[11px] leading-snug mt-0.5" style={{ color: "var(--ink-faint)" }}>
                      {item.description}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {showPremiumCta && (
        <Link
          href="/pricing"
          className="mt-3 block text-center text-[11px] font-semibold px-2 py-2 rounded-lg"
          style={{ background: "rgba(13,74,66,0.06)", color: "var(--ink)" }}
        >
          Unlock full path →
        </Link>
      )}
    </div>
  );
}
