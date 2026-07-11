"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import CvUploadZone from "@/components/dashboard/CvUploadZone";

export type DashboardProfileData = {
  nationalityCode: string;
  targetCountries: string[];
  degreeLevels: string[];
  cefrLevel: string;
  rentBudgetMin: number;
  rentBudgetMax: number;
  universityBudgetMin: number;
  universityBudgetMax: number;
  desiredStart: string;
  studyGoals: string;
  backgroundStory: string;
  lookingForward: string;
  cvFileName: string;
  matchingReady: boolean;
};

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  NL: "🇳🇱",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  SE: "🇸🇪",
};

type Props = {
  profile: DashboardProfileData;
  onProfileChange: (patch: Partial<DashboardProfileData>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  saveMessage: string | null;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--ink-faint)" }}>
        {label}
      </label>
      {hint && (
        <p className="text-xs mb-1.5" style={{ color: "var(--ink-faint)" }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

export default function DashboardProfilePanel({
  profile,
  onProfileChange,
  onSave,
  saving,
  saveMessage,
}: Props) {
  const [dirty, setDirty] = useState(false);

  const patch = useCallback(
    (p: Partial<DashboardProfileData>) => {
      onProfileChange(p);
      setDirty(true);
    },
    [onProfileChange]
  );

  return (
    <aside className="w-[380px] shrink-0 flex flex-col h-full overflow-hidden" style={{ background: "var(--surface)" }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--hairline)" }}>
        <div>
          <h2 className="font-bold" style={{ color: "var(--ink)" }}>
            Profile & documents
          </h2>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            Editable — save anytime
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await onSave();
            setDirty(false);
          }}
          disabled={saving || !dirty}
          className="btn-accent !py-2 !px-4 text-xs disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {saveMessage && (
        <p className="px-4 py-2 text-xs" style={{ color: "var(--success)", background: "rgba(47,143,110,0.08)" }}>
          {saveMessage}
        </p>
      )}

      <div className="flex-1 overflow-auto p-4 space-y-5">
        <div id="documents">
          <Field label="CV & documents">
            <CvUploadZone
              cvFileName={profile.cvFileName}
              compact
              onUploaded={(data) => {
                patch({ cvFileName: data.cvFileName });
                setDirty(true);
                onSave();
              }}
            />
          </Field>
        </div>

        <Field label="What you're looking for">
          <textarea
            className="input-field w-full text-sm min-h-[80px] resize-y"
            value={profile.studyGoals}
            onChange={(e) => patch({ studyGoals: e.target.value })}
            placeholder="e.g. Master's in data science in Spain or Germany…"
          />
        </Field>

        <Field label="Background & experience">
          <textarea
            className="input-field w-full text-sm min-h-[90px] resize-y"
            value={profile.backgroundStory}
            onChange={(e) => patch({ backgroundStory: e.target.value })}
            placeholder="Education, jobs, skills — plain language is fine"
          />
        </Field>

        <Field label="What excites you most">
          <textarea
            className="input-field w-full text-sm min-h-[70px] resize-y"
            value={profile.lookingForward}
            onChange={(e) => patch({ lookingForward: e.target.value })}
            placeholder="Culture, career, affordable education…"
          />
        </Field>

        <div className="pt-2 border-t" style={{ borderColor: "var(--hairline)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--ink-faint)" }}>
            Matching details {!profile.matchingReady && "(optional)"}
          </p>

          <div className="space-y-4">
            <Field label="Nationality" hint="ISO code, e.g. PH, IN, ES">
              <input
                className="input-field w-full text-sm"
                value={profile.nationalityCode}
                onChange={(e) => patch({ nationalityCode: e.target.value.toUpperCase() })}
                placeholder="PH"
              />
            </Field>

            <Field label="Target countries">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                  <button
                    key={code}
                    type="button"
                    className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors"
                    style={
                      profile.targetCountries.includes(code)
                        ? { borderColor: "var(--ink)", background: "rgba(13,74,66,0.06)", color: "var(--ink)" }
                        : { borderColor: "var(--hairline-strong)", color: "var(--ink-soft)" }
                    }
                    onClick={() => {
                      const has = profile.targetCountries.includes(code);
                      const next = has
                        ? profile.targetCountries.filter((c) => c !== code)
                        : profile.targetCountries.length < 3
                          ? [...profile.targetCountries, code]
                          : profile.targetCountries;
                      patch({ targetCountries: next });
                    }}
                  >
                    {flag} {code}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Degree level">
              <select
                className="input-field w-full text-sm"
                value={profile.degreeLevels[0] ?? ""}
                onChange={(e) => patch({ degreeLevels: e.target.value ? [e.target.value] : [] })}
              >
                <option value="">Select…</option>
                <option value="BACHELORS">Bachelor&apos;s</option>
                <option value="MASTERS">Master&apos;s</option>
                <option value="PHD">PhD</option>
                <option value="DIPLOMA">Diploma</option>
              </select>
            </Field>

            <Field label="Language level (CEFR)">
              <select
                className="input-field w-full text-sm"
                value={profile.cefrLevel}
                onChange={(e) => patch({ cefrLevel: e.target.value })}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Rent budget €/month">
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field w-1/2 text-sm"
                  value={profile.rentBudgetMin}
                  onChange={(e) => patch({ rentBudgetMin: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="input-field w-1/2 text-sm"
                  value={profile.rentBudgetMax}
                  onChange={(e) => patch({ rentBudgetMax: Number(e.target.value) })}
                />
              </div>
            </Field>

            <Field label="Tuition budget €/year">
              <div className="flex gap-2">
                <input
                  type="number"
                  className="input-field w-1/2 text-sm"
                  value={profile.universityBudgetMin}
                  onChange={(e) => patch({ universityBudgetMin: Number(e.target.value) })}
                />
                <input
                  type="number"
                  className="input-field w-1/2 text-sm"
                  value={profile.universityBudgetMax}
                  onChange={(e) => patch({ universityBudgetMax: Number(e.target.value) })}
                />
              </div>
            </Field>

            <Field label="Desired start">
              <input
                type="date"
                className="input-field w-full text-sm"
                value={profile.desiredStart}
                onChange={(e) => patch({ desiredStart: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <Link href="/intake" className="text-xs underline block" style={{ color: "var(--ink-faint)" }}>
          Re-run intake chat
        </Link>
      </div>
    </aside>
  );
}
