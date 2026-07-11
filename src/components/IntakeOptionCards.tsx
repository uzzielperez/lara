"use client";

import type { IntakeOption } from "@/lib/intake-flow";

type Props = {
  options: IntakeOption[];
  onSelect: (option: IntakeOption) => void;
  disabled?: boolean;
};

export default function IntakeOptionCards({ options, onSelect, disabled }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="group text-left rounded-xl overflow-hidden transition-all duration-200 disabled:opacity-50"
          style={{
            border: "1px solid var(--hairline-strong)",
            background: "var(--surface)",
          }}
        >
          <div className="relative h-28 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={option.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }}
            />
            <span className="absolute bottom-2 left-3 text-2xl">{option.emoji}</span>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
              {option.label}
            </p>
            <p className="text-xs mt-0.5 leading-snug" style={{ color: "var(--ink-soft)" }}>
              {option.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
