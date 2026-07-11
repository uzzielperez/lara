/** Program Discovery routes — Sprint 1 polish handoffs into Sprint 2. */

import type { GuidedChatResponse } from "@/lib/guided-chat";

export const DISCOVERY_ROUTES = {
  programs: "/programs",
  applications: "/applications",
  chat: "/chat",
  report: "/report",
} as const;

export function getGuidedStepNextStep(step: number): { label: string; href: string } {
  switch (step) {
    case 3:
      return { label: "Explore matched programs", href: DISCOVERY_ROUTES.programs };
    case 5:
      return { label: "Browse programs", href: DISCOVERY_ROUTES.programs };
    default:
      return { label: "Continue in LARA Guide", href: DISCOVERY_ROUTES.chat };
  }
}

/** Ensures guided responses link to discovery at the right prompt steps. */
export function applyGuidedStepNextStep(
  step: number,
  structured: GuidedChatResponse
): GuidedChatResponse {
  const defaults = getGuidedStepNextStep(step);

  if (step === 3) {
    return {
      ...structured,
      nextStep: {
        label: structured.nextStep.label || defaults.label,
        href: DISCOVERY_ROUTES.programs,
      },
    };
  }

  if (step === 5) {
    return {
      ...structured,
      nextStep: {
        label: structured.nextStep.label || defaults.label,
        href: DISCOVERY_ROUTES.programs,
      },
    };
  }

  return structured;
}
