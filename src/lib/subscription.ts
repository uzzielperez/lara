/** Paywall helpers. Prompts 1-4 are free; the eligibility report (prompt 5) is gated. */

export const FREE_PROMPT_LIMIT = 4;

const PREMIUM_STATUSES = ["PREMIUM", "STARTER", "MONTHLY", "LIFETIME", "ACTIVE"];

export function isPremium(status?: string | null): boolean {
  if (!status) return false;
  return PREMIUM_STATUSES.includes(status.toUpperCase());
}

/** Step 5 (eligibility + full report) requires premium. */
export function isStepLocked(step: number, status?: string | null): boolean {
  return step > FREE_PROMPT_LIMIT && !isPremium(status);
}
