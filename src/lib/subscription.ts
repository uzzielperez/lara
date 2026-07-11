/** Paywall helpers — 5 free ask-anything prompts, then Premium. */

export const FREE_CHAT_PROMPTS = 5;

/** @deprecated Use FREE_CHAT_PROMPTS for step-gated guided mode legacy */
export const FREE_PROMPT_LIMIT = 4;

const PREMIUM_STATUSES = ["PREMIUM", "STARTER", "MONTHLY", "LIFETIME", "ACTIVE"];

export function isPremium(status?: string | null): boolean {
  if (!status) return false;
  return PREMIUM_STATUSES.includes(status.toUpperCase());
}

/** Premium-only: coaching, voice input, live call support. */
export function hasPremiumCoaching(status?: string | null): boolean {
  return isPremium(status);
}

/** Ask-anything chat locked after FREE_CHAT_PROMPTS uses (unless Premium). */
export function isChatLocked(usesCount: number, status?: string | null): boolean {
  return usesCount >= FREE_CHAT_PROMPTS && !isPremium(status);
}

export function chatPromptsRemaining(
  usesCount: number,
  status?: string | null
): number | null {
  if (isPremium(status)) return null;
  return Math.max(0, FREE_CHAT_PROMPTS - usesCount);
}

/** Step 5 (eligibility + full report) requires premium. Legacy guided mode. */
export function isStepLocked(step: number, status?: string | null): boolean {
  return step > FREE_PROMPT_LIMIT && !isPremium(status);
}
