/** Shared profile types and helpers for Sprint 1 (F-01, F-04). */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export type ProfileInput = {
  nationalityCode?: string | null;
  budgetMinMonthly?: number | null;
  budgetMaxMonthly?: number | null;
  universityBudgetMin?: number | null;
  universityBudgetMax?: number | null;
  targetCountries?: string[] | null;
  degreeLevels?: string[] | null;
  cefrLevel?: string | null;
  desiredStart?: string | Date | null;
};

export function isProfileComplete(p: ProfileInput): boolean {
  const countries = Array.isArray(p.targetCountries) ? p.targetCountries : [];
  const degrees = Array.isArray(p.degreeLevels) ? p.degreeLevels : [];
  const hasStart =
    p.desiredStart instanceof Date
      ? !Number.isNaN(p.desiredStart.getTime())
      : typeof p.desiredStart === "string" && p.desiredStart.length > 0;

  return (
    !!p.nationalityCode?.trim() &&
    p.budgetMinMonthly != null &&
    p.budgetMaxMonthly != null &&
    p.budgetMinMonthly > 0 &&
    p.budgetMaxMonthly > p.budgetMinMonthly &&
    p.universityBudgetMin != null &&
    p.universityBudgetMax != null &&
    p.universityBudgetMax >= p.universityBudgetMin &&
    countries.length >= 1 &&
    countries.length <= 3 &&
    degrees.length >= 1 &&
    !!p.cefrLevel &&
    CEFR_LEVELS.includes(p.cefrLevel as CefrLevel) &&
    hasStart
  );
}

export function formatProfileForAI(p: ProfileInput & { name?: string | null }): string {
  const countries = (p.targetCountries ?? []).join(", ");
  const degrees = (p.degreeLevels ?? []).join(", ");
  const start =
    p.desiredStart instanceof Date
      ? p.desiredStart.toISOString().slice(0, 10)
      : p.desiredStart ?? "not set";

  return [
    p.name ? `Name: ${p.name}` : null,
    `Nationality: ${p.nationalityCode ?? "unknown"}`,
    `Rent budget: €${p.budgetMinMonthly ?? "?"}–€${p.budgetMaxMonthly ?? "?"}/month`,
    `Tuition budget: €${p.universityBudgetMin ?? "?"}–€${p.universityBudgetMax ?? "?"}/year`,
    `Target countries (max 3): ${countries || "none"}`,
    `Degree level: ${degrees || "none"}`,
    `CEFR language level: ${p.cefrLevel ?? "not set"}`,
    `Desired start: ${start}`,
  ]
    .filter(Boolean)
    .join("\n");
}
