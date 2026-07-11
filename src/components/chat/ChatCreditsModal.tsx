"use client";

import Link from "next/link";
import { FREEMIUM_FEATURES } from "@/lib/freemium-features";
import { FREE_CHAT_PROMPTS } from "@/lib/subscription";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChatCreditsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13, 74, 66, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
        style={{ background: "var(--surface)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="credits-modal-title"
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: "rgba(199,93,58,0.12)" }}
            >
              ✦
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xl leading-none opacity-40 hover:opacity-70"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <h2 id="credits-modal-title" className="text-xl font-extrabold mb-2" style={{ color: "var(--ink)" }}>
            You&apos;ve used your {FREE_CHAT_PROMPTS} free prompts
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Upgrade for unlimited LARA chat, coaching, and your full eligibility report — or keep exploring
            with free features below.
          </p>
        </div>

        <div className="px-6 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--ink-faint)" }}>
            Still free for you
          </p>
          <ul className="space-y-2">
            {FREEMIUM_FEATURES.map((f) => (
              <li key={f.href + f.label}>
                <Link
                  href={f.href}
                  onClick={onClose}
                  className="flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:opacity-90"
                  style={{ background: "var(--surface-warm)", border: "1px solid var(--hairline)" }}
                >
                  <span className="text-lg shrink-0">{f.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {f.label}
                    </span>
                    <span className="block text-xs" style={{ color: "var(--ink-faint)" }}>
                      {f.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="px-6 py-5 flex flex-col sm:flex-row gap-2.5"
          style={{ borderTop: "1px solid var(--hairline)", background: "var(--surface-warm)" }}
        >
          <Link href="/pricing" className="btn-primary flex-1 text-sm text-center !py-2.5">
            Get coaching
          </Link>
          <Link href="/pricing" className="btn-outline flex-1 text-sm text-center !py-2.5">
            Unlock full path
          </Link>
        </div>
      </div>
    </div>
  );
}
