"use client";

import Link from "next/link";
import { useState } from "react";
import { STUDY_ABROAD_PATH } from "@/lib/study-abroad-path";
import { FREE_CHAT_PROMPTS } from "@/lib/subscription";

type Props = {
  onDismiss?: () => void;
};

export default function DashboardWelcomeBanner({ onDismiss }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <div
      className="mx-5 mt-5 mb-0 rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
            Welcome to your dashboard
          </p>
          <h2 className="text-lg font-extrabold" style={{ color: "var(--ink)" }}>
            Here&apos;s the simplest path to studying abroad
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-lg leading-none shrink-0 opacity-40 hover:opacity-70"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      <ol className="grid sm:grid-cols-2 gap-2 text-sm">
        {STUDY_ABROAD_PATH.map((item) => (
          <li
            key={item.step}
            className="flex gap-2.5 rounded-xl px-3 py-2.5"
            style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
          >
            <span
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={
                item.step === 2
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "var(--hairline-strong)", color: "var(--ink-faint)" }
              }
            >
              {item.step}
            </span>
            <span>
              <span className="font-semibold block" style={{ color: "var(--ink)" }}>
                {item.title}
              </span>
              <span className="text-xs" style={{ color: "var(--ink-soft)" }}>
                {item.description}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        You have <strong style={{ color: "var(--ink)" }}>{FREE_CHAT_PROMPTS} free prompts</strong> to ask LARA
        anything. Coaching and the full guided path unlock with Premium.
      </p>

      <div className="flex flex-wrap gap-2.5">
        <Link href="/chat" className="btn-primary text-sm !py-2.5">
          Ask LARA ({FREE_CHAT_PROMPTS} free)
        </Link>
        <Link href="/pricing" className="btn-outline text-sm !py-2.5">
          Unlock full path
        </Link>
        <Link href="/pricing" className="btn-outline text-sm !py-2.5">
          Coaching & plans
        </Link>
      </div>
    </div>
  );
}
