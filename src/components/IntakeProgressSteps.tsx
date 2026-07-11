"use client";

const INTAKE_STEPS = [
  { id: 1, label: "Discover", shortLabel: "Discover" },
  { id: 2, label: "Account", shortLabel: "Account" },
  { id: 3, label: "Profile", shortLabel: "Profile" },
] as const;

type Props = {
  activeStep?: number;
};

export default function IntakeProgressSteps({ activeStep = 3 }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {INTAKE_STEPS.map((step) => {
        const isActive = step.id === activeStep;
        const isPast = step.id < activeStep;
        return (
          <div
            key={step.id}
            className="rounded-xl border px-2 py-3 text-center transition-all"
            style={{
              borderColor: isActive ? "var(--ink)" : isPast ? "var(--accent)" : "var(--hairline)",
              background: isActive
                ? "rgba(13,74,66,0.05)"
                : isPast
                  ? "rgba(199,93,58,0.06)"
                  : "var(--surface)",
            }}
          >
            <div
              className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={
                isPast
                  ? { background: "var(--accent)", color: "#fff" }
                  : isActive
                    ? { background: "var(--ink)", color: "#fff" }
                    : { background: "var(--hairline-strong)", color: "var(--ink-faint)" }
              }
            >
              {isPast ? "✓" : step.id}
            </div>
            <p
              className="text-[10px] sm:text-xs font-semibold leading-tight"
              style={{ color: isActive ? "var(--ink)" : isPast ? "var(--accent)" : "var(--ink-faint)" }}
            >
              {step.shortLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
