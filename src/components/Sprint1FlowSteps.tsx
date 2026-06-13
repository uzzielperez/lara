"use client";

import { SPRINT1_FLOW } from "@/lib/sprint1-flow";

type Props = {
  /** Current step in the 8-step Sprint 1 flow (1–8). */
  activeStep: number;
  compact?: boolean;
};

export default function Sprint1FlowSteps({ activeStep, compact = false }: Props) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <p className="text-sm font-semibold text-[#0D4A42] uppercase tracking-wider text-center">
          Sprint 1 — Personalization & AI
        </p>
      )}
      <div
        className={`grid gap-2 ${
          compact
            ? "grid-cols-4 sm:grid-cols-8"
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
        }`}
      >
        {SPRINT1_FLOW.map((step) => {
          const isActive = step.id === activeStep;
          const isPast = step.id < activeStep;
          return (
            <div
              key={step.id}
              className={`rounded-xl border px-2 py-3 text-center transition-all ${
                isActive
                  ? "border-[#0D4A42] bg-[#0D4A42]/5 shadow-sm scale-[1.02]"
                  : isPast
                    ? "border-[#10B981] bg-[#10B981]/5"
                    : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isPast
                    ? "bg-[#10B981] text-white"
                    : isActive
                      ? "bg-[#0D4A42] text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isPast ? "✓" : step.id}
              </div>
              <p
                className={`text-[10px] sm:text-xs font-semibold leading-tight ${
                  isActive ? "text-[#0D4A42]" : isPast ? "text-[#10B981]" : "text-gray-400"
                }`}
              >
                {compact ? step.shortLabel : step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
